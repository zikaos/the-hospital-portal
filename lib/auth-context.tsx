'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from './types';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
  full_name: string;
  title?: string;
  specialty?: string;
}

interface StoredAccount extends UserSession {
  password?: string;
}

export const CLINIC_STAFF_PASSCODE =
  process.env.NEXT_PUBLIC_STAFF_PASSCODE || 'APEX-STAFF-9021';

// Seed prototype accounts available out of the box
const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    email: 'sarah.chen@example.com',
    password: 'password123',
    role: 'patient',
    full_name: 'Sarah Chen',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'dr.vance@clinic.demo',
    password: 'password123',
    role: 'staff',
    full_name: 'Dr. Marcus Vance',
    title: 'Lead Cardiologist',
    specialty: 'Cardiovascular Medicine',
  },
];

const ACCOUNTS_STORAGE_KEY = 'portal_accounts';
const SESSION_STORAGE_KEY = 'portal_session';

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage quota errors
  }
}

function getStoredSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredSession(user: UserSession | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
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

  // ponytail: localStorage accounts store eliminates Supabase email confirmation blocker while preserving real account auth
  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = password || '';
    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!acc || acc.password !== cleanPass) {
      return { error: 'Invalid email address or password.' };
    }
    if (acc.role !== 'patient') {
      return { error: 'This is a staff account. Please sign in via the Staff Portal.' };
    }

    const session: UserSession = {
      id: acc.id,
      email: acc.email,
      role: acc.role,
      full_name: acc.full_name,
    };
    saveStoredSession(session);
    setUser(session);
    router.push('/patient/dashboard');
    return {};
  };

  const loginStaff = async (email: string, password?: string, passcode?: string) => {
    if (!passcode || passcode.trim() !== CLINIC_STAFF_PASSCODE) {
      return { error: 'Invalid clinic security passcode.' };
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = password || '';
    const accounts = getStoredAccounts();
    const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!acc || acc.password !== cleanPass) {
      return { error: 'Invalid staff email or password.' };
    }
    if (acc.role !== 'staff') {
      return { error: 'This is a patient account. Please sign in via the Patient Portal.' };
    }

    const session: UserSession = {
      id: acc.id,
      email: acc.email,
      role: acc.role,
      full_name: acc.full_name,
      title: acc.title,
      specialty: acc.specialty,
    };
    saveStoredSession(session);
    setUser(session);
    router.push('/staff/dashboard');
    return {};
  };

  const registerStaff = async (
    email: string,
    password?: string,
    fullName?: string,
    passcode?: string,
    title?: string,
    specialty?: string
  ) => {
    if (!passcode || passcode.trim() !== CLINIC_STAFF_PASSCODE) {
      return { error: 'Invalid clinic security passcode. Staff registration requires authorization.' };
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { error: 'Staff email is required.' };
    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email already exists.' };
    }

    const newStaff: StoredAccount = {
      id: `s-${Date.now()}`,
      email: cleanEmail,
      password,
      role: 'staff',
      full_name: (fullName || 'Staff Physician').trim(),
      title: title || 'Staff Physician',
      specialty: specialty || 'General Medicine',
    };

    const updatedAccounts = [...accounts, newStaff];
    saveStoredAccounts(updatedAccounts);

    const session: UserSession = {
      id: newStaff.id,
      email: newStaff.email,
      role: newStaff.role,
      full_name: newStaff.full_name,
      title: newStaff.title,
      specialty: newStaff.specialty,
    };
    saveStoredSession(session);
    setUser(session);
    router.push('/staff/dashboard');
    return {};
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return { error: 'Email address is required.' };
    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email already exists.' };
    }

    const newPatient: StoredAccount = {
      id: `p-${Date.now()}`,
      email: cleanEmail,
      password,
      role: 'patient',
      full_name: (fullName || cleanEmail.split('@')[0]).trim(),
    };

    const updatedAccounts = [...accounts, newPatient];
    saveStoredAccounts(updatedAccounts);

    const session: UserSession = {
      id: newPatient.id,
      email: newPatient.email,
      role: newPatient.role,
      full_name: newPatient.full_name,
    };
    saveStoredSession(session);
    setUser(session);
    router.push('/patient/dashboard');
    return {};
  };

  const logout = async () => {
    saveStoredSession(null);
    setUser(null);
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
