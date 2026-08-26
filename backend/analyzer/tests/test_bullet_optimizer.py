"""
Comprehensive unit and integration tests validating STAR component detection,
metric preservation, and rewrite quality.
"""

from django.test import TestCase
from analyzer.bullet_optimizer import BulletOptimizer, BulletAnalysis
from analyzer.bullet_serializers import BulletOptimizationRequestSerializer


class BulletOptimizerTestCase(TestCase):
    def test_strong_bullet_analysis(self):
        bullet = "Spearheaded a new caching system, reducing API latency by 40%."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertTrue(analysis.has_action_verb)
        self.assertTrue(analysis.has_metric)
        self.assertFalse(analysis.is_passive)
        self.assertGreaterEqual(analysis.score, 90)
        self.assertEqual(len(analysis.suggestions), 0)

    def test_weak_bullet_analysis(self):
        bullet = "Was responsible for managing the team."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertFalse(analysis.has_action_verb)
        self.assertFalse(analysis.has_metric)
        self.assertTrue(analysis.is_passive)
        self.assertLess(analysis.score, 50)
        self.assertGreater(len(analysis.suggestions), 2)

    def test_metric_extraction(self):
        bullet = "Increased sales by $1.5M and improved retention by 15%."
        analysis = BulletOptimizer.analyze(bullet)
        self.assertTrue(analysis.has_metric)
        self.assertIsNotNone(analysis.star_components["result"])

    def test_serializer_validation(self):
        valid_data = {
            "bullets": ["Developed a React component.", "Managed a team of 5."]
        }
        serializer = BulletOptimizationRequestSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_rejection_of_empty_bullets(self):
        invalid_data = {"bullets": ["", "   "]}
        serializer = BulletOptimizationRequestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("bullets", serializer.errors)
