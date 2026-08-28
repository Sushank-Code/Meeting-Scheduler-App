from rest_framework.test import APITestCase, APIRequestFactory
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

        cls.data = {
            "title": "Project Kickoff",
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

    def setUp(self):
        factory = APIRequestFactory()
        self.request = factory.post("/meetings/")
        self.request.user = self.user

    def test_meeting_valid_data(self):

        serializer = MeetingSerializer(data=self.data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.errors, {})

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
        self.assertEqual(
            serializer.errors['non_field_errors'][0], 'End Time must be after start time')

    def test_create_meeting_valid_invitedemail(self):

        data = self.data.copy()
        data["invited_emails"] = [
            "harry@gmail.com",
            self.user.email
        ]

        serializer = MeetingSerializer(
            data=data,
            context={"request": self.request}
        )

        self.assertFalse(serializer.is_valid())
        self.assertEqual(serializer.errors['invited_emails'][0],
                         'You cannot invite yourself to your own meeting')

    def test_create_meeting(self):

        serializer = MeetingSerializer(
            data=self.data,
            context={"request": self.request}
        )

        self.assertTrue(serializer.is_valid())

        meeting = serializer.save()

        # Meeting
        self.assertEqual(meeting.organizer, self.user)
        self.assertEqual(meeting.title, "Project Kickoff")
        self.assertEqual(meeting.description, "Discuss Q3 goals")

        # Participants
        participants = Participant.objects.filter(
            meeting=meeting
        )

        self.assertEqual(participants.count(), 2)

        self.assertTrue(
            participants.filter(
                email="harry@gmail.com"
            ).exists()
        )

        self.assertTrue(
            participants.filter(
                email="harr@gmail.com"
            ).exists()
        )

    def test_user_role(self):
        serializer = MeetingSerializer(
            self.meet,
            context={"request": self.request}
        )

        self.assertEqual(
            serializer.get_user_role(self.meet),
            "organizer"
        )
