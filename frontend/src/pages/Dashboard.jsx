import React, { useState, useEffect } from 'react';
import { 
  Award, BrainCircuit, Target, CheckCircle2, 
  UploadCloud, ArrowUpRight, Sparkles, FolderCheck, 
  Building2, FileText, ChevronRight, AlertCircle, RefreshCw 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      setMessage('');
      await api.loadDemoPortfolio();
      setMessage('Sample portfolio loaded! Check your Vault and Gap Analysis.');
      await fetchStats();
    } catch (err) {
      setMessage('Failed to load sample data.');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--accent-blue)' }} />
        <p>Loading your career intelligence dashboard...</p>
      </div>
    );
  }

  const categoryColors = [
    '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#6366f1'
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Welcome & Quick Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 32
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
              Welcome back, <span className="gradient-text">{user?.full_name || 'Student'}</span> 👋
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {user?.degree} • {user?.college || 'Engineering Institution'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {stats?.total_certificates === 0 && (
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="btn-accent"
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              <Sparkles size={16} />
              {seeding ? 'Loading Sample...' : '⚡ Load Sample Portfolio'}
            </button>
          )}

          <button
            onClick={() => setActiveTab('upload')}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <UploadCloud size={16} />
            Upload Certificate
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* Top 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 32
      }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Certificates</span>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
              <FolderCheck size={20} color="#60a5fa" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
            {stats?.total_certificates || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Organized in Smart Vault
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Identified Skills</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
              <BrainCircuit size={20} color="#c084fc" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>
            {stats?.total_skills || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Extracted & Verified Proficiencies
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Readiness</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
              <Target size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399' }}>
            {stats?.target_role_readiness || 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            For {stats?.target_role_name || 'Cloud Support Engineer'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target Company</span>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
              <Building2 size={20} color="#22d3ee" />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: 6 }}>
            {stats?.target_company_name || 'Microsoft'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Role: {stats?.target_role_name || 'Cloud Support'}
          </div>
        </div>
      </div>

      {/* Middle Section: Career Readiness Callout & Visual Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Career Readiness Banner Card */}
        <div className="glass-card" style={{
          padding: 28,
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span className="badge badge-emerald">Career Intelligence</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>AI-Evaluated</span>
          </div>

          <h3 style={{ fontSize: '1.35rem', marginBottom: 8 }}>
            Role Match: <span className="gradient-text">{stats?.target_role_name || 'Cloud Support Engineer'}</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20, lineHeight: 1.6 }}>
            Your certificates and verified skills match <b>{stats?.target_role_readiness || 0}%</b> of the qualifications sought by leading tech employers like <b>{stats?.target_company_name || 'Microsoft'}</b>.
          </p>

          <div style={{ width: '100%', height: 10, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 5, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{
              width: `${stats?.target_role_readiness || 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10b981, #06b6d4)',
              borderRadius: 5,
              transition: 'width 1s ease-in-out'
            }} />
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('gap')}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              View Gap Analysis <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <FileText size={14} /> Build Tailored Resume
            </button>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Certificates by Domain</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 20 }}>
            Categorized automatically by our extraction engine
          </p>

          {stats?.categories_distribution && stats.categories_distribution.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stats.categories_distribution.map((cat, idx) => {
                const total = stats.total_certificates || 1;
                const pct = Math.round((cat.count / total) * 100);
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={cat.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                      <span style={{ fontWeight: 500 }}>{cat.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.count} cert{cat.count > 1 ? 's' : ''} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>No certificates added yet.</p>
              <button onClick={handleSeedDemo} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                Load Sample Portfolio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Certificates Section */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Recent Certificates in Vault</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Extracted skills and metadata ready for resume generation
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('vault')}
            className="btn-secondary" 
            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
          >
            View All in Vault <ArrowUpRight size={14} />
          </button>
        </div>

        {stats?.recent_certificates && stats.recent_certificates.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.recent_certificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(79, 70, 229, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Award size={20} color="#818cf8" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{cert.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {cert.issuer} • {cert.issue_date || 'Verified'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{cert.category}</span>
                  {cert.skills?.slice(0, 3).map((sk) => (
                    <span key={sk} className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Award size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>Your vault is currently empty.</p>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Upload your certificates or load our sample portfolio to test features.</p>
          </div>
        )}
      </div>
    </div>
  );
}
