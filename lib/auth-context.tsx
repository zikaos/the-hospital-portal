'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Role } from './types';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
  full_name: string;
}

export const PROTOTYPE_PATIENT: UserSession = {
  id: 'p0000000-0000-0000-0000-000000000001',
  email: 'sarah.chen@example.com',
  role: 'patient',
  full_name: 'Sarah Chen',
};

export const PROTOTYPE_STAFF: UserSession = {
  id: 'd0000000-0000-0000-0000-000000000001',
  email: 'dr.vance@clinic.demo',
  role: 'staff',
  full_name: 'Dr. Marcus Vance',
};

interface AuthContextType {
  user: UserSession;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<{ error?: string }>;
  loginStaff: (email?: string, password?: string, passcode?: string) => Promise<{ error?: string }>;
  registerStaff: (
    email?: string,
    password?: string,
    fullName?: string,
    passcode?: string,
    title?: string,
    specialty?: string
  ) => Promise<{ error?: string }>;
  signUp: (email?: string, password?: string, fullName?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isStaffPath = pathname?.startsWith('/staff');
  const [activeRole, setActiveRole] = useState<Role>(isStaffPath ? 'staff' : 'patient');

  useEffect(() => {
    if (pathname?.startsWith('/staff')) {
      setActiveRole('staff');
    } else if (pathname?.startsWith('/patient')) {
      setActiveRole('patient');
    }
  }, [pathname]);

  const user = activeRole === 'staff' ? PROTOTYPE_STAFF : PROTOTYPE_PATIENT;

  const switchRole = (role: Role) => {
    setActiveRole(role);
    if (role === 'staff') {
      router.push('/staff/dashboard');
    } else {
      router.push('/patient/dashboard');
    }
  };

  const login = async () => {
    switchRole('patient');
    return {};
  };

  const loginStaff = async () => {
    switchRole('staff');
    return {};
  };

  const registerStaff = async (
    email?: string,
    password?: string,
    fullName?: string
  ) => {
    if (fullName) {
      PROTOTYPE_STAFF.full_name = fullName;
    }
    switchRole('staff');
    return {};
  };

  const signUp = async (
    email?: string,
    password?: string,
    fullName?: string
  ) => {
    if (fullName) {
      PROTOTYPE_PATIENT.full_name = fullName;
    }
    switchRole('patient');
    return {};
  };

  const logout = async () => {
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        login,
        loginStaff,
        registerStaff,
        signUp,
        logout,
        switchRole,
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
