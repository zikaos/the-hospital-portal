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
import {
  INITIAL_STAFF_PROFILES,
  INITIAL_PATIENT_PROFILES,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_NOTIFICATIONS,
} from './mock-data';

// Local storage keys for standalone demo mode
const STORAGE_PREFIX = 'patient_portal_demo_';
const AUTH_USER_KEY = `${STORAGE_PREFIX}current_user`;
const PROFILES_KEY = `${STORAGE_PREFIX}profiles`;
const PATIENTS_KEY = `${STORAGE_PREFIX}patients`;
const APPOINTMENTS_KEY = `${STORAGE_PREFIX}appointments`;
const RECORDS_KEY = `${STORAGE_PREFIX}medical_records`;
const PRESCRIPTIONS_KEY = `${STORAGE_PREFIX}prescriptions`;
const NOTIFICATIONS_KEY = `${STORAGE_PREFIX}notifications`;

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to localStorage key "${key}":`, e);
  }
}

// Ensure demo state exists in local storage
export function initializeDemoData(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(APPOINTMENTS_KEY)) {
    setStored(APPOINTMENTS_KEY, INITIAL_APPOINTMENTS);
  }
  if (!localStorage.getItem(RECORDS_KEY)) {
    setStored(RECORDS_KEY, INITIAL_MEDICAL_RECORDS);
  }
  if (!localStorage.getItem(PRESCRIPTIONS_KEY)) {
    setStored(PRESCRIPTIONS_KEY, INITIAL_PRESCRIPTIONS);
  }
  if (!localStorage.getItem(NOTIFICATIONS_KEY)) {
    setStored(NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(PROFILES_KEY)) {
    const profiles = [
      ...INITIAL_STAFF_PROFILES.map((s) => ({
        id: s.id,
        role: s.role,
        full_name: s.full_name,
        phone: s.phone,
        email: s.email,
        created_at: s.created_at,
      })),
      ...INITIAL_PATIENT_PROFILES.map((p) => ({
        id: p.id,
        role: p.role,
        full_name: p.full_name,
        phone: p.phone,
        email: p.email,
        created_at: p.created_at,
      })),
    ];
    setStored(PROFILES_KEY, profiles);
  }
  if (!localStorage.getItem(PATIENTS_KEY)) {
    const patients = INITIAL_PATIENT_PROFILES.map((p) => p.patient_details);
    setStored(PATIENTS_KEY, patients);
  }
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    role: Role;
    full_name: string;
  };
}

// -----------------------------------------------------------------------------
// AUTH OPERATIONS
// -----------------------------------------------------------------------------

export async function getCurrentUser(): Promise<AuthSession['user'] | null> {
  if (isSupabaseConfigured()) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role as Role,
      full_name: profile.full_name,
    };
  }

  // Fallback / Demo session
  initializeDemoData();
  const demoUser = getStored<AuthSession['user'] | null>(AUTH_USER_KEY, null);
  return demoUser;
}

export async function setDemoUser(user: AuthSession['user'] | null): Promise<void> {
  setStored(AUTH_USER_KEY, user);
}

export const CLINIC_STAFF_PASSCODE = process.env.NEXT_PUBLIC_STAFF_PASSCODE || 'APEX-STAFF-9021';

export async function login(
  email: string,
  password?: string,
  options?: { requireRole?: Role; passcode?: string }
): Promise<{ user: AuthSession['user']; error?: string }> {
  const requireRole = options?.requireRole;
  const passcode = options?.passcode;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });

    if (error) {
      return { user: null as any, error: error.message };
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileErr || !profile) {
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

    const sessionUser = {
      id: data.user.id,
      email: data.user.email || email,
      role: userRole,
      full_name: profile.full_name,
    };

    setStored(AUTH_USER_KEY, sessionUser);
    return { user: sessionUser };
  }

  // Demo fallback authentication
  initializeDemoData();
  const lowerEmail = email.toLowerCase().trim();

  // Check staff demo accounts
  const staff = INITIAL_STAFF_PROFILES.find((s) => s.email?.toLowerCase() === lowerEmail);
  if (staff) {
    if (requireRole === 'patient') {
      return {
        user: null as any,
        error: 'Staff accounts cannot sign in through the public patient portal. Please use the private internal staff entrance.',
      };
    }
    if (passcode !== CLINIC_STAFF_PASSCODE) {
      return {
        user: null as any,
        error: 'Invalid Clinic Security Passcode. Access to the staff portal is restricted.',
      };
    }

    const sessionUser = {
      id: staff.id,
      email: staff.email || email,
      role: 'staff' as Role,
      full_name: staff.full_name,
    };
    setStored(AUTH_USER_KEY, sessionUser);
    return { user: sessionUser };
  }

  // Check patient demo accounts or created patients
  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  const found = profiles.find((p) => p.email?.toLowerCase() === lowerEmail);
  if (found) {
    if (requireRole === 'patient' && found.role === 'staff') {
      return {
        user: null as any,
        error: 'Staff accounts cannot sign in through the public patient portal. Please use the private internal staff entrance.',
      };
    }
    if (requireRole === 'staff' && found.role !== 'staff') {
      return {
        user: null as any,
        error: 'This account does not have staff privileges.',
      };
    }
    if (found.role === 'staff' && passcode !== CLINIC_STAFF_PASSCODE) {
      return {
        user: null as any,
        error: 'Invalid Clinic Security Passcode.',
      };
    }

    const sessionUser = {
      id: found.id,
      email: found.email || email,
      role: found.role,
      full_name: found.full_name,
    };
    setStored(AUTH_USER_KEY, sessionUser);
    return { user: sessionUser };
  }

  // Fallback for newly entered email
  if (requireRole === 'staff') {
    if (passcode !== CLINIC_STAFF_PASSCODE) {
      return {
        user: null as any,
        error: 'Invalid Clinic Security Passcode.',
      };
    }
    const sessionUser = {
      id: INITIAL_STAFF_PROFILES[0].id,
      email: lowerEmail,
      role: 'staff' as Role,
      full_name: INITIAL_STAFF_PROFILES[0].full_name,
    };
    setStored(AUTH_USER_KEY, sessionUser);
    return { user: sessionUser };
  }

  // Default patient login
  const sessionUser = {
    id: INITIAL_PATIENT_PROFILES[0].id,
    email: lowerEmail,
    role: 'patient' as Role,
    full_name: INITIAL_PATIENT_PROFILES[0].full_name,
  };
  setStored(AUTH_USER_KEY, sessionUser);
  return { user: sessionUser };
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
  staffPasscode?: string
): Promise<{ user: AuthSession['user']; error?: string }> {
  const name = fullName || email.split('@')[0];

  // Disallow staff registration unless valid administrative clinic passcode is provided
  if (role === 'staff') {
    if (staffPasscode !== CLINIC_STAFF_PASSCODE) {
      return {
        user: null as any,
        error: 'Unauthorized. Staff accounts can only be provisioned by administrators with a valid Clinic Passcode.',
      };
    }
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || 'Password123!',
      options: {
        data: {
          full_name: name,
          role,
        },
      },
    });

    if (error) {
      return { user: null as any, error: error.message };
    }

    if (!data.user) {
      return { user: null as any, error: 'Registration failed.' };
    }

    // Insert into profiles
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      role,
      full_name: name,
    });

    if (profileError) {
      console.warn('Profile insert note:', profileError.message);
    }

    // If patient, insert initial patient row
    if (role === 'patient') {
      await supabase.from('patients').insert({
        id: data.user.id,
      });
    }

    const sessionUser = {
      id: data.user.id,
      email: data.user.email || email,
      role,
      full_name: name,
    };

    setStored(AUTH_USER_KEY, sessionUser);
    return { user: sessionUser };
  }

  // Standalone demo mode sign-up
  initializeDemoData();
  const newId = `p_demo_${Date.now()}`;
  const sessionUser = {
    id: newId,
    email,
    role,
    full_name: name,
  };

  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  profiles.push({
    id: newId,
    role,
    full_name: name,
    email,
    created_at: new Date().toISOString(),
  });
  setStored(PROFILES_KEY, profiles);

  if (role === 'patient') {
    const patients = getStored<Patient[]>(PATIENTS_KEY, []);
    patients.push({
      id: newId,
      created_at: new Date().toISOString(),
    });
    setStored(PATIENTS_KEY, patients);
  }

  setStored(AUTH_USER_KEY, sessionUser);
  return { user: sessionUser };
}

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

// -----------------------------------------------------------------------------
// PATIENT OPERATIONS
// -----------------------------------------------------------------------------

export async function getMyProfile(): Promise<PatientProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  if (isSupabaseConfigured()) {
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

  initializeDemoData();
  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  const patients = getStored<Patient[]>(PATIENTS_KEY, []);

  const profile = profiles.find((p) => p.id === user.id) || {
    id: user.id,
    role: user.role,
    full_name: user.full_name,
    email: user.email,
    created_at: new Date().toISOString(),
  };

  const patient = patients.find((p) => p.id === user.id) || null;

  return {
    ...profile,
    patient_details: patient,
  };
}

export async function updateMyProfile(fields: Partial<Patient> & { full_name?: string; phone?: string }): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  const profileIndex = profiles.findIndex((p) => p.id === user.id);
  if (profileIndex >= 0) {
    if (fields.full_name) profiles[profileIndex].full_name = fields.full_name;
    if (fields.phone !== undefined) profiles[profileIndex].phone = fields.phone;
    setStored(PROFILES_KEY, profiles);
  }

  const patients = getStored<Patient[]>(PATIENTS_KEY, []);
  const patientIndex = patients.findIndex((p) => p.id === user.id);
  const updatedData: Patient = {
    id: user.id,
    date_of_birth: fields.date_of_birth,
    gender: fields.gender,
    address: fields.address,
    insurance_provider: fields.insurance_provider,
    insurance_number: fields.insurance_number,
    emergency_contact_name: fields.emergency_contact_name,
    emergency_contact_phone: fields.emergency_contact_phone,
    created_at: new Date().toISOString(),
  };

  if (patientIndex >= 0) {
    patients[patientIndex] = { ...patients[patientIndex], ...updatedData };
  } else {
    patients.push(updatedData);
  }
  setStored(PATIENTS_KEY, patients);

  return { success: true };
}

// -----------------------------------------------------------------------------
// APPOINTMENTS
// -----------------------------------------------------------------------------

export async function getMyAppointments(): Promise<Appointment[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured()) {
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

  initializeDemoData();
  const appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, []);
  return appointments
    .filter((a) => a.patient_id === user.id)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
}

export async function createAppointment(
  scheduledAt: string,
  reason: string,
  staffId?: string
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  if (isSupabaseConfigured()) {
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

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      message: `Your appointment request for ${new Date(scheduledAt).toLocaleString()} has been received and is pending confirmation.`,
    });

    return { success: true, appointment: data };
  }

  // Demo fallback
  initializeDemoData();
  const newAppointment: Appointment = {
    id: `apt_demo_${Date.now()}`,
    patient_id: user.id,
    staff_id: staffId || INITIAL_STAFF_PROFILES[0].id,
    scheduled_at: scheduledAt,
    reason,
    status: 'pending',
    created_at: new Date().toISOString(),
    patient: {
      full_name: user.full_name,
      email: user.email,
    },
    staff: {
      full_name: INITIAL_STAFF_PROFILES.find((s) => s.id === staffId)?.full_name || INITIAL_STAFF_PROFILES[0].full_name,
      title: INITIAL_STAFF_PROFILES.find((s) => s.id === staffId)?.staff_details.title || 'Clinician',
    },
  };

  const list = getStored<Appointment[]>(APPOINTMENTS_KEY, []);
  list.unshift(newAppointment);
  setStored(APPOINTMENTS_KEY, list);

  // In-app notification
  await createNotification(
    user.id,
    `Your appointment request for ${new Date(scheduledAt).toLocaleString()} was received and is pending staff review.`
  );

  return { success: true, appointment: newAppointment };
}

export async function cancelAppointment(id: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const list = getStored<Appointment[]>(APPOINTMENTS_KEY, []);
  const target = list.find((a) => a.id === id);
  if (target) {
    target.status = 'cancelled';
    setStored(APPOINTMENTS_KEY, list);

    await createNotification(target.patient_id, 'Your appointment has been cancelled.');
  }
  return { success: true };
}

// -----------------------------------------------------------------------------
// MEDICAL RECORDS
// -----------------------------------------------------------------------------

export async function getMyRecords(): Promise<MedicalRecord[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured()) {
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

  initializeDemoData();
  const records = getStored<MedicalRecord[]>(RECORDS_KEY, []);
  return records
    .filter((r) => r.patient_id === user.id)
    .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());
}

// -----------------------------------------------------------------------------
// PRESCRIPTIONS
// -----------------------------------------------------------------------------

export async function getMyPrescriptions(): Promise<Prescription[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured()) {
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

  initializeDemoData();
  const prescriptions = getStored<Prescription[]>(PRESCRIPTIONS_KEY, []);
  return prescriptions
    .filter((p) => p.patient_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------------------------

export async function getMyNotifications(): Promise<Notification[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  }

  initializeDemoData();
  const list = getStored<Notification[]>(NOTIFICATIONS_KEY, []);
  return list
    .filter((n) => n.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function markNotificationRead(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    return;
  }

  initializeDemoData();
  const list = getStored<Notification[]>(NOTIFICATIONS_KEY, []);
  const item = list.find((n) => n.id === id);
  if (item) {
    item.is_read = true;
    setStored(NOTIFICATIONS_KEY, list);
  }
}

export async function createNotification(userId: string, message: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from('notifications').insert({ user_id: userId, message });
    return;
  }

  initializeDemoData();
  const list = getStored<Notification[]>(NOTIFICATIONS_KEY, []);
  list.unshift({
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user_id: userId,
    message,
    is_read: false,
    created_at: new Date().toISOString(),
  });
  setStored(NOTIFICATIONS_KEY, list);
}

// -----------------------------------------------------------------------------
// STAFF OPERATIONS
// -----------------------------------------------------------------------------

export async function getStaffQueue(filterDate?: 'today' | 'all'): Promise<Appointment[]> {
  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, []);
  const todayStr = new Date().toISOString().split('T')[0];

  return appointments
    .filter((a) => {
      if (filterDate === 'today') {
        return a.scheduled_at.startsWith(todayStr);
      }
      return true;
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, []);
  const item = appointments.find((a) => a.id === id);
  if (item) {
    item.status = status;
    setStored(APPOINTMENTS_KEY, appointments);

    const readableStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const formattedDate = new Date(item.scheduled_at).toLocaleDateString();
    await createNotification(
      item.patient_id,
      `Your appointment on ${formattedDate} has been ${readableStatus.toLowerCase()}.`
    );
  }

  return { success: true };
}

export async function searchPatients(query: string = ''): Promise<(Profile & { patient_details?: Patient })[]> {
  const q = query.toLowerCase().trim();

  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  const patients = getStored<Patient[]>(PATIENTS_KEY, []);

  const patientProfiles = profiles.filter((p) => p.role === 'patient');

  const filtered = patientProfiles.filter((p) => {
    if (!q) return true;
    const nameMatch = p.full_name.toLowerCase().includes(q);
    const phoneMatch = p.phone ? p.phone.toLowerCase().includes(q) : false;
    const emailMatch = p.email ? p.email.toLowerCase().includes(q) : false;
    return nameMatch || phoneMatch || emailMatch;
  });

  return filtered.map((p) => ({
    ...p,
    patient_details: patients.find((pt) => pt.id === p.id),
  }));
}

export async function getPatientDetail(patientId: string): Promise<{
  profile: Profile;
  patient: Patient | null;
  appointments: Appointment[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
} | null> {
  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const profiles = getStored<Profile[]>(PROFILES_KEY, []);
  const profile = profiles.find((p) => p.id === patientId);
  if (!profile) return null;

  const patients = getStored<Patient[]>(PATIENTS_KEY, []);
  const patient = patients.find((p) => p.id === patientId) || null;

  const appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, [])
    .filter((a) => a.patient_id === patientId)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const records = getStored<MedicalRecord[]>(RECORDS_KEY, [])
    .filter((r) => r.patient_id === patientId)
    .sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());

  const prescriptions = getStored<Prescription[]>(PRESCRIPTIONS_KEY, [])
    .filter((p) => p.patient_id === patientId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    profile,
    patient,
    appointments,
    records,
    prescriptions,
  };
}

export async function addRecord(
  patientId: string,
  recordType: MedicalRecordType,
  title: string,
  description?: string,
  file?: File | null
): Promise<{ success: boolean; record?: MedicalRecord; error?: string }> {
  const staffUser = await getCurrentUser();
  let filePath: string | null = null;

  if (file && isSupabaseConfigured()) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('medical-files')
      .upload(fileName, file);

    if (!uploadErr && uploadData) {
      filePath = uploadData.path;
    }
  } else if (file) {
    filePath = file.name;
  }

  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const newRecord: MedicalRecord = {
    id: `rec_demo_${Date.now()}`,
    patient_id: patientId,
    staff_id: staffUser?.id || INITIAL_STAFF_PROFILES[0].id,
    record_type: recordType,
    title,
    description,
    file_path: filePath,
    record_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    staff: {
      full_name: staffUser?.full_name || INITIAL_STAFF_PROFILES[0].full_name,
      title: 'Attending Clinician',
    },
  };

  const records = getStored<MedicalRecord[]>(RECORDS_KEY, []);
  records.unshift(newRecord);
  setStored(RECORDS_KEY, records);

  await createNotification(patientId, `A new medical record was added to your chart: ${title}`);
  return { success: true, record: newRecord };
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
  const staffUser = await getCurrentUser();

  if (isSupabaseConfigured()) {
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

  // Demo fallback
  initializeDemoData();
  const newPrescription: Prescription = {
    id: `rx_demo_${Date.now()}`,
    patient_id: patientId,
    staff_id: staffUser?.id || INITIAL_STAFF_PROFILES[0].id,
    medication_name: fields.medication_name,
    dosage: fields.dosage,
    frequency: fields.frequency,
    start_date: fields.start_date || new Date().toISOString().split('T')[0],
    end_date: fields.end_date,
    status: 'active',
    notes: fields.notes,
    created_at: new Date().toISOString(),
    staff: {
      full_name: staffUser?.full_name || INITIAL_STAFF_PROFILES[0].full_name,
      title: 'Prescribing Clinician',
    },
  };

  const list = getStored<Prescription[]>(PRESCRIPTIONS_KEY, []);
  list.unshift(newPrescription);
  setStored(PRESCRIPTIONS_KEY, list);

  await createNotification(
    patientId,
    `A new prescription for ${fields.medication_name} was added to your profile.`
  );

  return { success: true, prescription: newPrescription };
}

export async function getStaffList(): Promise<StaffProfile[]> {
  if (isSupabaseConfigured()) {
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

  return INITIAL_STAFF_PROFILES;
}
