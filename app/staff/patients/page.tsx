'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { searchPatients } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { Profile, Patient } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Search, User, ArrowRight, ArrowLeft, ShieldCheck, Phone } from 'lucide-react';

export default function StaffPatientsPage() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<(Profile & { patient_details?: Patient })[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const performSearch = async (searchTerm: string) => {
    try {
      const data = await searchPatients(searchTerm);
      setPatients(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">{t('Patients')}</h1>
          <p className="text-sm text-textSecondary mt-1">
            {t('Search patients to view medical charts, add records, or manage prescriptions.')}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder={t('Search by name, phone number, or email...')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-3 h-10 text-sm rounded-[6px] border border-border bg-surface focus:bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Directory Table */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-textPrimary">{t('Patient list')}</CardTitle>
            <span className="text-xs text-textSecondary font-medium">
              {patients.length} {patients.length === 1 ? t('patient') : t('patients')}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-textSecondary">{t('Loading patients...')}</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-16 px-4">
              <User className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-textPrimary">{t('No patients found')}</p>
              <p className="text-xs text-textSecondary mt-1">
                {t('Try searching with a different name, email, or telephone number.')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Name & email')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Phone')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Date of birth')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Insurance')}</TableHead>
                  <TableHead className="text-right rtl:text-left text-xs font-medium text-textSecondary">{t('Action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => {
                  const pd = p.patient_details;
                  return (
                    <TableRow key={p.id} className="border-b border-border/70 hover:bg-neutral-50/60">
                      <TableCell>
                        <Link
                          href={`/staff/patients/${p.id}`}
                          className="font-medium text-primary hover:underline text-sm block"
                        >
                          {p.full_name}
                        </Link>
                        <span className="text-xs text-textSecondary">{p.email || 'No email registered'}</span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-textPrimary">
                          <Phone className="h-3.5 w-3.5 text-neutral-400" />
                          <span>{p.phone || '—'}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-textPrimary font-medium">
                          {pd?.date_of_birth ? formatDate(pd.date_of_birth) : '—'}
                        </div>
                        <div className="text-xs text-textSecondary">
                          {pd?.gender ? t(pd.gender) : '—'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-textPrimary font-medium">
                          <ShieldCheck className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                          <span>{pd?.insurance_provider || 'Self-pay'}</span>
                        </div>
                        {pd?.insurance_number && (
                          <div className="text-xs text-textSecondary pl-5 rtl:pr-5 rtl:pl-0">
                            ID: {pd.insurance_number}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right rtl:text-left">
                        <Link href={`/staff/patients/${p.id}`}>
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs gap-1.5 rounded-[6px]"
                          >
                            {t('Open Chart')}
                            <ArrowIcon className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
