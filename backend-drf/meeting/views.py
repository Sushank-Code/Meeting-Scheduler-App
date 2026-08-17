from django.shortcuts import render
from rest_framework import viewsets,status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# models
from meeting.models import Meeting,Participant

# serializer
from meeting.serializers import MeetingSerializer

class MeetingView(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
 
    # get
    def get_queryset(self):
        user = self.request.user
        organized = Meeting.objects.filter(organizer=user)
        participated = Meeting.objects.filter(participant__user=user)
        return (organized | participated).distinct()                  
