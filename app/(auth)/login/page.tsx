'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A]">
      <header className="border-b border-[#E8E8EC] bg-white h-14 flex items-center px-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#0671B8] text-white">
            <Activity className="h-4 w-4" />
          </div>
          <span className="text-[16px] font-bold tracking-tight text-[#0A0A0A]">The Hospital Portal</span>
        </Link>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Sign in</h1>
            <p className="text-[14px] text-[#6B6B6B]">Enter your email and password to continue</p>
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
                    Email address
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
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="Enter your password"
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
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 border-t border-[#E8E8EC] py-3.5 bg-[#FAFAFA] text-center">
              <p className="text-[13px] text-[#6B6B6B]">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#0671B8] font-medium hover:underline">
                  Create an account
                </Link>
              </p>
              <p className="text-[12px] text-[#9C9C9C]">
                Staff member?{' '}
                <Link href="/staff-portal" className="text-[#6B6B6B] hover:text-[#0A0A0A] underline">
                  Staff sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
