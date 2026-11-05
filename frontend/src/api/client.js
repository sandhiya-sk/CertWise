const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('certiwise_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('certiwise_token', token);
  } else {
    localStorage.removeItem('certiwise_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // If unauthorized, clear token
    setAuthToken(null);
  }

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.detail || data.message || errorMsg;
    } catch (e) {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }
  return res;
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Dashboard
  getStats: () => request('/dashboard/stats'),

  // Certificates
  extractCertificate: (formData) => request('/certificates/extract', { method: 'POST', body: formData }),
  saveCertificate: (data) => request('/certificates', { method: 'POST', body: JSON.stringify(data) }),
  getCertificates: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.category) qs.append('category', params.category);
    if (params.issuer) qs.append('issuer', params.issuer);
    if (params.search) qs.append('search', params.search);
    return request(`/certificates?${qs.toString()}`);
  },
  updateCertificate: (id, data) => request(`/certificates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCertificate: (id) => request(`/certificates/${id}`, { method: 'DELETE' }),
  loadDemoPortfolio: () => request('/certificates/load-demo', { method: 'POST' }),

  // Skills
  getSkills: () => request('/skills'),
  addSkill: (data) => request('/skills', { method: 'POST', body: JSON.stringify(data) }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  // Career
  getCompanies: () => request('/career/companies'),
  getRoles: () => request('/career/roles'),
  analyzeCareer: (data) => request('/career/analyze', { method: 'POST', body: JSON.stringify(data) }),

  // Resume
  getResumePreview: (targetRole, targetCompany) => {
    const qs = new URLSearchParams({ target_role: targetRole, target_company: targetCompany || '' });
    return request(`/resume/preview?${qs.toString()}`);
  },
  saveResume: (data) => request('/resume/save', { method: 'POST', body: JSON.stringify(data) }),
  downloadResumePdf: async (resumeData) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/resume/download-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(resumeData)
    });
    if (!res.ok) throw new Error('Failed to generate PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_${(resumeData.full_name || 'Student').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
