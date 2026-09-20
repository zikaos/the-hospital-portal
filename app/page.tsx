'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Activity,
  Calendar,
  FileText,
  Pill,
  User,
  ArrowRight,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#0A0A0A]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8E8EC] bg-white/95 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#0671B8] text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-[#0A0A0A]">
              The Hospital Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/patient/dashboard">
              <Button variant="ghost" size="sm" className="text-xs">
                Patient Portal
              </Button>
            </Link>
            <Link href="/staff/dashboard">
              <Button variant="primary" size="sm" className="text-xs">
                Staff Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-[1280px] mx-auto px-6 py-12 md:py-16 w-full flex flex-col justify-center">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#0671B8]/10 text-[#0671B8] text-xs font-semibold mb-4 border border-[#0671B8]/20">
            Interactive Prototype Mode Active
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A0A0A] tracking-tight leading-tight">
            Clinical visits, health records, and prescription management.
          </h1>
          <p className="mt-4 text-[15px] text-[#6B6B6B] leading-relaxed">
            Welcome to The Hospital Portal. Explore both the patient and clinical staff portals directly with zero login required.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/patient/dashboard">
              <Button variant="primary" size="default" className="gap-2">
                Enter Patient Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/staff/dashboard">
              <Button variant="outline" size="default" className="gap-2 border-[#0671B8] text-[#0671B8] hover:bg-[#0671B8]/5">
                Enter Staff Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-[6px] bg-[#F4F4F6] text-[#0671B8] flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle className="text-[17px]">Appointments</CardTitle>
              <CardDescription>
                Schedule visits with your provider, choose available time slots, and view your upcoming or past consultations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-[6px] bg-[#F4F4F6] text-[#00A8A7] flex items-center justify-center mb-3">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-[17px]">Medical Records</CardTitle>
              <CardDescription>
                Read lab results, pathology reports, and physician consultation notes as soon as they are added by your care team.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="h-9 w-9 rounded-[6px] bg-[#F4F4F6] text-[#FAB217] flex items-center justify-center mb-3">
                <Pill className="h-5 w-5" />
              </div>
              <CardTitle className="text-[17px]">Prescriptions</CardTitle>
              <CardDescription>
                Keep track of your active medications, dosages, frequency instructions, and prescription end dates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E8EC] bg-white py-6">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#6B6B6B]">
          <p>The Hospital Portal</p>
          <div className="flex items-center gap-4">
            <Link
              href="/staff-portal"
              className="text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
