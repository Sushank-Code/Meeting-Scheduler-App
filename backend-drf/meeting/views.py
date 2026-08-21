from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from django.shortcuts import get_object_or_404
from meeting.permissions import IsMeetingOrganizerOrReadOnly   # custom permissions

# models
from meeting.models import Meeting, Participant
from accounts.models import Account

# serializer
from meeting.serializers import (
    AddParticipantSerializer,
    MeetingSerializer,
    ParticipantSerializer,
    RsvpSerializer,
)


class MeetingView(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated, IsMeetingOrganizerOrReadOnly]

    # get
    def get_queryset(self):
        user = self.request.user
        organized = Meeting.objects.filter(organizer=user)   # get if organizer
        participated = Meeting.objects.filter(participant__user=user)  # get if participant
        return (organized | participated).distinct()

    @action(methods=['post'], detail=True, url_path='cancel')
    def cancel_meeting(self, request, pk=None):
        meeting = self.get_object()

        if meeting.status == 'cancelled':
            return Response(
                {'error': 'Already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        meeting.status = 'cancelled'
        meeting.save()
        return Response({"message": "Meeting cancelled."}, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='complete')
    def complete_meeting(self, request, pk=None):
        meeting = self.get_object()

        if meeting.status == 'completed':
            return Response(
                {'error': 'Already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )

        meeting.status = 'completed'
        meeting.save()
        return Response({"message": "Meeting completed."}, status=status.HTTP_200_OK)

class MeetingParticipantListCreateView(generics.ListCreateAPIView):
    
    def get_meeting(self):
        return get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id']) # id = url

    def get_queryset(self):
        meeting = self.get_meeting()
        is_participant = Participant.objects.filter(
            meeting=meeting,
            user=self.request.user,
        ).exists()
        if meeting.organizer != self.request.user and not is_participant:
            raise PermissionDenied('You do not have access to this meeting.')
        return Participant.objects.filter(meeting=meeting)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddParticipantSerializer
        return ParticipantSerializer

    def perform_create(self, serializer):
        meeting = self.get_meeting()
        if meeting.organizer != self.request.user:
            raise PermissionDenied('Only the organizer can add participants.')

        email = serializer.validated_data['email']
        if email == meeting.organizer.email:
            raise ValidationError({'email': 'You cannot invite the organizer.'})
        if Participant.objects.filter(meeting=meeting, email=email).exists():
            raise ValidationError({'email': 'This email is already invited.'})

        serializer.save(
            meeting=meeting,
            user=Account.objects.filter(email=email).first(),
            rsvp_status='pending',
        )


class MeetingParticipantDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ParticipantSerializer
    lookup_url_kwarg = 'participant_id'

    def get_queryset(self):
        meeting = get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id'])
        if meeting.organizer != self.request.user:
            raise PermissionDenied('Only the organizer can manage participants.')
        return Participant.objects.filter(meeting=meeting)


class MeetingRsvpView(generics.UpdateAPIView):
    serializer_class = RsvpSerializer
    
    def get_object(self):
        meeting = get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id'])
        return get_object_or_404(
            Participant,
            meeting=meeting,
            user=self.request.user,
        )