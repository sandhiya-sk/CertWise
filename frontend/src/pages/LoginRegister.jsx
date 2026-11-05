import React, { useState } from 'react';
import { Award, Lock, Mail, User as UserIcon, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginRegister() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('Govt College of Technology');
  const [degree, setDegree] = useState('B.E. Computer Science and Engineering');
  const [gradYear, setGradYear] = useState('2026');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          college,
          degree,
          graduation_year: gradYear
        });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-brand)',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)'
          }}>
            <Award size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>
            Certi<span className="gradient-text">Wise</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Smart Certificate & Career Assistant
          </p>
        </div>


        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: 20
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', paddingLeft: 38 }}
                  />
                  <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  College / Institute
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="College Name"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    style={{ width: '100%', paddingLeft: 38 }}
                  />
                  <GraduationCap size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    Degree
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                    Grad Year
                  </label>
                  <input
                    type="text"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: 38 }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 13 }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: 8, padding: 12 }}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle sign in / register */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{
              background: 'none',
              color: 'var(--accent-blue)',
              fontWeight: 600,
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
