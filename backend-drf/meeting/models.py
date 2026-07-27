from django.db import models
import uuid
from accounts.models import Account
from django.core.validators import MinLengthValidator


class Meeting (models.Model):

    organizer = models.ForeignKey(Account, on_delete=models.CASCADE)

    meeting_id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False,unique=True)
    title = models.CharField(max_length=200,validators=[MinLengthValidator(3)])
    description = models.TextField(null=True,blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()

    MEET_CHOICE = [
        ('google_meet', 'Google Meet'),
        ('zoom', 'ZOOM')
    ]
    location_type = models.CharField(max_length=50, choices=MEET_CHOICE, default='google_meet')
    meeting_link = models.URLField(max_length=500)

    STATUS = [
        ('scheduled', 'SCHEDULED'),
        ('cancelled', 'CANCELLED'),
        ('completed', 'COMPLETED'),
    ]
    status = models.CharField(max_length=50,choices=STATUS,default='scheduled')
    agenda = models.TextField(null=True,blank=True)
    # the organizer fills this before the meeting
    meeting_notes = models.TextField(null=True,blank=True)
    # filled after the meeting ends
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def duration(self):
        return self.end_datetime - self.start_datetime
    
    def __str__(self):
        return self.title

class Participant(models.Model):

    meeting = models.ForeignKey(Meeting,on_delete=models.CASCADE,related_name='participant')

    user = models.ForeignKey(Account,on_delete=models.SET_NULL,null=True,blank=True)

    email = models.EmailField(max_length=254)

    RSVP_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    rsvp_status = models.CharField(max_length=50,choices=RSVP_STATUS,default='pending')
    invited_at = models.DateField(auto_now_add=True)

    class Meta :
        unique_together = [['meeting','email']]

    def __str__(self):
        return f'{self.email} - {self.meeting.title}'    