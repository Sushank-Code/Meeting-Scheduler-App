from rest_framework import serializers
from django.db import transaction
from accounts.models import Account
from meeting.models import Meeting, Participant
from meeting.tasks import generate_meeting_link_task
from notifications.tasks import send_participant_invitation_task

class MeetingSerializer(serializers.ModelSerializer):

    invited_emails = serializers.ListField( 
        child=serializers.EmailField(),
        write_only=True
    )
    user_role = serializers.SerializerMethodField()     # organizer or participant

    class Meta:
        model = Meeting
        fields = ['meeting_id', 'title', 'description', 'start_datetime', 'end_datetime','duration','location_type','meeting_link', 'status', 'agenda', 'meeting_notes', 'created_at', 'updated_at', 'invited_emails','user_role']

        read_only_fields = ['meeting_id','duration','meeting_link','status','created_at','updated_at','user_role']
        
        extra_kwargs = {
            'location_type': {'required': False},
        }

    def validate(self, data):

        if self.instance and 'location_type' in self.initial_data:
            raise serializers.ValidationError(
                {'location_type': 'Meeting location cannot be changed after creation.'}
            )
        if self.instance and 'meeting_link' in self.initial_data:
            raise serializers.ValidationError(
                {'meeting_link': 'Meeting link cannot be changed manually.'}
            )

        startDateTime = data.get(
            'start_datetime',
            getattr(self.instance, 'start_datetime', None),
        )
        endDateTime = data.get(
            'end_datetime',
            getattr(self.instance, 'end_datetime', None),
        )

        if startDateTime and endDateTime and endDateTime <= startDateTime:
            raise serializers.ValidationError('End Time must be after start time ')

        return data
    
    def validate_invited_emails(self,value):

        if not value:
            raise serializers.ValidationError('Invite atleast one person to meeting')

        if len(value) != len(set(value)):
            raise serializers.ValidationError('Duplicate emails found in invite list')

        request = self.context.get('request')
        if request and request.user.email in value:
            raise serializers.ValidationError('You cannot invite yourself to your own meeting')

        return value
    
    def create(self, validated_data):
        request = self.context.get('request')
        orgainzer = request.user             # logged user

        invited_emails = validated_data.pop('invited_emails')  # extract invited_emails

        # meeting saved
        meeting = Meeting.objects.create(organizer=orgainzer,**validated_data)   

        for email in invited_emails:
            try:
                user = Account.objects.get(email=email)
            except Account.DoesNotExist:
                user = None

            Participant.objects.create(
                meeting=meeting,
                user = user,
                email = email,
                rsvp_status = 'pending'
            )
            
        meeting_id = str(meeting.meeting_id)
        if meeting.location_type in ['google_meet', 'zoom']:
            transaction.on_commit(
                lambda: generate_meeting_link_task.delay(meeting_id)
            )

        return meeting        

    def update(self, instance, validated_data):
        invited_emails = validated_data.pop('invited_emails', None)

        with transaction.atomic():
            meeting = super().update(instance, validated_data)

            if invited_emails is not None:
                Participant.objects.filter(meeting=meeting).exclude(
                    email__in=invited_emails
                ).delete()

                for email in invited_emails:
                    user = Account.objects.filter(email=email).first()
                    participant, created = Participant.objects.get_or_create(
                        meeting=meeting,
                        email=email,
                        defaults={'user': user, 'rsvp_status': 'pending'},
                    )
                    if created:
                        transaction.on_commit(
                            lambda participant_id=participant.id: send_participant_invitation_task.delay(
                                participant_id
                            )
                        )

        return meeting

    def get_user_role(self, obj):       # obj is the Meeting instance.
        request = self.context.get('request')
        if request and obj.organizer == request.user:
            return 'organizer'
        return 'participant'

class ParticipantSerializer(serializers.ModelSerializer):

    class Meta : 
        model = Participant
        fields = ['id','email','rsvp_status','invited_at']
        read_only_fields = ['id', 'email', 'rsvp_status', 'invited_at']

class AddParticipantSerializer(serializers.ModelSerializer):

    class Meta:
        model = Participant
        fields = ['email']

class RsvpSerializer(serializers.ModelSerializer):

    class Meta:
        model = Participant
        fields = ['rsvp_status']
