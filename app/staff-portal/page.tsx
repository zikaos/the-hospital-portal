'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Stethoscope, ArrowLeft, User } from 'lucide-react';

export default function StaffPortalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
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
              Clinical workspace for physicians, nurses, and administrative staff.
            </p>
          </div>

          <Card className="rounded-[12px] border border-border bg-surface shadow-card overflow-hidden">
            <CardHeader className="pb-3 pt-5 border-b border-border text-center">
              <CardTitle className="text-base font-semibold text-textPrimary">
                Clinical Workspace
              </CardTitle>
              <CardDescription className="text-xs text-textSecondary">
                Prototype mode active &mdash; authentication and security passcodes are disabled.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-3">
              <Button
                variant="primary"
                onClick={() => router.push('/staff/dashboard')}
                className="w-full h-11 font-medium gap-2 rounded-[6px]"
              >
                <span>Enter Staff Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/patient/dashboard')}
                className="w-full h-11 font-medium gap-2 rounded-[6px] border-border text-textSecondary hover:text-textPrimary"
              >
                <User className="h-4 w-4" />
                <span>Switch to Patient View</span>
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border py-3 bg-neutral-50/50 text-center rounded-b-[12px]">
              <p className="text-xs text-textSecondary">
                Authorized clinical personnel prototype view.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
