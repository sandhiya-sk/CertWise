import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  Sparkles, ArrowRight, X, RefreshCw, Eye, ShieldCheck 
} from 'lucide-react';
import { api } from '../api/client';

export default function UploadCertificate({ setActiveTab }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingStage, setProcessingStage] = useState(0); 
  // 0: idle, 1: uploading, 2: extracting text, 3: identifying skills, 4: validating duplicates, 5: ready for review
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Editable fields in review
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewIssuer, setReviewIssuer] = useState('');
  const [reviewCategory, setReviewCategory] = useState('Cloud Computing');
  const [reviewDate, setReviewDate] = useState('');
  const [reviewExpiry, setReviewExpiry] = useState('');
  const [reviewCredId, setReviewCredId] = useState('');
  const [reviewSkills, setReviewSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Please upload a valid certificate file (PDF, JPG, or PNG).');
      return;
    }

    setSelectedFile(file);
    setError('');
    startExtractionPipeline(file);
  };

  const startExtractionPipeline = async (file) => {
    try {
      setProcessingStage(1); // Uploading
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStage(2); // Extracting text
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStage(3); // Identifying skills
      const formData = new FormData();
      formData.append('file', file);

      const result = await api.extractCertificate(formData);

      setProcessingStage(4); // Duplicate check
      await new Promise((r) => setTimeout(r, 400));

      setExtractedData(result);
      setReviewTitle(result.title);
      setReviewIssuer(result.issuer);
      setReviewCategory(result.category);
      setReviewDate(result.issue_date || '');
      setReviewExpiry(result.expiry_date || '');
      setReviewCredId(result.credential_id || '');
      setReviewSkills(result.skills || []);

      setProcessingStage(5); // Ready for review
    } catch (err) {
      setError(err.message || 'Failed to extract certificate details. You can still enter details manually.');
      setProcessingStage(0);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setReviewSkills(reviewSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !reviewSkills.includes(clean)) {
      setReviewSkills([...reviewSkills, clean]);
      setNewSkillInput('');
    }
  };

  const handleSaveToVault = async () => {
    if (!reviewTitle || !reviewIssuer) {
      alert('Please provide at least a certificate title and issuer.');
      return;
    }

    try {
      setSaving(true);
      await api.saveCertificate({
        title: reviewTitle,
        issuer: reviewIssuer,
        category: reviewCategory,
        issue_date: reviewDate,
        expiry_date: reviewExpiry,
        credential_id: reviewCredId,
        skills: reviewSkills,
        stored_filename: extractedData?.stored_filename || null,
        file_name: extractedData?.file_name || null,
      });

      alert('✅ Certificate saved to your vault successfully!');
      setActiveTab('vault');
    } catch (err) {
      setError(err.message || 'Failed to save certificate. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setProcessingStage(0);
    setError('');
  };

  const categories = [
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
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          Upload & <span className="gradient-text">Intelligent Document Extractor</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 650, margin: '0 auto' }}>
          Upload your certificates in PDF, JPG, or PNG. CertiWise parses the layout, verifies credential metadata, and discovers technical skills.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          padding: '14px 18px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Processing Pipeline Stages Card */}
      {processingStage > 0 && processingStage < 5 && (
        <div className="glass-card" style={{ padding: 32, marginBottom: 32, textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>
            Analyzing Document: <span className="gradient-text">{selectedFile?.name}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { num: 1, title: 'Uploading File', active: processingStage >= 1 },
              { num: 2, title: 'PyMuPDF Text Extract', active: processingStage >= 2 },
              { num: 3, title: 'Skill Identification', active: processingStage >= 3 },
              { num: 4, title: 'Duplicate Validation', active: processingStage >= 4 },
            ].map((st) => (
              <div
                key={st.num}
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-sm)',
                  background: st.active ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: st.active ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: st.active ? '#818cf8' : 'var(--text-muted)',
                  marginBottom: 4
                }}>
                  STEP 0{st.num}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: st.active ? '#fff' : 'var(--text-secondary)' }}>
                  {st.title}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent-cyan)' }}>
            <RefreshCw size={18} className="animate-spin" />
            <span style={{ fontSize: '0.9rem' }}>Extracting metadata and mapping skill ontologies...</span>
          </div>
        </div>
      )}

      {/* Upload Drop Zone (Visible when idle) */}
      {processingStage === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragActive ? 'rgba(6, 182, 212, 0.05)' : 'rgba(15, 23, 42, 0.6)',
            padding: '60px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: dragActive ? '0 0 30px rgba(6, 182, 212, 0.2)' : 'none',
            marginBottom: 32
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(79, 70, 229, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <UploadCloud size={32} color="#818cf8" />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>
            Click to upload or drag & drop certificate
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
            Supports PDF, JPG, and PNG documents up to 15MB
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <span className="badge badge-blue">Microsoft</span>
            <span className="badge badge-emerald">Infosys Springboard</span>
            <span className="badge badge-purple">NPTEL</span>
            <span className="badge badge-amber">Coursera / AWS</span>
          </div>
        </div>
      )}

      {/* Review & Edit Extracted Data (Stage 5) */}
      {processingStage === 5 && extractedData && (
        <div className="glass-card" style={{ padding: 32 }}>
          {/* Top Review Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-emerald">
                  <CheckCircle2 size={13} /> Extraction Completed
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Review and verify extracted details before saving
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 6 }}>
                Review Certificate Information
              </h2>
            </div>

            <button onClick={resetForm} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
              Upload Another
            </button>
          </div>

          {/* Duplicate Warning Alert if applicable */}
          {extractedData.is_duplicate && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <AlertTriangle size={22} />
              <div>
                <div style={{ fontWeight: 700 }}>Possible Duplicate Detected</div>
                <div style={{ fontSize: '0.85rem' }}>{extractedData.duplicate_of}</div>
              </div>
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Certificate Name / Title
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={reviewIssuer}
                  onChange={(e) => setReviewIssuer(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={reviewCategory}
                  onChange={(e) => setReviewCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c} style={{ background: '#0f172a' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Issue Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. March 2024"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                  Credential ID (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MSFT-AZ900-1234"
                  value={reviewCredId}
                  onChange={(e) => setReviewCredId(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Extracted Skills Tagging */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                Identified Skills (Click 'x' to remove, or type to add more):
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {reviewSkills.map((sk) => (
                  <span
                    key={sk}
                    className="badge badge-purple"
                    style={{ fontSize: '0.82rem', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      style={{ background: 'none', padding: 0, color: 'inherit' }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 10, maxWidth: 400 }}>
                <input
                  type="text"
                  placeholder="Add another skill (e.g. Linux, Docker)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '8px 14px' }}>
                  Add
                </button>
              </form>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 16 }}>
              <button onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSaveToVault}
                disabled={saving}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                {saving ? 'Saving...' : 'Save to Smart Vault'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
