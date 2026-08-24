from celery import shared_task
from smtplib import SMTPDataError
from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError
from django.template.defaultfilters import date as format_date
from django.template.loader import render_to_string
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


def _send(subject, message, recipient, template_name=None, context=None):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [recipient],
        fail_silently=False,
        html_message=(
            render_to_string(template_name, context or {})
            if template_name else None
        ),
    )


@shared_task(
    autoretry_for=(SMTPDataError,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=5,
    rate_limit='30/m',
)
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
        'notifications/email/invitation.html',
        {**details, 'accept_url': accept_url, 'decline_url': decline_url},
    )


@shared_task(
    autoretry_for=(SMTPDataError,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=5,
    rate_limit='30/m',
)
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
        'notifications/email/confirmation.html',
        details,
    )

    for participant_id in Participant.objects.filter(meeting=meeting).values_list('id', flat=True):
        send_participant_invitation_task.delay(participant_id)


@shared_task
def send_meeting_cancellation_task(meeting_id):
    participant_ids = Participant.objects.filter(
        meeting_id=meeting_id
    ).values_list('id', flat=True)
    for participant_id in participant_ids:
        send_participant_cancellation_task.delay(participant_id)


@shared_task(
    autoretry_for=(SMTPDataError,),
    retry_backoff=True,
    retry_jitter=True,
    max_retries=5,
    rate_limit='30/m',
)
def send_participant_cancellation_task(participant_id):
    participant = Participant.objects.select_related('meeting__organizer').get(id=participant_id)
    meeting = participant.meeting
    if EmailNotification.objects.filter(
        meeting=meeting,
        participant=participant,
        notification_type=EmailNotification.CANCELLATION,
    ).exists():
        return False

    _send(
        f"Cancelled: {meeting.title}",
        (
            f"The meeting '{meeting.title}' scheduled for "
            f"{_meeting_details(meeting)['start']} has been cancelled by "
            f"{_meeting_details(meeting)['organizer_name']}."
        ),
        participant.email,
        'notifications/email/cancellation.html',
        _meeting_details(meeting),
    )
    try:
        EmailNotification.objects.create(
            meeting=meeting,
            participant=participant,
            notification_type=EmailNotification.CANCELLATION,
        )
    except IntegrityError:
        pass
    return True
