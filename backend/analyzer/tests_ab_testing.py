"""
Unit tests for the A/B Testing Framework.

Validates data aggregation, statistical calculations, and endpoint security.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import ApplicationLog, ResumeAnalysis
from .ab_testing import calculate_resume_win_rates

User = get_user_model()


class ABTestingTests(TestCase):
    """Test suite for A/B testing logic and endpoints."""

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.resume1 = ResumeAnalysis.objects.create(
            user=self.user, file_name="resume_v1.pdf", ats_score=85
        )
        self.resume2 = ResumeAnalysis.objects.create(
            user=self.user, file_name="resume_v2.pdf", ats_score=90
        )

    def test_log_application_success(self):
        """Test successful logging of a job application."""
        data = {
            "resume_analysis": self.resume1.id,
            "company_name": "Tech Corp",
            "job_title": "Software Engineer",
            "status": "interviewed",
            "notes": "Great initial call.",
        }
        response = self.client.post("/api/log-application/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ApplicationLog.objects.count(), 1)

    def test_log_application_unauthorized_resume(self):
        """Test that a user cannot log an application for another user's resume."""
        other_user = User.objects.create_user(username="otheruser", password="pass")
        other_resume = ResumeAnalysis.objects.create(
            user=other_user, file_name="other.pdf"
        )

        data = {
            "resume_analysis": other_resume.id,
            "company_name": "Tech Corp",
            "job_title": "Engineer",
            "status": "applied",
        }
        response = self.client.post("/api/log-application/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("resume_analysis", response.data["errors"])

    def test_calculate_resume_win_rates_empty(self):
        """Test win rate calculation with no applications."""
        stats = calculate_resume_win_rates(self.user.id)
        self.assertEqual(stats["total_applications"], 0)
        self.assertEqual(stats["resume_stats"], [])
        self.assertIsNone(stats["best_performing_resume_id"])

    def test_calculate_resume_win_rates_with_data(self):
        """Test win rate calculation with multiple applications."""
        # Resume 1: 2 applied, 1 interviewed (33.33% success)
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume1,
            company_name="A",
            job_title="Dev",
            status="applied",
        )
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume1,
            company_name="B",
            job_title="Dev",
            status="applied",
        )
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume1,
            company_name="C",
            job_title="Dev",
            status="interviewed",
        )

        # Resume 2: 1 applied, 1 offered (100% success)
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume2,
            company_name="D",
            job_title="Dev",
            status="applied",
        )
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume2,
            company_name="E",
            job_title="Dev",
            status="offered",
        )

        stats = calculate_resume_win_rates(self.user.id)

        self.assertEqual(stats["total_applications"], 5)
        self.assertEqual(len(stats["resume_stats"]), 2)

        # Check sorting (Resume 2 should be first due to 100% success rate)
        self.assertEqual(stats["resume_stats"][0]["resume_id"], self.resume2.id)
        self.assertEqual(stats["resume_stats"][0]["success_rate"], 100.0)
        self.assertEqual(stats["best_performing_resume_id"], self.resume2.id)

    def test_ab_testing_stats_endpoint(self):
        """Test the GET /api/ab-testing-stats/ endpoint."""
        ApplicationLog.objects.create(
            user=self.user,
            resume_analysis=self.resume1,
            company_name="A",
            job_title="Dev",
            status="rejected",
        )

        response = self.client.get("/api/ab-testing-stats/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_applications"], 1)
