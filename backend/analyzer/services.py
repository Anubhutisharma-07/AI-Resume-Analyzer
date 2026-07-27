import os
import pdfplumber
import docx
import textstat
from django.contrib.auth import get_user_model
from .models import ResumeAnalysis
from .skill_matcher import extract_skills

User = get_user_model()

ROLE_SKILLS = {
    "Frontend Developer": [
        "html", "css", "javascript", "typescript", "react",
        "next.js", "tailwind", "git", "github", "webpack",
    ],

    "Backend Developer": [
        "python", "django", "flask", "fastapi", "node.js", "express.js",
        "sql", "mysql", "postgresql", "mongodb", "docker", "git", "github",
    ],

    "Data Analyst": [
        "python", "sql", "excel", "machine learning", "deep learning",
        "data analysis", "pandas", "numpy", "matplotlib", "tensorflow",
        "scikit-learn", "jupyter",
    ],
}

PIPELINE_STAGES = [
    {"stage": "extracting", "label": "Extracting text from document", "percent": 25},
    {"stage": "matching", "label": "Detecting & matching skills", "percent": 60},
    {"stage": "scoring", "label": "Generating ATS score & recommendations", "percent": 90},
    {"stage": "done", "label": "Analysis complete", "percent": 100},
]

def calculate_readability(text):
    score = textstat.flesch_reading_ease(text)
    if score >= 60:
        label = "easy"
    elif score >= 30:
        label = "moderate"
    else:
        label = "dense"
    return round(score , 1), label

def extract_text_from_file(file_path, file_name):
    text = ""
    if file_name.lower().endswith('.docx'):
        doc = docx.Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    elif file_name.lower().endswith('.txt'):
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
    else:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted
    return text


def analyze_cover_letter(text, target_role="", job_description=""):
    word_count = len(text.split())
    
    # 1. Length Feedback
    if word_count < 150:
        length_status = "Too short"
        length_feedback = f"Your cover letter is a bit short ({word_count} words). Consider expanding it to between 200 and 400 words to better detail your experience."
    elif word_count > 500:
        length_status = "Too long"
        length_feedback = f"Your cover letter is quite long ({word_count} words). Try to keep it concise and under 400 words so that recruiters can scan it quickly."
    else:
        length_status = "Good"
        length_feedback = f"Excellent length ({word_count} words). Your cover letter is concise and well-proportioned."
        
    # 2. Tone Feedback
    action_verbs = [
        "designed", "led", "managed", "implemented", "solved", "created", "analyzed", 
        "spearheaded", "collaborated", "executed", "developed", "built", "engineered",
        "optimized", "improved", "delivered", "facilitated", "increased", "reduced"
    ]
    weak_words = ["just", "hope", "try", "think", "believe", "maybe", "sort of", "hoping", "might"]
    
    words_lower = text.lower()
    found_action = [v for v in action_verbs if v in words_lower]
    found_weak = [w for w in weak_words if w in words_lower]
    
    tone_suggestions = []
    tone_categories = []
    
    if any(word in words_lower for word in ["excited", "thrilled", "passionate", "eager", "enthusiastic"]):
        tone_categories.append("Enthusiastic")
    if any(word in words_lower for word in ["expert", "specialist", "analytical", "background", "results", "performance"]):
        tone_categories.append("Analytical")
    
    if len(found_action) >= 4:
        tone_categories.append("Confident")
    elif len(found_action) < 2:
        tone_suggestions.append("Incorporate more active action verbs (e.g. 'spearheaded', 'implemented', 'optimized') to make your achievements sound more impactful.")
        
    if len(found_weak) > 2:
        tone_suggestions.append("Limit filler/weak words (like 'hope', 'just', 'believe') to sound more authoritative and confident in your capabilities.")
        
    tone_label = " & ".join(tone_categories) if tone_categories else "Professional"
    
    tone_feedback = f"Your cover letter has a {tone_label.lower()} tone. "
    if found_action:
        tone_feedback += f"It effectively uses active language (found action verbs: {', '.join(found_action[:3])})."
    else:
        tone_feedback += "Consider using stronger action verbs to describe your achievements."
        
    # 3. Relevance Feedback
    relevance_suggestions = []
    references_role = False
    references_company = False
    
    if target_role:
        role_words = target_role.lower().split()
        if target_role.lower() in words_lower or all(w in words_lower for w in role_words):
            references_role = True
        else:
            relevance_suggestions.append(f"Explicitly mention your target role '{target_role}' early in the letter to establish clear intent.")
            
    company_keywords = ["company", "firm", "organization", "team", "your team", "your organization", "enterprise", "agency", "institution"]
    if any(ck in words_lower for ck in company_keywords) or ("dear hiring" in words_lower or "dear team" in words_lower or "recruiting team" in words_lower):
        references_company = True
    else:
        relevance_suggestions.append("Mention the target company name or refer to their team to show that the letter is personalized.")
        
    if job_description:
        req_skills = ROLE_SKILLS.get(target_role, [])
        cover_letter_skills = [s for s in req_skills if s in words_lower]
        
        if cover_letter_skills:
            relevance_feedback = f"Great alignment! Your cover letter references several key skills required for the role, including: {', '.join([s.title() for s in cover_letter_skills[:4]])}."
        else:
            relevance_feedback = "Your cover letter does not reference the key technical skills from the target career track."
            if req_skills:
                relevance_suggestions.append(f"Weave in mentions of core role competencies like {', '.join([s.title() for s in req_skills[:3]])} to demonstrate your alignment.")
    else:
        relevance_feedback = "Please provide a job description alongside your cover letter to get specific relevance and alignment feedback."
        
    return {
        "word_count": word_count,
        "length": {
            "status": length_status,
            "feedback": length_feedback
        },
        "tone": {
            "label": tone_label,
            "feedback": tone_feedback,
            "suggestions": tone_suggestions
        },
        "relevance": {
            "references_role": references_role,
            "references_company": references_company,
            "feedback": relevance_feedback,
            "suggestions": relevance_suggestions
        }
    }


