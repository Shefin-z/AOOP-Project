import math
import os
import re
from collections import Counter
from typing import Any

import pymysql
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="CareerCube AI Service",
    version="1.0.0",
    description="Explainable career matching, readiness scoring and application writing.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CLIENT_ORIGIN", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
    "is", "it", "of", "on", "or", "that", "the", "to", "with", "you", "your",
}


def tokens(value: str) -> list[str]:
    return [
        word for word in re.findall(r"[a-z0-9+#.]+", (value or "").lower())
        if len(word) > 1 and word not in STOP_WORDS
    ]


def cosine_similarity(left: str, right: str) -> float:
    a, b = Counter(tokens(left)), Counter(tokens(right))
    if not a or not b:
        return 0.0
    dot = sum(a[word] * b[word] for word in a.keys() & b.keys())
    norm_a = math.sqrt(sum(value * value for value in a.values()))
    norm_b = math.sqrt(sum(value * value for value in b.values()))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0


def mysql_connection():
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "careerforge"),
        password=os.getenv("MYSQL_PASSWORD", "careerforge"),
        database=os.getenv("MYSQL_DATABASE", "careerforge"),
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=3,
    )


class Skill(BaseModel):
    name: str
    score: float = Field(default=50, ge=0, le=100)


class Job(BaseModel):
    id: int
    title: str
    description: str = ""
    category: str = ""
    company: str = ""


class RecommendationRequest(BaseModel):
    profile: dict[str, Any] = {}
    skills: list[Skill] = []
    jobs: list[Job]


class ReadinessRequest(BaseModel):
    profile_completion: float = Field(ge=0, le=100)
    skill_scores: list[float] = []
    assessments_completed: int = 0
    resume_complete: bool = False
    applications_sent: int = 0
    learning_hours: float = 0


class CoverLetterRequest(BaseModel):
    student_name: str
    target_role: str
    company: str
    experience_summary: str
    skills: list[str] = []
    job_description: str = ""


@app.get("/health")
def health():
    database = "unavailable"
    try:
        connection = mysql_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        connection.close()
        database = "healthy"
    except Exception:
        pass
    return {"status": "ok", "service": "careercube-ai", "database": database}


@app.post("/recommend/jobs")
def recommend_jobs(payload: RecommendationRequest):
    target_role = str(payload.profile.get("target_role") or "")
    student_skills = " ".join(skill.name for skill in payload.skills)
    student_signal = f"{target_role} {student_skills}"
    student_skill_set = set(tokens(student_skills))
    results = []

    for job in payload.jobs:
        job_signal = f"{job.title} {job.category} {job.description}"
        semantic = cosine_similarity(student_signal, job_signal)
        title_match = cosine_similarity(target_role, job.title)
        job_terms = set(tokens(job_signal))
        overlap = sorted(student_skill_set & job_terms)
        readiness = float(payload.profile.get("readiness_score") or 60) / 100
        score = 0.45 * semantic + 0.25 * title_match + 0.20 * readiness + 0.10 * min(len(overlap) / 4, 1)
        match = max(55, min(98, round(55 + score * 43)))
        reasons = []
        if overlap:
            reasons.append(f"Shared strengths: {', '.join(overlap[:3])}")
        if title_match > 0.15:
            reasons.append("Closely aligned with your target role")
        reasons.append("Calibrated to your current readiness")
        results.append({
            **job.model_dump(),
            "match_percentage": match,
            "reasons": reasons[:3],
            "skill_gaps": sorted(list(job_terms - student_skill_set))[:4],
        })

    return sorted(results, key=lambda item: item["match_percentage"], reverse=True)


@app.post("/score/readiness")
def readiness_score(payload: ReadinessRequest):
    average_skill = sum(payload.skill_scores) / len(payload.skill_scores) if payload.skill_scores else 0
    components = {
        "profile": payload.profile_completion * 0.20,
        "skills": average_skill * 0.35,
        "assessments": min(payload.assessments_completed / 8, 1) * 15,
        "resume": 10 if payload.resume_complete else 0,
        "applications": min(payload.applications_sent / 10, 1) * 10,
        "learning": min(payload.learning_hours / 20, 1) * 10,
    }
    score = round(sum(components.values()), 1)
    recommendations = []
    if payload.profile_completion < 90:
        recommendations.append("Complete the missing profile sections")
    if average_skill < 75:
        recommendations.append("Take an assessment in your weakest target-role skill")
    if not payload.resume_complete:
        recommendations.append("Create your first Career Vault resume")
    if payload.learning_hours < 8:
        recommendations.append("Complete one recommended learning module")
    return {"readiness_score": score, "components": components, "next_actions": recommendations[:3]}


@app.post("/generate/cover-letter")
def cover_letter(payload: CoverLetterRequest):
    if not payload.experience_summary.strip():
        raise HTTPException(status_code=400, detail="Experience summary is required")
    skills = ", ".join(payload.skills[:4]) or "analytical thinking and collaboration"
    letter = (
        f"Dear {payload.company} Hiring Team,\n\n"
        f"I am excited to apply for the {payload.target_role} position. "
        f"My background in {skills} aligns strongly with the opportunity and the problems your team is solving.\n\n"
        f"{payload.experience_summary.strip()} "
        f"I would bring that same thoughtful, evidence-led approach to {payload.company}.\n\n"
        f"I would welcome the opportunity to discuss how my experience and motivation can contribute to your team. "
        f"Thank you for your time and consideration.\n\n"
        f"Sincerely,\n{payload.student_name}"
    )
    return {
        "cover_letter": letter,
        "keywords_used": payload.skills[:4],
        "tone": "professional and confident",
    }


@app.get("/analytics/skill-gaps/{user_id}")
def skill_gaps(user_id: int):
    try:
        connection = mysql_connection()
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT s.name, us.score,
                       AVG(js.required_score) AS market_target,
                       COUNT(DISTINCT js.job_id) AS relevant_jobs
                FROM user_skills us
                JOIN skills s ON s.id=us.skill_id
                LEFT JOIN job_skills js ON js.skill_id=s.id
                WHERE us.user_id=%s
                GROUP BY s.id, us.score
                ORDER BY (AVG(js.required_score) - us.score) DESC
                """,
                (user_id,),
            )
            rows = cursor.fetchall()
        connection.close()
        for row in rows:
            row["gap"] = round(float(row["market_target"] or row["score"]) - float(row["score"]), 1)
        return {"user_id": user_id, "skills": rows}
    except Exception as error:
        raise HTTPException(status_code=503, detail=f"MySQL analytics unavailable: {error.__class__.__name__}") from error
