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
// AUTH OPERATIONS
// -----------------------------------------------------------------------------

async function ensureProfile(user: any): Promise<Profile | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) return profile;

  // Auto-heal missing profile (e.g. signup when email confirmation was pending)
  const role = (user.user_metadata?.role as Role) || 'patient';
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      role,
      full_name: fullName,
    })
    .select('*')
    .maybeSingle();

  if (error || !created) return null;

  if (role === 'patient') {
    await supabase.from('patients').upsert({ id: user.id });
  } else if (role === 'staff') {
    await supabase.from('staff').upsert({
      id: user.id,
      title: user.user_metadata?.title || 'Staff Physician',
      specialty: user.user_metadata?.specialty || 'General Medicine',
    });
  }

  return created;
}

export async function getCurrentUser(): Promise<AuthSession['user'] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const profile = await ensureProfile(user);
  if (!profile) return null;

  return {
    id: user.id,
    email: user.email || '',
    role: profile.role as Role,
    full_name: profile.full_name,
  };
}

export async function login(
  email: string,
  password?: string,
  options?: { requireRole?: Role; passcode?: string }
): Promise<{ user: AuthSession['user']; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { user: null as any, error: 'Database is not configured.' };
  }

  const requireRole = options?.requireRole;
  const passcode = options?.passcode;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || '',
  });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        user: null as any,
        error: 'Email address has not been confirmed. Please check your verification link or confirm the user in Supabase.',
      };
    }
    return { user: null as any, error: error.message };
  }

  const profile = await ensureProfile(data.user);
  if (!profile) {
    return { user: null as any, error: 'User profile not found in system.' };
  }

  const userRole = profile.role as Role;

  // Reject staff login on public patient portal
  if (requireRole === 'patient' && userRole === 'staff') {
    await supabase.auth.signOut();
    return {
      user: null as any,
      error: 'Staff accounts cannot sign in through the public patient portal. Please use the private internal staff entrance.',
    };
  }

  // Require valid clinic passcode for staff login
  if (requireRole === 'staff' || userRole === 'staff') {
    if (passcode !== CLINIC_STAFF_PASSCODE) {
      await supabase.auth.signOut();
      return {
        user: null as any,
        error: 'Invalid Clinic Security Passcode. Access to the staff portal is restricted to authorized personnel.',
      };
    }
    if (userRole !== 'staff') {
      await supabase.auth.signOut();
      return {
        user: null as any,
        error: 'This account does not have clinical staff privileges.',
      };
    }
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email || email,
      role: userRole,
      full_name: profile.full_name,
    },
  };
}

export async function loginStaff(
  email: string,
  password?: string,
  passcode?: string
): Promise<{ user: AuthSession['user']; error?: string }> {
  return login(email, password, { requireRole: 'staff', passcode });
}

export async function signUp(
  email: string,
  password?: string,
  fullName?: string,
  role: Role = 'patient',
  staffPasscode?: string,
  staffDetails?: { title?: string; specialty?: string }
): Promise<{ user: AuthSession['user']; error?: string }> {
  const name = fullName || email.split('@')[0];

  // Disallow staff registration unless valid administrative clinic passcode is provided
  if (role === 'staff' && staffPasscode !== CLINIC_STAFF_PASSCODE) {
    return {
      user: null as any,
      error: 'Unauthorized. Staff accounts can only be provisioned with a valid Clinic Passcode.',
    };
  }

  if (!isSupabaseConfigured()) {
    return { user: null as any, error: 'Database is not configured.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || 'Password123!',
    options: {
      data: {
        full_name: name,
        role,
        title: staffDetails?.title || 'Staff Physician',
        specialty: staffDetails?.specialty || 'General Medicine',
      },
    },
  });

  if (error) return { user: null as any, error: error.message };
  if (!data.user) return { user: null as any, error: 'Registration failed.' };

  // Insert profile and role records
  await supabase.from('profiles').upsert({
    id: data.user.id,
    role,
    full_name: name,
  });

  if (role === 'patient') {
    await supabase.from('patients').upsert({ id: data.user.id });
  } else if (role === 'staff') {
    await supabase.from('staff').upsert({
      id: data.user.id,
      title: staffDetails?.title || 'Staff Physician',
      specialty: staffDetails?.specialty || 'General Medicine',
    });
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email || email,
      role,
      full_name: name,
    },
  };
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

// -----------------------------------------------------------------------------
// PATIENT OPERATIONS
// -----------------------------------------------------------------------------

export async function getMyProfile(): Promise<PatientProfile | null> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return null;

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) return null;

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...profile,
    patient_details: patient || null,
  };
}

