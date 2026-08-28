"""
LinkedIn Profile Optimization Module.

This module contains logic to map parsed resume data into optimized,
platform-specific content tailored for LinkedIn profiles. It respects
character limits and LinkedIn's search algorithm preferences.
"""

import re
from typing import Dict, List, Any, Optional

# LinkedIn Character Limits (as of current platform standards)
LINKEDIN_LIMITS = {
    "headline": 220,
    "about": 2600,
    "experience_description": 2000,
    "skills": 50,  # Max 50 skills allowed on LinkedIn
}

# Common strong action verbs for LinkedIn optimization
ACTION_VERBS = [
    "Spearheaded",
    "Orchestrated",
    "Engineered",
    "Developed",
    "Implemented",
    "Optimized",
    "Architected",
    "Led",
    "Managed",
    "Directed",
    "Transformed",
    "Accelerated",
    "Pioneered",
    "Streamlined",
    "Revitalized",
    "Cultivated",
]

# Weak phrases to replace for higher impact
WEAK_PHRASES = [
    "responsible for",
    "duties included",
    "helped with",
    "worked on",
    "tasked with",
    "assisted in",
    "participated in",
    "handled",
]


def clean_and_format_text(text: str) -> str:
    """
    Cleans and formats text by removing extra whitespace and normalizing line breaks.

    Args:
        text (str): The raw text to clean.

    Returns:
        str: The cleaned and formatted text.
    """
    if not text or not isinstance(text, str):
        return ""

    # Replace multiple spaces with a single space
    text = re.sub(r"\s+", " ", text)
    # Replace multiple newlines with a double newline for paragraph breaks
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def optimize_headline(
    current_headline: str, target_role: str, top_skills: List[str]
) -> str:
    """
    Optimizes the LinkedIn headline to be impactful and within character limits.

    Args:
        current_headline (str): The existing or extracted headline.
        target_role (str): The target job role.
        top_skills (List[str]): A list of top skills to include.

    Returns:
        str: The optimized headline.
    """
    if not target_role:
        target_role = "Professional"

    skills_str = " | ".join(top_skills[:3]) if top_skills else ""

    # Construct a strong, keyword-rich headline
    optimized = (
        f"{target_role} | {skills_str} | Driving Innovation and Measurable Results"
    )

    # Enforce character limit strictly
    if len(optimized) > LINKEDIN_LIMITS["headline"]:
        optimized = optimized[: LINKEDIN_LIMITS["headline"] - 3] + "..."

    return optimized


def optimize_about_section(
    about_text: str, target_role: str, top_skills: List[str]
) -> str:
    """
    Optimizes the LinkedIn 'About' section for readability and keyword density.

    Args:
        about_text (str): The original about section or summary.
        target_role (str): The target job role.
        top_skills (List[str]): A list of top skills to include.

    Returns:
        str: The optimized 'About' section.
    """
    if not about_text:
        about_text = f"Results-driven {target_role} with a proven track record of delivering high-impact solutions."

    optimized_text = about_text

    # Replace weak phrases with strong action verbs
    for phrase in WEAK_PHRASES:
        optimized_text = re.sub(
            rf"\b{phrase}\b", "spearheaded", optimized_text, flags=re.IGNORECASE
        )

    # Ensure top skills are mentioned naturally at the end if not already present
    skills_str = ", ".join(top_skills[:5])
    if skills_str and skills_str.lower() not in optimized_text.lower():
        optimized_text += f"\n\nCore Competencies: {skills_str}."

    optimized_text = clean_and_format_text(optimized_text)

    # Enforce character limit
    if len(optimized_text) > LINKEDIN_LIMITS["about"]:
        optimized_text = optimized_text[: LINKEDIN_LIMITS["about"] - 3] + "..."

    return optimized_text


def optimize_experience(experiences: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Optimizes experience entries for LinkedIn, focusing on impact and action verbs.

    Args:
        experiences (List[Dict[str, Any]]): A list of experience dictionaries.

    Returns:
        List[Dict[str, Any]]: A list of optimized experience dictionaries.
    """
    optimized_experiences = []

    for exp in experiences:
        title = exp.get("title", "Professional")
        company = exp.get("company", "Company")
        description = exp.get("description", "")

        # Enhance description with action verbs if it's too passive
        if description and not any(
            verb.lower() in description.lower() for verb in ACTION_VERBS
        ):
            description = (
                f"Spearheaded key initiatives as {title} at {company}. {description}"
            )

        optimized_desc = clean_and_format_text(description)

        # Enforce character limit for experience description
        if len(optimized_desc) > LINKEDIN_LIMITS["experience_description"]:
            optimized_desc = (
                optimized_desc[: LINKEDIN_LIMITS["experience_description"] - 3] + "..."
            )

        optimized_experiences.append(
            {
                "title": title,
                "company": company,
                "description": optimized_desc,
                "original_description": description,
            }
        )

    return optimized_experiences


def optimize_skills(skills: List[str]) -> List[str]:
    """
    Optimizes and deduplicates skills for the LinkedIn Skills section.

    Args:
        skills (List[str]): A list of extracted skills.

    Returns:
        List[str]: A deduplicated and formatted list of skills, max 50.
    """
    # Deduplicate and clean
    cleaned_skills = list(
        set([clean_and_format_text(skill).title() for skill in skills if skill])
    )

    # Sort alphabetically for consistency
    cleaned_skills.sort()

    # Enforce limit
    return cleaned_skills[: LINKEDIN_LIMITS["skills"]]


def generate_linkedin_profile(resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to generate a fully optimized LinkedIn profile from resume data.

    Args:
        resume_data (Dict[str, Any]): The parsed resume data.

    Returns:
        Dict[str, Any]: The optimized LinkedIn profile data.
    """
    target_role = resume_data.get("target_role", "Professional")
    top_skills = resume_data.get("skills", [])
    summary = resume_data.get("summary", "")
    experiences = resume_data.get("experiences", [])

    return {
        "headline": optimize_headline(
            resume_data.get("headline", ""), target_role, top_skills
        ),
        "about": optimize_about_section(summary, target_role, top_skills),
        "experiences": optimize_experience(experiences),
        "skills": optimize_skills(top_skills),
        "limits": LINKEDIN_LIMITS,
    }
