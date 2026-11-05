import React from 'react';
import { 
  Award, LayoutDashboard, FolderCheck, UploadCloud, 
  BrainCircuit, Building2, GitCompare, FileText, 
  User, LogOut, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vault', label: 'Certificate Vault', icon: FolderCheck },
    { id: 'upload', label: 'Upload & Extract', icon: UploadCloud },
    { id: 'skills', label: 'Skill Intelligence', icon: BrainCircuit },
    { id: 'analyzer', label: 'Company & Roles', icon: Building2 },
    { id: 'gap', label: 'Gap Analysis', icon: GitCompare },
    { id: 'resume', label: 'Resume Builder', icon: FileText },
  ];

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            background: 'var(--gradient-brand)',
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
          }}>
            <Award size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
                CertiWise
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                AI Assistant
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Your Certificates. Your Skills. Your Career.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#818cf8' : 'currentColor'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--gradient-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {user.graduation_year ? `Batch ${user.graduation_year}` : 'Student'}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: '#fb7185',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
