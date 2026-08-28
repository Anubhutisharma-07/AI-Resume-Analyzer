"""
Unit tests for the Accessibility Checker module.

Covers various structural failure scenarios and valid accessible resumes.
"""

from django.test import TestCase
from .accessibility_checker import (
    check_accessibility,
    calculate_accessibility_score,
    get_recommendation,
)


class AccessibilityCheckerTests(TestCase):
    """Test suite for accessibility checking logic."""

    def test_check_accessibility_valid_resume(self):
        """Test that a well-formatted resume passes with no findings."""
        valid_resume = """
        Contact: john.doe@email.com | (555) 123-4567
        
        Professional Experience
        - Developed backend services using Python.
        - Led a team of 5 engineers.
        
        Education
        - B.S. Computer Science
        """
        findings = check_accessibility(valid_resume)
        self.assertEqual(len(findings), 0)

    def test_check_accessibility_missing_contact(self):
        """Test detection of missing contact information."""
        bad_resume = "I am a software engineer with 5 years of experience."
        findings = check_accessibility(bad_resume)

        missing_contact = [f for f in findings if f["rule"] == "missing_contact_header"]
        self.assertEqual(len(missing_contact), 1)
        self.assertEqual(missing_contact[0]["severity"], "critical")

    def test_check_accessibility_no_bullets(self):
        """Test detection of missing bullet points."""
        bad_resume = "Contact: test@test.com\nExperience\nI did many things and worked on projects."
        findings = check_accessibility(bad_resume)

        no_bullets = [f for f in findings if f["rule"] == "no_bullet_points"]
        self.assertEqual(len(no_bullets), 1)
        self.assertEqual(no_bullets[0]["severity"], "warning")

    def test_check_accessibility_excessive_caps(self):
        """Test detection of excessive ALL CAPS usage."""
        bad_resume = "Contact: test@test.com\nEXPERIENCE\nSOFTWARE ENGINEER\nMANAGER\nDIRECTOR\nVP\nCTO"
        findings = check_accessibility(bad_resume)

        caps_issue = [f for f in findings if f["rule"] == "excessive_caps"]
        self.assertEqual(len(caps_issue), 1)

    def test_calculate_accessibility_score_perfect(self):
        """Test that a resume with no findings scores 100."""
        score = calculate_accessibility_score([])
        self.assertEqual(score, 100)

    def test_calculate_accessibility_score_penalties(self):
        """Test that the score decreases correctly based on severity."""
        findings = [
            {"severity": "critical"},
            {"severity": "warning"},
            {"severity": "info"},
        ]
        score = calculate_accessibility_score(findings)
        # 100 - 30 - 15 - 5 = 50
        self.assertEqual(score, 50)

    def test_calculate_accessibility_score_minimum(self):
        """Test that the score does not drop below 0."""
        findings = [
            {"severity": "critical"},
            {"severity": "critical"},
            {"severity": "critical"},
            {"severity": "critical"},
        ]
        score = calculate_accessibility_score(findings)
        self.assertEqual(score, 0)

    def test_get_recommendation_exists(self):
        """Test that recommendations are provided for known rules."""
        rec = get_recommendation("no_bullet_points")
        self.assertIn("bullet", rec.lower())

    def test_get_recommendation_fallback(self):
        """Test that a fallback recommendation is provided for unknown rules."""
        rec = get_recommendation("unknown_rule")
        self.assertIn("review", rec.lower())
