from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), default="Student")
    phone = Column(String(50), default="")
    college = Column(String(255), default="")
    degree = Column(String(255), default="B.E. Computer Science and Engineering")
    graduation_year = Column(String(20), default="2026")
    linkedin_url = Column(String(255), default="")
    github_url = Column(String(255), default="")
    bio = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    category = Column(String(100), default="Other Technical Skills")
    issue_date = Column(String(50), default="")
    expiry_date = Column(String(50), default="")
    credential_id = Column(String(255), default="")
    credential_url = Column(String(500), default="")
    file_path = Column(String(500), default="")
    file_name = Column(String(255), default="")
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, default="")
    skills_json = Column(Text, default="[]") # JSON list of extracted skill strings
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="certificates")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    category = Column(String(100), default="Technical")
    source = Column(String(50), default="certificate") # "certificate", "project", "manual"
    proficiency = Column(String(50), default="Intermediate") # "Beginner", "Intermediate", "Advanced"
    is_confirmed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skills")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String(255), default="Software Engineer")
    target_company = Column(String(255), default="")
    template_name = Column(String(50), default="modern")
    full_name = Column(String(255), default="")
    email = Column(String(255), default="")
    phone = Column(String(50), default="")
    location = Column(String(255), default="")
    linkedin_url = Column(String(255), default="")
    github_url = Column(String(255), default="")
    summary = Column(Text, default="")
    education_json = Column(Text, default="[]")
    skills_json = Column(Text, default="[]")
    certificates_json = Column(Text, default="[]")
    projects_json = Column(Text, default="[]")
    experience_json = Column(Text, default="[]")
    pdf_filename = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
