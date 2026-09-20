'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { PortalLayout } from '@/components/layout/PortalLayout';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0671B8] border-t-transparent" />
          <p className="text-xs text-[#6B6B6B] font-medium">Loading The Hospital Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <PortalLayout>{children}</PortalLayout>;
}
