from celery import shared_task
from integrations.services import google_meet_link,zoom_link

from meeting.models import Meeting

@shared_task()
def generate_meeting_link_task(meeting_id):
    meeting = Meeting.objects.get(meeting_id=meeting_id)

    if meeting.location_type == 'google_meet':
        return google_meet_link(meeting)

    if meeting.location_type == 'zoom':
        return zoom_link(meeting)
    
    return None
 