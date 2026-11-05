import json
import shutil
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import UPLOAD_DIR, RESUME_DIR, ALLOWED_EXTENSIONS
from .database import engine, Base, get_db
from .models import User, Certificate, UserSkill, Resume
from .schemas import (
    UserCreate, UserLogin, GoogleLoginRequest, UserOut, UserProfileUpdate, Token,
    CertificateCreate, CertificateUpdate, CertificateOut, ExtractedCertificateInfo,
    UserSkillCreate, UserSkillOut,
    CareerAnalysisRequest, CareerAnalysisResponse,
    ResumeGenerateRequest, ResumeSaveRequest, ResumeOut
)
from .auth import hash_password, verify_password, create_access_token, get_current_user
from .extractor import parse_certificate_document
from .career_engine import (
    COMPANIES_DIRECTORY, JOB_ROLES_CATALOG,
    analyze_career_fit
)
from .resume_generator import prepare_initial_resume, generate_pdf_resume
from .sample_data import seed_sample_user_data

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CertiWise API",
    description="Smart Certificate & Career Assistant Platform with Automated Resume Builder",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static mounts
app.mount("/static/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/static/resumes", StaticFiles(directory=str(RESUME_DIR)), name="resumes")

# Health Check
@app.get("/api/health")
def health():
    return {"status": "ok", "app": "CertiWise API v1.0", "timestamp": datetime.utcnow()}

