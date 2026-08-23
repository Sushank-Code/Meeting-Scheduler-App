from django.db import models


class EmailNotification(models.Model):
    # "Records participant emails that must only be sent once per meeting."

    REMINDER = 'reminder'
    CANCELLATION = 'cancellation'
    TYPES = [
        (REMINDER, 'Reminder'),
        (CANCELLATION, 'Cancellation'),
    ]

    meeting = models.ForeignKey('meeting.Meeting', on_delete=models.CASCADE)
    participant = models.ForeignKey('meeting.Participant', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=TYPES)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['meeting', 'participant', 'notification_type'],
                name='unique_meeting_participant_email_notification',
            )
        ]
