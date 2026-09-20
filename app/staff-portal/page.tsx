'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CLINIC_STAFF_PASSCODE } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Stethoscope,
  AlertCircle,
  ArrowLeft,
  User,
  Briefcase,
  Award,
  UserPlus,
  LogIn,
} from 'lucide-react';

export default function StaffPortalPage() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('Physician');
  const [specialty, setSpecialty] = useState('General Practice');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginStaff, registerStaff } = useAuth();
  const router = useRouter();

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!passcode.trim()) {
      setError('Please enter the clinic security passcode.');
      setIsSubmitting(false);
      return;
    }

    const res = await loginStaff(email, password, passcode);
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    }
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!passcode.trim()) {
      setError('Please enter the clinic security passcode.');
      setIsSubmitting(false);
      return;
    }

    if (passcode.trim() !== CLINIC_STAFF_PASSCODE) {
      setError('Invalid Clinic Security Passcode. Registration is restricted to authorized personnel.');
      setIsSubmitting(false);
      return;
    }

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const res = await registerStaff(
      email.trim(),
      password,
      fullName.trim(),
      passcode.trim(),
      title.trim() || 'Physician',
      specialty.trim() || 'General Practice'
    );

    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    }
  };

  const prefillDemoStaff = () => {
    setTab('signin');
    setEmail('dr.vance@clinic.demo');
    setPassword('password123');
    setPasscode(CLINIC_STAFF_PASSCODE);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      {/* Top Header */}
      <header className="border-b border-border bg-surface px-4 py-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-textSecondary hover:text-textPrimary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to The Hospital Portal
          </Link>
          <Badge variant="outline" className="text-xs font-medium text-textSecondary">
            Staff access
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary mx-auto mb-1">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
              Staff Portal
            </h1>
            <p className="text-sm text-textSecondary max-w-sm mx-auto">
              Clinical workspace for authorized hospital physicians, nurses, and administrative staff.
            </p>
          </div>

          <Card className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
            {/* Tab Switcher */}
            <div className="p-3 border-b border-border bg-neutral-50/70">
              <div className="grid grid-cols-2 p-1 bg-neutral-200/60 rounded-[8px] border border-border/50 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setError(null); }}
                  className={`py-1.5 rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'signin'
                      ? 'bg-white text-textPrimary shadow-sm font-semibold'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(null); }}
                  className={`py-1.5 rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${
                    tab === 'register'
                      ? 'bg-white text-textPrimary shadow-sm font-semibold'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Register staff
                </button>
              </div>
            </div>

            <CardHeader className="pb-3 pt-4 border-b border-border">
              <CardTitle className="text-base font-semibold text-textPrimary flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-textSecondary" />
                {tab === 'signin' ? 'Staff credentials' : 'New staff registration'}
              </CardTitle>
              <CardDescription className="text-xs text-textSecondary">
                {tab === 'signin'
                  ? 'Enter your clinical email, password, and security passcode.'
                  : 'Hospital security passcode is strictly required to register a staff account.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {error && (
                <div className="p-3.5 rounded-[6px] bg-error/10 border border-error/25 text-error text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {tab === 'signin' ? (
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="signin-passcode">
                      Clinic security passcode
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="signin-passcode"
                        type="password"
                        required
                        placeholder="Enter clinic passcode..."
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="signin-email">
                      Staff email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        placeholder="doctor@clinic.demo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="signin-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium gap-2 mt-2 h-10 rounded-[6px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in to workspace'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleStaffRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-passcode">
                        Clinic security passcode
                      </label>
                      <span className="text-[11px] text-primary font-medium">Required authorization</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="reg-passcode"
                        type="password"
                        required
                        placeholder="Enter clinic passcode..."
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm border-primary/40 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-name">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="Dr. Sarah Connor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-title">
                        Role / Title
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input
                          id="reg-title"
                          type="text"
                          required
                          placeholder="Physician"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="pl-9 h-10 rounded-[6px] text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-specialty">
                        Specialty
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input
                          id="reg-specialty"
                          type="text"
                          required
                          placeholder="Cardiology"
                          value={specialty}
                          onChange={(e) => setSpecialty(e.target.value)}
                          className="pl-9 h-10 rounded-[6px] text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-email">
                      Staff email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="sarah.connor@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="reg-password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                      <Input
                        id="reg-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full font-medium gap-2 mt-3 h-10 rounded-[6px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating staff account...' : 'Create staff account'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* Demo Helper */}
              {tab === 'signin' && (
                <div className="pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={prefillDemoStaff}
                    className="w-full flex items-center justify-between p-3 rounded-[6px] border border-border bg-neutral-50 hover:bg-neutral-100 transition-colors text-left"
                  >
                    <div>
                      <span className="text-xs font-medium text-textPrimary block">
                        Demo: Fill Dr. Marcus Vance credentials
                      </span>
                      <span className="text-[11px] text-textSecondary">
                        Pre-fills email, password, and passcode ({CLINIC_STAFF_PASSCODE})
                      </span>
                    </div>
                    <Stethoscope className="h-4 w-4 text-textSecondary" />
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border py-3 bg-neutral-50/50 text-center rounded-b-[12px]">
              <p className="text-xs text-textSecondary">
                Authorized clinic personnel only. Staff registration requires the clinic security passcode.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
