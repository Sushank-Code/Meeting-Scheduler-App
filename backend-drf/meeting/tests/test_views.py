from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from datetime import datetime, timezone, timedelta

from accounts.models import Account
from meeting.models import Meeting, Participant


class MeetingViewTest(APITestCase):

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
            "title": "New Meeting",
            "description": "New Description",
            "start_datetime": "2026-08-28T11:00:00Z",
            "end_datetime": "2026-08-28T12:00:00Z",
            "location_type": "google_meet",
            "agenda": "Discuss project",
            "invited_emails": [
                "harry@gmail.com"
            ]
        }

    def test_unauthenticated_user_cannot_access_meetings(self):
        url = reverse('meeting-list')
        # print(url)
        response = self.client.get(url)
        # print(response)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # get request
    def test_get_meetings(self):
        # first authentication
        self.client.force_authenticate(user=self.user)

        url = reverse('meeting-list')
        response = self.client.get(url)  # array of object
        # print(f"Response : {response.data}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        self.assertEqual(response.data[0]["title"], "Test_Title")

    # post request
    def test_create_meeting(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('meeting-list')
        response = self.client.post(url, self.data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        meeting = Meeting.objects.get(title="New Meeting")
        self.assertEqual(meeting.organizer, self.user)

        # checking particiapant rows created or not
        self.assertTrue(Participant.objects.filter(
            meeting=meeting,
            email="harry@gmail.com"
        ).exists()
        )

    # retrieve request
    def test_get_meeting_detail(self):
        self.client.force_authenticate(user=self.user)
        detail_url = reverse('meeting-detail', args=[self.meet.meeting_id])

        response = self.client.get(detail_url)   # object

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response.data["title"],
            "Test_Title"
        )

    # patch request
    def test_update_meeting(self):
        self.client.force_authenticate(user=self.user)
        detail_url = reverse('meeting-detail', args=[self.meet.meeting_id])
        response = self.client.patch(
            detail_url,
            {
                "title": "Updated Meeting"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.meet.refresh_from_db()

        self.assertEqual(self.meet.title, "Updated Meeting")

    # delete request
    def test_delete_meeting_(self):
        self.client.force_authenticate(user=self.user)
        detail_url = reverse('meeting-detail', args=[self.meet.meeting_id])

        response = self.client.delete(detail_url)   # object

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_cancel_meeting(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('meeting-cancel-meeting',args=[self.meet.meeting_id])
        # print(url)
        response = self.client.post(url)

        self.assertEqual(response.status_code,status.HTTP_200_OK)

        self.meet.refresh_from_db()

        self.assertEqual(self.meet.status,"cancelled")
