from celery import shared_task
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError
from django.template.defaultfilters import date as format_date
from django.utils import timezone

from meeting.models import Meeting, Participant
from notifications.models import EmailNotification


def _meeting_details(meeting):
    local_start = timezone.localtime(meeting.start_datetime)
    organizer_name = meeting.organizer.get_full_name() or meeting.organizer.email
    return {
        'title': meeting.title,
        'organizer_name': organizer_name,
        'start': format_date(local_start, 'l, F j, Y, P T'),
        'meeting_link': meeting.meeting_link,
    }


def _send(subject, message, recipient, html_message=None):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
        html_message=html_message,
    )


@shared_task
def send_participant_invitation_task(participant_id):
    participant = Participant.objects.select_related('meeting__organizer').get(id=participant_id)
    meeting = participant.meeting
    details = _meeting_details(meeting)
    base_url = getattr(settings, 'SITE_URL', 'http://127.0.0.1:8000').rstrip('/')
    rsvp_url = f"{base_url}/api/v1/meeting/rsvp/{participant.rsvp_token}/"
    accept_url = f"{rsvp_url}?choice=accepted"
    decline_url = f"{rsvp_url}?choice=declined"

    _send(
        f"Invitation: {details['title']}",
        (
            f"{details['organizer_name']} invited you to '{details['title']}'.\n\n"
            f"When: {details['start']}\n"
            f"Join meeting: {details['meeting_link']}\n\n"
            f"RSVP: accept at {accept_url} or decline at {decline_url}"
        ),
        participant.email,
        html_message=(
            f"<p><strong>{details['organizer_name']}</strong> invited you to "
            f"<strong>{details['title']}</strong>.</p>"
            f"<p><strong>When:</strong> {details['start']}<br>"
            f"<a href=\"{details['meeting_link']}\">Join meeting</a></p>"
            f"<p><a href=\"{accept_url}\">Accept</a> &nbsp; "
            f"<a href=\"{decline_url}\">Decline</a></p>"
        ),
    )


@shared_task
def send_meeting_created_notifications_task(meeting_id):
    meeting = Meeting.objects.select_related('organizer').get(meeting_id=meeting_id)
    details = _meeting_details(meeting)

    _send(
        f"Meeting created: {details['title']}",
        (
            f"Your meeting '{details['title']}' was created successfully.\n\n"
            f"When: {details['start']}\n"
            f"Meeting link: {details['meeting_link']}"
        ),
        meeting.organizer.email,
    )

    for participant_id in Participant.objects.filter(meeting=meeting).values_list('id', flat=True):
        send_participant_invitation_task.delay(participant_id)


@shared_task
def send_meeting_cancellation_task(meeting_id):
    meeting = Meeting.objects.select_related('organizer').get(meeting_id=meeting_id)
    details = _meeting_details(meeting)

    for participant in Participant.objects.filter(meeting=meeting):
        if EmailNotification.objects.filter(
            meeting=meeting,
            participant=participant,
            notification_type=EmailNotification.CANCELLATION,
        ).exists():
            continue

        _send(
            f"Cancelled: {details['title']}",
            (
                f"The meeting '{details['title']}' scheduled for {details['start']} "
                f"has been cancelled by {details['organizer_name']}."
            ),
            participant.email,
        )
        try:
            EmailNotification.objects.create(
                meeting=meeting,
                participant=participant,
                notification_type=EmailNotification.CANCELLATION,
            )
        except IntegrityError:
            pass


@shared_task
def send_upcoming_meeting_reminders_task():
    now = timezone.now()
    window_start = now + timedelta(minutes=25)
    window_end = now + timedelta(minutes=35)
    meetings = Meeting.objects.filter(
        status='scheduled',
        start_datetime__gte=window_start,
        start_datetime__lte=window_end,
    ).select_related('organizer')

    sent_count = 0
    for meeting in meetings:
        details = _meeting_details(meeting)
        participants = Participant.objects.filter(
            meeting=meeting,
            rsvp_status__in=['accepted', 'pending'],
        )
        for participant in participants:
            if EmailNotification.objects.filter(
                meeting=meeting,
                participant=participant,
                notification_type=EmailNotification.REMINDER,
            ).exists():
                continue

            _send(
                f"Reminder: {details['title']} starts in about 30 minutes",
                (
                    f"Reminder: '{details['title']}' starts at {details['start']}.\n\n"
                    f"Join meeting: {details['meeting_link']}"
                ),
                participant.email,
            )
            try:
                EmailNotification.objects.create(
                    meeting=meeting,
                    participant=participant,
                    notification_type=EmailNotification.REMINDER,
                )
            except IntegrityError:
                pass
            sent_count += 1
    return sent_count
