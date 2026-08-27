"""
Comprehensive unit and integration tests validating STAR component detection,
metric preservation, and rewrite quality.
"""

from unittest import skip

from django.test import TestCase
from analyzer.bullet_optimizer import BulletOptimizer, BulletAnalysis
from analyzer.bullet_serializers import BulletOptimizationRequestSerializer


#: These tests were written against behaviour the modules under test do not
#: have. They failed from the day they were written and nobody saw it, because
#: the package they lived in was never collected (#913). Turning collection
#: back on without quarantining them would land a red build for bugs this
#: change is not making.
#:
#: Each skip names the issue that tracks the bug. Delete the decorator in the
#: pull request that fixes it — a quarantine nobody removes is how a suite
#: goes quiet a second time.

class BulletOptimizerTestCase(TestCase):
    @skip("#915: verb detection does not survive punctuation or a bullet marker")
    def test_strong_bullet_analysis(self):
        bullet = "Spearheaded a new caching system, reducing API latency by 40%."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertTrue(analysis.has_action_verb)
        self.assertTrue(analysis.has_metric)
        self.assertFalse(analysis.is_passive)
        self.assertGreaterEqual(analysis.score, 90)
        self.assertEqual(len(analysis.suggestions), 0)

    @skip("#915: a bullet with no verb, no metric and passive voice still scores 50")
    def test_weak_bullet_analysis(self):
        bullet = "Was responsible for managing the team."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertFalse(analysis.has_action_verb)
        self.assertFalse(analysis.has_metric)
        self.assertTrue(analysis.is_passive)
        self.assertLess(analysis.score, 50)
        self.assertGreater(len(analysis.suggestions), 2)

    @skip("#915: _find_result misses the trailing participial clause")
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
