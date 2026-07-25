from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

# models
from meeting.models import Meeting,Participant

# serializer
from meeting.serializers import MeetingSerializer

class MeetingView(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer