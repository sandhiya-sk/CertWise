import re
import os
from pathlib import Path
from typing import List, Dict, Any, Tuple
from PIL import Image

try:
    import pymupdf as fitz
    HAS_FITZ = True
except ImportError:
    try:
        import fitz
        HAS_FITZ = True
    except ImportError:
        HAS_FITZ = False

try:
    import PyPDF2
    HAS_PYPDF2 = True
except ImportError:
    HAS_PYPDF2 = False

try:
    import pytesseract
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False

# Known Issuers with matching patterns
KNOWN_ISSUERS = [
    ("Microsoft", [r"\bmicrosoft\b", r"\bazure\b", r"\bmsft\b"]),
    ("Infosys Springboard", [r"\binfosys springboard\b", r"\binfosys\b"]),
    ("NPTEL", [r"\bnptel\b", r"\biit\b", r"\bswayam\b"]),
    ("Coursera", [r"\bcoursera\b"]),
    ("Amazon Web Services (AWS)", [r"\bamazon web services\b", r"\baws\b"]),
    ("Google Cloud", [r"\bgoogle cloud\b", r"\bgoogle\b", r"\bgcp\b"]),
    ("HackerRank", [r"\bhackerrank\b"]),
    ("Udemy", [r"\budemy\b"]),
    ("edX", [r"\bedx\b"]),
    ("Cisco Networking Academy", [r"\bcisco\b"]),
    ("IBM", [r"\bibm\b", r"\bcognitive class\b"]),
    ("Oracle", [r"\boracle\b"]),
    ("LinkedIn Learning", [r"\blinkedin\b"]),
    ("HarvardX / edX", [r"\bharvard\b"]),
    ("Meta / Facebook", [r"\bmeta\b", r"\bfacebook\b"]),
    ("Stanford Online", [r"\bstanford\b"]),
    ("University / College", [r"\bcollege\b", r"\buniversity\b", r"\binstitute\b", r"\bdepartment of\b"])
]

