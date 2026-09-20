'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPatientDetail, addRecord, addPrescription, updateAppointmentStatus } from '@/lib/api';
import { Profile, Patient, Appointment, MedicalRecord, Prescription, MedicalRecordType, AppointmentStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import {
  User,
  Clock,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Check,
  CheckCheck,
  XCircle,
  Paperclip,
} from 'lucide-react';

export default function StaffPatientDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Record Form State
  const [recordType, setRecordType] = useState<MedicalRecordType>('lab_result');
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDesc, setRecordDesc] = useState('');
  const [recordFile, setRecordFile] = useState<File | null>(null);

  // Add Prescription Form State
  const [rxName, setRxName] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxFrequency, setRxFrequency] = useState('');
  const [rxStartDate, setRxStartDate] = useState('');
  const [rxEndDate, setRxEndDate] = useState('');
  const [rxNotes, setRxNotes] = useState('');

  const loadChart = async () => {
    try {
      const data = await getPatientDetail(patientId);
      if (data) {
        setProfile(data.profile);
        setPatient(data.patient);
        setAppointments(data.appointments);
        setRecords(data.records);
        setPrescriptions(data.prescriptions);
      }
    } catch (err) {
      console.error('Failed to load chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadChart();
      setRxStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [patientId]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title for the record.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await addRecord(patientId, recordType, recordTitle, recordDesc, recordFile);
      if (res.success) {
        setMessage({ type: 'success', text: `Medical record "${recordTitle}" added successfully.` });
        setIsRecordModalOpen(false);
        setRecordTitle('');
        setRecordDesc('');
        setRecordFile(null);
        loadChart();
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to add medical record.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a medication name.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await addPrescription(patientId, {
        medication_name: rxName,
        dosage: rxDosage,
        frequency: rxFrequency,
        start_date: rxStartDate,
        end_date: rxEndDate || undefined,
        notes: rxNotes,
      });

      if (res.success) {
        setMessage({ type: 'success', text: `Prescription for ${rxName} added successfully.` });
        setIsRxModalOpen(false);
        setRxName('');
        setRxDosage('');
        setRxFrequency('');
        setRxNotes('');
        loadChart();
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to add prescription.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const res = await updateAppointmentStatus(id, newStatus);
    if (res.success) {
      setMessage({ type: 'success', text: `Appointment status updated to ${newStatus}.` });
      loadChart();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-200 rounded-[6px]" />
        <div className="h-48 bg-neutral-100 rounded-[12px]" />
        <div className="h-64 bg-neutral-100 rounded-[12px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-semibold text-textPrimary">{t('Patient not found')}</p>
        <Link href="/staff/patients" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="rounded-[6px]">
            {t('Back to patient list')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top navigation & action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/staff/patients">
            <Button variant="ghost" size="sm" className="gap-1.5 text-textSecondary hover:text-textPrimary rounded-[6px]">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('Patients')}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
              {profile.full_name}
            </h1>
            <p className="text-xs text-textSecondary">
              {t('Patient chart & medical history')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecordModalOpen(true)}
            className="gap-1.5 text-xs font-medium rounded-[6px]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Add record')}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsRxModalOpen(true)}
            className="gap-1.5 text-xs font-medium rounded-[6px]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('Add prescription')}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[6px] text-xs sm:text-sm flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-secondary/10 border border-secondary/25 text-secondary'
              : 'bg-error/10 border border-error/25 text-error'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-textSecondary hover:text-textPrimary text-xs"
          >
            {t('Dismiss')}
          </button>
        </div>
      )}

      {/* Patient Profile Demographics Card */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-semibold text-textPrimary flex items-center gap-2">
            <User className="h-4 w-4 text-textSecondary" />
            {t('Patient details')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-textSecondary block">{t('Phone & email')}</span>
            <span className="font-medium text-textPrimary mt-0.5 block">
              {profile.phone || t('None provided')}
            </span>
            <span className="text-textSecondary">{profile.email || ''}</span>
          </div>

          <div>
            <span className="text-textSecondary block">{t('Date of birth')}</span>
            <span className="font-medium text-textPrimary mt-0.5 block">
              {patient?.date_of_birth ? formatDate(patient.date_of_birth) : t('Not specified')}
            </span>
            <span className="text-textSecondary">{patient?.gender ? t(patient.gender) : t('Unspecified')}</span>
          </div>

          <div>
            <span className="text-textSecondary block">{t('Insurance')}</span>
            <span className="font-medium text-textPrimary mt-0.5 block">
              {patient?.insurance_provider || t('Self-pay')}
            </span>
            <span className="text-textSecondary">{patient?.insurance_number || t('No ID on file')}</span>
          </div>

          <div>
            <span className="text-textSecondary block">{t('Emergency contact')}</span>
            <span className="font-medium text-textPrimary mt-0.5 block">
              {patient?.emergency_contact_name || t('None listed')}
            </span>
            <span className="text-textSecondary">{patient?.emergency_contact_phone || t('No phone')}</span>
          </div>

          {patient?.address && (
            <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t border-border">
              <span className="text-textSecondary">{t('Address')}: </span>
              <span className="text-textPrimary font-medium">{patient.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section: Medical Records */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <CardTitle className="text-base font-semibold text-textPrimary">
              {t('Medical records')} ({records.length})
            </CardTitle>
            <CardDescription className="text-xs text-textSecondary">
              {t('Lab tests, diagnostic reports, and visit summaries.')}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRecordModalOpen(true)}
            className="text-xs gap-1 rounded-[6px]"
          >
            <Plus className="h-3 w-3" />
            {t('Add record')}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-8 text-center text-xs text-textSecondary">
              {t('No medical records entered for this patient yet.')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map((r) => (
                <div key={r.id} className="p-4 hover:bg-neutral-50/60 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium text-textPrimary text-sm">{r.title}</h2>
                      <Badge variant="outline" className="text-xs capitalize">
                        {t(r.record_type.replace('_', ' '))}
                      </Badge>
                    </div>
                    <span className="text-xs text-textSecondary">{t('Date')}: {formatDate(r.record_date)}</span>
                  </div>

                  {r.description && (
                    <p className="text-xs text-textPrimary bg-neutral-50 p-2.5 rounded-[6px] border border-border/70 whitespace-pre-line">
                      {r.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-textSecondary pt-1">
                    <span>{t('By')}: {r.staff?.full_name || t('Staff doctor')}</span>
                    {r.file_path && (
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <Paperclip className="h-3 w-3" />
                        {r.file_path}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section: Prescriptions */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <div>
            <CardTitle className="text-base font-semibold text-textPrimary">
              {t('Prescriptions')} ({prescriptions.length})
            </CardTitle>
            <CardDescription className="text-xs text-textSecondary">
              {t('Medications prescribed for this patient.')}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRxModalOpen(true)}
            className="text-xs gap-1 rounded-[6px]"
          >
            <Plus className="h-3 w-3" />
            {t('Add prescription')}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {prescriptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-textSecondary">
              {t('No prescriptions registered for this patient.')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Medication')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Dosage & frequency')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Dates')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Status')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Instructions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((rx) => (
                  <TableRow key={rx.id} className="border-b border-border/70 hover:bg-neutral-50/60">
                    <TableCell className="font-medium text-textPrimary text-sm">
                      {rx.medication_name}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium text-textPrimary">{rx.dosage || t('Standard')}</span>
                      <span className="text-textSecondary block">{rx.frequency || t('Daily')}</span>
                    </TableCell>
                    <TableCell className="text-xs text-textSecondary">
                      <span>{t('Start')}: {formatDate(rx.start_date)}</span>
                      {rx.end_date && <span className="block">{t('End')}: {formatDate(rx.end_date)}</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rx.status === 'active' ? 'active' : 'secondary'}>
                        {t(rx.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-textPrimary max-w-xs">
                      {rx.notes && <p className="text-textSecondary mb-0.5">{rx.notes}</p>}
                      <span className="text-xs text-textSecondary">
                        {t('By')} {rx.staff?.full_name || 'Dr. Vance'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Section: Appointment History */}
      <Card className="rounded-[12px] border border-border bg-surface shadow-card">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-base font-semibold text-textPrimary flex items-center gap-2">
            <Clock className="h-4 w-4 text-textSecondary" />
            {t('Appointment history')} ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-xs text-textSecondary">
              {t('No appointments on record for this patient.')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Date & time')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Reason')}</TableHead>
                  <TableHead className="text-xs font-medium text-textSecondary">{t('Status')}</TableHead>
                  <TableHead className="text-end text-xs font-medium text-textSecondary">{t('Update status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id} className="border-b border-border/70 hover:bg-neutral-50/60">
                    <TableCell className="font-medium text-textPrimary text-xs">
                      {formatDateTime(apt.scheduled_at)}
                    </TableCell>
                    <TableCell className="text-xs text-textPrimary max-w-sm">
                      {apt.reason || t('General consultation')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={apt.status}>
                        {t(apt.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {apt.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'confirmed')}
                            className="rounded-[6px] text-xs h-7 px-2 text-secondary border-secondary/30 hover:bg-secondary/10"
                          >
                            <Check className="h-3 w-3 me-1" />
                            {t('Confirm')}
                          </Button>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'completed')}
                            className="rounded-[6px] text-xs h-7 px-2 text-primary border-primary/30 hover:bg-primary/10"
                          >
                            <CheckCheck className="h-3 w-3 me-1" />
                            {t('Complete')}
                          </Button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'cancelled')}
                            className="rounded-[6px] text-error hover:bg-error/10 text-xs h-7 px-2"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: Add Medical Record Dialog */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent onClose={() => setIsRecordModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{t('Add medical record')}</DialogTitle>
            <DialogDescription>
              {t('Upload or add a report, lab result, or visit summary for')} {profile.full_name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRecord} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="recordTypeSelect">
                {t('Record category')}
              </label>
              <Select
                id="recordTypeSelect"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as MedicalRecordType)}
                className="rounded-[6px]"
              >
                <option value="lab_result">{t('Lab result')}</option>
                <option value="visit_summary">{t('Visit summary')}</option>
                <option value="diagnosis">{t('Diagnosis')}</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="recordTitle">
                {t('Record title')}
              </label>
              <Input
                id="recordTitle"
                required
                placeholder="e.g. Metabolic panel, Annual checkup summary"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                className="rounded-[6px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="recordDesc">
                {t('Notes & clinical details')}
              </label>
              <Textarea
                id="recordDesc"
                rows={4}
                placeholder="Enter details, doctor notes, or findings..."
                value={recordDesc}
                onChange={(e) => setRecordDesc(e.target.value)}
                className="rounded-[6px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="recordFileUpload">
                {t('Attach document (optional)')}
              </label>
              <div className="border border-dashed border-border rounded-[6px] p-3 text-center bg-neutral-50">
                <input
                  id="recordFileUpload"
                  type="file"
                  onChange={(e) => setRecordFile(e.target.files?.[0] || null)}
                  className="text-xs text-textSecondary file:mr-2 file:py-1 file:px-2.5 file:rounded-[4px] file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/15 cursor-pointer"
                />
                <p className="text-xs text-textSecondary mt-1">
                  {t('Supported formats: PDF, PNG, JPG.')}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-[6px]"
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[6px]"
              >
                {isSubmitting ? t('Saving...') : t('Save record')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Add Prescription Dialog */}
      <Dialog open={isRxModalOpen} onOpenChange={setIsRxModalOpen}>
        <DialogContent onClose={() => setIsRxModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{t('Add prescription')}</DialogTitle>
            <DialogDescription>
              {t('Create a new prescription for')} {profile.full_name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPrescription} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="rxName">
                {t('Medication name')}
              </label>
              <Input
                id="rxName"
                required
                placeholder="e.g. Amoxicillin, Lisinopril, Metformin"
                value={rxName}
                onChange={(e) => setRxName(e.target.value)}
                className="rounded-[6px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-textPrimary block" htmlFor="rxDosage">
                  {t('Dosage')}
                </label>
                <Input
                  id="rxDosage"
                  placeholder="e.g. 500mg tablet"
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-textPrimary block" htmlFor="rxFrequency">
                  {t('Frequency')}
                </label>
                <Input
                  id="rxFrequency"
                  placeholder="e.g. Twice daily with meals"
                  value={rxFrequency}
                  onChange={(e) => setRxFrequency(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-textPrimary block" htmlFor="rxStartDate">
                  {t('Start date')}
                </label>
                <Input
                  id="rxStartDate"
                  type="date"
                  value={rxStartDate}
                  onChange={(e) => setRxStartDate(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-textPrimary block" htmlFor="rxEndDate">
                  {t('End date (optional)')}
                </label>
                <Input
                  id="rxEndDate"
                  type="date"
                  value={rxEndDate}
                  onChange={(e) => setRxEndDate(e.target.value)}
                  className="rounded-[6px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-textPrimary block" htmlFor="rxNotes">
                {t('Instructions / Notes')}
              </label>
              <Textarea
                id="rxNotes"
                rows={3}
                placeholder="Special instructions, dietary precautions, or pharmacy notes..."
                value={rxNotes}
                onChange={(e) => setRxNotes(e.target.value)}
                className="rounded-[6px]"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsRxModalOpen(false)}
                disabled={isSubmitting}
                className="rounded-[6px]"
              >
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[6px]"
              >
                {isSubmitting ? t('Saving...') : t('Save prescription')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
