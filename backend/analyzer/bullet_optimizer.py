"""
Core NLP logic to parse, evaluate, and rewrite resume bullet points
using the STAR (Situation, Task, Action, Result) framework.
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class BulletAnalysis:
    original: str
    has_action_verb: bool
    has_metric: bool
    is_passive: bool
    star_components: Dict[str, Optional[str]]
    score: int
    suggestions: List[str]
    rewrites: List[str]


class BulletOptimizer:
    """Evaluates and optimizes resume bullet points."""

    ACTION_VERBS = {
        "achieved",
        "improved",
        "trained",
        "managed",
        "created",
        "resolved",
        "volunteered",
        "influenced",
        "increased",
        "decreased",
        "launched",
        "spearheaded",
        "orchestrated",
        "developed",
        "engineered",
    }

    PASSIVE_INDICATORS = ["was", "were", "been", "being", "is", "are", "am"]

    METRIC_PATTERN = re.compile(r"\b\d+%?\b|\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\$\d+")

    @classmethod
    def analyze(cls, bullet: str) -> BulletAnalysis:
        """Analyze a single bullet point for STAR compliance and quality."""
        words = bullet.lower().split()
        first_word = words[0] if words else ""

        has_action = first_word in cls.ACTION_VERBS
        has_metric = bool(cls.METRIC_PATTERN.search(bullet))
        is_passive = any(word in cls.PASSIVE_INDICATORS for word in words[:3])

        star = cls._extract_star_components(bullet)
        score = cls._calculate_score(has_action, has_metric, is_passive, star)
        suggestions = cls._generate_suggestions(
            has_action, has_metric, is_passive, star
        )
        rewrites = cls._generate_rewrites(bullet, has_action, has_metric, is_passive)

        return BulletAnalysis(
            original=bullet,
            has_action_verb=has_action,
            has_metric=has_metric,
            is_passive=is_passive,
            star_components=star,
            score=score,
            suggestions=suggestions,
            rewrites=rewrites,
        )

    @classmethod
    def _extract_star_components(cls, bullet: str) -> Dict[str, Optional[str]]:
        """Heuristically extract Situation, Task, Action, Result."""
        return {
            "situation": cls._find_context(bullet),
            "task": cls._find_objective(bullet),
            "action": cls._find_action(bullet),
            "result": cls._find_result(bullet),
        }

    @classmethod
    def _find_context(cls, text: str) -> Optional[str]:
        match = re.search(r"(?:in|at|for|during)\s+([A-Z][a-zA-Z\s]+)", text)
        return match.group(1).strip() if match else None

    @classmethod
    def _find_objective(cls, text: str) -> Optional[str]:
        match = re.search(r"(?:to|for)\s+([a-zA-Z\s]+?)(?:,|\.|by|$)", text)
        return match.group(1).strip() if match else None

    @classmethod
    def _find_action(cls, text: str) -> Optional[str]:
        words = text.split()
        for i, word in enumerate(words):
            if word.lower() in cls.ACTION_VERBS:
                return " ".join(words[i : i + 4])
        return None

    @classmethod
    def _find_result(cls, text: str) -> Optional[str]:
        match = re.search(
            r"(?:resulting in|achieving|leading to|saving|generating)\s+([a-zA-Z0-9\s%$]+)",
            text,
            re.IGNORECASE,
        )
        return match.group(1).strip() if match else None

    @classmethod
    def _calculate_score(
        cls, has_action: bool, has_metric: bool, is_passive: bool, star: Dict
    ) -> int:
        score = 50
        if has_action:
            score += 20
        if has_metric:
            score += 20
        if not is_passive:
            score += 10
        if star["result"]:
            score += 10
        if star["situation"]:
            score += 10
        return min(100, score)

    @classmethod
    def _generate_suggestions(
        cls, has_action: bool, has_metric: bool, is_passive: bool, star: Dict
    ) -> List[str]:
        suggestions = []
        if not has_action:
            suggestions.append(
                "Start with a strong action verb (e.g., 'Spearheaded', 'Developed')."
            )
        if not has_metric:
            suggestions.append(
                "Add quantifiable metrics (e.g., percentages, dollar amounts, time saved)."
            )
        if is_passive:
            suggestions.append(
                "Rewrite in active voice to demonstrate direct ownership."
            )
        if not star["result"]:
            suggestions.append("Include the outcome or impact of your action.")
        return suggestions

    @classmethod
    def _generate_rewrites(
        cls, original: str, has_action: bool, has_metric: bool, is_passive: bool
    ) -> List[str]:
        rewrites = []
        base = original.strip()

        if not has_action:
            rewrites.append(f"Spearheaded initiative: {base}")
        if not has_metric:
            rewrites.append(f"{base}, resulting in a 25% improvement in efficiency.")
        if is_passive:
            active_base = re.sub(
                r"was\s+([a-zA-Z]+ed)", r"successfully \1", base, flags=re.IGNORECASE
            )
            rewrites.append(active_base)

        if not rewrites:
            rewrites.append(f"Optimized: {base} to drive measurable business outcomes.")

        return list(set(rewrites))[:3]
