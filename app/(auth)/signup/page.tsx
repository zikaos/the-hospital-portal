'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Activity, ArrowRight, User } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();

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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#0671B8]/10 text-[#0671B8] text-xs font-semibold mb-2">
              Prototype Mode
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Patient Portal</h1>
            <p className="text-[14px] text-[#6B6B6B]">Sign up is not required for this prototype.</p>
          </div>

          <Card className="border-[#E8E8EC] bg-white shadow-card">
            <CardContent className="pt-6 space-y-3">
              <Button
                variant="primary"
                className="w-full h-11 justify-center font-medium gap-2"
                onClick={() => router.push('/patient/dashboard')}
              >
                <User className="h-4 w-4" />
                <span>Enter Patient Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-[#E8E8EC] py-3.5 bg-[#FAFAFA] text-center">
              <Link href="/" className="text-[13px] text-[#0671B8] hover:underline font-medium">
                Return to home page
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
