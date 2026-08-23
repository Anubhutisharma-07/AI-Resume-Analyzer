import secrets
import uuid
from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class Resume(models.Model):
    file = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)


class ResumeAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="analyses")
    file_name = models.CharField(max_length=255)
    score = models.IntegerField()
    skills_found = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    matched_skills = models.JSONField(default=list)
    partial_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list)
    target_role = models.CharField(max_length=100)
    experience_level = models.CharField(max_length=50, default="Mid-Level", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    job_description = models.TextField(blank=True, null=True)
    resume_text = models.TextField(blank=True, null=True)
    cover_letter_text = models.TextField(blank=True, null=True)
    cover_letter_feedback = models.JSONField(blank=True, null=True)
    interview_questions = models.JSONField(blank=True, null=True)

    # --- Public sharing ---------------------------------------------------
    share_id = models.UUIDField(default=uuid.uuid4, unique=True)
    share_enabled = models.BooleanField(default=False)
    share_created_at = models.DateTimeField(null=True, blank=True)
    share_expires_at = models.DateTimeField(null=True, blank=True)
    share_view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} — {self.file_name} ({self.score}%)"

    def is_share_live(self, at=None):
        if not self.share_enabled:
            return False
        if self.share_expires_at is None:
            return False
        return self.share_expires_at > (at or timezone.now())

    def enable_sharing(self, lifetime_days, rotate=False, at=None):
        now = at or timezone.now()
        if rotate or not self.share_enabled:
            self.share_view_count = 0
        if rotate:
            self.share_id = uuid.uuid4()
        self.share_enabled = True
        self.share_created_at = now
        self.share_expires_at = now + timedelta(days=lifetime_days)
        self.save(
            update_fields=[
                "share_id",
                "share_enabled",
                "share_created_at",
                "share_expires_at",
                "share_view_count",
            ]
        )
        return self

    def revoke_sharing(self):
        self.share_enabled = False
        self.share_expires_at = None
        self.save(update_fields=["share_enabled", "share_expires_at"])
        return self

    def register_share_view(self):
        type(self).objects.filter(pk=self.pk).update(
            share_view_count=models.F("share_view_count") + 1
        )


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.FileField(upload_to="avatars/", blank=True, null=True)
    weekly_digest_opt_in = models.BooleanField(default=False)
    notification_preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="Per-channel notification preferences. Missing keys use documented defaults.",
    )

    def __str__(self):
        return f"{self.user.username}'s Profile"


class KnownDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="known_devices")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.CharField(max_length=255)
    last_login = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'ip_address', 'device_info')

    def __str__(self):
        return f"{self.user.username} - {self.device_info} ({self.ip_address})"


def generate_webhook_secret():
    return secrets.token_hex(32)


class Webhook(models.Model):
    EVENT_ANALYSIS_COMPLETED = "resume_analysis.completed"
    EVENT_PING = "ping"
    MAX_CONSECUTIVE_FAILURES = 10

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="webhooks")
    url = models.URLField(max_length=500)
    description = models.CharField(max_length=120, blank=True, default="")
    secret = models.CharField(max_length=64, default=generate_webhook_secret)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_delivery_at = models.DateTimeField(null=True, blank=True)
    last_status_code = models.IntegerField(null=True, blank=True)
    last_error = models.CharField(max_length=255, blank=True, default="")
    consecutive_failures = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "url"], name="unique_webhook_url_per_user"
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.url}"

    def record_success(self, status_code):
        self.last_delivery_at = timezone.now()
        self.last_status_code = status_code
        self.last_error = ""
        self.consecutive_failures = 0
        self.save(
            update_fields=[
                "last_delivery_at",
                "last_status_code",
                "last_error",
                "consecutive_failures",
            ]
        )

    def record_failure(self, error, status_code=None):
        self.last_delivery_at = timezone.now()
        self.last_status_code = status_code
        self.last_error = str(error)[:255]
        self.consecutive_failures += 1
        fields = [
            "last_delivery_at",
            "last_status_code",
            "last_error",
            "consecutive_failures",
        ]
        if self.consecutive_failures >= self.MAX_CONSECUTIVE_FAILURES:
            self.is_active = False
            fields.append("is_active")
        self.save(update_fields=fields)


class SuggestionFeedback(models.Model):
    UP = "up"
    DOWN = "down"
    VOTE_CHOICES = [(UP, "Helpful"), (DOWN, "Not helpful")]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="suggestion_feedback"
    )
    analysis = models.ForeignKey(
        ResumeAnalysis, on_delete=models.CASCADE, related_name="suggestion_feedback"
    )
    suggestion_text = models.TextField()
    suggestion_hash = models.CharField(max_length=64, db_index=True)
    vote = models.CharField(max_length=4, choices=VOTE_CHOICES)
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "analysis", "suggestion_hash"],
                name="unique_feedback_per_suggestion",
            )
        ]

    @staticmethod
    def hash_suggestion(text: str) -> str:
        import hashlib
        return hashlib.sha256((text or "").strip().encode("utf-8")).hexdigest()

    def save(self, *args, **kwargs):
        self.suggestion_hash = self.hash_suggestion(self.suggestion_text)
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} voted {self.vote} on \"{self.suggestion_text[:40]}\""


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    skills = models.ManyToManyField(Skill, related_name="roles")

    def __str__(self):
        return self.name


from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.core.cache import cache


@receiver([post_save, post_delete], sender=Role)
@receiver([post_save, post_delete], sender=Skill)
def invalidate_role_skills_cache(sender, **kwargs):
    cache.delete("role_skills_dict")


@receiver(m2m_changed, sender=Role.skills.through)
def invalidate_m2m_cache(sender, **kwargs):
    cache.delete("role_skills_dict")
