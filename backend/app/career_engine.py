import re
from typing import List, Dict, Any, Optional

COMPANIES_DIRECTORY = [
    {
        "id": "microsoft",
        "name": "Microsoft",
        "domain": "microsoft.com",
        "industry": "Cloud & Enterprise Software",
        "overview": "Leading global technology company focused on cloud platforms (Azure), enterprise solutions, AI, and developer tools.",
        "popular_roles": ["Cloud Support Engineer", "Junior Cloud Engineer", "Software Engineer - Azure", "Data & AI Specialist"]
    },
    {
        "id": "infosys",
        "name": "Infosys",
        "domain": "infosys.com",
        "industry": "IT Services & Consulting",
        "overview": "Global leader in next-generation digital services, enterprise consulting, and cloud transformation through Infosys Cobalt.",
        "popular_roles": ["Specialist Programmer", "Systems Engineer", "Full Stack Developer", "Cloud Operations Engineer"]
    },
    {
        "id": "tcs",
        "name": "Tata Consultancy Services (TCS)",
        "domain": "tcs.com",
        "industry": "Information Technology Services",
        "overview": "One of the world's largest IT consulting and business solutions organizations with hiring initiatives like TCS Digital & Ninja.",
        "popular_roles": ["TCS Digital Developer", "Python Developer", "Cloud & Infrastructure Engineer", "Data Analyst"]
    },
    {
        "id": "google",
        "name": "Google",
        "domain": "google.com",
        "industry": "Internet & Cloud Technology",
        "overview": "Global pioneer in search, cloud computing (GCP), machine learning, operating systems, and distributed platforms.",
        "popular_roles": ["Associate Cloud Engineer", "Cloud Technical Resident", "Software Engineer Trainee", "Data Analyst"]
    },
    {
        "id": "amazon",
        "name": "Amazon / AWS",
        "domain": "amazon.com",
        "industry": "Cloud Infrastructure & E-Commerce",
        "overview": "World leader in cloud computing (AWS) and enterprise infrastructure services.",
        "popular_roles": ["Cloud Support Associate", "Software Development Engineer (SDE I)", "Cloud Infrastructure Trainee"]
    },
    {
        "id": "accenture",
        "name": "Accenture",
        "domain": "accenture.com",
        "industry": "Technology Strategy & Cloud Consulting",
        "overview": "Global management consulting and professional technology services company driving cloud adoption and digital engineering.",
        "popular_roles": ["Associate Software Engineer", "Advanced App Engineering Analyst", "Cloud Architect Trainee"]
    },
    {
        "id": "cognizant",
        "name": "Cognizant",
        "domain": "cognizant.com",
        "industry": "Digital Transformation & IT",
        "overview": "Multinational IT corporation providing digital product engineering, IT modernization, and software development.",
        "popular_roles": ["GenC Elevate Developer", "Programmer Analyst Trainee", "Full Stack Web Developer"]
    },
    {
        "id": "wipro",
        "name": "Wipro",
        "domain": "wipro.com",
        "industry": "IT, Consulting & Business Process",
        "overview": "Major technology services provider offering digital transformation, cloud migrations, and software solutions.",
        "popular_roles": ["Project Engineer", "Cloud Trainee", "Web Developer"]
    }
]

