import { supabase, isSupabaseConfigured } from './supabase';
import {
  Profile,
  Patient,
  PatientProfile,
  StaffProfile,
  Appointment,
  AppointmentStatus,
  MedicalRecord,
  MedicalRecordType,
  Prescription,
  Notification,
  Role,
} from './types';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: Role;
    full_name: string;
  };
}

export const CLINIC_STAFF_PASSCODE = process.env.NEXT_PUBLIC_STAFF_PASSCODE || 'APEX-STAFF-9021';

// -----------------------------------------------------------------------------
// PROTOTYPE CONSTANTS & IN-MEMORY STORE
// -----------------------------------------------------------------------------

const PROTOTYPE_PATIENT_USER: AuthSession['user'] = {
  id: 'p0000000-0000-0000-0000-000000000001',
  email: 'sarah.chen@example.com',
  role: 'patient',
  full_name: 'Sarah Chen',
};

const PROTOTYPE_STAFF_USER: AuthSession['user'] = {
  id: 'd0000000-0000-0000-0000-000000000001',
  email: 'dr.vance@clinic.demo',
  role: 'staff',
  full_name: 'Dr. Marcus Vance',
};

const protoProfile: PatientProfile = {
  id: PROTOTYPE_PATIENT_USER.id,
  email: PROTOTYPE_PATIENT_USER.email,
  role: 'patient',
  full_name: 'Sarah Chen',
  phone: '(555) 987-6543',
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  patient_details: {
    id: PROTOTYPE_PATIENT_USER.id,
    date_of_birth: '1992-04-15',
    gender: 'Female',
    address: '742 Evergreen Terrace, Springfield, OR',
    insurance_provider: 'Blue Cross Blue Shield',
    insurance_number: 'BCBS-9982410-01',
    emergency_contact_name: 'Michael Chen (Spouse)',
    emergency_contact_phone: '(555) 987-6544',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
};

const protoStaffList: StaffProfile[] = [
  {
    id: PROTOTYPE_STAFF_USER.id,
    email: PROTOTYPE_STAFF_USER.email,
    role: 'staff',
    full_name: 'Dr. Marcus Vance',
    phone: '(555) 234-5678',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    staff_details: {
      id: PROTOTYPE_STAFF_USER.id,
      title: 'Attending Physician',
      specialty: 'Cardiology & Internal Medicine',
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    email: 'nurse.rostova@clinic.demo',
    role: 'staff',
    full_name: 'Nurse Elena Rostova, RN',
    phone: '(555) 345-6789',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    staff_details: {
      id: 'd0000000-0000-0000-0000-000000000002',
      title: 'Lead Nurse Practitioner',
      specialty: 'Clinical Triage & Family Practice',
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
  },
];

let protoAppointments: Appointment[] = [
  {
    id: 'apt-001',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    reason: 'Cardiology consultation and blood pressure follow-up',
    status: 'confirmed',
    notes: 'Please bring medication history and past lab panel.',
    created_at: new Date().toISOString(),
    patient: {
      full_name: 'Sarah Chen',
      phone: '(555) 987-6543',
      email: 'sarah.chen@example.com',
      date_of_birth: '1992-04-15',
      gender: 'Female',
      insurance_provider: 'Blue Cross Blue Shield',
    },
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
      specialty: 'Cardiology & Internal Medicine',
    },
  },
  {
    id: 'apt-002',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    staff_id: PROTOTYPE_STAFF_USER.id,
    scheduled_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    reason: 'Annual routine health evaluation',
    status: 'pending',
    notes: 'Fasting lipid profile required prior to visit.',
    created_at: new Date().toISOString(),
    patient: {
      full_name: 'David Miller',
      phone: '(555) 876-5432',
      email: 'david.miller@example.com',
      date_of_birth: '1985-08-22',
      gender: 'Male',
      insurance_provider: 'Aetna Health',
    },
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
      specialty: 'Cardiology & Internal Medicine',
    },
  },
  {
    id: 'apt-003',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    scheduled_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    reason: 'Comprehensive wellness screening and routine review',
    status: 'completed',
    notes: 'Vital signs normal. Patient advised to maintain current cardio regimen.',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    patient: {
      full_name: 'Sarah Chen',
      phone: '(555) 987-6543',
    },
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
      specialty: 'Cardiology & Internal Medicine',
    },
  },
];

