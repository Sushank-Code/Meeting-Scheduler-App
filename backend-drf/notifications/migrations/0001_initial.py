import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('meeting', '0006_participant_rsvp_token'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('reminder', 'Reminder'), ('cancellation', 'Cancellation')], max_length=20)),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('meeting', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='meeting.meeting')),
                ('participant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='meeting.participant')),
            ],
            options={
                'constraints': [
                    models.UniqueConstraint(
                        fields=('meeting', 'participant', 'notification_type'),
                        name='unique_meeting_participant_email_notification',
                    ),
                ],
            },
        ),
    ]
