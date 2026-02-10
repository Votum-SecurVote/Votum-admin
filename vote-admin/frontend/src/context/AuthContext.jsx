import React, { createContext, useContext, useEffect, useState } from 'react';

// Simple React context that holds the mock admin "session"
// for the UI-only mode (no real backend tokens).
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, role, token }
  const [loading, setLoading] = useState(true);

  // On app load, read any previously stored auth info so
  // refreshes keep the admin logged in.
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        // ignore invalid JSON
      }
    }
    setLoading(false);
  }, []);

  // Called from Login page after a successful mock login
  const login = (auth) => {
    setUser(auth);
    localStorage.setItem('auth', JSON.stringify(auth));
  };

  // Clears auth and sends user back to public view
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);