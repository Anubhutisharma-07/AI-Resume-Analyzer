"""
Resume Phrase Cliché Detector and Modernizer.

This module identifies overused buzzwords, passive voice, and cliché phrases
in resume bullet points, offering strong, action-oriented, and modern alternatives.
"""

import re
from typing import List, Dict, Any, Tuple

# Comprehensive dictionary of clichés mapped to strong alternatives
CLICHE_DICTIONARY = {
    r"\bresponsible for\b": "spearheaded",
    r"\bduties included\b": "managed",
    r"\bhelped with\b": "collaborated on",
    r"\bworked on\b": "developed",
    r"\btasked with\b": "executed",
    r"\bassisted in\b": "supported",
    r"\bparticipated in\b": "contributed to",
    r"\bhandled\b": "orchestrated",
    r"\bwas in charge of\b": "directed",
    r"\bthink outside the box\b": "innovated",
    r"\bgo-getter\b": "proactive",
    r"\bteam player\b": "collaborative",
    r"\bhard worker\b": "dedicated",
    r"\bresults-driven\b": "impact-focused",
    r"\bsynergy\b": "collaboration",
    r"\bleverage\b": "utilized",
    r"\butilize\b": "used",
    r"\bparadigm shift\b": "transformation",
    r"\bbest-in-class\b": "industry-leading",
    r"\bworld-class\b": "exceptional",
}

# Passive voice indicators (simplified heuristic)
PASSIVE_INDICATORS = [
    r"\bwas\b",
    r"\bwere\b",
    r"\bbeen\b",
    r"\bbeing\b",
    r"\bis\b",
    r"\bare\b",
]


def detect_cliches(text: str) -> List[Dict[str, Any]]:
    """
    Detects cliché phrases in the provided text.

    Args:
        text (str): The resume text or bullet point to analyze.

    Returns:
        List[Dict[str, Any]]: A list of detected clichés with their positions and suggestions.
    """
    detections = []
    text_lower = text.lower()

    for pattern, suggestion in CLICHE_DICTIONARY.items():
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            original_phrase = text[match.start() : match.end()]
            detections.append(
                {
                    "phrase": original_phrase,
                    "start": match.start(),
                    "end": match.end(),
                    "suggestion": suggestion,
                    "type": "cliche",
                }
            )

    return detections


def detect_passive_voice(text: str) -> List[Dict[str, Any]]:
    """
    Heuristically detects potential passive voice constructions.

    Args:
        text (str): The resume text to analyze.

    Returns:
        List[Dict[str, Any]]: A list of potential passive voice indicators.
    """
    detections = []
    words = text.split()

    for i, word in enumerate(words):
        word_lower = word.lower().strip(".,;:!?")
        if word_lower in ["was", "were", "been", "being", "is", "are"]:
            # Check if the next word is a past participle (simplified check)
            if i + 1 < len(words):
                next_word = words[i + 1].lower().strip(".,;:!?")
                if next_word.endswith(("ed", "en", "t")):
                    detections.append(
                        {
                            "phrase": f"{word} {words[i + 1]}",
                            "start": text.lower().find(f"{word_lower} {next_word}"),
                            "end": text.lower().find(f"{word_lower} {next_word}")
                            + len(f"{word} {words[i + 1]}"),
                            "suggestion": "Rewrite in active voice (e.g., 'Led', 'Built', 'Created')",
                            "type": "passive",
                        }
                    )

    return detections


def analyze_and_suggest(text: str) -> Dict[str, Any]:
    """
    Main function to analyze text for clichés and passive voice, providing suggestions.

    Args:
        text (str): The resume text to analyze.

    Returns:
        Dict[str, Any]: Analysis results including detections and a modernized version.
    """
    if not text or not isinstance(text, str):
        return {"detections": [], "modernized_text": "", "score": 100}

    cliches = detect_cliches(text)
    passive = detect_passive_voice(text)

    # Combine and sort detections by start position
    all_detections = sorted(cliches + passive, key=lambda x: x["start"])

    # Generate modernized text by replacing clichés
    modernized_text = text
    # Sort in reverse to replace from end to start, preserving indices
    for detection in sorted(all_detections, key=lambda x: x["start"], reverse=True):
        if detection["type"] == "cliche":
            # Preserve original casing of the first letter
            original = detection["phrase"]
            suggestion = detection["suggestion"]
            if original[0].isupper():
                suggestion = suggestion.capitalize()
            modernized_text = (
                modernized_text[: detection["start"]]
                + suggestion
                + modernized_text[detection["end"] :]
            )

    # Calculate a simple "impact score"
    total_words = len(text.split())
    issues_count = len(all_detections)
    score = max(0, 100 - int((issues_count / max(total_words, 1)) * 500))

    return {
        "detections": all_detections,
        "modernized_text": modernized_text,
        "score": score,
        "total_issues": issues_count,
    }
