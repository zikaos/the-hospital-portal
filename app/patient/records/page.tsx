'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
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
        return <Badge variant="confirmed">Lab result</Badge>;
      case 'diagnosis':
        return <Badge variant="pending">Diagnosis</Badge>;
      case 'visit_summary':
        return <Badge variant="secondary">Visit summary</Badge>;
    }
  };

  const getRecordIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'lab_result':
        return <Activity className="h-5 w-5 text-secondary" />;
      case 'diagnosis':
        return <FileSearch className="h-5 w-5 text-warning" />;
      case 'visit_summary':
        return <FileCheck className="h-5 w-5 text-primary" />;
    }
  };

  const handleDownload = (fileName: string) => {
    const blob = new Blob(
      [
        `Apex Care — Medical Document\n` +
        `-----------------------------------------\n` +
        `Document: ${fileName}\n` +
        `Patient: ${user?.full_name || 'Patient'}\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `-----------------------------------------\n\n` +
        `This file is an exported copy of your medical record from the patient portal.\n`
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Medical records</h1>
          <p className="text-sm text-textSecondary mt-1">
            View lab results, visit summaries, and care notes from your doctors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-xs text-textSecondary font-medium">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-border rounded-[6px] px-3 py-1.5 bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All records ({records.length})</option>
            <option value="lab_result">Lab results</option>
            <option value="visit_summary">Visit summaries</option>
            <option value="diagnosis">Diagnoses</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] border border-dashed border-border bg-surface">
          <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-textPrimary">No records found</p>
          <p className="text-xs text-textSecondary mt-1">
            {typeFilter !== 'all'
              ? `No records found under category "${typeFilter.replace('_', ' ')}".`
              : 'Records added by your doctor or clinic staff will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="rounded-[12px] border border-border bg-surface hover:shadow-cardHover hover:-translate-y-[2px] transition-all"
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-[8px] bg-neutral-100 mt-0.5 flex-shrink-0">
                      {getRecordIcon(record.record_type)}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-textPrimary">{record.title}</h2>
                        {getRecordTypeBadge(record.record_type)}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-textSecondary">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          Date: {formatDate(record.record_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-neutral-400" />
                          Doctor: {record.staff?.full_name || 'Clinic staff'}
                        </span>
                      </div>

                      {record.description && (
                        <p className="text-xs sm:text-sm text-textPrimary mt-2 bg-neutral-50 p-3 rounded-[8px] border border-border/70 whitespace-pre-line leading-relaxed">
                          {record.description}
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
                        <Download className="h-3.5 w-3.5 text-textSecondary" />
                        Download document
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
