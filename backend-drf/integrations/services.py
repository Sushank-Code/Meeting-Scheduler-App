import logging

from decouple import config
from django.utils import timezone
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from social_django.models import UserSocialAuth

CALENDAR_EVENTS_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
logger = logging.getLogger(__name__)

# GOOGLE MEET

def google_meet_link(meeting):

    # returns a hangoutLink

    try:
        from googleapiclient.discovery import build
        social_auth = UserSocialAuth.objects.get(
            user=meeting.organizer,
            provider='google-oauth2',
        )
        token_data = social_auth.extra_data
        access_token = token_data.get('access_token')
        if not access_token:
            raise ValueError('Connect Google Calendar before scheduling a Google Meet meeting.')
        if CALENDAR_EVENTS_SCOPE not in token_data.get('scope', '').split():
            raise ValueError('Reconnect Google Calendar to grant calendar event access.')

        # A personal Gmail calendar must be accessed with the organizer's OAuth
        # credential. A service account has its own calendar and cannot create
        # Meet conferences on behalf of a personal Google account.
        credentials = Credentials(
            token=access_token,
            refresh_token=token_data.get('refresh_token'),
            token_uri='https://oauth2.googleapis.com/token',
            client_id=config('GOOGLE_CLIENT_ID'),
            client_secret=config('GOOGLE_SECRET'),
            scopes=[CALENDAR_EVENTS_SCOPE],
        )
        if credentials.refresh_token:
            credentials.refresh(Request())
            token_data['access_token'] = credentials.token
            social_auth.extra_data = token_data
            social_auth.save(update_fields=['extra_data'])

        # Build the Google Calendar API client

        service = build('calendar', 'v3', credentials=credentials)

        
        # Format the event data Google Calendar API expects ISO 8601 format
        # for start and end datetime

        # Meeting does not store a timezone.  Use Django's configured timezone
        # while retaining the offset included in the ISO 8601 datetimes.
        meeting_timezone = getattr(meeting, 'meet_timezone', None) or timezone.get_current_timezone_name()

        event_body = {
            'summary': meeting.title,
            'description': meeting.description or '',
            'start': {
                'dateTime': meeting.start_datetime.isoformat(),
                'timeZone': meeting_timezone,
            },
            'end': {
                'dateTime': meeting.end_datetime.isoformat(),
                'timeZone': meeting_timezone,
            },

            # to generate the link 

            'conferenceData': {
                'createRequest': {
                    'requestId': str(meeting.meeting_id),
                    'conferenceSolutionKey': {
                        'type': 'hangoutsMeet'
                    }
                }
            }
        }

        event = service.events().insert(
            calendarId='primary',
            body=event_body,
            conferenceDataVersion=1
        ).execute()

        # Extract the Meet link from response,hangoutLink is the Google Meet URL

        meet_link = event.get('hangoutLink')

        if meet_link:
            # save to meeting model and return
            meeting.meeting_link = meet_link
            meeting.save(update_fields=['meeting_link'])  # only update the specific column
            return meet_link

        return None

    except Exception:
        logger.exception('Google Meet generation failed for meeting %s', meeting.meeting_id)
        raise
