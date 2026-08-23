
from django.urls import path,include
from rest_framework.routers import DefaultRouter
from meeting import views

router = DefaultRouter()
# http://127.0.0.1:8000/api/v1/meeting/
router.register('',views.MeetingView,basename='meeting')

urlpatterns = [
    path('rsvp/<uuid:token>/', views.PublicRsvpView.as_view()),
    path('<uuid:meeting_id>/participants/', views.MeetingParticipantListCreateView.as_view()),
    path('<uuid:meeting_id>/participants/<int:participant_id>/', views.MeetingParticipantDetailView.as_view()),
    path('<uuid:meeting_id>/rsvp/', views.MeetingRsvpView.as_view()),
    path('',include(router.urls))
]
