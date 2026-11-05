import os
import json
from pathlib import Path
from typing import Dict, Any, List
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.units import mm
from .config import RESUME_DIR

CERT_DESCRIPTIONS = {
    "azure": "Demonstrated foundational knowledge of cloud concepts, Azure architectural services, identity, governance, and security models.",
    "python": "Validated competencies in Python programming fundamentals, object-oriented concepts, and algorithmic problem solving.",
    "database": "Demonstrated practical proficiency in relational database architecture, SQL queries, schema normalization, and data transactions.",
    "aws": "Validated core architectural knowledge of Amazon Web Services, cloud security, compute, and serverless infrastructure.",
    "web": "Demonstrated practical development of responsive web applications, modern JavaScript, and component-based frontend architecture.",
    "machine learning": "Trained models, implemented feature pipelines, and applied machine learning algorithms for predictive analysis.",
    "cybersecurity": "Mastered core network security protocols, vulnerability scanning, threat identification, and compliance frameworks.",
    "cloud": "Gained foundational proficiency in cloud services, distributed deployments, and infrastructure resilience."
}

def get_cert_resume_description(title: str, issuer: str) -> str:
    combined = f"{title} {issuer}".lower()
    for key, desc in CERT_DESCRIPTIONS.items():
        if key in combined:
            return desc
    return f"Completed rigorous coursework and practical evaluations issued by {issuer}."

def categorize_skills(skills_list: List[str]) -> Dict[str, List[str]]:
    categories = {
        "Languages & Core": [],
        "Cloud & Infrastructure": [],
        "Frameworks & Web": [],
        "Databases & Tools": []
    }
    
    cloud_set = {"Azure", "AWS", "Google Cloud Platform", "Cloud Computing", "Docker", "Kubernetes", "DevOps", "Linux", "Networking"}
    lang_set = {"Python", "Java", "C++", "C", "JavaScript", "TypeScript", "Data Structures & Algorithms", "Object-Oriented Programming", "Problem Solving"}
    web_set = {"React.js", "Node.js", "HTML/CSS", "RESTful APIs", "FastAPI"}
    db_tool_set = {"SQL", "MongoDB", "Database Management", "Git & GitHub", "Cybersecurity", "Troubleshooting", "Machine Learning", "Deep Learning", "Data Science", "Natural Language Processing", "Computer Vision"}

    for s in skills_list:
        if s in lang_set:
            categories["Languages & Core"].append(s)
        elif s in cloud_set:
            categories["Cloud & Infrastructure"].append(s)
        elif s in web_set:
            categories["Frameworks & Web"].append(s)
        else:
            categories["Databases & Tools"].append(s)

    # Remove empty categories
    return {k: v for k, v in categories.items() if v}

def filter_relevant_certificates(certificates, target_role: str, max_certs: int = 3) -> list:
    """
    Return only certificates relevant to the target role, ranked by relevance.
    Relevance is scored by how many of the cert's skills / title / issuer
    keywords overlap with the role's required & preferred skills.
    Falls back to the top-N most recent if nothing matches.
    """
    from .career_engine import JOB_ROLES_CATALOG

    role_info = JOB_ROLES_CATALOG.get(target_role, {})
    required = [s.lower() for s in role_info.get("required_skills", [])]
    preferred = [s.lower() for s in role_info.get("preferred_skills", [])]
    role_keywords = required + preferred + [w.lower() for w in target_role.split()]

    scored = []
    for cert in certificates:
        cert_text = " ".join([
            cert.title or "",
            cert.issuer or "",
            cert.category or "",
            cert.skills_json or ""
        ]).lower()

        score = sum(1 for kw in role_keywords if kw in cert_text)
        # Bonus: issuer prominence (Microsoft, AWS, Google, NPTEL, Coursera, etc.)
        reputable = ["microsoft", "aws", "amazon", "google", "nptel", "coursera", "infosys", "cisco", "oracle"]
        if any(r in cert_text for r in reputable):
            score += 1
        scored.append((score, cert))

    # Sort by score descending; for ties keep original order (most recent first)
    scored.sort(key=lambda x: x[0], reverse=True)

    # Take top relevant certs; if none scored > 0, just take the first max_certs
    top = [cert for score, cert in scored if score > 0][:max_certs]
    if not top:
        top = [cert for _, cert in scored[:max_certs]]
    return top


