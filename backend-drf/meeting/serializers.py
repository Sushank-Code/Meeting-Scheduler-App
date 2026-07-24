from rest_framework import serializers
from meeting.models import Meeting, Participant


class MeetingSerializer(serializers.ModelSerializer):

    class Meta:
        model:Meeting
        fields = ['title','description','start_datetime','end_datetime','location_type','meeting_link','status','agenda','meeting_notes']

    