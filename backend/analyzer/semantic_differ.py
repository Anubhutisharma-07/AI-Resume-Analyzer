"""
NLP-based comparison logic that parses two resume texts and categorizes
changes into skills, experience, education, and formatting improvements.
Ignores trivial whitespace changes and focuses on semantic value.
"""

import re
import difflib
from typing import List, Dict, Any, Set, Tuple
from dataclasses import dataclass, field


@dataclass
class SemanticChange:
    """Represents a single semantic change between two resume versions."""

    category: str  # 'skill', 'experience', 'education', 'formatting', 'general'
    change_type: str  # 'added', 'removed', 'modified', 'improved'
    description: str
    details: Dict[str, Any] = field(default_factory=dict)


class SemanticDiffer:
    """
    Advanced resume comparison engine.
    Extracts structured data and compares it semantically rather than just textually.
    """

    SECTION_PATTERNS = {
        "experience": re.compile(
            r"(?im)^(experience|work history|employment|professional background)"
        ),
        "education": re.compile(r"(?im)^(education|academic|qualifications|degrees)"),
        "skills": re.compile(
            r"(?im)^(skills|technologies|competencies|technical skills)"
        ),
        "summary": re.compile(r"(?im)^(summary|profile|objective|about me)"),
    }

    STRONG_ACTION_VERBS = {
        "spearheaded",
        "orchestrated",
        "architected",
        "optimized",
        "accelerated",
        "pioneered",
        "maximized",
        "streamlined",
        "overhauled",
        "championed",
    }

    WEAK_ACTION_VERBS = {
        "helped",
        "assisted",
        "worked on",
        "responsible for",
        "tasked with",
        "participated in",
        "was involved in",
    }

    @classmethod
    def compare(cls, text_v1: str, text_v2: str) -> Dict[str, Any]:
        """
        Main entry point for comparing two resume texts.
        Returns a structured dictionary of semantic changes and summary statistics.
        """
        if not text_v1 or not text_v2:
            return {
                "error": "Both resume texts must be provided.",
                "changes": [],
                "summary": {},
            }

        # Normalize texts to ignore trivial whitespace differences
        norm_v1 = cls._normalize_text(text_v1)
        norm_v2 = cls._normalize_text(text_v2)

        changes: List[SemanticChange] = []

        # 1. Semantic Section Comparison
        changes.extend(cls._compare_skills(norm_v1, norm_v2))
        changes.extend(cls._compare_experience(norm_v1, norm_v2))
        changes.extend(cls._compare_education(norm_v1, norm_v2))

        # 2. Action Verb & Phrasing Improvements
        changes.extend(cls._analyze_action_verbs(norm_v1, norm_v2))

        # 3. General Text Diff (Fallback for unstructured changes)
        changes.extend(cls._general_text_diff(norm_v1, norm_v2))

        # 4. Generate Summary Statistics
        summary = cls._generate_summary(changes)

        return {
            "changes": [c.__dict__ for c in changes],
            "summary": summary,
            "word_count_v1": len(norm_v1.split()),
            "word_count_v2": len(norm_v2.split()),
        }

    @classmethod
    def _normalize_text(cls, text: str) -> str:
        """Removes excessive whitespace and normalizes line breaks."""
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"\n+", "\n", text)
        return text.strip()

    @classmethod
    def _extract_section(cls, text: str, section_name: str) -> str:
        """Extracts the content of a specific section from the resume text."""
        pattern = cls.SECTION_PATTERNS.get(section_name)
        if not pattern:
            return ""

        match = pattern.search(text)
        if not match:
            return ""

        start_idx = match.end()
        # Find the next section header to determine the end of this section
        next_section_match = None
        for name, pat in cls.SECTION_PATTERNS.items():
            if name != section_name:
                m = pat.search(text, start_idx)
                if m and (
                    not next_section_match or m.start() < next_section_match.start()
                ):
                    next_section_match = m

        end_idx = next_section_match.start() if next_section_match else len(text)
        return text[start_idx:end_idx].strip()

    @classmethod
    def _extract_skills(cls, text: str) -> Set[str]:
        """Heuristically extracts a comma or bullet-separated list of skills."""
        skills_section = cls._extract_section(text, "skills")
        if not skills_section:
            return set()

        # Split by common delimiters
        raw_skills = re.split(r"[,•\-\n;|]", skills_section)
        return {
            s.strip().lower()
            for s in raw_skills
            if len(s.strip()) > 1 and len(s.strip()) < 50
        }

    @classmethod
    def _compare_skills(cls, text_v1: str, text_v2: str) -> List[SemanticChange]:
        """Identifies added and removed skills."""
        changes = []
        skills_v1 = cls._extract_skills(text_v1)
        skills_v2 = cls._extract_skills(text_v2)

        added = skills_v2 - skills_v1
        removed = skills_v1 - skills_v2

        for skill in added:
            changes.append(
                SemanticChange(
                    category="skill",
                    change_type="added",
                    description=f"Added skill: {skill.title()}",
                    details={"skill": skill},
                )
            )

        for skill in removed:
            changes.append(
                SemanticChange(
                    category="skill",
                    change_type="removed",
                    description=f"Removed skill: {skill.title()}",
                    details={"skill": skill},
                )
            )

        return changes

    @classmethod
    def _compare_experience(cls, text_v1: str, text_v2: str) -> List[SemanticChange]:
        """Checks for added or removed job entries based on line count and structure."""
        changes = []
        exp_v1 = cls._extract_section(text_v1, "experience")
        exp_v2 = cls._extract_section(text_v2, "experience")

        lines_v1 = [l for l in exp_v1.split("\n") if l.strip()]
        lines_v2 = [l for l in exp_v2.split("\n") if l.strip()]

        diff = len(lines_v2) - len(lines_v1)
        if diff > 2:
            changes.append(
                SemanticChange(
                    category="experience",
                    change_type="added",
                    description=f"Significant expansion in Experience section (+{diff} lines)",
                    details={"line_diff": diff},
                )
            )
        elif diff < -2:
            changes.append(
                SemanticChange(
                    category="experience",
                    change_type="removed",
                    description=f"Significant reduction in Experience section ({diff} lines)",
                    details={"line_diff": diff},
                )
            )

        return changes

    @classmethod
    def _compare_education(cls, text_v1: str, text_v2: str) -> List[SemanticChange]:
        """Checks for changes in the Education section."""
        changes = []
        edu_v1 = cls._extract_section(text_v1, "education")
        edu_v2 = cls._extract_section(text_v2, "education")

        if not edu_v1 and edu_v2:
            changes.append(
                SemanticChange(
                    category="education",
                    change_type="added",
                    description="Education section was added.",
                )
            )
        elif edu_v1 and not edu_v2:
            changes.append(
                SemanticChange(
                    category="education",
                    change_type="removed",
                    description="Education section was removed.",
                )
            )

        return changes

    @classmethod
    def _analyze_action_verbs(cls, text_v1: str, text_v2: str) -> List[SemanticChange]:
        """Detects improvements in action verbs used in bullet points."""
        changes = []

        # Simple heuristic: count occurrences of strong vs weak verbs
        words_v1 = set(re.findall(r"\b[a-z]+\b", text_v1.lower()))
        words_v2 = set(re.findall(r"\b[a-z]+\b", text_v2.lower()))

        strong_added = words_v2.intersection(cls.STRONG_ACTION_VERBS) - words_v1
        weak_removed = words_v1.intersection(cls.WEAK_ACTION_VERBS) - words_v2

        if strong_added:
            changes.append(
                SemanticChange(
                    category="formatting",
                    change_type="improved",
                    description=f"Introduced stronger action verbs: {', '.join(strong_added)}",
                    details={"verbs": list(strong_added)},
                )
            )

        if weak_removed:
            changes.append(
                SemanticChange(
                    category="formatting",
                    change_type="improved",
                    description=f"Removed weak phrasing: {', '.join(weak_removed)}",
                    details={"verbs": list(weak_removed)},
                )
            )

        return changes

    @classmethod
    def _general_text_diff(cls, text_v1: str, text_v2: str) -> List[SemanticChange]:
        """Fallback general diff for unstructured text changes."""
        changes = []
        matcher = difflib.SequenceMatcher(None, text_v1.split(), text_v2.split())

        added_words = 0
        removed_words = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "insert":
                added_words += j2 - j1
            elif tag == "delete":
                removed_words += i2 - i1

        # Only report if the general text change is substantial and not covered by sections
        if added_words > 50 or removed_words > 50:
            changes.append(
                SemanticChange(
                    category="general",
                    change_type="modified",
                    description=f"General text updated (+{added_words} words, -{removed_words} words)",
                    details={
                        "added_words": added_words,
                        "removed_words": removed_words,
                    },
                )
            )

        return changes

    @classmethod
    def _generate_summary(cls, changes: List[SemanticChange]) -> Dict[str, int]:
        """Aggregates changes into a high-level summary."""
        summary = {
            "skills_added": 0,
            "skills_removed": 0,
            "experience_expanded": 0,
            "experience_reduced": 0,
            "phrasing_improved": 0,
            "general_modifications": 0,
        }

        for change in changes:
            if change.category == "skill":
                if change.change_type == "added":
                    summary["skills_added"] += 1
                elif change.change_type == "removed":
                    summary["skills_removed"] += 1
            elif change.category == "experience":
                if change.change_type == "added":
                    summary["experience_expanded"] += 1
                elif change.change_type == "removed":
                    summary["experience_reduced"] += 1
            elif change.category == "formatting" and change.change_type == "improved":
                summary["phrasing_improved"] += 1
            elif change.category == "general":
                summary["general_modifications"] += 1

        return summary
