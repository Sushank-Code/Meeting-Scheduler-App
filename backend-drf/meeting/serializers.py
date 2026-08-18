from rest_framework import serializers
from django.db import transaction
from accounts.models import Account
from meeting.models import Meeting, Participant
from meeting.tasks import generate_meeting_link_task

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

    def validate(self, data):
        startDateTime = data.get('start_datetime')
        endDateTime = data.get('end_datetime')

        if (endDateTime <= startDateTime):
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

        # This decides whether to queue the Celery task or not.
        # transaction.on_commit(...) means:
        # “Run this Celery task only after Django has successfully saved the meeting to the database.”
        
        if meeting.location_type == 'google_meet':
            meeting_id = str(meeting.meeting_id)
            transaction.on_commit(
                lambda: generate_meeting_link_task.delay(meeting_id)
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
        fields = []