# ----------------- AUTH ROUTES -----------------
@app.post("/api/auth/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        college=user_in.college or "",
        degree=user_in.degree or "",
        graduation_year=user_in.graduation_year or "2026"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@app.post("/api/auth/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.post("/api/auth/google", response_model=Token)
def google_auth(google_in: GoogleLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == google_in.email).first()
    if not user:
        # Create user account for Google authenticated student
        import secrets
        random_pwd = secrets.token_urlsafe(16)
        user = User(
            email=google_in.email,
            hashed_password=hash_password(random_pwd),
            full_name=google_in.full_name or "Google Student",
            college=google_in.college or "Govt College of Technology",
            degree=google_in.degree or "B.E. Computer Science and Engineering",
            graduation_year=google_in.graduation_year or "2026"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@app.get("/api/auth/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/api/auth/profile", response_model=UserOut)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user

# ----------------- CERTIFICATE EXTRACTION & VAULT -----------------
@app.post("/api/certificates/extract", response_model=ExtractedCertificateInfo)
async def extract_certificate(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Extracts text, metadata (title, issuer, date, credential ID), and skills from uploaded document.
    Does not save to DB yet — lets user review, correct, and confirm.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Please upload PDF, JPG, or PNG.")

    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    saved_file_path = UPLOAD_DIR / unique_filename

    with open(saved_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get user's existing certificates for duplicate check
    existing = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    existing_dicts = [
        {"title": c.title, "issuer": c.issuer, "credential_id": c.credential_id}
        for c in existing
    ]

    extraction = parse_certificate_document(str(saved_file_path), file.filename, existing_dicts)
    extraction["file_path"] = f"/static/uploads/{unique_filename}"
    extraction["file_name"] = file.filename
    extraction["stored_filename"] = unique_filename
    
    return extraction

@app.post("/api/certificates", response_model=CertificateOut)
def save_certificate(
    cert_in: CertificateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Persist confirmed certificate into vault and update UserSkills profile."""
    stored_filename = cert_in.stored_filename
    file_name = cert_in.file_name
    file_path = f"/static/uploads/{stored_filename}" if stored_filename else ""
    file_size = 0
    if stored_filename:
        p = UPLOAD_DIR / stored_filename
        if p.exists():
            file_size = p.stat().st_size

    new_cert = Certificate(
        user_id=current_user.id,
        title=cert_in.title,
        issuer=cert_in.issuer,
        category=cert_in.category or "Other Technical Skills",
        issue_date=cert_in.issue_date or "",
        expiry_date=cert_in.expiry_date or "",
        credential_id=cert_in.credential_id or "",
        credential_url=cert_in.credential_url or "",
        skills_json=json.dumps(cert_in.skills),
        file_path=file_path,
        file_name=file_name or f"{cert_in.title}.pdf",
        file_size=file_size,
        is_verified=True
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)

    # Automatically synchronize skills to user's skill profile
    for skill in cert_in.skills:
        skill_clean = skill.strip()
        if not skill_clean:
            continue
        exists = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_name.ilike(skill_clean)
        ).first()
        if not exists:
            uskill = UserSkill(
                user_id=current_user.id,
                skill_name=skill_clean,
                category=cert_in.category,
                source="certificate",
                proficiency="Intermediate",
                is_confirmed=True
            )
            db.add(uskill)
    db.commit()

    return {
        "id": new_cert.id,
        "user_id": new_cert.user_id,
        "title": new_cert.title,
        "issuer": new_cert.issuer,
        "category": new_cert.category,
        "issue_date": new_cert.issue_date,
        "expiry_date": new_cert.expiry_date,
        "credential_id": new_cert.credential_id,
        "credential_url": new_cert.credential_url,
        "file_path": new_cert.file_path,
        "file_name": new_cert.file_name,
        "file_size": new_cert.file_size,
        "skills": json.loads(new_cert.skills_json),
        "is_verified": new_cert.is_verified,
        "created_at": new_cert.created_at
    }

@app.get("/api/certificates")
def list_certificates(
    category: Optional[str] = None,
    issuer: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Certificate).filter(Certificate.user_id == current_user.id)
    if category and category != "All":
        query = query.filter(Certificate.category == category)
    if issuer and issuer != "All":
        query = query.filter(Certificate.issuer == issuer)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Certificate.title.ilike(s)) |
            (Certificate.issuer.ilike(s)) |
            (Certificate.skills_json.ilike(s)) |
            (Certificate.category.ilike(s))
        )

    certs = query.order_by(Certificate.created_at.desc()).all()
    results = []
    for c in certs:
        skills_list = []
        try:
            skills_list = json.loads(c.skills_json) if c.skills_json else []
        except Exception:
            pass
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "title": c.title,
            "issuer": c.issuer,
            "category": c.category,
            "issue_date": c.issue_date,
            "expiry_date": c.expiry_date,
            "credential_id": c.credential_id,
            "credential_url": c.credential_url,
            "file_path": c.file_path,
            "file_name": c.file_name,
            "file_size": c.file_size,
            "skills": skills_list,
            "is_verified": c.is_verified,
            "created_at": c.created_at
        })
    return results

@app.put("/api/certificates/{cert_id}")
def update_certificate(
    cert_id: int,
    cert_update: CertificateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id, Certificate.user_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if cert_update.title is not None: cert.title = cert_update.title
    if cert_update.issuer is not None: cert.issuer = cert_update.issuer
    if cert_update.category is not None: cert.category = cert_update.category
    if cert_update.issue_date is not None: cert.issue_date = cert_update.issue_date
    if cert_update.expiry_date is not None: cert.expiry_date = cert_update.expiry_date
    if cert_update.credential_id is not None: cert.credential_id = cert_update.credential_id
    if cert_update.credential_url is not None: cert.credential_url = cert_update.credential_url
    if cert_update.skills is not None:
        cert.skills_json = json.dumps(cert_update.skills)
        for s in cert_update.skills:
            exists = db.query(UserSkill).filter(UserSkill.user_id == current_user.id, UserSkill.skill_name.ilike(s)).first()
            if not exists:
                db.add(UserSkill(user_id=current_user.id, skill_name=s, source="certificate", proficiency="Intermediate"))

    db.commit()
    db.refresh(cert)
    return {"message": "Certificate updated successfully", "id": cert.id}

@app.delete("/api/certificates/{cert_id}")
def delete_certificate(
    cert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id, Certificate.user_id == current_user.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certificate removed from vault"}

@app.post("/api/certificates/load-demo")
def load_demo_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    seed_sample_user_data(db, current_user.id)
    return {"message": "Sample portfolio loaded successfully with Microsoft Azure, Infosys Python, NPTEL DBMS, and Web Dev certifications!"}

# ----------------- SKILL INTELLIGENCE -----------------
@app.get("/api/skills")
def get_user_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    # Also fetch all skills extracted from certificates for evidence correlation
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    evidence_map = {}
    for c in certs:
        try:
            sk_list = json.loads(c.skills_json) if c.skills_json else []
            for sk in sk_list:
                if sk not in evidence_map:
                    evidence_map[sk] = []
                evidence_map[sk].append({"title": c.title, "issuer": c.issuer})
        except Exception:
            pass

    results = []
    for s in skills:
        results.append({
            "id": s.id,
            "skill_name": s.skill_name,
            "category": s.category,
            "source": s.source,
            "proficiency": s.proficiency,
            "is_confirmed": s.is_confirmed,
            "certificates": evidence_map.get(s.skill_name, [])
        })
    return results

@app.post("/api/skills")
def add_user_skill(
    skill_in: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exists = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_name.ilike(skill_in.skill_name.strip())
    ).first()
    if exists:
        return {"message": "Skill already in profile", "id": exists.id}

    uskill = UserSkill(
        user_id=current_user.id,
        skill_name=skill_in.skill_name.strip(),
        category=skill_in.category or "Technical",
        source=skill_in.source or "manual",
        proficiency=skill_in.proficiency or "Intermediate",
        is_confirmed=True
    )
    db.add(uskill)
    db.commit()
    db.refresh(uskill)
    return uskill

@app.delete("/api/skills/{skill_id}")
def delete_user_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uskill = db.query(UserSkill).filter(UserSkill.id == skill_id, UserSkill.user_id == current_user.id).first()
    if not uskill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(uskill)
    db.commit()
    return {"message": "Skill removed"}

# ----------------- CAREER INTELLIGENCE & GAP ANALYZER -----------------
@app.get("/api/career/companies")
def get_companies():
    return COMPANIES_DIRECTORY

@app.get("/api/career/roles")
def get_roles():
    return list(JOB_ROLES_CATALOG.keys())

@app.post("/api/career/analyze", response_model=CareerAnalysisResponse)
def run_career_analysis(
    req: CareerAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_skills = [s.skill_name for s in db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()]
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    user_certs = []
    for c in certs:
        try:
            sk = json.loads(c.skills_json) if c.skills_json else []
        except Exception:
            sk = []
        user_certs.append({
            "title": c.title,
            "issuer": c.issuer,
            "skills": sk
        })

    analysis = analyze_career_fit(
        user_skills=user_skills,
        user_certs=user_certs,
        company_name=req.company_name,
        job_role=req.job_role,
        custom_jd=req.custom_job_description
    )
    return analysis

# ----------------- RESUME ASSISTANT -----------------
@app.get("/api/resume/preview")
def preview_resume(
    target_role: str = Query("Cloud Support Engineer"),
    target_company: str = Query(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    
    # Check if user already has a saved resume for this role
    saved = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.target_role == target_role
    ).first()

    if saved:
        return {
            "id": saved.id,
            "target_role": saved.target_role,
            "target_company": saved.target_company,
            "template_name": saved.template_name,
            "full_name": saved.full_name,
            "email": saved.email,
            "phone": saved.phone,
            "location": saved.location,
            "linkedin_url": saved.linkedin_url,
            "github_url": saved.github_url,
            "summary": saved.summary,
            "education": json.loads(saved.education_json) if saved.education_json else [],
            "skills": json.loads(saved.skills_json) if saved.skills_json else {},
            "certificates": json.loads(saved.certificates_json) if saved.certificates_json else [],
            "projects": json.loads(saved.projects_json) if saved.projects_json else [],
            "experience": json.loads(saved.experience_json) if saved.experience_json else [],
            "is_saved": True
        }

    # Otherwise generate fresh initial resume from verified certificates and profile
    fresh = prepare_initial_resume(
        user=current_user,
        certificates=certs,
        skills=skills,
        target_role=target_role,
        target_company=target_company
    )
    fresh["is_saved"] = False
    return fresh

@app.post("/api/resume/save")
def save_resume(
    req: ResumeSaveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.target_role == req.target_role
    ).first()

    if not existing:
        existing = Resume(user_id=current_user.id, target_role=req.target_role)
        db.add(existing)

    existing.target_company = req.target_company or ""
    existing.template_name = req.template_name
    existing.full_name = req.full_name
    existing.email = req.email
    existing.phone = req.phone
    existing.location = req.location or ""
    existing.linkedin_url = req.linkedin_url or ""
    existing.github_url = req.github_url or ""
    existing.summary = req.summary
    existing.education_json = json.dumps(req.education)
    existing.skills_json = json.dumps(req.skills)
    existing.certificates_json = json.dumps(req.certificates)
    existing.projects_json = json.dumps(req.projects)
    existing.experience_json = json.dumps(req.experience)

    db.commit()
    db.refresh(existing)
    return {"message": "Resume saved successfully", "id": existing.id}

@app.post("/api/resume/download-pdf")
def download_resume_pdf(
    req: ResumeSaveRequest,
    current_user: User = Depends(get_current_user)
):
    filename = f"Resume_{current_user.full_name.replace(' ', '_')}_{req.target_role.replace(' ', '_')}.pdf"
    pdf_path = generate_pdf_resume(req.dict(), filename)
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ----------------- DASHBOARD -----------------
@app.get("/api/dashboard/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()
    
    total_certs = len(certs)
    total_skills = len(skills)

    # Categories count
    cat_counts = {}
    issuers_count = {}
    for c in certs:
        cat_counts[c.category] = cat_counts.get(c.category, 0) + 1
        issuers_count[c.issuer] = issuers_count.get(c.issuer, 0) + 1

    # Default readiness score against Cloud Support Engineer or top role
    analysis = analyze_career_fit(
        user_skills=[s.skill_name for s in skills],
        user_certs=[{"title": c.title, "issuer": c.issuer, "skills": json.loads(c.skills_json) if c.skills_json else []} for c in certs],
        company_name="Microsoft",
        job_role="Cloud Support Engineer"
    )

    return {
        "total_certificates": total_certs,
        "total_skills": total_skills,
        "verified_credentials": sum(1 for c in certs if c.is_verified),
        "categories_distribution": [{"name": k, "count": v} for k, v in cat_counts.items()],
        "issuers_distribution": [{"name": k, "count": v} for k, v in issuers_count.items()],
        "target_role_readiness": analysis["readiness_score"],
        "target_role_name": analysis["target_role"],
        "target_company_name": analysis["target_company"],
        "recent_certificates": [
            {
                "id": c.id,
                "title": c.title,
                "issuer": c.issuer,
                "category": c.category,
                "issue_date": c.issue_date,
                "skills": json.loads(c.skills_json) if c.skills_json else []
            }
            for c in certs[:5]
        ]
    }
