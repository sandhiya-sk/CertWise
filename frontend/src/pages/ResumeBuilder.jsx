import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, Save, Sparkles, 
  Plus, Trash2, CheckCircle2, RefreshCw, Eye, Edit3, Briefcase, Building2
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const JOB_ROLES = [
  'Cloud Support Engineer',
  'Junior Cloud Engineer',
  'Software Engineer - Azure',
  'Full Stack Developer',
  'Python Developer',
  'Data Analyst',
  'Machine Learning Engineer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
  'Associate Cloud Engineer',
];

const COMPANIES = [
  'Microsoft',
  'Google',
  'Amazon / AWS',
  'Infosys',
  'Tata Consultancy Services (TCS)',
  'Accenture',
  'Cognizant',
  'Wipro',
];

export default function ResumeBuilder({ sharedResumeParams }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [message, setMessage] = useState('');

  // Target Role & Company
  const [targetRole, setTargetRole] = useState(sharedResumeParams?.role || 'Cloud Support Engineer');
  const [targetCompany, setTargetCompany] = useState(sharedResumeParams?.company || 'Microsoft');

  // Resume Data State
  const [resume, setResume] = useState({
    full_name: user?.full_name || 'Student Name',
    email: user?.email || 'student@example.com',
    phone: user?.phone || '',
    location: user?.college ? '' : '',
    linkedin_url: user?.linkedin_url || '',
    github_url: user?.github_url || '',
    target_role: targetRole,
    target_company: targetCompany,
    template_name: 'modern',
    summary: sharedResumeParams?.summary || '',
    education: [
      {
        degree: user?.degree || 'B.E. Computer Science and Engineering',
        institution: user?.college || 'College of Engineering',
        year: `Graduation: ${user?.graduation_year || '2026'}`,
        score: ''
      }
    ],
    skills: {
      'Languages & Core': ['Python', 'SQL', 'Problem Solving'],
      'Cloud & Platforms': ['Azure', 'Cloud Computing', 'Networking'],
      'Frameworks & Web': ['HTML/CSS', 'JavaScript', 'RESTful APIs'],
      'Databases & Tools': ['Database Management', 'Git & GitHub', 'Troubleshooting']
    },
    certificates: [],
    projects: [
      {
        title: 'CertiWise – Intelligent Certificate & Career Assistant',
        tech_stack: 'React.js, FastAPI, Python, SQLAlchemy, PyMuPDF, ReportLab',
        description: 'Engineered an automated career platform that parses certificates, analyzes skill gaps for target roles, and prepares ATS-optimized resumes with dynamic PDF generation.'
      }
    ],
    experience: []
  });

  const loadResumeData = async () => {
    try {
      setLoading(true);
      const data = await api.getResumePreview(targetRole, targetCompany);
      setResume((prev) => ({
        ...prev,
        ...data,
        full_name: data.full_name || user?.full_name || prev.full_name,
        email: data.email || user?.email || prev.email,
        summary: sharedResumeParams?.summary || data.summary || prev.summary
      }));
    } catch (err) {
      console.error('Failed to load resume preview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, [targetRole, targetCompany]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await api.saveResume(resume);
      setMessage('Resume saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await api.downloadResumePdf(resume);
    } catch (err) {
      alert('Failed to generate and download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper functions to modify array sections
  const addProject = () => {
    setResume({
      ...resume,
      projects: [
        ...resume.projects,
        {
          title: 'New Technical Project',
          tech_stack: 'Python, SQL, Git',
          description: 'Developed an application solving real-world data and architectural challenges.'
        }
      ]
    });
  };

  const removeProject = (index) => {
    setResume({
      ...resume,
      projects: resume.projects.filter((_, i) => i !== index)
    });
  };

  const updateProject = (index, field, value) => {
    const updated = [...resume.projects];
    updated[index][field] = value;
    setResume({ ...resume, projects: updated });
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          role: 'Software Engineering Intern',
          company: 'Technology Solutions Pvt Ltd',
          duration: 'June 2024 - August 2024',
          description: 'Collaborated on cloud service integration, API endpoints, and bug fixes in agile sprints.'
        }
      ]
    });
  };

  const removeExperience = (index) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index, field, value) => {
    const updated = [...resume.experience];
    updated[index][field] = value;
    setResume({ ...resume, experience: updated });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent-blue)' }} />
        <p>Compiling verified credentials into tailored resume content...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Top Action Bar */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="badge badge-emerald">Module 5</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Document Sync</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Automated <span className="gradient-text">Resume Assistant</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tailored for: <b>{targetRole}</b>{targetCompany ? <> at <b>{targetCompany}</b></> : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {message && (
            <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              {message}
            </span>
          )}

          <button onClick={handleSave} disabled={saving} className="btn-secondary" style={{ padding: '9px 16px' }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>

          <button onClick={handlePrint} className="btn-secondary" style={{ padding: '9px 16px' }}>
            <Printer size={16} /> Print / Save
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn-primary"
            style={{ padding: '9px 20px' }}
          >
            <Download size={16} /> {downloading ? 'Compiling PDF...' : 'Download ATS PDF'}
          </button>
        </div>
      </div>

      {/* Role & Company Selector */}
      <div className="glass-card no-print" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Briefcase size={13} /> Target Job Role
          </label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ width: '100%' }}
          >
            {JOB_ROLES.map((r) => (
              <option key={r} value={r} style={{ background: '#0f172a' }}>{r}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Building2 size={13} /> Target Company
          </label>
          <select
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="" style={{ background: '#0f172a' }}>-- Any Company --</option>
            {COMPANIES.map((c) => (
              <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={loadResumeData}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
        >
          <RefreshCw size={15} style={{ marginRight: 6 }} />
          {loading ? 'Generating...' : 'Regenerate Resume'}
        </button>
      </div>

      {/* Main Two-Column Layout: Left = Editor Form, Right = Live Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: EDITABLE CONTROLS */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Section: Personal Info */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Edit3 size={16} color="var(--accent-blue)" /> Contact Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  value={resume.full_name}
                  onChange={(e) => setResume({ ...resume, full_name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Phone</label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Location</label>
                <input
                  type="text"
                  value={resume.location}
                  onChange={(e) => setResume({ ...resume, location: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>LinkedIn URL</label>
                <input
                  type="text"
                  value={resume.linkedin_url}
                  onChange={(e) => setResume({ ...resume, linkedin_url: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>GitHub URL</label>
                <input
                  type="text"
                  value={resume.github_url}
                  onChange={(e) => setResume({ ...resume, github_url: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Summary */}
          <div className="glass-card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="var(--accent-cyan)" /> Role-Tailored Professional Summary
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
              Automatically synthesized based on your target role qualifications
            </p>
            <textarea
              rows={4}
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              style={{ width: '100%', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* Section: Technical Projects */}
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.05rem' }}>Technical Projects</h3>
              <button onClick={addProject} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                <Plus size={13} /> Add Project
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {resume.projects?.map((proj, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, 'title', e.target.value)}
                      style={{ fontWeight: 700, flex: 1, marginRight: 10 }}
                    />
                    <button onClick={() => removeProject(idx)} style={{ background: 'none', color: '#fb7185' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Technologies (e.g. React.js, FastAPI, SQL)"
                    value={proj.tech_stack}
                    onChange={(e) => updateProject(idx, 'tech_stack', e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem', marginBottom: 8 }}
                  />

                  <textarea
                    rows={2}
                    placeholder="Project description & achievements"
                    value={proj.description}
                    onChange={(e) => updateProject(idx, 'description', e.target.value)}
                    style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Experience & Internships */}
          <div className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.05rem' }}>Internships & Experience</h3>
              <button onClick={addExperience} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                <Plus size={13} /> Add Experience
              </button>
            </div>

            {resume.experience?.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No experience entries added yet. Click "+ Add Experience" if you have completed an internship or work tenure.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {resume.experience?.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 14,
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={exp.role}
                        onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                        style={{ fontWeight: 700, flex: 1, marginRight: 10 }}
                      />
                      <button onClick={() => removeExperience(idx)} style={{ background: 'none', color: '#fb7185' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. Jun 2024 - Aug 2024)"
                        value={exp.duration}
                        onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Responsibilities & outcomes"
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY LIVE ATS RESUME PREVIEW */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            padding: '0 4px'
          }} className="no-print">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              LIVE ATS DOCUMENT PREVIEW
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              ✓ Verified Content Sync
            </span>
          </div>

          <div
            className="resume-paper"
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-md)',
              padding: '40px 44px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)',
              fontFamily: 'Inter, -apple-system, sans-serif',
              minHeight: 700,
              fontSize: '0.88rem',
              lineHeight: 1.45
            }}
          >
            {/* 1. Header */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h1 style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                marginBottom: 4,
                textTransform: 'uppercase'
              }}>
                {resume.full_name || 'STUDENT NAME'}
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>• {resume.phone}</span>}
                {resume.location && <span>• {resume.location}</span>}
                {resume.linkedin_url && <span>• LinkedIn</span>}
                {resume.github_url && <span>• GitHub</span>}
              </div>
              <div style={{ height: 2, background: '#2563eb', marginTop: 10, marginBottom: 14 }} />
            </div>

            {/* 2. Professional Summary */}
            {resume.summary && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Professional Summary
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {resume.summary}
                </p>
              </div>
            )}

            {/* 3. Technical Skills (Categorized) */}
            {resume.skills && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Technical Skills
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {Object.entries(resume.skills).map(([cat, skList]) => {
                    const items = Array.isArray(skList) ? skList.join(', ') : skList;
                    return (
                      <div key={cat}>
                        <b style={{ color: '#0f172a' }}>{cat}:</b> {items}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Verified Certifications */}
            {resume.certificates && resume.certificates.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Verified Certifications
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resume.certificates.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          {c.title} — <span style={{ fontStyle: 'italic', fontWeight: 500, color: '#475569' }}>{c.issuer}</span>
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.date}</span>
                      </div>
                      {c.description && (
                        <div style={{ color: '#334155', marginTop: 2, paddingLeft: 12 }}>
                          • {c.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Technical Projects
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resume.projects.map((p, i) => (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {p.title} {p.tech_stack && <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#475569' }}>| {p.tech_stack}</span>}
                      </div>
                      <div style={{ color: '#334155', marginTop: 2, paddingLeft: 12 }}>
                        • {p.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Education */}
            {resume.education && resume.education.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Education
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {resume.education.map((edu, i) => (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                        <span>{edu.degree} — {edu.institution}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{edu.year}</span>
                      </div>
                      {edu.score && <div style={{ color: '#475569', fontSize: '0.78rem' }}>{edu.score}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Experience (if present) */}
            {resume.experience && resume.experience.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: 4,
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 2
                }}>
                  Experience & Internships
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resume.experience.map((exp, i) => (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0f172a' }}>
                        <span>{exp.role} — {exp.company}</span>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{exp.duration}</span>
                      </div>
                      <div style={{ color: '#334155', marginTop: 2, paddingLeft: 12 }}>
                        • {exp.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
