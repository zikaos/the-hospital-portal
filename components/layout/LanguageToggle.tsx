'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium border border-[#E8E8EC] bg-white hover:bg-[#F4F4F6] text-[#0A0A0A] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0671B8] ${className}`}
      title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5 text-[#0671B8]" />
      <span className="font-semibold">{lang === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
