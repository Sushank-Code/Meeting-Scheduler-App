from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

# models
from meeting.models import Meeting, Participant

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

    def update(self, request, *args, **kwargs):
        meeting = self.get_object()
        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can update this meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        meeting = self.get_object()
        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can delete this meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(methods=['post'], detail=True, url_path='cancel')
    def cancel_meeting(self, request, pk=None):
        meeting = self.get_object()

        if meeting.organizer != request.user:
            return Response(
                {'error': 'Only the organizer can cancel this meeting'},
                status=status.HTTP_403_FORBIDDEN
            )
        if meeting.status == 'cancelled':
            return Response(
                {'error': 'Already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        meeting.status = 'cancelled'
        meeting.save()
        return Response({"message": "Meeting cancelled."}, status=status.HTTP_200_OK)