from django.db import models
from django.contrib.auth.models import User
import uuid


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
    missing_skills = models.JSONField(default=list)
    target_role = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    job_description = models.TextField(blank=True, null=True)
    resume_text = models.TextField(blank=True, null=True)
    share_id = models.UUIDField(default=uuid.uuid4, unique=True)
    cover_letter_text = models.TextField(blank=True, null=True)
    cover_letter_feedback = models.JSONField(blank=True, null=True)
    interview_questions = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} — {self.file_name} ({self.score}%)"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.FileField(upload_to="avatars/", blank=True, null=True)
    weekly_digest_opt_in = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Profile"


# ==========================================
# NEW WEBHOOK MODEL ADDED HERE
# ==========================================
class Webhook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="webhooks")
    url = models.URLField(max_length=500)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.url}"
# ==========================================


class SuggestionFeedback(models.Model):
    """A user's up/down vote on one suggestion from one of their analyses.

    Suggestions are generated from a template, so votes are the only signal
    available for whether the recommendations are worth reading. One row per
    (user, analysis, suggestion): voting again updates the existing row rather
    than stacking duplicates.
    """

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
    #: SHA-256 of the suggestion text. The uniqueness constraint keys on this
    #: rather than the text itself, because databases limit how many bytes an
    #: index entry may hold and suggestions have no length bound.
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
        # Keep the hash in step with the text no matter who writes the row.
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
