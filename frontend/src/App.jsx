import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CertificateVault from './pages/CertificateVault';
import UploadCertificate from './pages/UploadCertificate';
import SkillIntelligence from './pages/SkillIntelligence';
import CompanyJobAnalyzer from './pages/CompanyJobAnalyzer';
import CareerGapAnalyzer from './pages/CareerGapAnalyzer';
import ResumeBuilder from './pages/ResumeBuilder';
import LoginRegister from './pages/LoginRegister';

function MainLayout() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Shared state passing across modules
  const [sharedAnalysisParams, setSharedAnalysisParams] = useState({
    company: 'Microsoft',
    role: 'Cloud Support Engineer',
    jd: ''
  });

  const [sharedResumeParams, setSharedResumeParams] = useState({
    role: 'Cloud Support Engineer',
    company: 'Microsoft',
    summary: ''
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Initializing CertiWise...
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flex: 1, paddingBottom: 40 }}>
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'vault' && <CertificateVault setActiveTab={setActiveTab} />}
        {activeTab === 'upload' && <UploadCertificate setActiveTab={setActiveTab} />}
        {activeTab === 'skills' && <SkillIntelligence setActiveTab={setActiveTab} />}
        {activeTab === 'analyzer' && (
          <CompanyJobAnalyzer
            setActiveTab={setActiveTab}
            setSharedAnalysisParams={setSharedAnalysisParams}
          />
        )}
        {activeTab === 'gap' && (
          <CareerGapAnalyzer
            setActiveTab={setActiveTab}
            sharedAnalysisParams={sharedAnalysisParams}
            setSharedResumeParams={setSharedResumeParams}
          />
        )}
        {activeTab === 'resume' && (
          <ResumeBuilder sharedResumeParams={sharedResumeParams} />
        )}
      </main>

      <footer className="no-print" style={{
        textAlign: 'center',
        padding: '24px 20px',
        borderTop: '1px solid var(--border-subtle)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        CertiWise — Smart Certificate & Career Assistant Platform • Web Technology Project
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
