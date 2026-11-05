import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, CheckCircle2, ShieldCheck, Plus, 
  Trash2, Award, FolderCheck, Sparkles, Filter 
} from 'lucide-react';
import { api } from '../api/client';

export default function SkillIntelligence({ setActiveTab }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Languages & Core');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');
  const [isAdding, setIsAdding] = useState(false);
  const [filterSource, setFilterSource] = useState('All');

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await api.getSkills();
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      setIsAdding(true);
      const created = await api.addSkill({
        skill_name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency,
        source: 'manual'
      });
      setNewSkillName('');
      await fetchSkills();
    } catch (err) {
      alert('Failed to add skill');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (id, name) => {
    if (window.confirm(`Remove skill "${name}" from your profile?`)) {
      try {
        await api.deleteSkill(id);
        setSkills(skills.filter((s) => s.id !== id));
      } catch (err) {
        alert('Failed to delete skill');
      }
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (filterSource === 'All') return true;
    if (filterSource === 'certificate') return s.source === 'certificate';
    if (filterSource === 'manual') return s.source === 'manual';
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
            Skill <span className="gradient-text">Intelligence Engine</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live repository of verified proficiencies, evidence lineage, and credentials
          </p>
        </div>

        <button
          onClick={() => setActiveTab('gap')}
          className="btn-accent"
          style={{ padding: '10px 18px', fontSize: '0.88rem' }}
        >
          <Sparkles size={16} /> Run Career Gap Analysis
        </button>
      </div>

      {/* Add New Skill Form Card */}
      <div className="glass-card" style={{ padding: 22, marginBottom: 28 }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} color="var(--accent-blue)" /> Add Confirmed Skill to Profile
        </h3>

        <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Skill Name (e.g. Docker, TypeScript, Linux)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            style={{ flex: '1 1 240px' }}
          />

          <select
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            style={{ minWidth: 160 }}
          >
            <option value="Languages & Core" style={{ background: '#0f172a' }}>Languages & Core</option>
            <option value="Cloud & Infrastructure" style={{ background: '#0f172a' }}>Cloud & Infrastructure</option>
            <option value="Frameworks & Web" style={{ background: '#0f172a' }}>Frameworks & Web</option>
            <option value="Databases & Tools" style={{ background: '#0f172a' }}>Databases & Tools</option>
          </select>

          <select
            value={newSkillProficiency}
            onChange={(e) => setNewSkillProficiency(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="Beginner" style={{ background: '#0f172a' }}>Beginner</option>
            <option value="Intermediate" style={{ background: '#0f172a' }}>Intermediate</option>
            <option value="Advanced" style={{ background: '#0f172a' }}>Advanced</option>
          </select>

          <button type="submit" disabled={isAdding} className="btn-primary" style={{ padding: '10px 20px' }}>
            {isAdding ? 'Adding...' : 'Add Skill'}
          </button>
        </form>
      </div>

      {/* Filter by Source */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          Total Identified Skills: <span className="gradient-text">{filteredSkills.length}</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'certificate', 'manual'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterSource(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: filterSource === f ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                color: filterSource === f ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {f === 'All' ? 'All Skills' : f === 'certificate' ? 'Verified in Certificates' : 'User Confirmed'}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading skills...
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <BrainCircuit size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No skills found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Upload certificates or add skills using the form above.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 18
        }}>
          {filteredSkills.map((sk) => {
            const hasCerts = sk.certificates && sk.certificates.length > 0;
            return (
              <div
                key={sk.id}
                className="glass-card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sk.skill_name}</h3>
                    <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                      {sk.proficiency}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                    Domain: {sk.category}
                  </div>

                  {/* Evidence source banner */}
                  <div style={{
                    background: hasCerts ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${hasCerts ? 'rgba(59, 130, 246, 0.25)' : 'var(--border-subtle)'}`,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: hasCerts ? '#60a5fa' : 'var(--text-secondary)' }}>
                      {hasCerts ? <ShieldCheck size={14} /> : <CheckCircle2 size={14} />}
                      {hasCerts ? 'Verified by Certificate Evidence' : 'Confirmed by Student'}
                    </div>

                    {hasCerts && (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sk.certificates.map((c, i) => (
                          <div key={i}>• {c.title} ({c.issuer})</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => handleDeleteSkill(sk.id, sk.skill_name)}
                    style={{ background: 'none', color: '#fb7185', padding: '4px 8px', fontSize: '0.8rem' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
