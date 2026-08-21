
from django.urls import path,include
from rest_framework.routers import DefaultRouter
from meeting import views

router = DefaultRouter()
# http://127.0.0.1:8000/api/v1/meeting/
router.register('',views.MeetingView,basename='meeting')

# http://127.0.0.1:8000/api/v1/meeting/participant/
router.register('participant',views.ParticipantView,basename='participant')


urlpatterns = [
    path('',include(router.urls))
]
