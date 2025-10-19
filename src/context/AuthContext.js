import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Use tvp_auth for persistent login
    const raw = localStorage.getItem("tvp_auth");
    if (raw) {
      try {
        const auth = JSON.parse(raw);
        if (auth.authenticated && auth.email) {
          setUser({ email: auth.email });
        }
      } catch {}
    }
  }, []);

  const login = (email) => {
    setUser({ email, authenticated: true });
    localStorage.setItem("tvp_auth", JSON.stringify({ email, authenticated: true }));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem("tvp_auth");
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user && user.authenticated,
    login,
    logout
  }), [user]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


