from celery import shared_task
from django.contrib.auth import get_user_model
from .services import analyze_resume
from .webhook_utils import trigger_webhooks_for_user

User = get_user_model()

@shared_task
def analyze_resume_task(file_path, target_role, file_name, user_id=None, job_description=None, cover_letter_path=None, cover_letter_name=None):
    
    # 1. Run the AI analysis and capture the result
    analysis_result = analyze_resume(
        file_path=file_path,
        target_role=target_role,
        file_name=file_name,
        user_id=user_id,
        job_description=job_description,
        cover_letter_path=cover_letter_path,
        cover_letter_name=cover_letter_name
    )

    # 2. If this was triggered by a logged-in user, fire their webhooks
    if user_id:
        try:
            user = User.objects.get(id=user_id)
            trigger_webhooks_for_user(user, analysis_result)
        except Exception as e:
            print(f"Failed to trigger webhooks for user {user_id}: {e}")

    # 3. Return the result so the Celery task completes successfully
    return analysis_result
