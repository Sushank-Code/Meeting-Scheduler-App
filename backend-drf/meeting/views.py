from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponseBadRequest
from django.views import View
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated 
from meeting.permissions import IsMeetingOrganizerOrReadOnly   # custom permissions
from notifications.tasks import (
    send_meeting_cancellation_task,
    send_participant_invitation_task,
)
from meeting.throttles import MeetingCreateThrottle

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

# Meeting view
class MeetingView(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated, IsMeetingOrganizerOrReadOnly]

    def get_throttles(self):
        if self.action == "create":
            return [MeetingCreateThrottle()]

        return []

    # get
    def get_queryset(self):
        user = self.request.user
        organized = Meeting.objects.filter(organizer=user)   # get if organizer
        participated = Meeting.objects.filter(
            participant__email__iexact=user.email
        )
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
        transaction.on_commit(
            lambda: send_meeting_cancellation_task.delay(str(meeting.meeting_id))
        )
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

# Participant view ( get / post )
class MeetingParticipantListCreateView(generics.ListCreateAPIView):
    
    def get_meeting(self):
        return get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id']) # id = url

    def get_queryset(self):
        meeting = self.get_meeting()
        is_participant = Participant.objects.filter(
            meeting=meeting,
            email__iexact=self.request.user.email,
        ).exists()
        if meeting.organizer != self.request.user and not is_participant:
            raise PermissionDenied('You do not have access to this meeting.')
        return Participant.objects.filter(meeting=meeting)

    # serializer check 
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AddParticipantSerializer
        return ParticipantSerializer

    # create/ add participant 
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

        participant_id = serializer.instance.id
        transaction.on_commit(
            lambda: send_participant_invitation_task.delay(participant_id)
        )

# Participant view ( retrieve / delete )
class MeetingParticipantDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ParticipantSerializer
    lookup_url_kwarg = 'participant_id'

    def get_queryset(self):
        meeting = get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id'])
        if meeting.organizer != self.request.user:
            raise PermissionDenied('Only the organizer can manage participants.')
        return Participant.objects.filter(meeting=meeting)

# Partticipant ( Update )
class MeetingRsvpView(generics.UpdateAPIView):
    serializer_class = RsvpSerializer
    
    def get_object(self):
        meeting = get_object_or_404(Meeting, meeting_id=self.kwargs['meeting_id'])
        participant = get_object_or_404(
            Participant,
            meeting=meeting,
            email__iexact=self.request.user.email,
        )
        if participant.user_id is None:
            participant.user = self.request.user
            participant.save(update_fields=['user'])
        return participant


@method_decorator(csrf_exempt, name='dispatch')
class PublicRsvpView(View):
    #  Lets an invited email recipient respond without an application account.

    valid_choices = {'accepted', 'declined'}

    def get(self, request, token):
        choice = request.GET.get('choice')
        if choice not in self.valid_choices:
            return HttpResponseBadRequest('Choose accepted or declined.')
        participant = get_object_or_404(Participant, rsvp_token=token)
        return HttpResponse(
            '<h1>Confirm RSVP</h1>'
            f'<p>{participant.meeting.title}</p>'
            '<form method="post">'
            f'<input type="hidden" name="choice" value="{choice}">'
            f'<button type="submit">Confirm {choice.title()}</button>'
            '</form>'
        )

    def post(self, request, token):
        choice = request.POST.get('choice')
        if choice not in self.valid_choices:
            return HttpResponseBadRequest('Choose accepted or declined.')
        participant = get_object_or_404(Participant, rsvp_token=token)
        participant.rsvp_status = choice
        participant.save(update_fields=['rsvp_status'])
        return HttpResponse(f'<h1>RSVP {choice.title()}</h1><p>Thank you.</p>')
