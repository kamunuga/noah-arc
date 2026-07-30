import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setToken } from './api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('noahArcToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await api.get('/auth/me');
      setUser(user);
    } catch (e) {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  async function login(email, password) {
    try {
      const data = await api.post('/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      setToken(null);
      setUser(null);
      throw e;
    }
  }

  async function register(payload) {
    try {
      const data = await api.post('/auth/register', payload);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      setToken(null);
      setUser(null);
      throw e;
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  async function refreshMe() {
    try {
      const { user } = await api.get('/auth/me');
      setUser(user);
      return user;
    } catch (e) {
      setToken(null);
      setUser(null);
      throw e;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
