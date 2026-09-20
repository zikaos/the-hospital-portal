'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getStaffQueue, updateAppointmentStatus } from '@/lib/api';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { formatTime, formatDateTime } from '@/lib/utils';
import {
  Calendar,
  Check,
  CheckCheck,
  XCircle,
  Clock,
  User,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadQueue = async () => {
    try {
      const data = await getStaffQueue(filterMode);
      setQueue(data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [filterMode, user]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (res.success) {
      setActionMessage(`Appointment updated to ${newStatus}.`);
      loadQueue();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const pendingCount = queue.filter((a) => a.status === 'pending').length;
  const confirmedCount = queue.filter((a) => a.status === 'confirmed').length;
  const completedCount = queue.filter((a) => a.status === 'completed').length;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-neutral-200 rounded-[6px]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-neutral-100 rounded-[12px]" />
          <div className="h-24 bg-neutral-100 rounded-[12px]" />
          <div className="h-24 bg-neutral-100 rounded-[12px]" />
          <div className="h-24 bg-neutral-100 rounded-[12px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-textPrimary">
            Appointments
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Welcome back, {user?.full_name || 'Staff'}. Review upcoming visits and update statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/staff/patients">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-[6px]">
              <User className="h-4 w-4" />
              Patient directory
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-[6px] bg-secondary/10 border border-secondary/25 text-secondary text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[12px] border border-border bg-surface shadow-card hover:shadow-cardHover hover:-translate-y-[2px] transition-all">
          <p className="text-xs font-medium text-textSecondary">Total appointments</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{queue.length}</p>
        </div>

        <div className="p-4 rounded-[12px] border border-border bg-surface shadow-card hover:shadow-cardHover hover:-translate-y-[2px] transition-all">
          <p className="text-xs font-medium text-warning">Pending review</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-[12px] border border-border bg-surface shadow-card hover:shadow-cardHover hover:-translate-y-[2px] transition-all">
          <p className="text-xs font-medium text-secondary">Confirmed</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{confirmedCount}</p>
        </div>

        <div className="p-4 rounded-[12px] border border-border bg-surface shadow-card hover:shadow-cardHover hover:-translate-y-[2px] transition-all">
          <p className="text-xs font-medium text-primary">Completed</p>
          <p className="text-2xl font-bold text-textPrimary mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Queue Table */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3 border-b border-border">
          <div>
            <CardTitle className="text-base font-semibold text-textPrimary flex items-center gap-2">
              <Calendar className="h-4 w-4 text-textSecondary" />
              Appointment list
            </CardTitle>
            <CardDescription className="text-xs text-textSecondary">
              Confirm appointments, mark visits completed, or open patient charts.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-[6px]">
            <button
              type="button"
              onClick={() => setFilterMode('today')}
              className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all ${
                filterMode === 'today'
                  ? 'bg-surface text-textPrimary shadow-sm'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-medium rounded-[4px] transition-all ${
                filterMode === 'all'
                  ? 'bg-surface text-textPrimary shadow-sm'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              All visits
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {queue.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Clock className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-textPrimary">
                {filterMode === 'today' ? 'No appointments scheduled for today' : 'No appointments on file'}
              </p>
              <p className="text-xs text-textSecondary mt-1">
                When patients schedule appointments, they will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs font-medium text-textSecondary">Time & date</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">Patient</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">Reason</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">Status</TableHead>
                  <TableHead className="text-right text-xs font-medium text-textSecondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((apt) => (
                  <TableRow key={apt.id} className="border-b border-border/70 hover:bg-neutral-50/60">
                    <TableCell className="font-medium text-textPrimary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                        <div>
                          <span className="text-sm">{formatTime(apt.scheduled_at)}</span>
                          <span className="block text-xs font-normal text-textSecondary">
                            {formatDateTime(apt.scheduled_at).split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/staff/patients/${apt.patient_id}`}
                        className="font-medium text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        {apt.patient?.full_name || 'Patient'}
                        <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                      </Link>
                      {apt.patient?.phone && (
                        <div className="text-xs text-textSecondary">{apt.patient.phone}</div>
                      )}
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <p className="text-textPrimary text-xs sm:text-sm line-clamp-2">
                        {apt.reason || 'General consultation'}
                      </p>
                      {apt.notes && (
                        <span className="text-xs text-textSecondary block mt-0.5">
                          Note: {apt.notes}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={apt.status}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {apt.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'confirmed')}
                            className="rounded-[6px] text-xs h-7 px-2.5 text-secondary border-secondary/30 hover:bg-secondary/10"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Confirm
                          </Button>
                        )}

                        {apt.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="rounded-[6px] text-xs h-7 px-2.5 text-primary border-primary/30 hover:bg-primary/10"
                          >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}

                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="rounded-[6px] text-error hover:bg-error/10 text-xs h-7 px-2"
                            title="Cancel appointment"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}

                        <Link href={`/staff/patients/${apt.patient_id}`}>
                          <Button variant="ghost" size="sm" className="rounded-[6px] text-xs h-7 px-2.5 text-textSecondary hover:text-textPrimary">
                            Chart
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
