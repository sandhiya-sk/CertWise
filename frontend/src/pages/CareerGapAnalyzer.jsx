import React, { useState, useEffect } from 'react';
import { 
  GitCompare, CheckCircle2, AlertCircle, Sparkles, 
  ArrowRight, ExternalLink, Code2, Award, BookOpen, 
  RefreshCw, FileText, ChevronRight 
} from 'lucide-react';
import { api } from '../api/client';

export default function CareerGapAnalyzer({ setActiveTab, sharedAnalysisParams, setSharedResumeParams }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [targetCompany, setTargetCompany] = useState(sharedAnalysisParams?.company || 'Microsoft');
  const [targetRole, setTargetRole] = useState(sharedAnalysisParams?.role || 'Cloud Support Engineer');
  const [rolesList, setRolesList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);

  const runAnalysis = async (comp, role, customJD) => {
    try {
      setLoading(true);
      const res = await api.analyzeCareer({
        company_name: comp,
        job_role: role,
        custom_job_description: customJD || ''
      });
      setAnalysis(res);
      setTargetRole(res.target_role);
      setTargetCompany(res.target_company);
    } catch (err) {
      console.error('Failed to run career analysis', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const [roles, comps] = await Promise.all([api.getRoles(), api.getCompanies()]);
        setRolesList(roles);
        setCompaniesList(comps.map((c) => c.name));
      } catch (e) {}

      runAnalysis(
        sharedAnalysisParams?.company || 'Microsoft',
        sharedAnalysisParams?.role || 'Cloud Support Engineer',
        sharedAnalysisParams?.jd || ''
      );
    }
    init();
  }, [sharedAnalysisParams]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setTargetRole(newRole);
    runAnalysis(targetCompany, newRole, '');
  };

  const handleCompanyChange = (e) => {
    const newComp = e.target.value;
    setTargetCompany(newComp);
    runAnalysis(newComp, targetRole, '');
  };

  const handleProceedToResume = () => {
    if (setSharedResumeParams) {
      setSharedResumeParams({
        role: targetRole,
        company: targetCompany,
        summary: analysis?.tailored_resume_summary || ''
      });
    }
    setActiveTab('resume');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent-blue)' }} />
        <p>Analyzing qualification alignment and discovering gaps...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1250, margin: '0 auto', padding: '32px 24px' }}>
      {/* Target Selector Banner */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-purple">Career Gap Intelligence</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-Time Evidence Matching</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              Gap Analysis for: <span className="gradient-text">{targetRole}</span>
            </h1>
          </div>

          {/* Quick Selectors */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Target Company:
              </label>
              <select
                value={targetCompany}
                onChange={handleCompanyChange}
                style={{ padding: '8px 12px', minWidth: 140 }}
              >
                {companiesList.map((c) => (
                  <option key={c} value={c} style={{ background: '#0f172a' }}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                Target Job Role:
              </label>
              <select
                value={targetRole}
                onChange={handleRoleChange}
                style={{ padding: '8px 12px', minWidth: 200 }}
              >
                {rolesList.map((r) => (
                  <option key={r} value={r} style={{ background: '#0f172a' }}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Readiness Score & Overview Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        marginBottom: 32
      }}>
        {/* Score gauge */}
        <div className="glass-card" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            position: 'relative',
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: 'conic-gradient(#10b981 0% ' + (analysis?.readiness_score || 0) + '%, rgba(255,255,255,0.08) ' + (analysis?.readiness_score || 0) + '% 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              background: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
                {analysis?.readiness_score || 0}%
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Readiness
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>
              {analysis?.readiness_score >= 70 ? 'Strong Qualifications Match!' : 'Foundational Competence Identified'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
              You have verified evidence for <b>{analysis?.matched_count}</b> out of <b>{analysis?.total_required}</b> key skills required for this role at <b>{targetCompany}</b>.
            </p>
            <button
              onClick={handleProceedToResume}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 14px' }}
            >
              <FileText size={14} /> Create Tailored Resume
            </button>
          </div>
        </div>

        {/* Tailored Summary Generator preview */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              AUTOMATICALLY TAILORED RESUME SUMMARY
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>
            "{analysis?.tailored_resume_summary}"
          </p>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            This summary is automatically injected into your resume builder when applying to {targetCompany}.
          </div>
        </div>
      </div>

      {/* Side-by-Side Skills Analysis: Demonstrated vs Missing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Column 1: Demonstrated Skills */}
        <div className="glass-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <CheckCircle2 size={18} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Demonstrated Qualifications</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {analysis?.matched_skills?.length || 0} skills supported by evidence
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis?.matched_skills?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{item.skill}</span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>Demonstrated</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6ee7b7', marginBottom: 2 }}>
                  ✓ {item.evidence}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Missing Skills & Development Recommendations */}
        <div className="glass-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: 6, borderRadius: 'var(--radius-sm)' }}>
              <AlertCircle size={18} color="#fbbf24" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Skill Gaps & Opportunities</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {analysis?.missing_skills?.length || 0} skills needing practical evidence
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analysis?.missing_skills?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{item.skill}</span>
                  <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>Needs Evidence</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                  • {item.evidence}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#fde68a' }}>
                  → {item.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations: Certifications & Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        {/* Recommended Certifications */}
        <div className="glass-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Award size={20} color="var(--accent-blue)" />
            <h3 style={{ fontSize: '1.15rem' }}>Recommended Credentials for {targetRole}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {analysis?.suggested_certificates?.map((cert, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{cert.title}</span>
                  <span className="badge badge-blue">{cert.level}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginBottom: 6 }}>
                  Issued by: {cert.issuer}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.4 }}>
                  {cert.description}
                </p>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    View Official Curriculum <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Hands-on Projects */}
        <div className="glass-card" style={{ padding: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Code2 size={20} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '1.15rem' }}>Recommended Hands-on Portfolio Projects</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {analysis?.suggested_projects?.map((proj, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{proj.title}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {proj.tech_stack?.map((t) => (
                    <span key={t} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
