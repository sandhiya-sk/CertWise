# CertiWise — Smart Certificate & Career Assistant Platform

> **Your Certificates. Your Skills. Your Career Opportunities.**  
> An intelligent Web Technology project combining certificate management, automated document extraction, company and job-role skill gap analysis, and tailored ATS resume generation.

---

## 🌟 Project Highlights & Modules

CertiWise solves the student problem of scattered certificates by extracting, organizing, and linking certifications to real career opportunities:

1. **Smart Certificate Vault**:
   - Centralized repository supporting PDF, JPG, and PNG certificate documents.
   - Automatic categorization into *Cloud Computing*, *Programming*, *Web Development*, *Database Management*, *Artificial Intelligence*, *Cybersecurity*, and *Internships*.
   - Live search by title, issuer, skill, and category.
   - Duplicate upload detection (matching credential IDs and identical titles).
   - Expiration date tracking and verified credential tagging.

2. **Certificate Information Extractor**:
   - Automated layout & text extraction powered by **PyMuPDF (`pymupdf`)** with OCR fallbacks.
   - Intelligent heuristics detecting:
     - Prominent Issuers (*Microsoft*, *Infosys Springboard*, *NPTEL*, *Coursera*, *AWS*, *Google Cloud*, *HackerRank*, *Udemy*, etc.)
     - Credential IDs and certification titles
     - 150+ in-demand technical and soft skills mapped via ontology patterns
   - Interactive review & confirmation modal allowing users to inspect and correct extracted metadata before saving.

3. **Skill Intelligence Engine**:
   - Maintains a structured user skill profile with evidence lineage.
   - Distinguishes between **skills verified by accredited certificates** vs **skills confirmed by the student**.
   - Lets students log additional proficiencies (Beginner, Intermediate, Advanced).

4. **Company & Job Role Analyzer (Option C)**:
   - **Mode A (Company Directory)**: Select top enterprises (*Microsoft*, *Infosys*, *TCS*, *Google*, *Amazon*, *Accenture*, *Wipro*, *Cognizant*) to inspect company profiles and popular job tracks.
   - **Mode B (Standard Job Roles)**: Target specialized positions (*Cloud Support Engineer*, *Junior Cloud Engineer*, *Python Developer*, *Full Stack Web Developer*, *Data Analyst*, *AI/ML Trainee*, *Cyber Security Analyst*).
   - **Mode C (Custom Job Description)**: Paste real job postings from LinkedIn, Indeed, or campus drives to parse custom requirements.

5. **Career Gap Analyzer**:
   - Calculates a real-time **Readiness Score (%)** comparing the student's verified skills against target qualifications.
   - Displays a side-by-side breakdown of **Demonstrated Skills** vs **Skill Gaps**.
   - Recommends recognized learning paths with official curriculum links (*Microsoft Learn*, *Infosys Springboard*, *AWS Skill Builder*, *Coursera*, *NPTEL*).
   - Suggests real-world hands-on portfolio projects with tech stacks to bridge missing experience.

6. **Automated Resume Assistant & Generator**:
   - Generates an ATS-optimized, professional resume using only verified credentials and user inputs (zero fabricated data).
   - Formats a role-tailored professional summary.
   - Automatically categorizes technical skills into *Languages & Core*, *Cloud & Platforms*, *Frameworks & Web*, and *Databases & Tools*.
   - Generates verified certification entries with accredited issuer descriptions.
   - Features real-time in-browser live editing alongside a side-by-side ATS document preview.
   - Exports high-quality downloadable PDF resumes generated dynamically by **Python ReportLab** (`/api/resume/download-pdf`) or browser print.

7. **Interactive Dashboard**:
   - Dynamic metric counters for certificates, verified skills, and readiness scores.
   - Visual domain distribution bars and platform summaries.
   - 1-Click Demo Seed button for instant presentation and evaluation.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend** | React.js 18, Vite, Vanilla CSS, Lucide Icons | Responsive UI, live preview, glassmorphism design |
| **Backend** | Python 3.10+, FastAPI, Uvicorn | RESTful API, business logic, authentication |
| **Database** | SQLite (default zero-config) / MySQL via SQLAlchemy | Storage of users, certificates, skills, and resumes |
| **Doc Processing** | PyMuPDF (`pymupdf`), Pillow | Extract text, layout parsing, and image handling |
| **PDF Generation** | ReportLab | Compiling professional ATS resumes into PDF format |
| **Auth & Security**| PyJWT, bcrypt | JWT bearer tokens and secure salted password hashing |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
1. Open a terminal in the project directory:
   ```bash
   cd "backend"
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set a JWT signing key in PowerShell:
   ```powershell
   $env:SECRET_KEY = (python -c "import secrets; print(secrets.token_urlsafe(32))")
   ```
4. Run the FastAPI backend:
   ```bash
   python run.py
   ```
   *The backend will start at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.*

### 3. Frontend Setup
1. Open a separate terminal:
   ```bash
   cd "frontend"
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Open your browser at `http://localhost:5173`.*

---

## 🗄️ Database: Switching to MySQL

By default, CertiWise initializes with SQLite (`certiwise.db`) for instant zero-configuration demonstration.

To switch to **MySQL**:
1. Create a database in MySQL Workbench or terminal:
   ```sql
   CREATE DATABASE certiwise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Set the environment variable in your terminal before launching the backend:
   - **PowerShell**:
     ```powershell
     $env:DATABASE_URL="mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/certiwise"
     python run.py
     ```
   - **Command Prompt**:
     ```cmd
     set DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/certiwise
     python run.py
     ```
   - Or configure it directly in [backend/app/config.py](file:///d:/5th%20Sem/WT%20Project/backend/app/config.py).

FastAPI will automatically create all required tables (*users*, *certificates*, *user_skills*, *resumes*) on startup!

---

## 🧪 Testing & Evaluation Flow (For Viva & Demo)

1. Open `http://localhost:5173`.
2. Click **⚡ 1-Click Demo Login (Sandhiya)** — no typing required!
3. On the Dashboard, click **⚡ Load Sample Portfolio** — immediately seeds 4 verified certificates (*Microsoft Azure Fundamentals*, *Infosys Python*, *NPTEL DBMS*, *College Web Workshop*).
4. Inspect the **Smart Certificate Vault** and test the live search by typing `Python` or `Azure`.
5. Visit the **Company & Roles** tab, choose **Microsoft** or **Cloud Support Engineer**, and click **Analyze Qualifications**.
6. Review the **Gap Analysis** showing demonstrated skills (Azure, Cloud, Networking) vs gaps (Linux, Docker) with recommended certifications and projects.
7. Click **Create Tailored Resume** to open the **Resume Builder**, review the real-time ATS preview on the right, and click **Download ATS PDF** to receive the ReportLab-generated resume!
