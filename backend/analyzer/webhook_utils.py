import requests
import threading
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
from .models import Webhook

def fire_webhook(url, payload):
    """Fires webhook with 3 retries and exponential backoff for 5xx errors."""
    session = requests.Session()
    retry_strategy = Retry(total=3, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504])
    session.mount("http://", HTTPAdapter(max_retries=retry_strategy))
    session.mount("https://", HTTPAdapter(max_retries=retry_strategy))
    try:
        session.post(url, json=payload, timeout=10)
    except Exception as e:
        print(f"Webhook failed for {url}: {e}")

def trigger_webhooks_for_user(user, analysis_data):
    """Finds active webhooks for a user and fires them in a background thread."""
    if not user:
        return
    webhooks = Webhook.objects.filter(user=user, is_active=True)
    if not webhooks.exists():
        return
        
    payload = {"event": "resume_analysis.completed", "data": analysis_data}
    for webhook in webhooks:
        threading.Thread(target=fire_webhook, args=(webhook.url, payload)).start()
