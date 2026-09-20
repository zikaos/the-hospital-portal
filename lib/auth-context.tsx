'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, login as apiLogin, loginStaff as apiLoginStaff, signUp as apiSignUp, logout as apiLogout } from './api';
import { supabase, isSupabaseConfigured } from './supabase';
import { Role } from './types';

interface UserSession {
  id: string;
  email: string;
  role: Role;
  full_name: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  loginStaff: (email: string, password?: string, passcode?: string) => Promise<{ error?: string }>;
  registerStaff: (
    email: string,
    password?: string,
    fullName?: string,
    passcode?: string,
    title?: string,
    specialty?: string
  ) => Promise<{ error?: string }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function handleTokenRedirect(u: UserSession | null) {
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
        if (u) {
          router.push(u.role === 'staff' ? '/staff/dashboard' : '/patient/dashboard');
        }
      }
    }

    async function loadUser() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        handleTokenRedirect(u);
      } catch (err) {
        console.error('Error loading session:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const u = await getCurrentUser();
          setUser(u);
          handleTokenRedirect(u);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router]);

  // Patient Login (Rejects Staff)
  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await apiLogin(email, password, { requireRole: 'patient' });
      if (res.error) {
        setLoading(false);
        return { error: res.error };
      }
      setUser(res.user);
      setLoading(false);
      router.push('/patient/dashboard');
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Login failed' };
    }
  };

  // Dedicated Staff Login with Passcode
  const loginStaff = async (email: string, password?: string, passcode?: string) => {
    setLoading(true);
    try {
      const res = await apiLoginStaff(email, password, passcode);
      if (res.error) {
        setLoading(false);
        return { error: res.error };
      }
      setUser(res.user);
      setLoading(false);
      router.push('/staff/dashboard');
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Staff login failed' };
    }
  };

  // Staff Registration with Secret Security Passcode
  const registerStaff = async (
    email: string,
    password?: string,
    fullName?: string,
    passcode?: string,
    title?: string,
    specialty?: string
  ) => {
    setLoading(true);
    try {
      const res = await apiSignUp(
        email,
        password,
        fullName,
        'staff',
        passcode,
        { title, specialty }
      );
      if (res.error) {
        setLoading(false);
        return { error: res.error };
      }
      setUser(res.user);
      setLoading(false);
      router.push('/staff/dashboard');
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Staff registration failed' };
    }
  };

  // Public Registration: Patients Only
  const signUp = async (email: string, password?: string, fullName?: string) => {
    setLoading(true);
    try {
      const res = await apiSignUp(email, password, fullName, 'patient');
      if (res.error) {
        setLoading(false);
        return { error: res.error };
      }
      setUser(res.user);
      setLoading(false);
      router.push('/patient/dashboard');
      return {};
    } catch (err: any) {
      setLoading(false);
      return { error: err.message || 'Sign up failed' };
    }
  };

  const logout = async () => {
    setLoading(true);
    await apiLogout();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginStaff,
        registerStaff,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
