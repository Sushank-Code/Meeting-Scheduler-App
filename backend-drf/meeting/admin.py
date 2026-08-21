from django.contrib import admin
from meeting.models import Meeting,Participant

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['meeting_id','title','location_type','organizer','status']
    list_display_links =['title']
    list_editable = ['status']
    list_filter = ['location_type']
    readonly_fields = ['created_at','updated_at']
    
@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['id','meeting','user','email','rsvp_status']
    list_display_links =['meeting']
    list_editable = ['rsvp_status']
    list_filter = ['rsvp_status']
    readonly_fields = ['invited_at']
    