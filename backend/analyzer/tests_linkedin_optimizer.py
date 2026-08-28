"""
Unit tests for the LinkedIn Profile Optimization module.

Covers character limit enforcement, section mapping accuracy,
and edge cases for missing or malformed data.
"""

from django.test import TestCase
from .linkedin_optimizer import (
    clean_and_format_text,
    optimize_headline,
    optimize_about_section,
    optimize_experience,
    optimize_skills,
    generate_linkedin_profile,
    LINKEDIN_LIMITS,
)


class LinkedInOptimizerTests(TestCase):
    """Test suite for LinkedIn optimization logic."""

    def test_clean_and_format_text_empty(self):
        """Test that empty or None inputs return empty strings."""
        self.assertEqual(clean_and_format_text(""), "")
        self.assertEqual(clean_and_format_text(None), "")
        self.assertEqual(clean_and_format_text("   \n\n  "), "")

    def test_clean_and_format_text_normalization(self):
        """Test that extra whitespace and newlines are normalized."""
        raw_text = "This   is  a   test.\n\n\nWith   multiple  spaces."
        expected = "This is a test.\n\nWith multiple spaces."
        self.assertEqual(clean_and_format_text(raw_text), expected)

    def test_optimize_headline_within_limits(self):
        """Test headline optimization stays within character limits."""
        headline = optimize_headline(
            "Software Engineer", "Software Engineer", ["Python", "Django", "React"]
        )
        self.assertLessEqual(len(headline), LINKEDIN_LIMITS["headline"])
        self.assertIn("Software Engineer", headline)

    def test_optimize_headline_truncation(self):
        """Test that excessively long headlines are truncated properly."""
        long_role = "A" * 300
        headline = optimize_headline("", long_role, ["Skill1", "Skill2", "Skill3"])
        self.assertEqual(len(headline), LINKEDIN_LIMITS["headline"])
        self.assertTrue(headline.endswith("..."))

    def test_optimize_about_section_weak_phrase_replacement(self):
        """Test that weak phrases are replaced with strong action verbs."""
        about = "I was responsible for managing a team and helped with development."
        optimized = optimize_about_section(about, "Manager", ["Leadership"])
        self.assertNotIn("responsible for", optimized.lower())
        self.assertNotIn("helped with", optimized.lower())
        self.assertIn("spearheaded", optimized.lower())

    def test_optimize_about_section_limit(self):
        """Test that the about section respects the 2600 character limit."""
        long_about = "A" * 3000
        optimized = optimize_about_section(long_about, "Developer", ["Python"])
        self.assertLessEqual(len(optimized), LINKEDIN_LIMITS["about"])
        self.assertTrue(optimized.endswith("..."))

    def test_optimize_experience_enhancement(self):
        """Test that experience descriptions are enhanced with action verbs."""
        experiences = [
            {
                "title": "Developer",
                "company": "Tech Corp",
                "description": "worked on the backend api.",
            }
        ]
        optimized = optimize_experience(experiences)
        self.assertEqual(len(optimized), 1)
        self.assertIn("Spearheaded", optimized[0]["description"])
        self.assertEqual(
            optimized[0]["original_description"], "worked on the backend api."
        )

    def test_optimize_experience_limit(self):
        """Test that experience descriptions are truncated if too long."""
        experiences = [{"title": "Dev", "company": "Corp", "description": "A" * 2500}]
        optimized = optimize_experience(experiences)
        self.assertLessEqual(
            len(optimized[0]["description"]), LINKEDIN_LIMITS["experience_description"]
        )

    def test_optimize_skills_deduplication_and_limit(self):
        """Test that skills are deduplicated, cleaned, and limited to 50."""
        skills = ["python", "Python", " django ", "react"] + [
            "Skill" + str(i) for i in range(60)
        ]
        optimized = optimize_skills(skills)

        # Check deduplication (python and Python should be one)
        self.assertEqual(optimized.count("Python"), 1)
        self.assertEqual(optimized.count("Django"), 1)

        # Check limit
        self.assertLessEqual(len(optimized), LINKEDIN_LIMITS["skills"])

        # Check sorting
        self.assertEqual(optimized, sorted(optimized))

    def test_generate_linkedin_profile_full_flow(self):
        """Test the main generation function with comprehensive data."""
        resume_data = {
            "target_role": "Data Scientist",
            "skills": ["Python", "Machine Learning", "SQL", "Python"],
            "summary": "Tasked with building models.",
            "experiences": [
                {
                    "title": "Analyst",
                    "company": "Data Inc",
                    "description": "Handled data pipelines.",
                }
            ],
        }

        result = generate_linkedin_profile(resume_data)

        self.assertIn("headline", result)
        self.assertIn("about", result)
        self.assertIn("experiences", result)
        self.assertIn("skills", result)
        self.assertIn("limits", result)

        self.assertIn("Data Scientist", result["headline"])
        self.assertIn("spearheaded", result["about"].lower())
        self.assertEqual(len(result["skills"]), 3)  # Deduplicated
