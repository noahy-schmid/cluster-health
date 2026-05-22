"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextType {
  password: string | null;
  setPassword: (pw: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "lauda-voucher-password";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [password, setPasswordState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setPasswordState(stored);
    }
    setLoaded(true);
  }, []);

  const setPassword = (pw: string) => {
    localStorage.setItem(STORAGE_KEY, pw);
    setPasswordState(pw);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPasswordState(null);
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ password, setPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
