'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getMyPrescriptions } from '@/lib/api';
import { Prescription } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Pill, Calendar, User, CheckCircle2 } from 'lucide-react';

export default function PatientPrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    async function loadPrescriptions() {
      try {
        const data = await getMyPrescriptions();
        setPrescriptions(data);
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrescriptions();
  }, [user]);

  const activePrescriptions = prescriptions.filter(
    (p) => p.status === 'active' && (!p.end_date || new Date(p.end_date) >= new Date())
  );

  const pastPrescriptions = prescriptions.filter(
    (p) => p.status !== 'active' || (p.end_date && new Date(p.end_date) < new Date())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded-[6px]" />
        <div className="h-64 bg-neutral-100 rounded-[12px]" />
      </div>
    );
  }

  const renderPrescriptionCard = (rx: Prescription, isActive: boolean) => (
    <Card
      key={rx.id}
      className="rounded-[12px] border border-border bg-surface hover:shadow-cardHover hover:-translate-y-[2px] transition-all"
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-[8px] flex-shrink-0 mt-0.5 ${
                isActive ? 'bg-secondary/10 text-secondary' : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              <Pill className="h-5 w-5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-textPrimary">{rx.medication_name}</h2>
                <Badge variant={isActive ? 'active' : 'secondary'}>
                  {isActive ? 'Active' : 'Completed'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-textSecondary pt-1">
                <p>
                  <strong className="font-medium text-textPrimary">Dosage:</strong> {rx.dosage || 'As directed'}
                </p>
                <p>
                  <strong className="font-medium text-textPrimary">Frequency:</strong> {rx.frequency || 'Daily'}
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  Prescribed: {formatDate(rx.start_date)}
                </p>
                {rx.end_date && (
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    End date: {formatDate(rx.end_date)}
                  </p>
                )}
              </div>

              {rx.notes && (
                <div className="text-xs text-textPrimary mt-2 bg-neutral-50 p-2.5 rounded-[6px] border border-border/70">
                  <span className="font-medium text-textSecondary">Instructions: </span>
                  {rx.notes}
                </div>
              )}

              <p className="text-xs text-textSecondary pt-1 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                Prescribed by: <strong className="font-medium text-textPrimary">{rx.staff?.full_name || 'Dr. Marcus Vance'}</strong>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">Prescriptions</h1>
        <p className="text-sm text-textSecondary mt-1">
          Active medications, dosage instructions, and prescription history.
        </p>
      </div>

      <div className="inline-flex h-[38px] items-center justify-center rounded-[8px] bg-neutral-100 p-1 mb-4 text-[#6B6B6B]">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-1 text-xs font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white text-textPrimary shadow-sm font-semibold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
          Active medications ({activePrescriptions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-3.5 py-1 text-xs font-medium transition-all ${
            activeTab === 'past'
              ? 'bg-white text-textPrimary shadow-sm font-semibold'
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Past medications ({pastPrescriptions.length})
        </button>
      </div>

      {activeTab === 'active' ? (
        activePrescriptions.length === 0 ? (
          <div className="text-center py-16 rounded-[12px] border border-dashed border-border bg-surface">
            <Pill className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-textPrimary">No active prescriptions</p>
            <p className="text-xs text-textSecondary mt-1">
              You currently do not have any active medications on file.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activePrescriptions.map((rx) => renderPrescriptionCard(rx, true))}
          </div>
        )
      ) : pastPrescriptions.length === 0 ? (
        <div className="text-center py-16 rounded-[12px] border border-dashed border-border bg-surface">
          <Pill className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-textPrimary">No past prescriptions</p>
          <p className="text-xs text-textSecondary mt-1">
            Completed medications and past prescriptions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastPrescriptions.map((rx) => renderPrescriptionCard(rx, false))}
        </div>
      )}
    </div>
  );
}
