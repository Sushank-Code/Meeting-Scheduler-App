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
            # only update the specific column
            meeting.save(update_fields=['meeting_link'])
            return meet_link

        return None

    except Exception:
        logger.exception(
            'Google Meet generation failed for meeting %s', meeting.meeting_id)
        raise


def get_zoom_access_token():
    """
    Zoom Server-to-Server OAuth requires getting
    an access token first before calling any API.

    How it works:
    - You send your Account ID, Client ID, Client Secret
    - Zoom returns a temporary access token
    - Token expires in 1 hour
    - You use this token in the Authorization header
      for all subsequent Zoom API calls
    """

    ZOOM_ACCOUNT_ID  = config('ZOOM_ACCOUNT_ID')
    ZOOM_CLIENT_ID   = config('ZOOM_CLIENT_ID')
    ZOOM_CLIENT_SECRET = config('ZOOM_CLIENT_SECRET')

    # Zoom token endpoint
    token_url = f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={ZOOM_ACCOUNT_ID}"

    response = requests.post(
        token_url,
        auth=(ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)
    )

    if response.status_code == 200:
        return response.json().get('access_token')

    # token request failed
    print(f"Zoom token error: {response.status_code} {response.text}")
    return None


def zoom_link(meeting):
    """
    Calls Zoom API to create a Zoom meeting.
    Returns the join URL string or None if it fails.

    How it works:
    - First get an access token using credentials
    - Then call Zoom create meeting endpoint
    - Zoom returns a join_url
    - Save join_url to meeting.meeting_link
    """

    try:
        # -----------------------------------------------
        # Step 1 - Get access token first
        # all Zoom API calls need this token
        # -----------------------------------------------
        access_token = get_zoom_access_token()

        if not access_token:
            print("Zoom access token could not be retrieved.")
            return None

        # -----------------------------------------------
        # Step 2 - Format meeting data for Zoom API
        # Zoom expects start_time in ISO 8601 format
        # duration in minutes as an integer
        # -----------------------------------------------
        duration_minutes = int(
            (meeting.end_datetime - meeting.start_datetime).total_seconds() / 60
        )
        meeting_timezone = getattr(
            meeting, 'meet_timezone', None) or timezone.get_current_timezone_name()

        meeting_data = {
            'topic': meeting.title,
            'type': 2,
            # type 2 = scheduled meeting
            # type 1 = instant meeting
            # type 3 = recurring with no fixed time
            'start_time': meeting.start_datetime.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'duration': duration_minutes,
            'timezone': meeting_timezone,
            'agenda': meeting.description or '',
            'settings': {
                'host_video': True,
                'participant_video': True,
                'join_before_host': True,
                # join_before_host allows participants
                # to join before organizer arrives
            }
        }

        # -----------------------------------------------
        # Step 3 - Call Zoom create meeting endpoint
        # /users/me/meetings creates meeting for
        # the authenticated user (your service account)
        # -----------------------------------------------
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        response = requests.post(
            'https://api.zoom.us/v2/users/me/meetings',
            json=meeting_data,
            headers=headers
        )

        # -----------------------------------------------
        # Step 4 - Extract join_url from response
        # join_url is what participants use to join
        # start_url is what the host uses to start
        # we only need join_url for our purpose
        # -----------------------------------------------
        if response.status_code == 201:
            zoom_meeting = response.json()
            join_url = zoom_meeting.get('join_url')

            if join_url:
                meeting.meeting_link = join_url
                meeting.save(update_fields=['meeting_link'])
                return join_url

        print(f"Zoom meeting creation failed: {response.status_code} {response.text}")
        return None

    except Exception as e:
        print(f"Zoom generation failed: {e}")
        return None