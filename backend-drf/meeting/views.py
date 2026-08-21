from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from meeting.permissions import IsMeetingOrganizerOrReadOnly

# models
from meeting.models import Meeting, Participant

# serializer
from meeting.serializers import MeetingSerializer


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
    