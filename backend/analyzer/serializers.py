from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import OpenApiResponse, extend_schema
from . import sharing
from .models import Resume, ResumeAnalysis


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = "__all__"


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "password")

    def validate_password(self, value):
        candidate = User(username=self.initial_data.get("username") or "")
        try:
            validate_password(value, user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        request = self.context.get("request")
        if request and hasattr(request, "data"):
            captcha_token = request.data.get("captcha_token") or request.data.get("captcha")
            from .views import verify_captcha_token
            if not verify_captcha_token(captcha_token):
                raise serializers.ValidationError(
                    {"captcha_token": ["CAPTCHA verification failed. Please complete the security challenge."]}
                )
        username = attrs.get("username")
        password = attrs.get("password")
        from django.contrib.auth import authenticate
        from django.contrib.auth.models import User
        from rest_framework.exceptions import AuthenticationFailed
        user = User.objects.filter(username=username).first()
        if not user:
            raise AuthenticationFailed("No active account found with the given credentials.")
        if not user.is_active:
            raise AuthenticationFailed({
                "detail": "Your account has been locked or deactivated. Please reset your password to unlock it or contact support.",
                "code": "account_locked"
            })
        if not user.check_password(password):
            raise AuthenticationFailed("No active account found with the given credentials.")
        profile = getattr(user, 'profile', None)
        is_verified = getattr(profile, 'is_verified', True) if profile else True
        if not is_verified:
            raise AuthenticationFailed({
                "detail": "Your email address is not verified. Please verify your email to gain full account access.",
                "code": "email_unverified",
                "email": user.email
            })
        data = super().validate(attrs)
        profile, _ = UserProfile.objects.get_or_create(user=self.user)
        if profile.avatar:
            if request:
                data["avatar_url"] = request.build_absolute_uri(profile.avatar.url)
            else:
                data["avatar_url"] = profile.avatar.url
        else:
            data["avatar_url"] = None
        if request:
            from .models import KnownDevice
            from .views import get_client_ip, parse_user_agent, send_new_device_login_alert
            ip = get_client_ip(request)
            ua = request.META.get('HTTP_USER_AGENT', '')
            device = parse_user_agent(ua)
            known_devices = KnownDevice.objects.filter(user=self.user)
            has_existing = known_devices.exists()
            device_exists = known_devices.filter(ip_address=ip, device_info=device).exists()
            if not device_exists:
                if has_existing:
                    try:
                        send_new_device_login_alert(self.user, ip, device)
                    except Exception:
                        pass
                try:
                    KnownDevice.objects.get_or_create(
                        user=self.user,
                        ip_address=ip,
                        device_info=device
                    )
                except Exception:
                    pass
        return data


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    """Full record, including the extracted text. Used for a single analysis."""
    class Meta:
        model = ResumeAnalysis
        fields = ("id", "share_id", "file_name", "score", "skills_found", "suggestions",
                  "matched_skills", "partial_skills", "missing_skills", "target_role", "experience_level", "created_at", "resume_text",
                  "cover_letter_text", "cover_letter_feedback", "interview_questions")


class ResumeAnalysisListSerializer(serializers.ModelSerializer):
    """Slim record for history listings."""
    class Meta:
        model = ResumeAnalysis
        fields = ("id", "share_id", "file_name", "score", "skills_found", "suggestions",
                  "matched_skills", "partial_skills", "missing_skills", "target_role", "experience_level", "created_at")

class PublicSharedAnalysisSerializer(serializers.ModelSerializer):
    share_id = serializers.CharField(read_only=True)
    expires_at = serializers.DateTimeField(source="share_expires_at", read_only=True)
    class Meta:
        model = ResumeAnalysis
        fields = sharing.PUBLIC_FIELDS + ("expires_at",)
        read_only_fields = fields
    def to_representation(self, instance):
        return sharing.redact_structure(super().to_representation(instance))


class ShareStateSerializer(serializers.ModelSerializer):
    is_live = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()
    class Meta:
        model = ResumeAnalysis
        fields = ("share_id", "share_enabled", "share_created_at", "share_expires_at", "share_view_count", "is_live", "share_url")
        read_only_fields = fields
    def get_is_live(self, obj) -> bool:
        return obj.is_share_live()
    def get_share_url(self, obj):
        if not obj.is_share_live():
            return None
        base = getattr(settings, "FRONTEND_URL", "") or ""
        return f"{base.rstrip('/')}/shared/{obj.share_id}"


class VersionComparisonSerializer(serializers.Serializer):
    older_id = serializers.IntegerField()
    newer_id = serializers.IntegerField()
    older_label = serializers.CharField()
    newer_label = serializers.CharField()
    older_score = serializers.IntegerField()
    newer_score = serializers.IntegerField()
    score_delta = serializers.IntegerField()
    added_skills = serializers.ListField(child=serializers.CharField())
    removed_skills = serializers.ListField(child=serializers.CharField())
    newly_matched_skills = serializers.ListField(child=serializers.CharField())
    newly_missing_skills = serializers.ListField(child=serializers.CharField())
    still_missing_skills = serializers.ListField(child=serializers.CharField())
    text_diff = serializers.ListField(child=serializers.DictField())
    insights = serializers.ListField(child=serializers.CharField())


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, allow_blank=False)
    weekly_digest_opt_in = serializers.BooleanField(required=False, default=False)
    notification_preferences = serializers.JSONField(required=False)

    class Meta:
        model = User
        fields = ("username", "email", "weekly_digest_opt_in", "notification_preferences")

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        profile, _ = UserProfile.objects.get_or_create(user=instance)
        prefs = profile.notification_preferences or {}
        ret["weekly_digest_opt_in"] = profile.weekly_digest_opt_in
        ret["notification_preferences"] = {
            "in_app": prefs.get("in_app", True),
            "browser": prefs.get("browser", False),
        }
        return ret

    def update(self, instance, validated_data):
        weekly_digest_opt_in = validated_data.pop("weekly_digest_opt_in", None)
        notification_preferences = validated_data.pop("notification_preferences", None)
        user = super().update(instance, validated_data)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        changed = False
        if weekly_digest_opt_in is not None:
            profile.weekly_digest_opt_in = weekly_digest_opt_in
            changed = True
        if notification_preferences is not None:
            current = profile.notification_preferences or {}
            profile.notification_preferences = {
                "in_app": notification_preferences.get("in_app", current.get("in_app", True)),
                "browser": notification_preferences.get("browser", current.get("browser", False)),
            }
            changed = True
        if changed:
            profile.save()
        return user

    def validate_email(self, value):
        user = None
        if "request" in self.context and self.context["request"].user:
            user = self.context["request"].user
        qs = User.objects.filter(email__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        user = None
        if "request" in self.context and self.context["request"].user:
            user = self.context["request"].user
        qs = User.objects.filter(username__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value


from .models import SuggestionFeedback

class SuggestionFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SuggestionFeedback
        fields = ("id", "analysis", "suggestion_text", "vote", "comment", "updated_at")
        read_only_fields = fields


from .models import Webhook
from .url_safety import UnsafeURLError, assert_url_is_safe

class WebhookSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    class Meta:
        model = Webhook
        fields = ("id", "url", "description", "is_active", "created_at", "status")
        read_only_fields = ("id", "created_at", "status")
    def get_status(self, obj):
        return {
            "last_delivery_at": obj.last_delivery_at.isoformat() if obj.last_delivery_at else None,
            "last_status_code": obj.last_status_code,
            "last_error": obj.last_error,
            "consecutive_failures": obj.consecutive_failures,
        }
    def validate_url(self, value):
        try:
            assert_url_is_safe(value)
        except UnsafeURLError as exc:
            raise serializers.ValidationError(
                "That URL cannot be used as a webhook destination. It must be a public HTTPS or HTTP address on port 80 or 443 — internal, loopback and cloud-metadata addresses are not permitted."
            ) from exc
        return value
    def validate(self, attrs):
        user = self.context["request"].user
        url = attrs.get("url", getattr(self.instance, "url", None))
        duplicates = Webhook.objects.filter(user=user, url=url)
        if self.instance is not None:
            duplicates = duplicates.exclude(pk=self.instance.pk)
        if duplicates.exists():
            raise serializers.ValidationError({"url": "You have already registered a webhook for that URL."})
        return attrs