let protoRecords: MedicalRecord[] = [
  {
    id: 'rec-001',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    record_type: 'lab_result',
    title: 'Comprehensive Metabolic Panel (CMP)',
    description: 'Electrolyte balance, kidney parameters, and hepatic function within normal clinical limits.',
    record_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
  {
    id: 'rec-002',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    record_type: 'diagnosis',
    title: 'Resting 12-Lead Electrocardiogram',
    description: 'Normal sinus rhythm at 68 bpm. No acute ST-T segment elevation or ischemic changes observed.',
    record_date: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
  {
    id: 'rec-003',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    record_type: 'visit_summary',
    title: 'Annual Cardiovascular Evaluation',
    description: 'Patient demonstrates excellent blood pressure stability. Continued current pharmacological plan.',
    record_date: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
];

let protoPrescriptions: Prescription[] = [
  {
    id: 'rx-001',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    medication_name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily in the morning',
    start_date: new Date(Date.now() - 86400000 * 90).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
    status: 'active',
    notes: 'Take with or without food. Monitor blood pressure periodically.',
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
  {
    id: 'rx-002',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    medication_name: 'Atorvastatin',
    dosage: '20 mg',
    frequency: 'Once daily at bedtime',
    start_date: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 120).toISOString().split('T')[0],
    status: 'active',
    notes: 'Primary cardiovascular lipid maintenance.',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
  {
    id: 'rx-003',
    patient_id: PROTOTYPE_PATIENT_USER.id,
    staff_id: PROTOTYPE_STAFF_USER.id,
    medication_name: 'Amoxicillin',
    dosage: '500 mg',
    frequency: 'Three times daily for 10 days',
    start_date: new Date(Date.now() - 86400000 * 120).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 86400000 * 110).toISOString().split('T')[0],
    status: 'completed',
    notes: 'Completed standard antibiotic course.',
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance',
      title: 'Attending Physician',
    },
  },
];

let protoNotifications: Notification[] = [
  {
    id: 'notif-001',
    user_id: PROTOTYPE_PATIENT_USER.id,
    message: 'Dr. Marcus Vance confirmed your cardiology consultation for Thursday at 10:00 AM.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: PROTOTYPE_PATIENT_USER.id,
    message: 'Your Comprehensive Metabolic Panel (CMP) diagnostic results are now available to review.',
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// -----------------------------------------------------------------------------
// AUTH OPERATIONS (FRICTIONLESS PROTOTYPE)
// -----------------------------------------------------------------------------

export async function getCurrentUser(): Promise<AuthSession['user']> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('portal_session');
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }
  return PROTOTYPE_PATIENT_USER;
}

export async function login(
  email?: string,
  password?: string,
  options?: { requireRole?: Role; passcode?: string }
): Promise<{ user: AuthSession['user'] }> {
  const isStaff = options?.requireRole === 'staff';
  return { user: isStaff ? PROTOTYPE_STAFF_USER : PROTOTYPE_PATIENT_USER };
}

export async function loginStaff(
  email?: string,
  password?: string,
  passcode?: string
): Promise<{ user: AuthSession['user'] }> {
  return { user: PROTOTYPE_STAFF_USER };
}

export async function signUp(
  email?: string,
  password?: string,
  fullName?: string,
  role: Role = 'patient',
  staffPasscode?: string,
  staffDetails?: { title?: string; specialty?: string }
): Promise<{ user: AuthSession['user'] }> {
  const targetUser = role === 'staff' ? PROTOTYPE_STAFF_USER : PROTOTYPE_PATIENT_USER;
  if (fullName) {
    targetUser.full_name = fullName;
  }
  return { user: targetUser };
}

export async function logout(): Promise<void> {
  // Managed by AuthContext
}

// -----------------------------------------------------------------------------
// PATIENT OPERATIONS
// -----------------------------------------------------------------------------

export async function getMyProfile(): Promise<PatientProfile> {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('portal_session');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          ...protoProfile,
          id: u.id,
          email: u.email,
          full_name: u.full_name,
        };
      }
    } catch {
      // Fallback
    }
  }
  return protoProfile;
}

