'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { getMyRecords } from '@/lib/api';
import { MedicalRecord, MedicalRecordType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Download,
  Calendar,
  User,
  Activity,
  FileCheck,
  FileSearch,
  Filter,
} from 'lucide-react';

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    async function loadRecords() {
      try {
        const data = await getMyRecords();
        setRecords(data);
      } catch (err) {
        console.error('Failed to load records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [user]);

  const filteredRecords = records.filter((r) => {
    if (typeFilter === 'all') return true;
    return r.record_type === typeFilter;
  });

  const getRecordTypeBadge = (type: MedicalRecordType) => {
    switch (type) {
      case 'lab_result':
        return <Badge variant="confirmed">{t('Lab result')}</Badge>;
      case 'diagnosis':
        return <Badge variant="pending">{t('Diagnosis')}</Badge>;
      case 'visit_summary':
        return <Badge variant="secondary">{t('Visit summary')}</Badge>;
    }
  };

  const getRecordIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'lab_result':
        return <Activity className="h-5 w-5 text-[#00A8A7]" />;
      case 'diagnosis':
        return <FileSearch className="h-5 w-5 text-[#FAB217]" />;
      case 'visit_summary':
        return <FileCheck className="h-5 w-5 text-[#0671B8]" />;
    }
  };

  const handleDownload = (fileName: string) => {
    const blob = new Blob(
      [
        `The Hospital Portal — Medical Document\n` +
        `-----------------------------------------\n` +
        `Document: ${fileName}\n` +
        `Patient: ${user?.full_name || 'Patient'}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `-----------------------------------------\n\n` +
        `This file is an exported copy of your medical record.\n`
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded-[6px]" />
        <div className="h-64 bg-neutral-100 rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">{t('Medical Records')}</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {t('Diagnostic reports, laboratory results, and consultation summaries')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-xs text-[#6B6B6B] font-medium">{t('Category')}:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-[#E8E8EC] rounded-[6px] px-3 py-1.5 bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0671B8]"
          >
            <option value="all">{t('All Categories')} ({records.length})</option>
            <option value="lab_result">{t('Lab Results')}</option>
            <option value="visit_summary">{t('Summaries')}</option>
            <option value="diagnosis">{t('Diagnoses')}</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] border border-dashed border-[#E8E8EC] bg-white">
          <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0A0A0A]">{t('No medical records found.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="rounded-[12px] border border-[#E8E8EC] bg-white hover:shadow-cardHover hover:-translate-y-[2px] transition-all"
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-[8px] bg-[#FAFAFA] mt-0.5 flex-shrink-0">
                      {getRecordIcon(record.record_type)}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-[#0A0A0A]">{t(record.title)}</h2>
                        {getRecordTypeBadge(record.record_type)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B6B6B]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          {t('Record Date')}: {formatDate(record.record_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-neutral-400" />
                          {t('Doctor:')} {record.staff?.full_name || t('Clinic staff')}
                        </span>
                      </div>

                      {record.description && (
                        <p className="text-xs sm:text-sm text-[#0A0A0A] mt-2 bg-[#FAFAFA] p-3 rounded-[8px] border border-[#E8E8EC] whitespace-pre-line leading-relaxed">
                          {t(record.description)}
                        </p>
                      )}
                    </div>
                  </div>

                  {record.file_path && (
                    <div className="flex-shrink-0 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(record.file_path!)}
                        className="rounded-[6px] gap-1.5 text-xs"
                      >
                        <Download className="h-3.5 w-3.5 text-[#6B6B6B]" />
                        {t('Download')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
