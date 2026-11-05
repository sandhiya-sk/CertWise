import React, { useState, useEffect } from 'react';
import { 
  FolderCheck, Search, Filter, Trash2, Edit3, 
  ExternalLink, Download, Plus, CheckCircle2, 
  Calendar, Award, AlertTriangle, Eye, Sparkles 
} from 'lucide-react';
import { api } from '../api/client';

export default function CertificateVault({ setActiveTab }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIssuer, setSelectedIssuer] = useState('All');

  // Edit Modal State
  const [editingCert, setEditingCert] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIssuer, setEditIssuer] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIssueDate, setEditIssueDate] = useState('');
  const [editCredentialId, setEditCredentialId] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // View modal
  const [viewingCert, setViewingCert] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await api.getCertificates({
        category: selectedCategory !== 'All' ? selectedCategory : '',
        issuer: selectedIssuer !== 'All' ? selectedIssuer : '',
        search: searchTerm
      });
      setCertificates(data);
    } catch (err) {
      console.error('Failed to load certificates', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [selectedCategory, selectedIssuer]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from your vault?`)) {
      try {
        await api.deleteCertificate(id);
        setCertificates(certificates.filter((c) => c.id !== id));
      } catch (err) {
        alert('Failed to delete certificate');
      }
    }
  };

  const handleOpenEdit = (cert) => {
    setEditingCert(cert);
    setEditTitle(cert.title);
    setEditIssuer(cert.issuer);
    setEditCategory(cert.category);
    setEditIssueDate(cert.issue_date || '');
    setEditCredentialId(cert.credential_id || '');
    setEditSkills(cert.skills ? cert.skills.join(', ') : '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCert) return;
    setIsSavingEdit(true);

    const skillsArray = editSkills.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      await api.updateCertificate(editingCert.id, {
        title: editTitle,
        issuer: editIssuer,
        category: editCategory,
        issue_date: editIssueDate,
        credential_id: editCredentialId,
        skills: skillsArray
      });

      setCertificates(certificates.map((c) => {
        if (c.id === editingCert.id) {
          return {
            ...c,
            title: editTitle,
            issuer: editIssuer,
            category: editCategory,
            issue_date: editIssueDate,
            credential_id: editCredentialId,
            skills: skillsArray
          };
        }
        return c;
      }));

      setEditingCert(null);
    } catch (err) {
      alert('Failed to update certificate');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const categories = [
    'All',
    'Cloud Computing',
    'Programming',
    'Web Development',
    'Database Management',
    'Artificial Intelligence',
    'Cybersecurity',
    'Internships & Workshops',
    'Other Technical Skills'
  ];

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
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
            Smart <span className="gradient-text">Certificate Vault</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Centralized archive of verified qualifications, extracted competencies, and credential IDs
          </p>
        </div>

        <button
          onClick={() => setActiveTab('upload')}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '0.88rem' }}
        >
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by title, skill (e.g. Python, Azure, SQL), or issuer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: 38 }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          </form>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ minWidth: 160 }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#0f172a' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Certificate Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Loading your vault...
        </div>
      ) : certificates.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <FolderCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>No certificates found in this view</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Upload your PDFs, JPGs, or PNGs to start tracking your credentials and skills.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => setActiveTab('upload')} className="btn-primary">
              <Plus size={16} /> Upload Now
            </button>
            <button onClick={() => setActiveTab('dashboard')} className="btn-secondary">
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 22
        }}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="glass-card"
              style={{
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                {/* Certificate Thumbnail */}
                {cert.file_path && (
                  <div style={{
                    width: '100%',
                    height: 140,
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    marginBottom: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cert.file_path.toLowerCase().endsWith('.pdf') ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Award size={36} style={{ marginBottom: 6, opacity: 0.5 }} />
                        <div style={{ fontSize: '0.75rem' }}>PDF Document</div>
                      </div>
                    ) : (
                      <img
                        src={cert.file_path}
                        alt={cert.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => setViewingCert(cert)}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div style="text-align:center;color:#64748b;font-size:0.78rem;padding:16px">Preview unavailable</div>';
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Card Top Row: Issuer & Verification Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="badge badge-blue">{cert.issuer}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge badge-emerald" title="Extracted and verified metadata">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
                  {cert.title}
                </h3>

                {/* Category & Date */}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <span>📁 {cert.category}</span>
                  {cert.issue_date && <span>📅 {cert.issue_date}</span>}
                </div>

                {/* Credential ID if present */}
                {cert.credential_id && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '4px 8px',
                    borderRadius: 4,
                    marginBottom: 16,
                    fontFamily: 'monospace'
                  }}>
                    Credential ID: {cert.credential_id}
                  </div>
                )}

                {/* Extracted Skills Badges */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                    IDENTIFIED SKILLS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cert.skills && cert.skills.length > 0 ? (
                      cert.skills.map((skill) => (
                        <span key={skill} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No explicit skills mapped</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 14,
                marginTop: 8
              }}>
                <button
                  onClick={() => setViewingCert(cert)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  <Eye size={14} /> View
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleOpenEdit(cert)}
                    title="Edit certificate details"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-secondary)',
                      padding: 8,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(cert.id, cert.title)}
                    title="Delete certificate"
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      color: '#fb7185',
                      padding: 8,
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Certificate Modal */}
      {editingCert && (
        <div className="modal-overlay" onClick={() => setEditingCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: 18 }}>Edit Certificate Metadata</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Certificate Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={editIssuer}
                    onChange={(e) => setEditIssuer(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat} style={{ background: '#0f172a' }}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Issue Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. March 2024"
                    value={editIssueDate}
                    onChange={(e) => setEditIssueDate(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Credential ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MSFT-AZ900-1234"
                    value={editCredentialId}
                    onChange={(e) => setEditCredentialId(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Identified Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Azure, Cloud Computing, Troubleshooting"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setEditingCert(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="btn-primary">
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {viewingCert && (
        <div className="modal-overlay" onClick={() => setViewingCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="badge badge-blue">{viewingCert.issuer}</span>
              <span className="badge badge-emerald">Verified Document</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>{viewingCert.title}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
              Category: <b>{viewingCert.category}</b> • Issued: <b>{viewingCert.issue_date || 'N/A'}</b>
            </div>

            {/* Certificate Image or PDF Link */}
            {viewingCert.file_path && (
              <div style={{ marginBottom: 20 }}>
                {viewingCert.file_path.toLowerCase().endsWith('.pdf') ? (
                  <a
                    href={`${viewingCert.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={14} /> Open PDF Certificate
                  </a>
                ) : (
                  <div style={{
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255,255,255,0.03)',
                    textAlign: 'center'
                  }}>
                    <img
                      src={`${viewingCert.file_path}`}
                      alt={viewingCert.title}
                      style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{ display: 'none', padding: 20, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Image preview unavailable
                    </div>
                  </div>
                )}
              </div>
            )}
            {!viewingCert.file_path && (
              <div style={{
                marginBottom: 20,
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-subtle)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.82rem'
              }}>
                No document file attached to this certificate
              </div>
            )}

            {viewingCert.credential_id && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 18,
                fontSize: '0.85rem'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Credential ID: </span>
                <span style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 600 }}>{viewingCert.credential_id}</span>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Identified Technical Skills:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {viewingCert.skills?.map((sk) => (
                  <span key={sk} className="badge badge-purple" style={{ fontSize: '0.82rem' }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setViewingCert(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
