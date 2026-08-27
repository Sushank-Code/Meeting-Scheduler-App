from rest_framework.test import APITestCase ,APIRequestFactory
from datetime import datetime, timezone

from meeting.models import Meeting, Participant
from accounts.models import Account
from meeting.serializers import MeetingSerializer


class MeetingSerializerTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = Account.objects.create_user(
            username='Test_User',
            email='testuser@gmail.com',
            first_name='Test_first',
            last_name='Test_last'
        )

        cls.meet = Meeting.objects.create(
            organizer=cls.user,
            title='Test_Title',
            description='Test_Description',
            start_datetime=datetime(
                2026, 8, 27, 11, 0, tzinfo=timezone.utc),
            end_datetime=datetime(2026, 8, 27, 12, 0, tzinfo=timezone.utc),
            location_type='google_meet',
            status='scheduled',
        )

    def test_create_meeting_valid_data(self):
   
        data = {
            "title": "Project Kickoff2",
            "description": "Discuss Q3 goals",
            "start_datetime": "2026-08-27T11:00:00Z",
            "end_datetime": "2026-08-27T12:00:00Z",
            "location_type": "google_meet",
            "agenda": "Review roadmap3",
            "invited_emails": [
                "harry@gmail.com",
                "harr@gmail.com"
            ]
        }
        serializer = MeetingSerializer(data = data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.errors,{})

    def test_create_meeting_valid_date(self):
        
        data = {
            "title": "Project Kickoff2",
            "description": "Discuss Q3 goals",
            "start_datetime": "2026-08-27T11:00:00Z",
            "end_datetime": "2026-08-27T10:00:00Z",
            "location_type": "google_meet",
            "agenda": "Review roadmap3",
            "invited_emails": [
                "harry@gmail.com",
                "harr@gmail.com",
            ]
        }

        serializer = MeetingSerializer(data=data)
    
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors['non_field_errors'][0],'End Time must be after start time')

    def test_create_meeting_valid_invitedemail(self):
       
        data = {
            "title": "Project Kickoff2",
            "description": "Discuss Q3 goals",
            "start_datetime": "2026-08-27T11:00:00Z",
            "end_datetime": "2026-08-27T12:00:00Z",
            "location_type": "google_meet",
            "agenda": "Review roadmap3",
            "invited_emails": [
                "harry@gmail.com",
                "harr@gmail.com",
                self.user.email
            ]
        }
        # --- user cannnot inivite ownself ---

        factory = APIRequestFactory()
        request = factory.post("/meetings/", data)

        request.user = self.user

        # ---
        serializer = MeetingSerializer(
            data=data,
            context={"request": request}
        )
    
        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors['invited_emails'][0],'You cannot invite yourself to your own meeting')


    
