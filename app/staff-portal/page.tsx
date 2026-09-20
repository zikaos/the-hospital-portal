'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, CLINIC_STAFF_PASSCODE } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Mail,
  ArrowRight,
  Stethoscope,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  User,
  Award,
  Briefcase,
} from 'lucide-react';

export default function StaffPortalPage() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('Physician');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginStaff, registerStaff } = useAuth();
  const { t } = useLanguage();

  const handleStaffSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await loginStaff(email, password, passcode);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (password.length < 6) {
      setError(t('At least 6 characters'));
      setIsSubmitting(false);
      return;
    }

    const result = await registerStaff(
      email,
      password,
      fullName,
      passcode,
      title,
      specialty
    );

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const prefillDemoStaff = () => {
    setEmail('dr.vance@clinic.demo');
    setPassword('password123');
    setPasscode(CLINIC_STAFF_PASSCODE);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A]">
      <header className="border-b border-[#E8E8EC] bg-white px-4 py-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('Return to The Hospital Portal')}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Badge variant="outline" className="text-xs font-medium text-[#6B6B6B]">
              {t('Staff access')}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#0671B8]/10 text-[#0671B8] mx-auto mb-1">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
              {t('Staff Portal')}
            </h1>
            <p className="text-sm text-[#6B6B6B] max-w-sm mx-auto">
              {t('Clinical workspace for physicians, nurses, and administrative personnel.')}
            </p>
          </div>

          <Card className="rounded-[12px] border border-[#E8E8EC] bg-white shadow-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#E8E8EC] bg-[#FAFAFA]">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                  tab === 'signin'
                    ? 'border-[#0671B8] text-[#0671B8] bg-white'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#0A0A0A]'
                }`}
              >
                {t('Sign In')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
                  tab === 'register'
                    ? 'border-[#0671B8] text-[#0671B8] bg-white'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#0A0A0A]'
                }`}
              >
                {t('Register Staff')}
              </button>
            </div>

            <CardContent className="pt-5 space-y-4">
              {error && (
                <div className="p-3 rounded-[6px] bg-[#F37521]/10 border border-[#F37521]/30 text-[#C25208] text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {tab === 'signin' ? (
                /* SIGN IN FORM */
                <form onSubmit={handleStaffSignIn} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="signin-email">
                      {t('Staff email address')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        placeholder="doctor@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="signin-password">
                      {t('Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        placeholder={t('Enter password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="signin-passcode">
                        {t('Clinic security passcode')}
                      </label>
                      <span className="text-[11px] text-[#0671B8] font-medium">{t('Required')}</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="signin-passcode"
                        type="password"
                        required
                        placeholder={t('Enter clinic passcode...')}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-medium gap-2 mt-2 h-10 rounded-[6px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('Signing in...') : t('Sign in to workspace')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                /* REGISTER STAFF FORM */
                <form onSubmit={handleStaffRegister} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-passcode">
                        {t('Clinic security passcode')}
                      </label>
                      <span className="text-[11px] text-[#0671B8] font-medium">{t('Required authorization')}</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="reg-passcode"
                        type="password"
                        required
                        placeholder={t('Enter clinic passcode...')}
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-name">
                      {t('Full name')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="Dr. Jane Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-title">
                        {t('Title / Role')}
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B6B]" />
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
                      <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-specialty">
                        {t('Specialty')}
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B6B]" />
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
                    <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-email">
                      {t('Staff email address')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="reg-email"
                        type="email"
                        required
                        placeholder="jane.smith@hospital.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#0A0A0A] block" htmlFor="reg-password">
                      {t('Password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B6B6B]" />
                      <Input
                        id="reg-password"
                        type="password"
                        required
                        placeholder={t('At least 6 characters')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-10 rounded-[6px] text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-medium gap-2 mt-3 h-10 rounded-[6px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('Creating staff account...') : t('Create staff account')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* Demo Helper */}
              {tab === 'signin' && (
                <div className="pt-3 border-t border-[#E8E8EC]">
                  <button
                    type="button"
                    onClick={prefillDemoStaff}
                    className="w-full flex items-center justify-between p-2.5 rounded-[6px] border border-[#E8E8EC] bg-[#FAFAFA] hover:bg-[#F4F4F6] transition-colors text-left rtl:text-right"
                  >
                    <div>
                      <span className="text-xs font-medium text-[#0A0A0A] block">
                        {t('Demo: Fill Dr. Marcus Vance credentials')}
                      </span>
                      <span className="text-[11px] text-[#6B6B6B]">
                        dr.vance@clinic.demo / passcode: {CLINIC_STAFF_PASSCODE}
                      </span>
                    </div>
                    <Stethoscope className="h-4 w-4 text-[#6B6B6B]" />
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-[#E8E8EC] py-3 bg-[#FAFAFA] text-center rounded-b-[12px]">
              <p className="text-xs text-[#6B6B6B]">
                {t('Authorized clinic personnel only. Requires clinic security passcode')} ({CLINIC_STAFF_PASSCODE}).
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
