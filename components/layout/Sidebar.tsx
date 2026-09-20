'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  User,
  ClipboardList,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();

  const isStaff = user?.role === 'staff';

  const patientNav = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/patient/records', icon: FileText },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
    { name: 'My Profile', href: '/patient/profile', icon: User },
  ];

  const staffNav = [
    { name: 'Today’s Queue', href: '/staff/dashboard', icon: ClipboardList },
    { name: 'Patients', href: '/staff/patients', icon: Users },
  ];

  const navigation = isStaff ? staffNav : patientNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0A0A0A]/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 z-40 w-60 transform bg-white border-e border-[#E8E8EC] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between pt-14 lg:pt-0',
          isRTL ? 'right-0' : 'left-0',
          isOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        )}
      >
        <div className="px-3 py-5 space-y-4">
          <div className="px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B6B]">
              {t(isStaff ? 'Staff Workspace' : 'Menu')}
            </p>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/staff/dashboard' &&
                  item.href !== '/patient/dashboard' &&
                  pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 rounded-[6px] px-3 py-2 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-[#0671B8] text-white shadow-xs'
                      : 'text-[#6B6B6B] hover:bg-[#F4F4F6] hover:text-[#0A0A0A]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-white' : 'text-[#6B6B6B] group-hover:text-[#0A0A0A]'
                    )}
                  />
                  <span>{t(item.name)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quiet clinical note */}
        <div className="p-3 border-t border-[#E8E8EC] m-3 text-center">
          <p className="text-[11px] text-[#6B6B6B]">{t('The Hospital Portal')}</p>
        </div>
      </aside>
    </>
  );
}