export async function updateMyProfile(
  fields: Partial<Patient> & { full_name?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return { success: false, error: 'Not authenticated' };

  if (fields.full_name || fields.phone !== undefined) {
    await supabase
      .from('profiles')
      .update({
        full_name: fields.full_name,
        phone: fields.phone,
      })
      .eq('id', user.id);
  }

  const { error } = await supabase
    .from('patients')
    .upsert({
      id: user.id,
      date_of_birth: fields.date_of_birth,
      gender: fields.gender,
      address: fields.address,
      insurance_provider: fields.insurance_provider,
      insurance_number: fields.insurance_number,
      emergency_contact_name: fields.emergency_contact_name,
      emergency_contact_phone: fields.emergency_contact_phone,
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// -----------------------------------------------------------------------------
// APPOINTMENTS
// -----------------------------------------------------------------------------

export async function getMyAppointments(): Promise<Appointment[]> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      staff:staff_id(
        profiles(full_name),
        title,
        specialty
      )
    `)
    .eq('patient_id', user.id)
    .order('scheduled_at', { ascending: false });

  if (error || !data) return [];
  return data.map((item: any) => ({
    ...item,
    staff: item.staff ? {
      full_name: item.staff.profiles?.full_name || 'Clinic Physician',
      title: item.staff.title,
      specialty: item.staff.specialty,
    } : undefined,
  }));
}

export async function createAppointment(
  scheduledAt: string,
  reason: string,
  staffId?: string
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return { success: false, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      staff_id: staffId || null,
      scheduled_at: scheduledAt,
      reason,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await supabase.from('notifications').insert({
    user_id: user.id,
    message: `Your appointment request for ${new Date(scheduledAt).toLocaleString()} has been received and is pending confirmation.`,
  });

  return { success: true, appointment: data };
}

export async function cancelAppointment(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await supabase.from('notifications').insert({
    user_id: user.id,
    message: 'Your appointment has been cancelled.',
  });

  return { success: true };
}

// -----------------------------------------------------------------------------
// MEDICAL RECORDS
// -----------------------------------------------------------------------------

export async function getMyRecords(): Promise<MedicalRecord[]> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('medical_records')
    .select(`
      *,
      staff:staff_id(
        profiles(full_name),
        title
      )
    `)
    .eq('patient_id', user.id)
    .order('record_date', { ascending: false });

  if (error || !data) return [];
  return data.map((item: any) => ({
    ...item,
    staff: item.staff ? {
      full_name: item.staff.profiles?.full_name || 'Staff Provider',
      title: item.staff.title,
    } : undefined,
  }));
}

// -----------------------------------------------------------------------------
// PRESCRIPTIONS
// -----------------------------------------------------------------------------

export async function getMyPrescriptions(): Promise<Prescription[]> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      *,
      staff:staff_id(
        profiles(full_name),
        title
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((item: any) => ({
    ...item,
    staff: item.staff ? {
      full_name: item.staff.profiles?.full_name || 'Prescribing Physician',
      title: item.staff.title,
    } : undefined,
  }));
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------------------------

export async function getMyNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user || !isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function createNotification(userId: string, message: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await supabase.from('notifications').insert({ user_id: userId, message });
}

// -----------------------------------------------------------------------------
// STAFF OPERATIONS
// -----------------------------------------------------------------------------

export async function getStaffQueue(filterDate?: 'today' | 'all'): Promise<Appointment[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patient_id(
        profiles(full_name, phone)
      ),
      staff:staff_id(
        profiles(full_name),
        title
      )
    `)
    .order('scheduled_at', { ascending: true });

  if (filterDate === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString());
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((item: any) => ({
    ...item,
    patient: {
      full_name: item.patient?.profiles?.full_name || 'Patient',
      phone: item.patient?.profiles?.phone,
    },
    staff: item.staff ? {
      full_name: item.staff.profiles?.full_name || 'Staff Clinician',
      title: item.staff.title,
    } : undefined,
  }));
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Database not configured' };

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  if (data?.patient_id) {
    const readableStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const formattedDate = new Date(data.scheduled_at).toLocaleDateString();
    await createNotification(
      data.patient_id,
      `Your appointment on ${formattedDate} status was updated to: ${readableStatus}.`
    );
  }

  return { success: true };
}

export async function searchPatients(query: string = ''): Promise<(Profile & { patient_details?: Patient })[]> {
  if (!isSupabaseConfigured()) return [];

  const q = query.toLowerCase().trim();
  let req = supabase
    .from('profiles')
    .select(`
      *,
      patient_details:patients(*)
    `)
    .eq('role', 'patient');

  if (q) {
    req = req.ilike('full_name', `%${q}%`);
  }

  const { data, error } = await req;
  if (error || !data) return [];
  return data;
}

export async function getPatientDetail(patientId: string): Promise<{
  profile: Profile;
  patient: Patient | null;
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
} | null> {
  if (!isSupabaseConfigured()) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', patientId)
    .single();

  if (!profile) return null;

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false });

  const { data: records } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('record_date', { ascending: false });

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  return {
    profile,
    patient: patient || null,
    appointments: appointments || [],
    records: records || [],
    prescriptions: prescriptions || [],
  };
}

export async function addRecord(
  patientId: string,
  recordType: MedicalRecordType,
  title: string,
  description?: string,
  file?: File | null
): Promise<{ success: boolean; record?: MedicalRecord; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Database not configured' };

  const staffUser = await getCurrentUser();
  let filePath: string | null = null;

  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('medical-files')
      .upload(fileName, file);

    if (!uploadErr && uploadData) {
      filePath = uploadData.path;
    }
  }

  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      patient_id: patientId,
      staff_id: staffUser?.id || null,
      record_type: recordType,
      title,
      description,
      file_path: filePath,
      record_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await createNotification(
    patientId,
    `A new medical record was added to your chart: ${title}`
  );

  return { success: true, record: data };
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
  if (!isSupabaseConfigured()) return { success: false, error: 'Database not configured' };

  const staffUser = await getCurrentUser();

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: patientId,
      staff_id: staffUser?.id || null,
      medication_name: fields.medication_name,
      dosage: fields.dosage,
      frequency: fields.frequency,
      start_date: fields.start_date || new Date().toISOString().split('T')[0],
      end_date: fields.end_date,
      notes: fields.notes,
      status: 'active',
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await createNotification(
    patientId,
    `A new prescription for ${fields.medication_name} was issued to your chart.`
  );

  return { success: true, prescription: data };
}

export async function getStaffList(): Promise<StaffProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const { data } = await supabase
    .from('staff')
    .select(`
      *,
      profiles(*)
    `);

  if (!data) return [];
  return data.map((s: any) => ({
    ...s.profiles,
    staff_details: {
      id: s.id,
      title: s.title,
      specialty: s.specialty,
      created_at: s.created_at,
    },
  }));
}
