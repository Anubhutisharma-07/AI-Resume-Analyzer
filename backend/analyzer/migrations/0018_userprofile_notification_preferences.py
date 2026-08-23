from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analyzer", "0017_resumeanalysis_share_controls"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="notification_preferences",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Per-channel notification preferences. Missing keys use documented defaults.",
            ),
        ),
    ]
