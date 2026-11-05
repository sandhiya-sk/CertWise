from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth & User
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    college: Optional[str] = "Engineering College"
    degree: Optional[str] = "B.E. Computer Science and Engineering"
    graduation_year: Optional[str] = "2026"

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    email: str
    full_name: str
    college: Optional[str] = "Govt College of Technology"
    degree: Optional[str] = "B.E. Computer Science and Engineering"
    graduation_year: Optional[str] = "2026"
    avatar_url: Optional[str] = ""

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = ""
    college: Optional[str] = ""
    degree: Optional[str] = ""
    graduation_year: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    bio: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Certificates
class CertificateCreate(BaseModel):
    title: str
    issuer: str
    category: Optional[str] = "Other Technical Skills"
    issue_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    credential_id: Optional[str] = ""
    credential_url: Optional[str] = ""
    skills: List[str] = []
    stored_filename: Optional[str] = None
    file_name: Optional[str] = None

class CertificateUpdate(BaseModel):
    title: Optional[str] = None
    issuer: Optional[str] = None
    category: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    skills: Optional[List[str]] = None
    is_verified: Optional[bool] = None

class CertificateOut(BaseModel):
    id: int
    user_id: int
    title: str
    issuer: str
    category: str
    issue_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    credential_id: Optional[str] = ""
    credential_url: Optional[str] = ""
    file_path: Optional[str] = ""
    file_name: Optional[str] = ""
    file_size: Optional[int] = 0
    skills: List[str] = []
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Extracted Certificate Details
class ExtractedCertificateInfo(BaseModel):
    title: str
    issuer: str
    category: str
    issue_date: str
    expiry_date: str
    credential_id: str
    skills: List[str]
    raw_text: str
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None

# Skills
class UserSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"
    source: Optional[str] = "manual"
    proficiency: Optional[str] = "Intermediate"

class UserSkillOut(BaseModel):
    id: int
    user_id: int
    skill_name: str
    category: str
    source: str
    proficiency: str
    is_confirmed: bool

    class Config:
        from_attributes = True

# Career & Job Matching
class CareerAnalysisRequest(BaseModel):
    company_name: Optional[str] = None
    job_role: Optional[str] = None
    custom_job_description: Optional[str] = None

class SkillMatchItem(BaseModel):
    skill: str
    status: str # "demonstrated", "missing", "in_progress"
    evidence: Optional[str] = None
    recommendation: Optional[str] = None

class SuggestedCert(BaseModel):
    title: str
    issuer: str
    url: Optional[str] = ""
    description: str
    level: str

class SuggestedProject(BaseModel):
    title: str
    tech_stack: List[str]
    description: str

class CareerAnalysisResponse(BaseModel):
    target_role: str
    target_company: Optional[str] = ""
    readiness_score: int # 0 to 100
    matched_count: int
    total_required: int
    matched_skills: List[SkillMatchItem]
    missing_skills: List[SkillMatchItem]
    suggested_certificates: List[SuggestedCert]
    suggested_projects: List[SuggestedProject]
    tailored_resume_summary: str
    recommended_resume_points: List[str]

# Resume
class ResumeSectionEducation(BaseModel):
    degree: str
    institution: str
    year: str
    score: Optional[str] = ""

class ResumeSectionProject(BaseModel):
    title: str
    tech_stack: str
    description: str
    github_link: Optional[str] = ""

class ResumeSectionExperience(BaseModel):
    role: str
    company: str
    duration: str
    description: str

class ResumeGenerateRequest(BaseModel):
    target_role: str
    target_company: Optional[str] = ""
    template_name: Optional[str] = "modern"

class ResumeSaveRequest(BaseModel):
    target_role: str
    target_company: Optional[str] = ""
    template_name: str = "modern"
    full_name: str
    email: str
    phone: str
    location: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    summary: str
    education: List[Dict[str, Any]]
    skills: Dict[str, List[str]] # e.g. {"Languages": [...], "Cloud & Tools": [...]}
    certificates: List[Dict[str, Any]] # title, issuer, issue_date, description
    projects: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]

class ResumeOut(BaseModel):
    id: int
    user_id: int
    target_role: str
    target_company: Optional[str] = ""
    template_name: str
    full_name: str
    email: str
    phone: str
    location: Optional[str] = ""
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    summary: str
    education: List[Dict[str, Any]]
    skills: Dict[str, List[str]]
    certificates: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    experience: List[Dict[str, Any]]
    pdf_filename: Optional[str] = ""
    updated_at: datetime
