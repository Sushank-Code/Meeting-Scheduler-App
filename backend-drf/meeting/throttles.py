from rest_framework.throttling import UserRateThrottle

class MeetingCreateThrottle(UserRateThrottle):
    scope = 'meeting_create'

    