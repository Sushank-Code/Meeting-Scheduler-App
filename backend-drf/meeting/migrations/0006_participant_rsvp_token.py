import uuid

from django.db import migrations, models


def populate_rsvp_tokens(apps, schema_editor):
    Participant = apps.get_model('meeting', 'Participant')
    for participant in Participant.objects.filter(rsvp_token__isnull=True):
        participant.rsvp_token = uuid.uuid4()
        participant.save(update_fields=['rsvp_token'])


class Migration(migrations.Migration):

    dependencies = [
        ('meeting', '0005_alter_participant_meeting'),
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='rsvp_token',
            field=models.UUIDField(editable=False, null=True),
        ),
        migrations.RunPython(populate_rsvp_tokens, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='participant',
            name='rsvp_token',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
