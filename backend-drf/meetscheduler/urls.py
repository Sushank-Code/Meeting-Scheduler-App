
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('accounts.urls')),
    path('api/v1/meeting',include('meeting.urls')),
    # path('api/v1/notification',include('notifications.urls'))
]
