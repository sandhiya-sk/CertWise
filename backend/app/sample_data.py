import json
from .models import Certificate, UserSkill

SAMPLE_CERTIFICATES = [
    {
        "title": "Microsoft Certified: Azure Fundamentals (AZ-900)",
        "issuer": "Microsoft",
        "category": "Cloud Computing",
        "issue_date": "March 2024",
        "expiry_date": "",
        "credential_id": "MSFT-AZ900-883920",
        "credential_url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
        "skills": ["Azure", "Cloud Computing", "Networking", "Troubleshooting"]
    },
    {
        "title": "Python Programming Masterclass",
        "issuer": "Infosys Springboard",
        "category": "Programming",
        "issue_date": "January 2024",
        "expiry_date": "",
        "credential_id": "INFY-SPB-PY-44912",
        "credential_url": "https://infyspringboard.onwingspan.com/",
        "skills": ["Python", "Data Structures & Algorithms", "Object-Oriented Programming"]
    },
    {
        "title": "Database Management System (DBMS)",
        "issuer": "NPTEL",
        "category": "Database Management",
        "issue_date": "October 2023",
        "expiry_date": "",
        "credential_id": "NPTEL23CS89S12093",
        "credential_url": "https://nptel.ac.in/",
        "skills": ["SQL", "Database Management"]
    },
    {
        "title": "Modern Full-Stack Web Development Workshop",
        "issuer": "University / College",
        "category": "Web Development",
        "issue_date": "August 2023",
        "expiry_date": "",
        "credential_id": "COLLEGE-WS-WEB-2023",
        "credential_url": "",
        "skills": ["HTML/CSS", "JavaScript", "React.js", "RESTful APIs"]
    }
]

def seed_sample_user_data(db, user_id: int):
    """Seed user with standard authentic certificates and skills for initial demo."""
    # Check if user already has certificates
    existing_count = db.query(Certificate).filter(Certificate.user_id == user_id).count()
    if existing_count > 0:
        return

    all_skills = set()
    for item in SAMPLE_CERTIFICATES:
        cert = Certificate(
            user_id=user_id,
            title=item["title"],
            issuer=item["issuer"],
            category=item["category"],
            issue_date=item["issue_date"],
            expiry_date=item["expiry_date"],
            credential_id=item["credential_id"],
            credential_url=item["credential_url"],
            skills_json=json.dumps(item["skills"]),
            is_verified=True,
            file_name=f"{item['title'].replace(' ', '_')}.pdf",
            file_size=1024 * 450
        )
        db.add(cert)
        for s in item["skills"]:
            all_skills.add(s)

    for skill in all_skills:
        uskill = UserSkill(
            user_id=user_id,
            skill_name=skill,
            category="Technical",
            source="certificate",
            proficiency="Intermediate",
            is_confirmed=True
        )
        db.add(uskill)

    db.commit()
