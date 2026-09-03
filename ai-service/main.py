"""
TeamFinder AI & CUDA Acceleration Service
FastAPI Microservice for PyTorch / CUDA-accelerated Vector Similarity & Smart Teammate Recommendation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import numpy as np
import os
import re

# Optional torch import with fallback to numpy
try:
    import torch
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

app = FastAPI(
    title="TeamFinder AI & CUDA Acceleration Service",
    version="1.0.0",
    description="Accelerated vector similarity & AI team builder for Students Team Finder"
)

# Allow CORS for React Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_compute_device():
    if TORCH_AVAILABLE and torch.cuda.is_available():
        return {
            "device": "cuda",
            "cuda_available": True,
            "device_name": torch.cuda.get_device_name(0),
            "device_count": torch.cuda.device_count(),
            "allocated_memory_mb": round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2),
            "engine": "PyTorch (NVIDIA CUDA Accelerated)"
        }
    elif TORCH_AVAILABLE:
        return {
            "device": "cpu",
            "cuda_available": False,
            "device_name": "CPU",
            "device_count": 0,
            "allocated_memory_mb": 0,
            "engine": "PyTorch (CPU fallback)"
        }
    else:
        return {
            "device": "cpu",
            "cuda_available": False,
            "device_name": "CPU (NumPy)",
            "device_count": 0,
            "allocated_memory_mb": 0,
            "engine": "NumPy Vector Engine"
        }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "TeamFinder AI Microservice",
        "hardware": get_compute_device()
    }

@app.get("/api/device")
def device_info():
    return get_compute_device()

class StudentCandidate(BaseModel):
    id: str
    name: str
    department: str
    college: str
    skills: List[str]
    interests: List[str] = []
    experienceYears: float = 1.0
    availability: str = "10-20 hrs/week"
    location: str = "Campus"

class ProjectRequirements(BaseModel):
    title: str
    description: str
    requiredSkills: List[str]
    category: Optional[str] = "Tech"
    teamSize: int = 4
    weights: Optional[Dict[str, float]] = None

class MatchScoreResult(BaseModel):
    studentId: str
    studentName: str
    overallMatch: float
    skillScore: float
    interestScore: float
    availabilityScore: float
    matchedSkills: List[str]
    missingSkills: List[str]

class TeamBuilderRequest(BaseModel):
    prompt: str
    candidates: List[StudentCandidate]
    targetTeamSize: Optional[int] = 4

class RoleRecommendation(BaseModel):
    roleTitle: str
    requiredSkills: List[str]
    recommendedStudent: Optional[StudentCandidate] = None
    matchPercentage: float
    rationale: str

class TeamBuilderResponse(BaseModel):
    projectConcept: str
    detectedCategory: str
    extractedRoles: List[RoleRecommendation]
    averageTeamMatch: float
    deviceUsed: str

# Vocabulary indexer for vector embedding computation
COMMON_SKILLS = [
    "python", "pytorch", "cuda", "tensorflow", "machine learning", "deep learning",
    "computer vision", "nlp", "react", "next.js", "javascript", "typescript",
    "node.js", "firebase", "mongodb", "postgresql", "fastapi", "docker",
    "figma", "ui/ux", "wireframing", "blender", "embedded systems", "iot",
    "c++", "c", "esp32", "arduino", "robotics", "ros", "hardware design",
    "cloud computing", "aws", "gcp", "product management", "pitching", "business"
]

def vectorize_skills(skills: List[str]) -> np.ndarray:
    vec = np.zeros(len(COMMON_SKILLS), dtype=np.float32)
    normalized = [s.strip().lower() for s in skills]
    for i, token in enumerate(COMMON_SKILLS):
        for s in normalized:
            if token in s or s in token:
                vec[i] += 1.0
    norm = np.linalg.norm(vec)
    return vec / norm if norm > 0 else vec

@app.post("/api/match", response_model=List[MatchScoreResult])
def compute_matches(project: ProjectRequirements, candidates: List[StudentCandidate]):
    if not candidates:
        return []
    
    device_info = get_compute_device()
    target_vec = vectorize_skills(project.requiredSkills)
    candidate_vecs = np.array([vectorize_skills(c.skills) for c in candidates], dtype=np.float32)

    # Tensor computation on CUDA if available
    if TORCH_AVAILABLE and device_info["cuda_available"]:
        t_target = torch.tensor(target_vec, device="cuda").unsqueeze(0)
        t_candidates = torch.tensor(candidate_vecs, device="cuda")
        sims = F.cosine_similarity(t_target, t_candidates).cpu().numpy()
    elif TORCH_AVAILABLE:
        t_target = torch.tensor(target_vec).unsqueeze(0)
        t_candidates = torch.tensor(candidate_vecs)
        sims = F.cosine_similarity(t_target, t_candidates).numpy()
    else:
        # Fallback numpy dot product cosine
        sims = np.dot(candidate_vecs, target_vec)

    results = []
    req_set = {s.lower() for s in project.requiredSkills}
    
    for i, cand in enumerate(candidates):
        cand_skills_lower = {s.lower() for s in cand.skills}
        matched = [s for s in project.requiredSkills if s.lower() in cand_skills_lower or any(s.lower() in cs for cs in cand_skills_lower)]
        missing = [s for s in project.requiredSkills if s not in matched]

        skill_cov = len(matched) / max(len(project.requiredSkills), 1)
        sim_score = float(sims[i]) if not np.isnan(sims[i]) else 0.0
        combined_skill = 0.6 * skill_cov + 0.4 * max(0.0, sim_score)
        
        # Availability heuristic
        avail_score = 0.95 if "20" in cand.availability or "15" in cand.availability else 0.8
        
        # Overall weighted match
        overall = round((combined_skill * 0.65 + avail_score * 0.2 + 0.15 * min(cand.experienceYears / 3.0, 1.0)) * 100, 1)
        overall = min(max(overall, 35.0), 99.0)

        results.append(MatchScoreResult(
            studentId=cand.id,
            studentName=cand.name,
            overallMatch=overall,
            skillScore=round(combined_skill * 100, 1),
            interestScore=85.0,
            availabilityScore=round(avail_score * 100, 1),
            matchedSkills=matched,
            missingSkills=missing
        ))

    results.sort(key=lambda x: x.overallMatch, reverse=True)
    return results

@app.post("/api/team-builder", response_model=TeamBuilderResponse)
def ai_team_builder(request: TeamBuilderRequest):
    prompt_lower = request.prompt.lower()
    
    # Archetype role extractor
    roles = []
    category = "Cross-Disciplinary Innovation"

    if any(k in prompt_lower for k in ["drone", "robot", "hardware", "iot", "esp32", "embedded"]):
        category = "Robotics & Hardware"
        roles.append({"title": "Hardware & Embedded Systems Lead", "skills": ["Embedded Systems", "IoT", "C++", "ESP32", "Robotics"]})
        roles.append({"title": "AI & Computer Vision Specialist", "skills": ["Python", "PyTorch", "Computer Vision", "CUDA"]})
        roles.append({"title": "Dashboard & Control UI Developer", "skills": ["React", "TypeScript", "UI/UX", "Tailwind CSS"]})
        roles.append({"title": "Systems & Integration Specialist", "skills": ["Cloud Computing", "Firebase", "APIs", "Sensors"]})
    elif any(k in prompt_lower for k in ["health", "medical", "patient", "clinical", "doctor"]):
        category = "Healthcare & MedTech"
        roles.append({"title": "AI Diagnostics & ML Lead", "skills": ["Python", "PyTorch", "Deep Learning", "Machine Learning"]})
        roles.append({"title": "Frontend & Patient Experience Designer", "skills": ["React", "UI/UX", "Figma", "Tailwind CSS"]})
        roles.append({"title": "Backend & Cloud Security Architect", "skills": ["Node.js", "Firebase", "MongoDB", "FastAPI"]})
        roles.append({"title": "Healthcare Research & Compliance Lead", "skills": ["Product Management", "Data Analysis", "Research"]})
    elif any(k in prompt_lower for k in ["waste", "eco", "green", "recycle", "climate", "environment"]):
        category = "EcoTech & Sustainability"
        roles.append({"title": "Computer Vision & ML Specialist", "skills": ["Python", "PyTorch", "Computer Vision", "CUDA"]})
        roles.append({"title": "Full Stack Platform Developer", "skills": ["React", "Node.js", "Firebase", "TypeScript"]})
        roles.append({"title": "Product Designer & UI/UX", "skills": ["UI/UX", "Figma", "Wireframing", "Tailwind CSS"]})
        roles.append({"title": "IoT & Sensor Engineer", "skills": ["IoT", "Embedded Systems", "C++", "Arduino"]})
    else:
        # General Tech / Hackathon
        category = "Hackathon MVP"
        roles.append({"title": "AI/ML Lead Developer", "skills": ["Python", "PyTorch", "FastAPI", "Machine Learning"]})
        roles.append({"title": "Frontend & UI/UX Engineer", "skills": ["React", "Tailwind CSS", "Figma", "UI/UX"]})
        roles.append({"title": "Backend & Cloud Architect", "skills": ["Node.js", "Firebase", "Database Design", "APIs"]})
        roles.append({"title": "Product Manager & Pitch Lead", "skills": ["Product Management", "Business Strategy", "Pitching"]})

    # Pick best candidate for each role without duplicates
    assigned_ids = set()
    recommendations = []
    total_match = 0.0

    device = get_compute_device()["engine"]

    for r in roles:
        req = ProjectRequirements(
            title=r["title"],
            description="Role in " + request.prompt,
            requiredSkills=r["skills"]
        )
        available_candidates = [c for c in request.candidates if c.id not in assigned_ids]
        if available_candidates:
            matches = compute_matches(req, available_candidates)
            best_match = matches[0]
            chosen_candidate = next(c for c in available_candidates if c.id == best_match.studentId)
            assigned_ids.add(chosen_candidate.id)

            recommendations.append(RoleRecommendation(
                roleTitle=r["title"],
                requiredSkills=r["skills"],
                recommendedStudent=chosen_candidate,
                matchPercentage=best_match.overallMatch,
                rationale=f"High proficiency in {', '.join(best_match.matchedSkills[:3])} with strong college track record."
            ))
            total_match += best_match.overallMatch
        else:
            recommendations.append(RoleRecommendation(
                roleTitle=r["title"],
                requiredSkills=r["skills"],
                recommendedStudent=None,
                matchPercentage=0.0,
                rationale="Candidate search open for this role."
            ))

    avg_match = round(total_match / max(len(recommendations), 1), 1)

    return TeamBuilderResponse(
        projectConcept=request.prompt,
        detectedCategory=category,
        extractedRoles=recommendations,
        averageTeamMatch=avg_match,
        deviceUsed=device
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
