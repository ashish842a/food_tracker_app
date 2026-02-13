import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, login as authLogin, signup as authSignup, logout as authLogout, User } from "@/lib/auth";

type SafeUser = Omit<User, "passwordHash">;

interface AuthContextType {
  user: SafeUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password);
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const signup = async (name: string, email: string, password: string) => {
    const result = await authSignup(name, email, password);
    if (result.success && result.user) setUser(result.user);
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
