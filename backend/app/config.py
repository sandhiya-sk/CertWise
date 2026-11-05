import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Database configuration
# Can be overridden with: mysql+pymysql://user:password@localhost/certiwise
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'certiwise.db'}")

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
	raise RuntimeError("Set the SECRET_KEY environment variable before starting the backend.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# File Storage Directories
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

RESUME_DIR = BASE_DIR / "generated_resumes"
RESUME_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_MB = 15