def analyze_resume(file_path, target_role, file_name="resume.pdf", user_id=None, job_description=None, cover_letter_path=None, cover_letter_name=None):
    text = ""
    try:
        text = extract_text_from_file(file_path, file_name)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    raw_text = text
    readability_score, readability_label = calculate_readability(raw_text)
    detected = extract_skills(text)

    matched = []
    missing = []
    required = ROLE_SKILLS.get(target_role, [])

    for skill in required:
        if skill in detected:
            matched.append(skill)
        else:
            missing.append(skill)

    score = (
        int(len(matched) / len(required) * 100)
        if required
        else min(len(detected) * 10, 100)
    )

    suggestions = [
        f"Add projects or experience with {skill.title()}"
        for skill in missing
    ]

    # Process optional cover letter if provided
    cover_letter_text = ""
    cover_letter_feedback = None
    if cover_letter_path:
        try:
            cover_letter_text = extract_text_from_file(cover_letter_path, cover_letter_name)
            cover_letter_feedback = analyze_cover_letter(cover_letter_text, target_role, job_description)
        finally:
            if os.path.exists(cover_letter_path):
                os.remove(cover_letter_path)

    analysis_id = None

    if user_id:
        try:
            user = User.objects.get(id=user_id)
            analysis_record = ResumeAnalysis.objects.create(
                user=user,
                file_name=file_name,
                target_role=target_role,
                job_description=job_description,
                score=score,
                skills_found=detected,
                suggestions=suggestions,
                matched_skills=matched,
                missing_skills=missing,
                resume_text=raw_text,
                cover_letter_text=cover_letter_text if cover_letter_text else None,
                cover_letter_feedback=cover_letter_feedback,
            )
            analysis_id = analysis_record.id
        except User.DoesNotExist:
            pass

    progress_info = {
        "current_stage": "done",
        "percent": 100,
        "stages": PIPELINE_STAGES,
    }

    track_comparisons = {}
    for role, req_skills in ROLE_SKILLS.items():
        role_matched = [s for s in req_skills if s in detected]
        role_missing = [s for s in req_skills if s not in detected]
        role_score = (
            int(len(role_matched) / len(req_skills) * 100)
            if req_skills
            else min(len(detected) * 10, 100)
        )
        role_suggestions = [f"Add projects or experience with {s.title()}" for s in role_missing]
        
        track_comparisons[role] = {
            "score": role_score,
            "matched_skills": role_matched,
            "missing_skills": role_missing,
            "suggestions": role_suggestions,
        }

    return {
        "id": analysis_id,
        "score": score,
        "readability_score": readability_score,
        "readability_label": readability_label,
        "skills_found": detected,
        "suggestions": suggestions,
        "matched_skills": matched,
        "missing_skills": missing,
        "target_role": target_role,
        "resume_text": raw_text,
        "cover_letter_text": cover_letter_text if cover_letter_text else None,
        "cover_letter_feedback": cover_letter_feedback,
        "progress": progress_info,
        "pipeline_stages": PIPELINE_STAGES,
        "track_comparisons": track_comparisons,
    }