export async function updateMyProfile(
  fields: Partial<Patient> & { full_name?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  if (fields.full_name) protoProfile.full_name = fields.full_name;
  if (fields.phone) protoProfile.phone = fields.phone;
  if (protoProfile.patient_details) {
    Object.assign(protoProfile.patient_details, fields);
  }
  return { success: true };
}

// -----------------------------------------------------------------------------
// APPOINTMENTS
// -----------------------------------------------------------------------------

export async function getMyAppointments(): Promise<Appointment[]> {
  const current = await getCurrentUser();
  const currentId = current?.id || PROTOTYPE_PATIENT_USER.id;
  const isDemoPatient = currentId === PROTOTYPE_PATIENT_USER.id;

  if (isDemoPatient) {
    return protoAppointments.filter((a) => a.patient_id === PROTOTYPE_PATIENT_USER.id);
  }
  return protoAppointments.filter((a) => a.patient_id === currentId);
}

export async function createAppointment(
  scheduledAt: string,
  reason: string,
  staffId?: string
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const current = await getCurrentUser();
  const patientId = current?.id || PROTOTYPE_PATIENT_USER.id;
  const patientName = current?.full_name || protoProfile.full_name;
  const patientEmail = current?.email || protoProfile.email;

  const staff = protoStaffList.find((s) => s.id === staffId) || protoStaffList[0];

  const newApt: Appointment = {
    id: `apt-${Date.now()}`,
    patient_id: patientId,
    staff_id: staff.id,
    scheduled_at: scheduledAt,
    reason,
    status: 'pending',
    created_at: new Date().toISOString(),
    patient: {
      full_name: patientName,
      phone: protoProfile.phone,
      email: patientEmail,
    },
    staff: {
      full_name: staff.full_name,
      title: staff.staff_details?.title,
      specialty: staff.staff_details?.specialty,
    },
  };

  protoAppointments.unshift(newApt);

  protoNotifications.unshift({
    id: `notif-${Date.now()}`,
    user_id: patientId,
    message: `Consultation booked with ${staff.full_name} for ${scheduledAt.replace('T', ' ')}.`,
    is_read: false,
    created_at: new Date().toISOString(),
  });

  return { success: true, appointment: newApt };
}

export async function cancelAppointment(id: string): Promise<{ success: boolean; error?: string }> {
  protoAppointments = protoAppointments.map((a) =>
    a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
  );
  return { success: true };
}

// -----------------------------------------------------------------------------
// MEDICAL RECORDS
// -----------------------------------------------------------------------------

export async function getMyRecords(): Promise<MedicalRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('medical_records')
        .select('*, staff:staff_id(profiles(full_name), title)')
        .order('record_date', { ascending: false });

      if (data && data.length > 0) return data;
    } catch {
      // Fall through
    }
  }
  return protoRecords;
}

// -----------------------------------------------------------------------------
// PRESCRIPTIONS
// -----------------------------------------------------------------------------

export async function getMyPrescriptions(): Promise<Prescription[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) return data;
    } catch {
      // Fall through
    }
  }
  return protoPrescriptions;
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------------------------

export async function getMyNotifications(): Promise<Notification[]> {
  return protoNotifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  protoNotifications = protoNotifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
}

export async function createNotification(userId: string, message: string): Promise<void> {
  protoNotifications.unshift({
    id: `notif-${Date.now()}`,
    user_id: userId,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  });
}

// -----------------------------------------------------------------------------
// STAFF OPERATIONS
// -----------------------------------------------------------------------------

