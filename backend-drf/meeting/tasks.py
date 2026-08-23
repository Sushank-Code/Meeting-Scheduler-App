from celery import shared_task
from integrations.services import google_meet_link,zoom_link

from meeting.models import Meeting

@shared_task()
def generate_meeting_link_task(meeting_id):
    meeting = Meeting.objects.get(meeting_id=meeting_id)

    if meeting.location_type == 'google_meet':
        meeting_link = google_meet_link(meeting)

    elif meeting.location_type == 'zoom':
        meeting_link = zoom_link(meeting)

    else:
        return None

    from notifications.tasks import send_meeting_created_notifications_task
    send_meeting_created_notifications_task.delay(str(meeting.meeting_id))
    return meeting_link
