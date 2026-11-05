import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (err) {
          console.error("Auth check failed:", err);
          setAuthToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setAuthToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
