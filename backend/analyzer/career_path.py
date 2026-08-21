from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ResumeAnalysis, CareerPath, CareerMilestone

def generate_mock_milestones(target_role, current_skills):
    """
    Simulates AI generation of a career path up to the target role.
    """
    
    if 'data' in target_role.lower():
        milestones = [
            {"title": "Data Analyst", "timeframe": "Current", "skills": ["SQL", "Excel", "Python Basics"], "desc": "Build a strong foundation in querying and reporting.", "order": 0},
            {"title": "Data Engineer / Junior Scientist", "timeframe": "1-3 Years", "skills": ["Airflow", "Machine Learning", "Pandas"], "desc": "Expand into automated pipelines or predictive modeling.", "order": 1},
            {"title": "Lead Data Scientist", "timeframe": "3-5 Years", "skills": ["Deep Learning", "Team Leadership", "MLOps"], "desc": "Lead large scale projects and deploy models into production.", "order": 2},
            {"title": "Director of Data", "timeframe": "5-8+ Years", "skills": ["Data Strategy", "Budgeting", "Executive Communication"], "desc": "Drive enterprise data architecture and strategy.", "order": 3}
        ]
    elif 'product' in target_role.lower():
        milestones = [
            {"title": "Associate Product Manager", "timeframe": "Current", "skills": ["Agile", "User Research", "Jira"], "desc": "Support product delivery and gather requirements.", "order": 0},
            {"title": "Product Manager", "timeframe": "2-4 Years", "skills": ["Roadmapping", "A/B Testing", "Go-To-Market"], "desc": "Own end-to-end delivery of a major feature set.", "order": 1},
            {"title": "Group Product Manager", "timeframe": "4-7 Years", "skills": ["Mentorship", "Cross-functional Leadership", "P&L Management"], "desc": "Manage a team of PMs and a portfolio of products.", "order": 2},
            {"title": "VP of Product", "timeframe": "7-10+ Years", "skills": ["Product Vision", "Org Design", "Board Relations"], "desc": "Define product vision for the entire company.", "order": 3}
        ]
    else: # Default Engineering
        milestones = [
            {"title": "Software Engineer I", "timeframe": "Current", "skills": ["Git", "React", "Python"], "desc": "Contribute code to existing services and fix bugs.", "order": 0},
            {"title": "Software Engineer II", "timeframe": "1-3 Years", "skills": ["CI/CD", "System Design Basics", "Docker"], "desc": "Lead small features and optimize performance.", "order": 1},
            {"title": "Senior Software Engineer", "timeframe": "3-5 Years", "skills": ["Distributed Systems", "Architecture", "Mentoring"], "desc": "Design large scale systems and mentor junior devs.", "order": 2},
            {"title": "Staff Software Engineer / Architect", "timeframe": "5-8+ Years", "skills": ["Technical Strategy", "Cross-team Impact", "Cloud Infrastructure"], "desc": "Set the technical direction for multiple engineering teams.", "order": 3}
        ]
        
    return milestones


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_career_path(request):
    """
    API endpoint to generate a personalized career path timeline.
    Expects JSON payload with:
    - analysis_id: (Optional) ID of previous ResumeAnalysis to use skills from
    - target_role: The ultimate objective job title
    """
    user = request.user
    data = request.data
    
    target_role = data.get('target_role', 'Senior Software Engineer')
    analysis_id = data.get('analysis_id')
    
    # Try to find user's skills
    skills_to_use = []
    
    if analysis_id:
        try:
            analysis_obj = ResumeAnalysis.objects.get(id=analysis_id, user=user)
            skills_to_use = analysis_obj.skills_found
        except ResumeAnalysis.DoesNotExist:
            pass
            
    if not skills_to_use:
        # Fallback to the latest analysis
        analysis_obj = ResumeAnalysis.objects.filter(user=user).order_by('-created_at').first()
        if analysis_obj:
            skills_to_use = analysis_obj.skills_found
            
    # Clean up old paths (optional, keep latest 5)
    existing_paths = CareerPath.objects.filter(user=user)
    if existing_paths.count() > 5:
        existing_paths.first().delete()
        
    # Generate milestones
    mock_milestones = generate_mock_milestones(target_role, skills_to_use)
    
    # Save the path
    path = CareerPath.objects.create(
        user=user,
        target_role=target_role,
        current_role=mock_milestones[0]['title']
    )
    
    saved_milestones = []
    for m in mock_milestones:
        ms = CareerMilestone.objects.create(
            path=path,
            title=m['title'],
            timeframe=m['timeframe'],
            skills_required=m['skills'],
            description=m['desc'],
            order=m['order']
        )
        saved_milestones.append({
            "id": ms.id,
            "title": ms.title,
            "timeframe": ms.timeframe,
            "skills": ms.skills_required,
            "description": ms.description,
            "order": ms.order
        })
    
    return Response({
        "path_id": path.id,
        "target_role": path.target_role,
        "current_role": path.current_role,
        "milestones": saved_milestones
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_career_paths(request):
    paths = CareerPath.objects.filter(user=request.user).order_by('-created_at')
    
    results = []
    for p in paths:
        results.append({
            "id": p.id,
            "target_role": p.target_role,
            "current_role": p.current_role,
            "created_at": p.created_at,
            "milestone_count": p.milestones.count()
        })
        
    return Response({"career_paths": results})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_career_path_details(request, path_id):
    try:
        path = CareerPath.objects.get(id=path_id, user=request.user)
    except CareerPath.DoesNotExist:
        return Response({"error": "Path not found"}, status=404)
        
    milestones = path.milestones.all()
    results = []
    for ms in milestones:
        results.append({
            "id": ms.id,
            "title": ms.title,
            "timeframe": ms.timeframe,
            "skills": ms.skills_required,
            "description": ms.description,
            "order": ms.order
        })
        
    return Response({
        "id": path.id,
        "target_role": path.target_role,
        "current_role": path.current_role,
        "milestones": results
    })
