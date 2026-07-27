from django.contrib import admin
from meeting.models import Meeting,Participant

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['meeting_id','title','location_type','organizer','status']
    list_display_links =['title']
    list_filter = ['location_type']
    readonly_fields = ['created_at','updated_at']
    
admin.site.register(Participant)