def prepare_initial_resume(user, certificates, skills, target_role="Software Engineer", target_company="") -> Dict[str, Any]:
    """Compile verified user data into a structured editable resume."""
    skill_names = [s.skill_name for s in skills]
    if not skill_names:
        # Fallback to skills extracted in certificates
        for cert in certificates:
            try:
                c_skills = json.loads(cert.skills_json) if isinstance(cert.skills_json, str) else cert.skills_json
                for cs in c_skills:
                    if cs not in skill_names:
                        skill_names.append(cs)
            except Exception:
                pass

    categorized_skills = categorize_skills(skill_names)
    
    # Only include certificates relevant to the target role (max 3)
    relevant_certs = filter_relevant_certificates(certificates, target_role, max_certs=3)

    cert_entries = []
    for cert in relevant_certs:
        desc = get_cert_resume_description(cert.title, cert.issuer)
        cert_entries.append({
            "title": cert.title,
            "issuer": cert.issuer,
            "date": cert.issue_date or "Verified",
            "credential_id": cert.credential_id or "",
            "description": desc
        })

    from .career_engine import JOB_ROLES_CATALOG
    catalog_info = JOB_ROLES_CATALOG.get(target_role)
    primary_skills = ", ".join(skill_names[:3]) if skill_names else "modern software engineering"
    
    if catalog_info and "resume_summary_template" in catalog_info:
        summary = catalog_info["resume_summary_template"].format(
            primary_skills=primary_skills,
            target_company=target_company if target_company else "leading engineering teams"
        )
    else:
        summary = f"Motivated {user.degree or 'Computer Science'} student with strong foundations in {primary_skills}. Eager to leverage verified technical skills and problem-solving abilities as a {target_role} at {target_company or 'your organization'}."

    education = [
        {
            "degree": user.degree or "B.E. Computer Science and Engineering",
            "institution": user.college or "University College of Engineering",
            "year": f"Graduation: {user.graduation_year or '2026'}",
            "score": ""
        }
    ]

    # Sample standard academic projects if user hasn't added custom ones
    projects = [
        {
            "title": "CertiWise – Smart Certificate & Career Assistant",
            "tech_stack": "React.js, FastAPI, Python, SQLAlchemy, PyMuPDF, ReportLab",
            "description": "Architected an intelligent platform that parses technical certificates, identifies skill proficiencies, conducts company-aligned gap analysis, and exports ATS-ready resumes.",
            "github_link": user.github_url or ""
        }
    ]

    experience = []

    return {
        "full_name": user.full_name or "Student Name",
        "email": user.email,
        "phone": user.phone or "",
        "location": "Chennai, Tamil Nadu, India",
        "linkedin_url": user.linkedin_url or "",
        "github_url": user.github_url or "",
        "target_role": target_role,
        "target_company": target_company,
        "template_name": "modern",
        "summary": summary,
        "education": education,
        "skills": categorized_skills,
        "certificates": cert_entries,
        "projects": projects,
        "experience": experience
    }

