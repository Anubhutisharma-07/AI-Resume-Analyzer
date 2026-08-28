"""
Resume Accessibility and Screen Reader Compliance Checker.

This module evaluates resume structure for screen-reader compatibility,
flagging issues like missing heading hierarchies, improper list formatting,
or problematic layouts that hinder assistive technologies.
"""

import re
from typing import List, Dict, Any

# Heuristic rules for accessibility checks
ACCESSIBILITY_RULES = {
    "missing_contact_header": {
        "severity": "critical",
        "description": "Resume lacks a clear, top-level contact information section.",
        "check": lambda text: not re.search(
            r"(?:email|phone|address|linkedin)", text, re.IGNORECASE
        ),
    },
    "no_bullet_points": {
        "severity": "warning",
        "description": "Experience sections lack bullet points, making them hard to parse for screen readers.",
        "check": lambda text: "-" not in text and "*" not in text and "•" not in text,
    },
    "excessive_caps": {
        "severity": "warning",
        "description": "Excessive use of ALL CAPS can be read as individual letters by some screen readers.",
        "check": lambda text: len(re.findall(r"\b[A-Z]{4,}\b", text)) > 5,
    },
    "special_characters": {
        "severity": "info",
        "description": "Contains special characters or symbols that may not be vocalized correctly.",
        "check": lambda text: bool(re.search(r"[^\w\s\-\.\,\:\;\(\)\[\]\/\@]", text)),
    },
    "missing_section_headers": {
        "severity": "critical",
        "description": "Resume lacks standard section headers (e.g., Experience, Education, Skills).",
        "check": lambda text: not re.search(
            r"(?:experience|education|skills|summary|projects)", text, re.IGNORECASE
        ),
    },
}


def check_accessibility(resume_text: str) -> List[Dict[str, Any]]:
    """
    Evaluates the resume text against accessibility heuristic rules.

    Args:
        resume_text (str): The parsed text of the resume.

    Returns:
        List[Dict[str, Any]]: A list of findings with severity, description, and rule name.
    """
    if not resume_text or not isinstance(resume_text, str):
        return []

    findings = []

    for rule_name, rule_data in ACCESSIBILITY_RULES.items():
        if rule_data["check"](resume_text):
            findings.append(
                {
                    "rule": rule_name,
                    "severity": rule_data["severity"],
                    "description": rule_data["description"],
                    "recommendation": get_recommendation(rule_name),
                }
            )

    return findings


def get_recommendation(rule_name: str) -> str:
    """
    Provides a specific recommendation for a given accessibility rule violation.
    """
    recommendations = {
        "missing_contact_header": "Add a dedicated 'Contact' section at the very top with your email, phone, and LinkedIn URL.",
        "no_bullet_points": "Use standard bullet characters (-, *, or •) for lists to ensure screen readers identify them as list items.",
        "excessive_caps": "Use Title Case or Sentence case instead of ALL CAPS for headings to improve screen reader vocalization.",
        "special_characters": "Replace decorative symbols (e.g., arrows, stars) with standard text or simple bullet points.",
        "missing_section_headers": "Include clear, standard headings like 'Professional Experience', 'Education', and 'Skills'.",
    }
    return recommendations.get(
        rule_name, "Review this section for clarity and standard formatting."
    )


def calculate_accessibility_score(findings: List[Dict[str, Any]]) -> int:
    """
    Calculates an accessibility compliance score from 0 to 100.
    """
    if not findings:
        return 100

    score = 100
    for finding in findings:
        if finding["severity"] == "critical":
            score -= 30
        elif finding["severity"] == "warning":
            score -= 15
        elif finding["severity"] == "info":
            score -= 5

    return max(0, score)
