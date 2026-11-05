import React, { useState, useEffect } from 'react';
import { 
  Building2, Briefcase, FileCode2, ArrowRight, 
  Sparkles, Search, CheckCircle2, ChevronRight, Compass 
} from 'lucide-react';
import { api } from '../api/client';

export default function CompanyJobAnalyzer({ setActiveTab, setSharedAnalysisParams }) {
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab within Analyzer: 'company' | 'role' | 'custom_jd'
  const [mode, setMode] = useState('company');

  // Selections
  const [selectedCompany, setSelectedCompany] = useState('Microsoft');
  const [selectedRole, setSelectedRole] = useState('Cloud Support Engineer');
  const [customJD, setCustomJD] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [compData, roleData] = await Promise.all([
          api.getCompanies(),
          api.getRoles()
        ]);
        setCompanies(compData);
        setRoles(roleData);
      } catch (err) {
        console.error('Failed to load company/role catalog', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLaunchAnalysis = (overrideCompany, overrideRole) => {
    const finalComp = overrideCompany !== undefined ? overrideCompany : (mode === 'company' ? selectedCompany : '');
    const finalRole = overrideRole !== undefined ? overrideRole : (mode === 'custom_jd' ? '' : selectedRole);
    const finalJD = mode === 'custom_jd' ? customJD : '';

    if (setSharedAnalysisParams) {
      setSharedAnalysisParams({
        company: finalComp,
        role: finalRole,
        jd: finalJD
      });
    }

    // Navigate to Career Gap Analyzer
    setActiveTab('gap');
  };

  return (
    <div style={{ maxWidth: 1250, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          Company & <span className="gradient-text">Job Role Analyzer</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 700, margin: '0 auto' }}>
          Evaluate your verified qualifications against leading tech enterprises, industry job roles, or custom job descriptions.
        </p>
      </div>

      {/* Mode Switcher: Option C (Company vs Job Role vs Custom JD) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setMode('company')}
          className={mode === 'company' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}
        >
          <Building2 size={16} /> Mode A: Company Directory
        </button>

        <button
          onClick={() => setMode('role')}
          className={mode === 'role' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}
        >
          <Briefcase size={16} /> Mode B: Target Job Role
        </button>

        <button
          onClick={() => setMode('custom_jd')}
          className={mode === 'custom_jd' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '10px 20px', borderRadius: 'var(--radius-full)' }}
        >
          <FileCode2 size={16} /> Mode C: Paste Job Description
        </button>
      </div>

      {/* Mode A: Company Directory */}
      {mode === 'company' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Select a Target Enterprise</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Explore specific job roles and skill matrices demanded by top recruiters
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: 20
          }}>
            {companies.map((comp) => {
              const isSelected = selectedCompany === comp.name;
              return (
                <div
                  key={comp.id}
                  className="glass-card"
                  style={{
                    padding: 24,
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(79, 70, 229, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#818cf8'
                      }}>
                        {comp.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{comp.name}</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>{comp.domain}</span>
                      </div>
                    </div>
                    <span className="badge badge-blue">{comp.industry}</span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                    {comp.overview}
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                      IN-DEMAND ROLES:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {comp.popular_roles.map((r) => (
                        <button
                          key={r}
                          onClick={() => handleLaunchAnalysis(comp.name, r)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-primary)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {r} <ChevronRight size={12} color="var(--accent-blue)" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchAnalysis(comp.name, comp.popular_roles[0])}
                    className="btn-primary"
                    style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem' }}
                  >
                    Analyze Qualifications for {comp.name} <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode B: Direct Job Role Catalog */}
      {mode === 'role' && (
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Target Standard Career Track</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Choose a defined engineering profile. CertiWise analyzes required vs preferred competencies.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
              {roles.map((r) => (
                <div
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedRole === r ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedRole === r ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: selectedRole === r ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'
                    }} />
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>{r}</span>
                  </div>

                  <span className="badge badge-purple">Industry Standard</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleLaunchAnalysis(selectedCompany, selectedRole)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px' }}
            >
              Analyze Fit for {selectedRole} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Mode C: Custom Job Description Input */}
      {mode === 'custom_jd' && (
        <div style={{ maxWidth: 850, margin: '0 auto' }}>
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="badge badge-cyan">AI JD Parser</span>
              <h2 style={{ fontSize: '1.35rem' }}>Paste Real Job Posting</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Paste any job description from LinkedIn, Indeed, Naukri, or campus placement drives.
            </p>

            <textarea
              rows={8}
              placeholder="Paste job description text here... (e.g. We are hiring a Junior Python & Cloud Engineer. Requirements: Python, FastAPI, Docker, SQL, Azure knowledge, Git...)"
              value={customJD}
              onChange={(e) => setCustomJD(e.target.value)}
              style={{ width: '100%', marginBottom: 20, resize: 'vertical' }}
            />

            <button
              onClick={() => handleLaunchAnalysis('Custom Posting', '')}
              disabled={!customJD.trim()}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px' }}
            >
              Extract Requirements & Run Gap Analysis <Sparkles size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
