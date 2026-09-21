export type Role = 'patient' | 'staff';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone?: string | null;
  created_at: string;
  email?: string;
}

export interface Patient {
  id: string;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  created_at: string;
}

export interface PatientProfile extends Profile {
  patient_details?: Patient | null;
}

interface Staff {
  id: string;
  title?: string | null;
  specialty?: string | null;
  created_at: string;
}

export interface StaffProfile extends Profile {
  staff_details?: Staff | null;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  staff_id?: string | null;
  scheduled_at: string;
  reason?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  created_at: string;
  // Joined relation fields
  patient?: {
    full_name: string;
    phone?: string | null;
    email?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
    insurance_provider?: string | null;
  };
  staff?: {
    full_name: string;
    title?: string | null;
    specialty?: string | null;
  };
}

export type MedicalRecordType = 'lab_result' | 'diagnosis' | 'visit_summary';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  staff_id?: string | null;
  record_type: MedicalRecordType;
  title: string;
  description?: string | null;
  file_path?: string | null;
  record_date: string;
  created_at: string;
  staff?: {
    full_name: string;
    title?: string | null;
  };
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Prescription {
  id: string;
  patient_id: string;
  staff_id?: string | null;
  medication_name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: PrescriptionStatus;
  notes?: string | null;
  created_at: string;
  staff?: {
    full_name: string;
    title?: string | null;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
