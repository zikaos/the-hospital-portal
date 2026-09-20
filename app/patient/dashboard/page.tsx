'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getMyAppointments, getMyPrescriptions, getMyNotifications, cancelAppointment } from '@/lib/api';
import { Appointment, Prescription, Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatDate } from '@/lib/utils';
import {
  Calendar,
  Pill,
  Bell,
  Clock,
  ArrowRight,
  Plus,
  User,
  CheckCircle2,
  CalendarCheck,
  Stethoscope,
} from 'lucide-react';

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [aptData, rxData, notifData] = await Promise.all([
        getMyAppointments(),
        getMyPrescriptions(),
        getMyNotifications(),
      ]);
      setAppointments(aptData);
      setPrescriptions(rxData);
      setNotifications(notifData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    const res = await cancelAppointment(id);
    if (res.success) {
      setActionSuccess('Appointment cancelled.');
      loadData();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && new Date(a.scheduled_at) >= now
  );
  const nextAppointment =
    upcomingAppointments[upcomingAppointments.length - 1] ||
    appointments.find((a) => a.status === 'pending' || a.status === 'confirmed');

  const activePrescriptions = prescriptions.filter((p) => p.status === 'active');
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-[#E8E8EC] rounded-[6px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="h-32 bg-[#E8E8EC] rounded-[12px]" />
          <div className="h-32 bg-[#E8E8EC] rounded-[12px]" />
          <div className="h-32 bg-[#E8E8EC] rounded-[12px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8EC]">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">
            Welcome, {user?.full_name || 'Patient'}
          </h1>
          <p className="text-[14px] text-[#6B6B6B] mt-0.5">
            Here is an overview of your visits, medications, and messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/patient/appointments">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Book appointment
            </Button>
          </Link>
          <Link href="/patient/profile">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <User className="h-4 w-4" />
              My profile
            </Button>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-[6px] bg-[#00A8A7]/10 border border-[#00A8A7]/30 text-[#007372] text-[13px] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#00A8A7]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Next Appointment Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-[16px] flex items-center gap-2 font-bold">
                <CalendarCheck className="h-4 w-4 text-[#0671B8]" />
                Next appointment
              </CardTitle>
              <CardDescription className="text-[12px]">
                Your next scheduled consultation
              </CardDescription>
            </div>
            <Link
              href="/patient/appointments"
              className="text-[12px] font-medium text-[#0671B8] hover:underline flex items-center gap-1"
            >
              All appointments
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>

          <CardContent>
            {nextAppointment ? (
              <div className="rounded-[8px] border border-[#E8E8EC] bg-[#FAFAFA] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={nextAppointment.status}>
                      {nextAppointment.status.charAt(0).toUpperCase() + nextAppointment.status.slice(1)}
                    </Badge>
                    <span className="text-[13px] text-[#6B6B6B] flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#9C9C9C]" />
                      {formatDateTime(nextAppointment.scheduled_at)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-[15px] font-semibold text-[#0A0A0A]">
                      {nextAppointment.reason || 'General checkup'}
                    </h2>
                    <p className="text-[13px] text-[#6B6B6B] flex items-center gap-1 mt-0.5">
                      <Stethoscope className="h-3.5 w-3.5 text-[#9C9C9C]" />
                      Doctor: {nextAppointment.staff?.full_name || 'Clinic doctor'}
                    </p>
                  </div>
                </div>

                <div>
                  {nextAppointment.status !== 'cancelled' && nextAppointment.status !== 'completed' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(nextAppointment.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-7 rounded-[8px] border border-dashed border-[#E8E8EC] bg-[#FAFAFA]">
                <Calendar className="h-7 w-7 text-[#9C9C9C] mx-auto mb-2" />
                <p className="text-[14px] font-medium text-[#0A0A0A]">No upcoming appointments</p>
                <p className="text-[13px] text-[#6B6B6B] mt-0.5">
                  Schedule a visit whenever you need to see a doctor.
                </p>
                <Link href="/patient/appointments" className="inline-block mt-3">
                  <Button variant="primary" size="sm">
                    Schedule a visit
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[16px] flex items-center gap-2 font-bold">
                <Bell className="h-4 w-4 text-[#0671B8]" />
                Recent updates
              </CardTitle>
              {unreadNotifications.length > 0 && (
                <span className="text-[11px] bg-[#0671B8]/12 text-[#0671B8] font-medium px-2 py-0.5 rounded-full">
                  {unreadNotifications.length} new
                </span>
              )}
            </div>
            <CardDescription className="text-[12px]">
              Messages from your clinic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-[13px] text-[#9C9C9C] py-5 text-center">No new messages</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-[6px] border text-[13px] transition-colors ${
                      !n.is_read ? 'bg-[#FAFAFA] border-[#0671B8]/30 text-[#0A0A0A]' : 'bg-white border-[#E8E8EC] text-[#6B6B6B]'
                    }`}
                  >
                    <p className={!n.is_read ? 'font-medium' : ''}>{n.message}</p>
                    <span className="text-[11px] text-[#9C9C9C] mt-1 block">
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Prescriptions Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-[16px] flex items-center gap-2 font-bold">
              <Pill className="h-4 w-4 text-[#00A8A7]" />
              Active prescriptions
            </CardTitle>
            <CardDescription className="text-[12px]">
              Medications you are currently taking
            </CardDescription>
          </div>
          <Link
            href="/patient/prescriptions"
            className="text-[12px] font-medium text-[#0671B8] hover:underline flex items-center gap-1"
          >
            All prescriptions
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent>
          {activePrescriptions.length === 0 ? (
            <div className="text-center py-6 text-[13px] text-[#9C9C9C]">
              No active prescriptions on file.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activePrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-[8px] border border-[#E8E8EC] bg-white space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold text-[#0A0A0A] text-[14px]">{rx.medication_name}</h2>
                    <Badge variant="active">Active</Badge>
                  </div>
                  <div className="text-[13px] text-[#6B6B6B] space-y-0.5">
                    <p>Dosage: {rx.dosage || 'As directed'}</p>
                    <p>Frequency: {rx.frequency || 'Daily'}</p>
                  </div>
                  <div className="pt-2 border-t border-[#E8E8EC] flex items-center justify-between text-[11px] text-[#9C9C9C]">
                    <span>Started: {formatDate(rx.start_date)}</span>
                    <span>Doctor: {rx.staff?.full_name || 'Clinic physician'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
