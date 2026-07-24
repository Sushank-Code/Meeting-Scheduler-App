from rest_framework import serializers
from meeting.models import Meeting, Participant


class MeetingSerializer(serializers.ModelSerializer):

    invited_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True
    )

    class Meta:
        model = Meeting
        fields = ['meeting_id', 'title', 'description', 'start_datetime', 'end_datetime',       'location_type','meeting_link', 'status', 'agenda', 'meeting_notes', 'created_at', 'updated_at', 'invited_emails']

        read_only_fields = ['id','meeting_link','status','created_at','updated_at']

    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        print(validated_data)

        