JOB_ROLES_CATALOG = {
    "Cloud Support Engineer": {
        "domain": "Cloud & Infrastructure",
        "required_skills": ["Cloud Computing", "Azure", "Networking", "Linux", "Troubleshooting", "Problem Solving"],
        "preferred_skills": ["AWS", "Docker", "Python", "Git & GitHub"],
        "certifications": [
            {
                "title": "Microsoft Certified: Azure Fundamentals (AZ-900)",
                "issuer": "Microsoft",
                "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/",
                "description": "Foundational knowledge of cloud services and how those services are provided with Microsoft Azure.",
                "level": "Foundational"
            },
            {
                "title": "AWS Certified Cloud Practitioner",
                "issuer": "Amazon Web Services (AWS)",
                "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/",
                "description": "Overall understanding of the AWS Cloud platform, covering cloud concepts and basic security.",
                "level": "Foundational"
            },
            {
                "title": "Cisco Certified Support Technician (CCST) Networking",
                "issuer": "Cisco Networking Academy",
                "url": "https://www.netacad.com/",
                "description": "Validates essential networking concepts, IP addressing, diagnostic tools, and network troubleshooting.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "Multi-Region Cloud Web Application Architecture",
                "tech_stack": ["Azure App Service", "Azure SQL", "Virtual Networks", "Linux"],
                "description": "Deploy a highly-available web service with automated failover, load balancing, and secure subnet configurations."
            },
            {
                "title": "Automated Cloud Health & Diagnostic Monitor",
                "tech_stack": ["Python", "Azure Monitor", "Bash", "RESTful APIs"],
                "description": "Develop a diagnostic CLI tool that queries cloud resource health, logs network latency, and alerts upon anomalies."
            }
        ],
        "resume_summary_template": "Aspiring Cloud Support Engineer with practical competence in cloud architectures ({primary_skills}), system troubleshooting, and networking. Eager to deliver high-availability cloud infrastructure and incident resolution for enterprise clients at {target_company}."
    },
    "Junior Cloud Engineer": {
        "domain": "Cloud Computing",
        "required_skills": ["Cloud Computing", "Azure", "Docker", "Linux", "Git & GitHub", "Networking"],
        "preferred_skills": ["Kubernetes", "DevOps", "Python", "AWS"],
        "certifications": [
            {
                "title": "Microsoft Certified: Azure Administrator Associate (AZ-104)",
                "issuer": "Microsoft",
                "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
                "description": "Subject matter expertise implementing, managing, and monitoring an organization's Microsoft Azure environment.",
                "level": "Associate"
            },
            {
                "title": "Docker & Kubernetes Containerization Specialist",
                "issuer": "Coursera / Linux Foundation",
                "url": "https://www.coursera.org/",
                "description": "Master containerization, pod deployments, microservices orchestration, and declarative CI/CD manifests.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "Containerized Microservices CI/CD Pipeline",
                "tech_stack": ["Docker", "Kubernetes", "GitHub Actions", "Azure Container Registry"],
                "description": "Build an end-to-end containerized deployment pipeline with automated unit testing and rolling updates."
            }
        ],
        "resume_summary_template": "Proactive Junior Cloud Engineer equipped with skills in {primary_skills}, containerized deployment, and infrastructure monitoring. Passionate about automating resilient cloud solutions at {target_company}."
    },
    "Python Developer": {
        "domain": "Software Engineering",
        "required_skills": ["Python", "RESTful APIs", "SQL", "Git & GitHub", "Data Structures & Algorithms", "Object-Oriented Programming"],
        "preferred_skills": ["Docker", "Linux", "Database Management", "HTML/CSS"],
        "certifications": [
            {
                "title": "Programming, Data Structures And Algorithms Using Python",
                "issuer": "NPTEL",
                "url": "https://nptel.ac.in/",
                "description": "Rigorous foundation in algorithmic complexity, dynamic programming, and Python data structure design.",
                "level": "Foundational to Intermediate"
            },
            {
                "title": "Python Programming Masterclass",
                "issuer": "Infosys Springboard",
                "url": "https://infyspringboard.onwingspan.com/",
                "description": "Comprehensive enterprise Python, object-oriented concepts, and clean coding best practices.",
                "level": "Foundational"
            }
        ],
        "projects": [
            {
                "title": "High-Performance RESTful Microservice API",
                "tech_stack": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker"],
                "description": "Engineered an asynchronous API service with JWT authentication, role-based access control, and automated swagger documentation."
            },
            {
                "title": "Automated Web Data Aggregator & ETL Pipeline",
                "tech_stack": ["Python", "BeautifulSoup", "Pandas", "SQLite"],
                "description": "Created an automated data pipeline scraping industry job feeds, normalizing data, and calculating skill frequency trends."
            }
        ],
        "resume_summary_template": "Software Developer with strong foundational mastery in Python, API development ({primary_skills}), and relational database design. Dedicated to writing clean, maintainable, and scalable code for {target_company}."
    },
    "Full Stack Web Developer": {
        "domain": "Web Development",
        "required_skills": ["JavaScript", "React.js", "Node.js", "HTML/CSS", "SQL", "RESTful APIs", "Git & GitHub"],
        "preferred_skills": ["TypeScript", "MongoDB", "Docker", "Cloud Computing"],
        "certifications": [
            {
                "title": "Meta Front-End Developer Professional Certificate",
                "issuer": "Coursera / Meta",
                "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
                "description": "In-depth training in React, responsive user interfaces, JavaScript fundamentals, and UX principles.",
                "level": "Professional"
            },
            {
                "title": "Full Stack Web Development with Node & React",
                "issuer": "Infosys Springboard",
                "url": "https://infyspringboard.onwingspan.com/",
                "description": "End-to-end full stack architecture, state management, REST APIs, and database integration.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "Interactive Career & Certificate Management Portal",
                "tech_stack": ["React.js", "FastAPI", "SQLite/MySQL", "Vanilla CSS"],
                "description": "Architected a responsive single-page application with JWT authentication, live search, and dynamic PDF resume generation."
            },
            {
                "title": "Real-Time Collaborative Task Workspace",
                "tech_stack": ["React.js", "Node.js", "WebSockets", "MongoDB"],
                "description": "Developed a Kanban board with real-time drag-and-drop state synchronization and responsive mobile UI."
            }
        ],
        "resume_summary_template": "Motivated Full Stack Developer with hands-on proficiency in React.js, modern backend architectures, and database design ({primary_skills}). Looking to build high-impact web products at {target_company}."
    },
    "Data Analyst": {
        "domain": "Data & Analytics",
        "required_skills": ["SQL", "Python", "Data Science", "Database Management", "Problem Solving"],
        "preferred_skills": ["RESTful APIs", "Git & GitHub", "Cloud Computing"],
        "certifications": [
            {
                "title": "Google Data Analytics Professional Certificate",
                "issuer": "Google Cloud / Coursera",
                "url": "https://grow.google/certificates/data-analytics/",
                "description": "Hands-on data cleaning, visualization, SQL analysis, and business intelligence reporting.",
                "level": "Professional"
            },
            {
                "title": "Database Management System (DBMS)",
                "issuer": "NPTEL",
                "url": "https://nptel.ac.in/",
                "description": "Deep understanding of relational algebra, SQL optimization, schema normalization, and transaction handling.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "E-Commerce Customer Retention & Revenue Analytics Dashboard",
                "tech_stack": ["Python", "Pandas", "SQL", "Matplotlib"],
                "description": "Analyzed 100,000+ transaction records to uncover customer churn patterns and forecast seasonal purchasing spikes."
            }
        ],
        "resume_summary_template": "Analytical Data Specialist experienced in SQL querying, data normalization ({primary_skills}), and actionable insights generation. Eager to drive metric-informed business decisions for {target_company}."
    },
    "Artificial Intelligence / ML Trainee": {
        "domain": "AI & Machine Learning",
        "required_skills": ["Python", "Machine Learning", "Artificial Intelligence", "Data Science", "Data Structures & Algorithms"],
        "preferred_skills": ["Deep Learning", "Natural Language Processing", "Docker", "Git & GitHub"],
        "certifications": [
            {
                "title": "Deep Learning Specialization",
                "issuer": "Coursera / DeepLearning.AI",
                "url": "https://www.coursera.org/specializations/deep-learning",
                "description": "Neural networks, hyperparameter tuning, CNNs, Sequence Models, and practical ML strategy.",
                "level": "Advanced"
            },
            {
                "title": "Applied Machine Learning in Python",
                "issuer": "Coursera / University of Michigan",
                "url": "https://www.coursera.org/",
                "description": "Model evaluation, feature engineering, classification trees, and scikit-learn pipelines.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "Intelligent Document Skill & Information Extractor",
                "tech_stack": ["Python", "NLP", "Scikit-Learn", "PyMuPDF"],
                "description": "Built an automated parser extracting credential data and technical skills from unstructured certificate files."
            }
        ],
        "resume_summary_template": "Emerging AI/ML Engineer with foundational knowledge in machine learning algorithms, model training ({primary_skills}), and Python data science pipelines. Eager to contribute to intelligent software solutions at {target_company}."
    },
    "Cyber Security Analyst": {
        "domain": "Information Security",
        "required_skills": ["Cybersecurity", "Networking", "Linux", "Troubleshooting", "Problem Solving"],
        "preferred_skills": ["Python", "Git & GitHub", "Cloud Computing"],
        "certifications": [
            {
                "title": "Google Cybersecurity Professional Certificate",
                "issuer": "Google Cloud / Coursera",
                "url": "https://grow.google/certificates/cybersecurity/",
                "description": "Foundational security models, SIEM tools, packet sniffing, Linux CLI, and incident response playbooks.",
                "level": "Professional"
            },
            {
                "title": "Ethical Hacking and Information Security",
                "issuer": "NPTEL",
                "url": "https://nptel.ac.in/",
                "description": "Vulnerability scanning, cryptographic algorithms, penetration testing, and secure protocols.",
                "level": "Intermediate"
            }
        ],
        "projects": [
            {
                "title": "Automated Port & Vulnerability Scanner Tool",
                "tech_stack": ["Python", "Socket Programming", "Linux", "Bash"],
                "description": "Engineered an audit tool inspecting open host ports, testing TLS configurations, and logging potential entry points."
            }
        ],
        "resume_summary_template": "Security-focused Computer Science student with practical training in {primary_skills}, network diagnostic tools, and vulnerability identification. Aiming to protect digital assets at {target_company}."
    }
}

