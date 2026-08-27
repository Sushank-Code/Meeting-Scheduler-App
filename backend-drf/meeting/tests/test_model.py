from django.test import TestCase
from meeting.models import Meeting,Participant
from accounts.models import Account
from datetime import datetime, timezone ,timedelta

class MeetingModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = Account.objects.create_user(
            username = 'Test_User',
            email = 'testuser@gmail.com',
            first_name = 'Test_first',
            last_name = 'Test_last'
        )

        cls.meet = Meeting.objects.create(
            organizer = cls.user, 
            title = 'Test_Title',
            description = 'Test_Description',
            start_datetime = datetime(2026, 8, 27, 11, 0, tzinfo=timezone.utc),
            end_datetime = datetime(2026, 8, 27, 12, 0, tzinfo=timezone.utc),
            location_type = 'google_meet',
            status = 'scheduled',
        )

    def test_create_meeting(self):
    
        self.assertEqual(
            (self.meet.organizer,self.meet.title, self.meet.description,self.meet.start_datetime,self.meet.end_datetime,self.meet.location_type,self.meet.status),
            (self.user,'Test_Title','Test_Description', datetime(2026, 8, 27, 11, 0, tzinfo=timezone.utc), datetime(2026, 8, 27, 12, 0, tzinfo=timezone.utc) ,'google_meet','scheduled')
        )

    def test_create_participant(self):
        rsvp_token = "88da1c59-acf7-4b52-96b3-964be3b2224b"

        p = Participant.objects.create(
            meeting=self.meet,
            user=self.user,
            email="testparticipant@gmail.com",
            rsvp_token=rsvp_token,
            rsvp_status="pending",
        )

        self.assertEqual(
            (
                p.meeting,
                p.user,
                p.email, 
                p.rsvp_token,
                p.rsvp_status,
            ),
            (
                self.meet,
                self.user,
                "testparticipant@gmail.com",
                rsvp_token,
                "pending",
            )
        )

class MeetingMethodTest(TestCase):

    def test_duration(self):
        meet = Meeting(
            start_datetime=datetime(2026, 8, 27, 11, 0, tzinfo=timezone.utc),
            end_datetime=datetime(2026, 8, 27, 12, 0, tzinfo=timezone.utc),
        )

        self.assertEqual(
            meet.duration,
            timedelta(hours=1)
        )
