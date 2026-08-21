from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated 
from meeting.permissions import IsMeetingOrganizerOrReadOnly   # custom permissions

# models
from meeting.models import Meeting, Participant

# serializer
from meeting.serializers import MeetingSerializer,ParticipantSerializer


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

class ParticipantView(viewsets.ModelViewSet):
    
    serializer_class = ParticipantSerializer
    permission_classes = [IsAuthenticated , IsMeetingOrganizerOrReadOnly]

    def get_queryset(request):
        organized = Participant.objects.filter(meeting__organizer=request.user) 
        return organized    


    