def parse_custom_job_description(jd_text: str) -> Dict[str, Any]:
    """Parse pasted job description to extract required skills and target role title."""
    from .extractor import SKILLS_TAXONOMY

    detected_skills = []
    lower_jd = jd_text.lower()

    for skill, patterns in SKILLS_TAXONOMY.items():
        for pat in patterns:
            if re.search(pat, lower_jd, re.IGNORECASE):
                if skill not in detected_skills:
                    detected_skills.append(skill)
                break

    # If very few skills found, ensure basic tech defaults
    if not detected_skills:
        detected_skills = ["Problem Solving", "Programming Fundamentals", "Git & GitHub"]

    # Extract probable job title from the first 3 lines
    first_lines = [line.strip() for line in jd_text.split("\n")[:4] if line.strip()]
    inferred_title = "Software Engineer"
    for line in first_lines:
        if len(line) < 50 and any(kw in line.lower() for kw in ["engineer", "developer", "analyst", "trainee", "associate", "specialist"]):
            inferred_title = line
            break

    return {
        "inferred_title": inferred_title,
        "required_skills": detected_skills[:8],
        "preferred_skills": detected_skills[8:12] if len(detected_skills) > 8 else ["Git & GitHub", "Troubleshooting"]
    }

def analyze_career_fit(
    user_skills: List[str],
    user_certs: List[Dict[str, Any]],
    company_name: Optional[str] = None,
    job_role: Optional[str] = None,
    custom_jd: Optional[str] = None
) -> Dict[str, Any]:
    """
    Core Career Recommendation & Gap Analysis Engine.
    Implements Option C (Company + Job Role + Custom JD).
    """
    target_company = company_name.strip() if company_name else "Target Enterprise"
    
    # 1. Determine job role requirements
    if custom_jd and len(custom_jd.strip()) > 20:
        parsed_jd = parse_custom_job_description(custom_jd)
        target_role = job_role.strip() if job_role else parsed_jd["inferred_title"]
        required_skills = parsed_jd["required_skills"]
        preferred_skills = parsed_jd["preferred_skills"]
        catalog_info = None
    elif job_role and job_role.strip() in JOB_ROLES_CATALOG:
        target_role = job_role.strip()
        catalog_info = JOB_ROLES_CATALOG[target_role]
        required_skills = catalog_info["required_skills"]
        preferred_skills = catalog_info.get("preferred_skills", [])
    else:
        # Default or fallback role
        target_role = job_role.strip() if job_role else "Cloud Support Engineer"
        catalog_info = JOB_ROLES_CATALOG.get(target_role, JOB_ROLES_CATALOG["Cloud Support Engineer"])
        required_skills = catalog_info["required_skills"]
        preferred_skills = catalog_info.get("preferred_skills", [])

    # Lowercase set of user's skills for case-insensitive matching
    user_skill_set = {s.lower(): s for s in user_skills}
    
    # Also extract skills directly mentioned across all certificates
    cert_skill_map = {}
    for cert in user_certs:
        title = cert.get("title", "")
        issuer = cert.get("issuer", "")
        skills = cert.get("skills", [])
        for sk in skills:
            cert_skill_map[sk.lower()] = f"{title} ({issuer})"

    all_target_skills = required_skills + [p for p in preferred_skills if p not in required_skills]
    
    matched_skills = []
    missing_skills = []

    for skill in all_target_skills:
        skill_lower = skill.lower()
        if skill_lower in cert_skill_map:
            evidence = cert_skill_map[skill_lower]
            matched_skills.append({
                "skill": skill,
                "status": "demonstrated",
                "evidence": f"Demonstrated in verified certificate: {evidence}",
                "recommendation": "Already demonstrated at verified certification level. Highlight on resume."
            })
        elif skill_lower in user_skill_set:
            matched_skills.append({
                "skill": skill,
                "status": "demonstrated",
                "evidence": "Present in confirmed user skill profile",
                "recommendation": "Skill confirmed by user. Consider creating a project to provide verifiable evidence."
            })
        else:
            # Missing skill / Gap
            missing_skills.append({
                "skill": skill,
                "status": "missing",
                "evidence": "No certificate or project evidence found yet",
                "recommendation": f"Explore foundational learning paths or tutorials for {skill} to strengthen role alignment."
            })

    total_count = len(all_target_skills) if all_target_skills else 1
    matched_count = len(matched_skills)
    readiness_score = int(round((matched_count / total_count) * 100))

    # Suggested certifications
    suggested_certs = []
    if catalog_info and "certifications" in catalog_info:
        for cert_item in catalog_info["certifications"]:
            # Check if user already holds this certificate
            user_has = any(cert_item["title"].lower() in c.get("title", "").lower() for c in user_certs)
            if not user_has:
                suggested_certs.append(cert_item)
    else:
        # Generic suggested certifications based on missing skills
        for m in missing_skills[:2]:
            suggested_certs.append({
                "title": f"Professional Certification in {m['skill']}",
                "issuer": "Coursera / NPTEL",
                "url": "https://www.coursera.org/",
                "description": f"Comprehensive coursework covering real-world {m['skill']} principles and practical labs.",
                "level": "Foundational"
            })

    # Suggested practical projects
    suggested_projects = []
    if catalog_info and "projects" in catalog_info:
        suggested_projects = catalog_info["projects"]
    else:
        suggested_projects = [
            {
                "title": f"{target_role} Practical Portfolio Application",
                "tech_stack": required_skills[:3] if required_skills else ["Python", "SQL", "Git & GitHub"],
                "description": f"Architect a portfolio project demonstrating practical use of {', '.join(required_skills[:3])}."
            }
        ]

    # Generate tailored summary
    primary_demonstrated = [m["skill"] for m in matched_skills[:3]]
    primary_str = ", ".join(primary_demonstrated) if primary_demonstrated else "core computer science principles"
    
    if catalog_info and "resume_summary_template" in catalog_info:
        tailored_summary = catalog_info["resume_summary_template"].format(
            primary_skills=primary_str,
            target_company=target_company if target_company != "Target Enterprise" else "forward-thinking organizations"
        )
    else:
        tailored_summary = f"Dedicated engineering student with competencies in {primary_str}. Seeking to leverage certified technical skills as a {target_role} at {target_company}."

    # Recommended bullet points for resume
    bullet_points = [
        f"Demonstrated technical proficiency in {primary_str} validated by accredited certifications.",
        f"Completed structured coursework and problem-solving evaluations aligned with {target_role} standards.",
        f"Engineered practical applications integrating robust software development practices and version control."
    ]

    return {
        "target_role": target_role,
        "target_company": target_company,
        "readiness_score": min(readiness_score, 100),
        "matched_count": matched_count,
        "total_required": total_count,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggested_certificates": suggested_certs,
        "suggested_projects": suggested_projects,
        "tailored_resume_summary": tailored_summary,
        "recommended_resume_points": bullet_points
    }
