
from django.urls import path,include
from rest_framework.routers import DefaultRouter
from meeting import views

router = DefaultRouter()
router.register('',views.MeetingView,basename='meeting')


urlpatterns = [
    path('',include(router.urls))
]
