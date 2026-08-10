from celery import shared_task
from .services import analyze_resume

@shared_task
def analyze_resume_task(file_path, target_role, file_name, user_id=None, job_description=None, cover_letter_path=None, cover_letter_name=None):
    return analyze_resume(
        file_path=file_path,
        target_role=target_role,
        file_name=file_name,
        user_id=user_id,
        job_description=job_description,
        cover_letter_path=cover_letter_path,
        cover_letter_name=cover_letter_name
    )