export async function getStaffQueue(filterDate?: 'today' | 'all'): Promise<Appointment[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*, patient:patient_id(profiles(full_name, phone)), staff:staff_id(profiles(full_name), title)')
        .order('scheduled_at', { ascending: true });

      if (data && data.length > 0) return data;
    } catch {
      // Fall through
    }
  }
  return protoAppointments;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  protoAppointments = protoAppointments.map((a) => (a.id === id ? { ...a, status } : a));
  return { success: true };
}

export async function searchPatients(query: string = ''): Promise<(Profile & { patient_details?: Patient })[]> {
  const q = query.toLowerCase().trim();
  const list = [
    {
      id: protoProfile.id,
      role: 'patient' as Role,
      full_name: protoProfile.full_name,
      email: protoProfile.email,
      phone: protoProfile.phone,
      created_at: protoProfile.created_at,
      patient_details: protoProfile.patient_details || undefined,
    },
    {
      id: 'p0000000-0000-0000-0000-000000000002',
      role: 'patient' as Role,
      full_name: 'David Miller',
      email: 'david.miller@example.com',
      phone: '(555) 876-5432',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      patient_details: {
        id: 'p0000000-0000-0000-0000-000000000002',
        date_of_birth: '1985-08-22',
        gender: 'Male',
        address: '1042 Elm Street, Seattle, WA',
        insurance_provider: 'Aetna Health',
        insurance_number: 'AET-8874102',
        emergency_contact_name: 'Linda Miller',
        emergency_contact_phone: '(555) 876-5433',
        created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
    },
  ];

  if (!q) return list;
  return list.filter((p) => p.full_name.toLowerCase().includes(q) || (p.phone && p.phone.includes(q)));
}

export async function getPatientDetail(patientId: string): Promise<{
  profile: Profile;
  patient: Patient | null;
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
}> {
  return {
    profile: protoProfile,
    patient: protoProfile.patient_details || null,
    appointments: protoAppointments.filter((a) => a.patient_id === patientId),
    records: protoRecords.filter((r) => r.patient_id === patientId),
    prescriptions: protoPrescriptions.filter((p) => p.patient_id === patientId),
  };
}

export async function addRecord(
  patientId: string,
  recordType: MedicalRecordType,
  title: string,
  description?: string,
  file?: File | null
): Promise<{ success: boolean; record?: MedicalRecord; error?: string }> {
  const newRec: MedicalRecord = {
    id: `rec-${Date.now()}`,
    patient_id: patientId,
    staff_id: PROTOTYPE_STAFF_USER.id,
    record_type: recordType,
    title,
    description: description || 'Clinical notes documented by attending staff.',
    file_path: file ? file.name : null,
    record_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    staff: {
      full_name: PROTOTYPE_STAFF_USER.full_name,
      title: 'Attending Physician',
    },
  };

  protoRecords.unshift(newRec);
  return { success: true, record: newRec };
}

export async function addPrescription(
  patientId: string,
  fields: {
    medication_name: string;
    dosage?: string;
    frequency?: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
  }
): Promise<{ success: boolean; prescription?: Prescription; error?: string }> {
  const newRx: Prescription = {
    id: `rx-${Date.now()}`,
    patient_id: patientId,
    staff_id: PROTOTYPE_STAFF_USER.id,
    medication_name: fields.medication_name,
    dosage: fields.dosage || 'As directed',
    frequency: fields.frequency || 'Daily',
    start_date: fields.start_date || new Date().toISOString().split('T')[0],
    end_date: fields.end_date,
    notes: fields.notes,
    status: 'active',
    created_at: new Date().toISOString(),
    staff: {
      full_name: PROTOTYPE_STAFF_USER.full_name,
      title: 'Attending Physician',
    },
  };

  protoPrescriptions.unshift(newRx);
  return { success: true, prescription: newRx };
}

export async function getStaffList(): Promise<StaffProfile[]> {
  return protoStaffList;
}
