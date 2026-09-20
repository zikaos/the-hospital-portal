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
} from 'lucide-react';

export default function StaffPortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginStaff } = useAuth();
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

  const prefillDemoStaff = () => {
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

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary mx-auto mb-1">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
              Staff sign in
            </h1>
            <p className="text-sm text-textSecondary max-w-sm mx-auto">
              Sign in with your staff credentials and passcode to access appointments and patient records.
            </p>
          </div>

          <Card className="rounded-[12px] border border-border bg-surface shadow-card">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-semibold text-textPrimary flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-textSecondary" />
                Staff credentials
              </CardTitle>
              <CardDescription className="text-xs text-textSecondary">
                Enter your clinic email, password, and security passcode.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {error && (
                <div className="p-3.5 rounded-[6px] bg-error/10 border border-error/25 text-error text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleStaffLogin} className="space-y-4">
                {/* Clinic Security Passcode */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-textPrimary block" htmlFor="passcode">
                      Clinic security passcode
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      id="passcode"
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
                  <label className="text-xs font-medium text-textPrimary block" htmlFor="email">
                    Staff email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      id="email"
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
                  <label className="text-xs font-medium text-textPrimary block" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      id="password"
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

              {/* Demo Helper */}
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
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border py-3 bg-neutral-50/50 text-center rounded-b-[12px]">
              <p className="text-xs text-textSecondary">
                Authorized clinic personnel only. Contact administrative support if you need access.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
