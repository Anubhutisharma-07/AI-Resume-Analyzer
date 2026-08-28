"""
Unit tests for the Cliché Detector module.

Validates detection accuracy and suggestion generation across various edge cases.
"""

from django.test import TestCase
from .cliche_detector import detect_cliches, detect_passive_voice, analyze_and_suggest


class ClicheDetectorTests(TestCase):
    """Test suite for cliché detection logic."""

    def test_detect_cliches_finds_exact_match(self):
        """Test that exact cliché phrases are detected."""
        text = "I was responsible for managing the team."
        detections = detect_cliches(text)
        self.assertEqual(len(detections), 1)
        self.assertEqual(detections[0]["phrase"], "responsible for")
        self.assertEqual(detections[0]["suggestion"], "spearheaded")

    def test_detect_cliches_case_insensitive(self):
        """Test that detection is case-insensitive."""
        text = "I Was Responsible For the project."
        detections = detect_cliches(text)
        self.assertEqual(len(detections), 1)
        self.assertEqual(detections[0]["phrase"], "Was Responsible For")

    def test_detect_cliches_no_false_positives(self):
        """Test that legitimate technical terms are not flagged."""
        text = "Utilized Python to build a robust backend system."
        # Note: 'utilized' is in the dictionary, so it WILL be flagged.
        # Let's test a truly safe phrase.
        safe_text = (
            "Developed a microservices architecture using Docker and Kubernetes."
        )
        detections = detect_cliches(safe_text)
        self.assertEqual(len(detections), 0)

    def test_detect_passive_voice_finds_indicators(self):
        """Test that passive voice indicators are detected."""
        text = "The project was completed by the team."
        detections = detect_passive_voice(text)
        self.assertGreater(len(detections), 0)
        self.assertIn("was completed", detections[0]["phrase"].lower())

    def test_analyze_and_suggest_empty_input(self):
        """Test that empty input returns safe defaults."""
        result = analyze_and_suggest("")
        self.assertEqual(result["detections"], [])
        self.assertEqual(result["modernized_text"], "")
        self.assertEqual(result["score"], 100)

    def test_analyze_and_suggest_modernization(self):
        """Test that the modernized text correctly replaces clichés."""
        text = "Tasked with handling the database migration."
        result = analyze_and_suggest(text)

        self.assertNotIn("tasked with", result["modernized_text"].lower())
        self.assertNotIn("handling", result["modernized_text"].lower())
        self.assertIn("executed", result["modernized_text"].lower())
        self.assertIn("orchestrated", result["modernized_text"].lower())

    def test_analyze_and_suggest_score_calculation(self):
        """Test that the impact score decreases with more issues."""
        clean_text = "Led the development of a new feature."
        dirty_text = "I was responsible for helping with the thing and was tasked with duties included."

        clean_result = analyze_and_suggest(clean_text)
        dirty_result = analyze_and_suggest(dirty_text)

        self.assertGreater(clean_result["score"], dirty_result["score"])
        self.assertEqual(dirty_result["total_issues"], len(dirty_result["detections"]))
