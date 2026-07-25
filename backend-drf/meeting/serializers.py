from rest_framework import serializers
from accounts.models import Account
from meeting.models import Meeting, Participant


class MeetingSerializer(serializers.ModelSerializer):

    invited_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True
    )

    class Meta:
        model = Meeting
        fields = ['meeting_id', 'title', 'description', 'start_datetime', 'end_datetime','duration','location_type','meeting_link', 'status', 'agenda', 'meeting_notes', 'created_at', 'updated_at', 'invited_emails']

        read_only_fields = ['meeting_id','duration','meeting_link','status','created_at','updated_at']

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
        if request and request.user in value:
            raise serializers.ValidationError('You cannot invite yourself to your own meeting')

        return value
    
    def create(self, validated_data):
        request = self.context['request']
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

        return meeting        