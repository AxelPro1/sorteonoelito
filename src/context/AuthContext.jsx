import { createContext, useContext, useState, useCallback } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('sorteo_admin_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sorteo_admin_token'));

  const login = useCallback(async (username, password) => {
    const { data } = await client.post('/auth/login', { username, password });
    const { token: newToken, ...user } = data.data;
    localStorage.setItem('sorteo_admin_token', newToken);
    localStorage.setItem('sorteo_admin_user', JSON.stringify(user));
    setToken(newToken);
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sorteo_admin_token');
    localStorage.removeItem('sorteo_admin_user');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
