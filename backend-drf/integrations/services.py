import os,uuid,requests
from decouple import config

# GOOGLE MEET

def generate_google_meet_link(meeting):

    # returns a hangoutLink

    try:
        from googleapiclient.discovery import build
        from google.oauth2 import service_account

        # Load service account credentials
   
        SERVICE_ACCOUNT_FILE = config('GOOGLE_SERVICE_ACCOUNT_FILE')

        SCOPES = ['https://www.googleapis.com/auth/calendar']

        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=SCOPES
        )

        # Build the Google Calendar API client

        service = build('calendar', 'v3', credentials=credentials)

        
        # Format the event data Google Calendar API expects ISO 8601 format
        # for start and end datetime

        event_body = {
            'summary': meeting.title,
            'description': meeting.description or '',
            'start': {
                'dateTime': meeting.start_datetime.isoformat(),
                'timeZone': meeting.meet_timezone or 'UTC',
            },
            'end': {
                'dateTime': meeting.end_datetime.isoformat(),
                'timeZone': meeting.meet_timezone or 'UTC',
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
            calendarId=config('GOOGLE_CALENDAR_ID', default='primary'),
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

    except Exception as e:
        print(f"Google Meet generation failed: {e}")
        return None
