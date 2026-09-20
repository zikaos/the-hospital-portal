'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { LanguageToggle } from './LanguageToggle';
import { Button } from '@/components/ui/button';
import { Activity, LogOut, Menu, Home } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E8EC] bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-[1280px] mx-auto w-full">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-[#6B6B6B] hover:text-[#0A0A0A] rounded-[6px] hover:bg-[#F4F4F6] transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            href={user?.role === 'staff' ? '/staff/dashboard' : '/patient/dashboard'}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#0671B8] text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-[16px] font-bold tracking-tight text-[#0A0A0A]">
              {t('The Hospital Portal')}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {user && (
            <>
              <NotificationBell />

              <div className="hidden sm:flex flex-col text-right rtl:text-left">
                <span className="text-[13px] font-semibold text-[#0A0A0A] leading-tight">
                  {user.full_name}
                </span>
                <span className="text-[11px] text-[#6B6B6B] capitalize font-medium">
                  {t(user.role === 'staff' ? 'Staff view' : 'Patient view')}
                </span>
              </div>

              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#6B6B6B] hover:text-[#0A0A0A] h-8 px-2"
                  title={t('Home')}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-[#6B6B6B] hover:text-[#F37521] gap-1.5 text-xs h-8 px-2.5"
                title={t('Sign out')}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('Sign out')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
