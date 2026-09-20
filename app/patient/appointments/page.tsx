'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/i18n';
import { getMyAppointments, createAppointment, cancelAppointment, getStaffList } from '@/lib/api';
import { Appointment, StaffProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Book appointment form state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    try {
      const [aptData, staffData] = await Promise.all([
        getMyAppointments(),
        getStaffList(),
      ]);
      setAppointments(aptData);
      setStaffMembers(staffData);
      if (staffData.length > 0 && !selectedStaffId) {
        setSelectedStaffId(staffData[0].id);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [user]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !reason.trim()) {
      setMessage({ type: 'error', text: t('Please complete the date, time, and reason.') || 'Please fill all fields.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const res = await createAppointment(scheduledDateTime, reason, selectedStaffId);

      if (res.success) {
        setMessage({
          type: 'success',
          text: t('Your appointment request has been submitted.') || 'Appointment booked.',
        });
        setIsDialogOpen(false);
        setReason('');
        loadData();
      } else {
        setMessage({ type: 'error', text: res.error || t('Failed to book appointment.') || 'Failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm(t('Are you sure you want to cancel this appointment?') || 'Cancel appointment?')) return;
    const res = await cancelAppointment(id);
    if (res.success) {
      setMessage({ type: 'success', text: t('Appointment cancelled.') || 'Cancelled.' });
      loadData();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to cancel appointment.' });
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-[#E8E8EC] rounded-[6px]" />
        <div className="h-64 bg-[#E8E8EC] rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8EC]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">{t('Appointments')}</h1>
          <p className="text-[14px] text-[#6B6B6B] mt-0.5">
            {t('View upcoming visits and previous clinic consultations')}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('Book appointment')}
        </Button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[6px] text-[13px] flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-[#00A8A7]/10 border border-[#00A8A7]/30 text-[#007372]'
              : 'bg-[#F37521]/10 border border-[#F37521]/30 text-[#C25208]'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#00A8A7] flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-[#F37521] flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[#9C9C9C] hover:text-[#0A0A0A] text-xs"
          >
            {t('Close')}
          </button>
        </div>
      )}

      {/* Appointments Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-[#E8E8EC]">
          <div>
            <CardTitle className="text-[16px]">{t('Scheduled visits') || t('Appointments')}</CardTitle>
            <CardDescription className="text-[12px]">
              {t('All visits ordered by date') || t('View upcoming visits and previous clinic consultations')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[#9C9C9C]" />
            <span className="text-[13px] text-[#6B6B6B]">{t('Filter')}:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[13px] border border-[#E8E8EC] rounded-[6px] px-2.5 py-1 bg-white text-[#0A0A0A] focus:outline-none focus:border-[#0671B8]"
            >
              <option value="all">{t('All')} ({appointments.length})</option>
              <option value="pending">{t('Pending')}</option>
              <option value="confirmed">{t('Confirmed')}</option>
              <option value="completed">{t('Completed')}</option>
              <option value="cancelled">{t('Cancelled')}</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Calendar className="h-8 w-8 text-[#9C9C9C] mx-auto mb-2" />
              <p className="text-[14px] font-medium text-[#0A0A0A]">{t('No appointments found matching this filter.')}</p>
              <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                {statusFilter !== 'all'
                  ? `${t('No appointments matching')} "${t(statusFilter)}".`
                  : t('No upcoming appointments')}
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3.5"
                onClick={() => setIsDialogOpen(true)}
              >
                {t('Book appointment')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Date & Time')}</TableHead>
                  <TableHead>{t('Doctor')}</TableHead>
                  <TableHead>{t('Reason')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className="text-right rtl:text-left">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => {
                  const isUpcoming =
                    apt.status !== 'cancelled' &&
                    apt.status !== 'completed' &&
                    new Date(apt.scheduled_at) >= new Date();

                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium text-[#0A0A0A] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#9C9C9C] flex-shrink-0" />
                          <span>{formatDateTime(apt.scheduled_at)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-[#0A0A0A]">
                          {apt.staff?.full_name || t('Clinic physician')}
                        </div>
                        <div className="text-[12px] text-[#6B6B6B]">
                          {apt.staff?.title || t('Doctor')}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-md">
                        <p className="text-[#0A0A0A] text-[13px] line-clamp-2">
                          {t(apt.reason || 'General checkup')}
                        </p>
                        {apt.notes && (
                          <p className="text-[11px] text-[#9C9C9C] mt-0.5">
                            {apt.notes}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant={apt.status}>
                          {t(apt.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right rtl:text-left">
                        {isUpcoming ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(apt.id)}
                            className="h-7 px-2.5 text-[12px]"
                          >
                            {t('Cancel')}
                          </Button>
                        ) : (
                          <span className="text-[12px] text-[#9C9C9C]">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Book Appointment Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{t('Book New Appointment')}</DialogTitle>
            <DialogDescription>
              {t('Select your preferred date, time, and doctor.')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBook} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="staffSelect">
                {t('Select Doctor / Physician')}
              </label>
              <Select
                id="staffSelect"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.staff_details?.title || t('Doctor')})
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="aptDate">
                  {t('Date')}
                </label>
                <Input
                  id="aptDate"
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="aptTime">
                  {t('Time')}
                </label>
                <Select
                  id="aptTime"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="13:30">01:30 PM</option>
                  <option value="14:30">02:30 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="16:30">04:30 PM</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="aptReason">
                {t('Consultation Reason')}
              </label>
              <Textarea
                id="aptReason"
                required
                placeholder={t('Reason')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('Booking...') : t('Confirm Booking')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