def generate_pdf_resume(resume_data: Dict[str, Any], output_filename: str) -> str:
    """Generate a high quality, ATS-compliant PDF resume using ReportLab."""
    pdf_path = RESUME_DIR / output_filename
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=18*mm,
        rightMargin=18*mm,
        topMargin=16*mm,
        bottomMargin=16*mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1e293b") # Slate 800
    accent_color = colors.HexColor("#2563eb")  # Blue 600
    dark_gray = colors.HexColor("#334155")
    light_line = colors.HexColor("#cbd5e1")

    name_style = ParagraphStyle(
        "ResumeName",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=1 # Center
    )

    contact_style = ParagraphStyle(
        "ResumeContact",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=dark_gray,
        alignment=1 # Center
    )

    section_heading_style = ParagraphStyle(
        "ResumeSection",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=8,
        spaceAfter=2
    )

    subhead_bold = ParagraphStyle(
        "ResumeSubBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=primary_color
    )

    subhead_italic = ParagraphStyle(
        "ResumeSubItalic",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=12,
        textColor=dark_gray
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=primary_color
    )

    bullet_style = ParagraphStyle(
        "ResumeBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=dark_gray,
        leftIndent=14
    )

    story = []

    # 1. Header (Name & Contact)
    full_name = resume_data.get("full_name", "Student Name").upper()
    story.append(Paragraph(full_name, name_style))
    story.append(Spacer(1, 4))

    contacts = []
    if resume_data.get("email"):
        contacts.append(resume_data["email"])
    if resume_data.get("phone"):
        contacts.append(resume_data["phone"])
    if resume_data.get("location"):
        contacts.append(resume_data["location"])
    if resume_data.get("linkedin_url"):
        contacts.append("LinkedIn")
    if resume_data.get("github_url"):
        contacts.append("GitHub")

    story.append(Paragraph(" • ".join(contacts), contact_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceBefore=4, spaceAfter=8))

    # 2. Career Summary
    if resume_data.get("summary"):
        story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        story.append(Paragraph(resume_data["summary"], body_style))
        story.append(Spacer(1, 8))

    # 3. Technical Skills (Categorized)
    skills = resume_data.get("skills", {})
    if skills:
        story.append(Paragraph("TECHNICAL SKILLS", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        if isinstance(skills, dict):
            for cat, skill_items in skills.items():
                if skill_items:
                    items_str = ", ".join(skill_items) if isinstance(skill_items, list) else str(skill_items)
                    line_html = f"<b>{cat}:</b> {items_str}"
                    story.append(Paragraph(line_html, body_style))
                    story.append(Spacer(1, 2))
        elif isinstance(skills, list):
            story.append(Paragraph(", ".join(skills), body_style))
        story.append(Spacer(1, 6))

    # 4. Verified Certifications
    certs = resume_data.get("certificates", [])
    if certs:
        story.append(Paragraph("VERIFIED CERTIFICATIONS", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        for c in certs:
            title = c.get("title", "")
            issuer = c.get("issuer", "")
            date = c.get("date", "")
            desc = c.get("description", "")
            
            top_line = f"<b>{title}</b> — <i>{issuer}</i>"
            if date:
                top_line += f" ({date})"
            story.append(Paragraph(top_line, body_style))
            if desc:
                story.append(Paragraph(f"• {desc}", bullet_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 6))

    # 5. Projects
    projects = resume_data.get("projects", [])
    if projects:
        story.append(Paragraph("TECHNICAL PROJECTS", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        for p in projects:
            p_title = p.get("title", "")
            p_stack = p.get("tech_stack", "")
            p_desc = p.get("description", "")
            p_head = f"<b>{p_title}</b>"
            if p_stack:
                p_head += f" | <i>{p_stack}</i>"
            story.append(Paragraph(p_head, body_style))
            if p_desc:
                story.append(Paragraph(f"• {p_desc}", bullet_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 6))

    # 6. Education
    education = resume_data.get("education", [])
    if education:
        story.append(Paragraph("EDUCATION", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        for edu in education:
            deg = edu.get("degree", "")
            inst = edu.get("institution", "")
            yr = edu.get("year", "")
            score = edu.get("score", "")
            edu_line = f"<b>{deg}</b> — {inst}"
            extra = []
            if yr: extra.append(yr)
            if score: extra.append(score)
            if extra:
                edu_line += f" ({', '.join(extra)})"
            story.append(Paragraph(edu_line, body_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 6))

    # 7. Experience / Internships
    experience = resume_data.get("experience", [])
    if experience:
        story.append(Paragraph("INTERNSHIP & EXPERIENCE", section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=light_line, spaceBefore=2, spaceAfter=4))
        for exp in experience:
            role = exp.get("role", "")
            comp = exp.get("company", "")
            dur = exp.get("duration", "")
            desc = exp.get("description", "")
            story.append(Paragraph(f"<b>{role}</b> at <b>{comp}</b> ({dur})", body_style))
            if desc:
                story.append(Paragraph(f"• {desc}", bullet_style))
            story.append(Spacer(1, 4))

    doc.build(story)
    return str(pdf_path)