# Skill Dictionary (Skill Name -> regex keywords)
SKILLS_TAXONOMY = {
    "Python": [r"\bpython\b", r"\bpython3\b"],
    "Java": [r"\bjava\b(?!script)"],
    "C++": [r"\bc\+\+\b", r"\bcpp\b"],
    "C": [r"\bc programming\b", r"\blanguage c\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b", r"\bes6\b"],
    "TypeScript": [r"\btypescript\b", r"\bts\b"],
    "React.js": [r"\breact\b", r"\breact\.?js\b"],
    "Node.js": [r"\bnode\b", r"\bnode\.?js\b"],
    "HTML/CSS": [r"\bhtml5?\b", r"\bcss3?\b", r"\bweb design\b"],
    "SQL": [r"\bsql\b", r"\brdbms\b", r"\bmysql\b", r"\bpostgresql\b", r"\bsqlite\b"],
    "MongoDB": [r"\bmongodb\b", r"\bnosql\b"],
    "Database Management": [r"\bdatabase\b", r"\bquery optimization\b", r"\bdata modeling\b"],
    "Azure": [r"\bazure\b", r"\baz-900\b", r"\baz-104\b", r"\baz-204\b"],
    "AWS": [r"\baws\b", r"\bcloud practitioner\b", r"\bsolutions architect\b", r"\bec2\b", r"\bs3\b"],
    "Google Cloud Platform": [r"\bgcp\b", r"\bgoogle cloud\b"],
    "Cloud Computing": [r"\bcloud computing\b", r"\bcloud concepts\b", r"\bcloud fundamentals\b", r"\biaas\b", r"\bpaas\b", r"\bsaas\b"],
    "Docker": [r"\bdocker\b", r"\bcontainerization\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "DevOps": [r"\bdevops\b", r"\bci/cd\b", r"\bpipeline\b"],
    "Linux": [r"\blinux\b", r"\bunix\b", r"\bbash\b", r"\bshell scripting\b"],
    "Git & GitHub": [r"\bgit\b", r"\bgithub\b", r"\bversion control\b"],
    "Machine Learning": [r"\bmachine learning\b", r"\bml\b", r"\bsupervised learning\b", r"\bunsupervised\b"],
    "Deep Learning": [r"\bdeep learning\b", r"\bneural networks\b", r"\bcnn\b", r"\brnn\b"],
    "Artificial Intelligence": [r"\bartificial intelligence\b", r"\bai\b"],
    "Natural Language Processing": [r"\bnlp\b", r"\bnatural language\b", r"\bllm\b"],
    "Computer Vision": [r"\bcomputer vision\b", r"\bopencv\b"],
    "Data Science": [r"\bdata science\b", r"\bpandas\b", r"\bnumpy\b", r"\bdata analysis\b"],
    "Cybersecurity": [r"\bcyber ?security\b", r"\bethical hacking\b", r"\binformation security\b", r"\bnetwork security\b"],
    "Networking": [r"\bnetworking\b", r"\btcp/ip\b", r"\bdns\b", r"\brouting\b", r"\bccna\b"],
    "RESTful APIs": [r"\brest\b", r"\brestful\b", r"\bapi\b", r"\bfastapi\b", r"\bflask\b"],
    "Data Structures & Algorithms": [r"\bdata structures\b", r"\balgorithms\b", r"\bdsa\b"],
    "Object-Oriented Programming": [r"\boop\b", r"\bobject oriented\b"],
    "Problem Solving": [r"\bproblem solving\b", r"\bcompetitive programming\b"],
    "Troubleshooting": [r"\btroubleshooting\b", r"\bdebugging\b", r"\bsupport\b"],
    "Agile / Scrum": [r"\bagile\b", r"\bscrum\b", r"\bsprint\b"],
}

# Category Heuristics
CATEGORY_RULES = [
    ("Cloud Computing", [r"cloud", r"azure", r"aws", r"gcp", r"devops", r"kubernetes", r"docker"]),
    ("Artificial Intelligence", [r"artificial intelligence", r"machine learning", r"deep learning", r"neural", r"nlp", r"data science", r"ai"]),
    ("Web Development", [r"web development", r"frontend", r"backend", r"full stack", r"react", r"javascript", r"html", r"node"]),
    ("Programming", [r"programming", r"python", r"java\b", r"c\+\+", r"algorithms", r"data structures", r"coding"]),
    ("Database Management", [r"database", r"sql", r"mysql", r"mongodb", r"nosql", r"dbms", r"data management"]),
    ("Cybersecurity", [r"security", r"cyber", r"ethical hack", r"cryptography", r"infosec", r"networking"]),
    ("Internships & Workshops", [r"internship", r"intern\b", r"workshop", r"hackathon", r"bootcamp", r"training"])
]

def extract_text_from_file(file_path: str) -> str:
    """Extract raw text from PDF or Image file."""
    path = Path(file_path)
    suffix = path.suffix.lower()
    text = ""

    if suffix == ".pdf":
        if HAS_FITZ:
            try:
                doc = fitz.open(file_path)
                for page in doc:
                    text += page.get_text() + "\n"
                doc.close()
            except Exception as e:
                pass
        
        if not text.strip() and HAS_PYPDF2:
            try:
                with open(file_path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
            except Exception as e:
                pass

    elif suffix in [".png", ".jpg", ".jpeg"]:
        if HAS_TESSERACT:
            try:
                img = Image.open(file_path)
                text = pytesseract.image_to_string(img)
            except Exception:
                pass

    # If text is still blank or very short (like scanned PDF or image without OCR),
    # infer hints from the filename so the user isn't stuck with empty fields!
    if len(text.strip()) < 10:
        filename_hint = path.stem.replace("_", " ").replace("-", " ")
        text += f"\nFile Title Hint: {filename_hint}"

    return text.strip()

def identify_issuer(text: str, filename: str = "") -> str:
    combined = f"{text}\n{filename}".lower()
    for issuer_name, patterns in KNOWN_ISSUERS:
        for pat in patterns:
            if re.search(pat, combined, re.IGNORECASE):
                return issuer_name
    return "Independent / Other"

def identify_category(text: str, title: str = "") -> str:
    combined = f"{title}\n{text}".lower()
    for cat_name, patterns in CATEGORY_RULES:
        for pat in patterns:
            if re.search(pat, combined, re.IGNORECASE):
                return cat_name
    return "Other Technical Skills"

def extract_skills_from_text(text: str) -> List[str]:
    found_skills = []
    text_lower = text.lower()
    for skill_name, patterns in SKILLS_TAXONOMY.items():
        for pat in patterns:
            if re.search(pat, text_lower, re.IGNORECASE):
                if skill_name not in found_skills:
                    found_skills.append(skill_name)
                break
    return found_skills

def extract_dates(text: str) -> Tuple[str, str]:
    """Find issue date and expiry date."""
    # Pattern for Month Year: "January 2024", "Jan 2024"
    month_year_pattern = r"\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,\s]+(20[12]\d)\b"
    # Pattern for DD-MM-YYYY or YYYY-MM-DD
    numeric_date_pattern = r"\b(\d{1,2}[/-]\d{1,2}[/-]20[12]\d|20[12]\d[/-]\d{1,2}[/-]\d{1,2})\b"

    issue_date = ""
    expiry_date = ""

    # Look for "Issued on", "Date of Issue", "Date:", "Completed on"
    issue_match = re.search(r"(?:issued\s*(?:on|date)?|completed\s*(?:on)?|date\s*(?:of\s*issue)?|awarded\s*(?:on)?)[^\w\n]*([A-Za-z0-9\s,/-]{4,25})", text, re.IGNORECASE)
    if issue_match:
        cand = issue_match.group(1).strip()
        m1 = re.search(month_year_pattern, cand, re.IGNORECASE) or re.search(numeric_date_pattern, cand)
        if m1:
            issue_date = m1.group(0)

    if not issue_date:
        m2 = re.search(month_year_pattern, text, re.IGNORECASE)
        if m2:
            issue_date = m2.group(0)
        else:
            m3 = re.search(numeric_date_pattern, text)
            if m3:
                issue_date = m3.group(0)

    # Expiry
    exp_match = re.search(r"(?:expires|expiration|valid\s*thru|valid\s*until)[^\w\n]*([A-Za-z0-9\s,/-]{4,25})", text, re.IGNORECASE)
    if exp_match:
        cand_exp = exp_match.group(1).strip()
        m_exp = re.search(month_year_pattern, cand_exp, re.IGNORECASE) or re.search(numeric_date_pattern, cand_exp)
        if m_exp:
            expiry_date = m_exp.group(0)

    return issue_date, expiry_date

def extract_credential_id(text: str) -> str:
    patterns = [
        r"(?:credential\s*id|certificate\s*(?:id|no|number)|verification\s*code|license\s*number)[^\w\n]*([A-Za-z0-9-_]{6,40})",
        r"\bID\s*:\s*([A-Za-z0-9-_]{6,30})\b"
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return ""

def extract_certificate_title(text: str, filename: str) -> str:
    """Intelligently determine the certificate title."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # Check for explicit patterns like:
    # "has successfully completed [Course Title]"
    # "Certificate of Completion [Course Title]"
    # "Microsoft Certified: [Azure Fundamentals]"
    pattern_title = re.search(
        r"(?:has\s+successfully\s+completed|certifies\s+that[^\n]+has\s+completed|certificate\s+of\s+completion\s+(?:for|in)?|certified\s*(?:as|in)?)[^\w\n]*([A-Za-z0-9\s\(\)\:\+\#\-]{4,80})",
        text,
        re.IGNORECASE
    )
    if pattern_title:
        candidate = pattern_title.group(1).strip()
        candidate = re.sub(r"^(the\s+|an?\s+)", "", candidate, flags=re.IGNORECASE)
        if len(candidate) > 4 and len(candidate.split()) < 10:
            return candidate.title()

    # Look through first 10 lines for title-like phrase
    for line in lines[:10]:
        lower = line.lower()
        if any(keyword in lower for keyword in ["fundamentals", "programming", "developer", "architect", "engineer", "course", "specialization", "certified", "bootcamp"]):
            if len(line) < 70 and not any(skip in lower for skip in ["this is to certify", "certificate of", "presented to", "verify at"]):
                return line.strip()

    # Fallback to filename cleanup
    stem = Path(filename).stem
    cleaned = re.sub(r"[_\-]+", " ", stem)
    cleaned = re.sub(r"\b(cert|certificate|completion|verified)\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    return cleaned.title() if cleaned else "Technical Certification"

def parse_certificate_document(file_path: str, filename: str, existing_certificates: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Complete extraction pipeline for uploaded certificate."""
    raw_text = extract_text_from_file(file_path)
    
    title = extract_certificate_title(raw_text, filename)
    issuer = identify_issuer(raw_text, filename)
    category = identify_category(raw_text, title)
    skills = extract_skills_from_text(raw_text)
    
    # If no skills were detected in text, infer skills from title!
    if not skills:
        skills = extract_skills_from_text(title)
    if not skills:
        # Default skill based on category
        cat_defaults = {
            "Cloud Computing": ["Cloud Computing"],
            "Programming": ["Programming Fundamentals"],
            "Web Development": ["Web Development", "HTML/CSS"],
            "Database Management": ["SQL", "Database Management"],
            "Artificial Intelligence": ["Machine Learning", "Artificial Intelligence"],
            "Cybersecurity": ["Cybersecurity", "Networking"],
            "Internships & Workshops": ["Problem Solving"]
        }
        skills = cat_defaults.get(category, ["Technical Competence"])

    issue_date, expiry_date = extract_dates(raw_text)
    credential_id = extract_credential_id(raw_text)

    # Duplicate check
    is_duplicate = False
    duplicate_of = None
    if existing_certificates:
        for exist in existing_certificates:
            # Check same credential ID or very similar title and issuer
            if credential_id and exist.get("credential_id") == credential_id:
                is_duplicate = True
                duplicate_of = f"Matches existing credential ID: {exist.get('title')}"
                break
            elif exist.get("title", "").strip().lower() == title.lower() and exist.get("issuer", "").strip().lower() == issuer.lower():
                is_duplicate = True
                duplicate_of = f"Identical title & issuer: {exist.get('title')}"
                break

    return {
        "title": title,
        "issuer": issuer,
        "category": category,
        "issue_date": issue_date,
        "expiry_date": expiry_date,
        "credential_id": credential_id,
        "skills": skills,
        "raw_text": raw_text[:2000], # truncated snippet
        "is_duplicate": is_duplicate,
        "duplicate_of": duplicate_of
    }
