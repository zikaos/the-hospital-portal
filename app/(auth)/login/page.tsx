'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Activity, AlertCircle, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const prefillDemoPatient = () => {
    setEmail('sarah.chen@example.com');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A]">
      <header className="border-b border-[#E8E8EC] bg-white h-14 flex items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#0671B8] text-white">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-[#0A0A0A]">
            {t('The Hospital Portal')}
          </span>
        </Link>
        <LanguageToggle />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{t('Patient Sign In')}</h1>
            <p className="text-[14px] text-[#6B6B6B]">{t('Enter your credentials to access your patient records')}</p>
          </div>

          <Card className="border-[#E8E8EC] bg-white shadow-card">
            <CardContent className="pt-6 space-y-4">
              {error && (
                <div className="p-3 rounded-[6px] bg-[#F37521]/10 border border-[#F37521]/30 text-[#C25208] text-[13px] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="email">
                    {t('Email address')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="password">
                    {t('Password')}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder={t('Enter password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('Signing in...') : t('Sign in')}
                </Button>
              </form>

              <div className="pt-3 border-t border-[#E8E8EC]">
                <button
                  type="button"
                  onClick={prefillDemoPatient}
                  className="w-full flex items-center justify-between p-2.5 rounded-[6px] border border-[#E8E8EC] bg-[#FAFAFA] hover:bg-[#F4F4F6] transition-colors text-left rtl:text-right"
                >
                  <div>
                    <span className="text-xs font-medium text-[#0A0A0A] block">
                      {t('Demo: Fill Sarah Chen credentials')}
                    </span>
                    <span className="text-[11px] text-[#6B6B6B]">
                      sarah.chen@example.com / password123
                    </span>
                  </div>
                  <User className="h-4 w-4 text-[#6B6B6B]" />
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t border-[#E8E8EC] py-3.5 bg-[#FAFAFA] text-center">
              <p className="text-[13px] text-[#6B6B6B]">
                {t("Don't have an account?")}{' '}
                <Link href="/signup" className="text-[#0671B8] font-medium hover:underline">
                  {t('Create an account')}
                </Link>
              </p>
              <p className="text-[12px] text-[#6B6B6B]">
                {t('Clinic staff?')}{' '}
                <Link href="/staff-portal" className="text-[#0671B8] hover:underline font-medium">
                  {t('Staff sign in')}
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
