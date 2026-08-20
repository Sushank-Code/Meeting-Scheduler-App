import logging,requests

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
            raise ValueError(
                'Connect Google Calendar before scheduling a Google Meet meeting.')
        
        if CALENDAR_EVENTS_SCOPE not in token_data.get('scope', '').split():
            raise ValueError(
                'Reconnect Google Calendar to grant calendar event access.')

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

        meeting_timezone = getattr(
            meeting, 'meet_timezone', None) or timezone.get_current_timezone_name()

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
            meeting.save(update_fields=['meeting_link'])   # only update the specific column
            return meet_link

        return None

    except Exception:
        logger.exception(
            'Google Meet generation failed for meeting %s', meeting.meeting_id)
        raise


def get_zoom_access_token():

    ZOOM_ACCOUNT_ID = config('ZOOM_ACCOUNT_ID')
    ZOOM_CLIENT_ID = config('ZOOM_CLIENT_ID')
    ZOOM_CLIENT_SECRET = config('ZOOM_CLIENT_SECRET')

    # Zoom token endpoint
    token_url = 'https://zoom.us/oauth/token'

    response = requests.post(
        token_url,
        params={
            'grant_type': 'account_credentials',
            'account_id': ZOOM_ACCOUNT_ID,
        },
        auth=(ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET),
        timeout=15,
    )
    response.raise_for_status()
    access_token = response.json().get('access_token')
    if not access_token:
        raise RuntimeError('Zoom did not return an access token.')
    return access_token

def zoom_link(meeting):

    try:
        access_token = get_zoom_access_token()

        duration_minutes = int(
            (meeting.end_datetime - meeting.start_datetime).total_seconds() / 60
        )
        meeting_timezone = getattr(
            meeting, 'meet_timezone', None) or timezone.get_current_timezone_name()

        meeting_data = {
            'topic': meeting.title,
            'type': 2,
            'start_time': meeting.start_datetime.isoformat(),
            'duration': duration_minutes,
            'timezone': meeting_timezone,
            'agenda': meeting.description or '',
            'settings': {
                'host_video': True,
                'participant_video': True,
                'join_before_host': True,
            }
        }

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(
            f"https://api.zoom.us/v2/users/{config('ZOOM_HOST_EMAIL')}/meetings",
            json=meeting_data,
            headers=headers,
            timeout=15,
        )

        if response.status_code == 201:
            zoom_meeting = response.json()
            join_url = zoom_meeting.get('join_url')

            if join_url:
                meeting.meeting_link = join_url
                meeting.save(update_fields=['meeting_link'])
                return join_url

        response.raise_for_status()
        raise RuntimeError('Zoom created the meeting without a join URL.')

    except Exception:
        logger.exception('Zoom generation failed for meeting %s', meeting.meeting_id)
        raise
