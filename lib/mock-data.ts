import { Profile, Patient, Staff, Appointment, MedicalRecord, Prescription, Notification } from './types';

export const INITIAL_STAFF_PROFILES: (Profile & { staff_details: Staff })[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    email: 'dr.vance@clinic.demo',
    role: 'staff',
    full_name: 'Dr. Marcus Vance, MD',
    phone: '(555) 234-5678',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    staff_details: {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Cardiologist',
      specialty: 'Cardiology & Internal Medicine',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    email: 'nurse.rostova@clinic.demo',
    role: 'staff',
    full_name: 'Nurse Elena Rostova, RN',
    phone: '(555) 345-6789',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    staff_details: {
      id: 'd0000000-0000-0000-0000-000000000002',
      title: 'Lead Nurse Practitioner',
      specialty: 'Family Medicine & Clinical Triage',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  },
];

export const INITIAL_PATIENT_PROFILES: (Profile & { patient_details: Patient })[] = [
  {
    id: 'p0000000-0000-0000-0000-000000000001',
    email: 'sarah.chen@example.com',
    role: 'patient',
    full_name: 'Sarah Chen',
    phone: '(555) 987-6543',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    patient_details: {
      id: 'p0000000-0000-0000-0000-000000000001',
      date_of_birth: '1992-04-15',
      gender: 'Female',
      address: '742 Evergreen Terrace, Springfield, OR',
      insurance_provider: 'Blue Cross Blue Shield',
      insurance_number: 'BCBS-9982410-01',
      emergency_contact_name: 'Michael Chen (Spouse)',
      emergency_contact_phone: '(555) 987-6544',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000002',
    email: 'david.miller@example.com',
    role: 'patient',
    full_name: 'David Miller',
    phone: '(555) 876-5432',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    patient_details: {
      id: 'p0000000-0000-0000-0000-000000000002',
      date_of_birth: '1984-11-23',
      gender: 'Male',
      address: '1004 Pinecrest Blvd, Portland, OR',
      insurance_provider: 'Aetna Health Care',
      insurance_number: 'AET-4432190-02',
      emergency_contact_name: 'Jessica Miller (Sister)',
      emergency_contact_phone: '(555) 876-5433',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
  },
  {
    id: 'p0000000-0000-0000-0000-000000000003',
    email: 'maya.lin@example.com',
    role: 'patient',
    full_name: 'Maya Lin',
    phone: '(555) 765-4321',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    patient_details: {
      id: 'p0000000-0000-0000-0000-000000000003',
      date_of_birth: '1998-08-30',
      gender: 'Female',
      address: '52 Elmwood Avenue, Eugene, OR',
      insurance_provider: 'UnitedHealthcare',
      insurance_number: 'UHC-7712390-01',
      emergency_contact_name: 'Robert Lin (Father)',
      emergency_contact_phone: '(555) 765-4322',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  },
];

const today = new Date();
const todayAt = (hours: number, minutes = 0) => {
  const d = new Date(today);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const tomorrowAt = (hours: number, minutes = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + 1);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    scheduled_at: todayAt(10, 0),
    reason: 'Follow-up consultation for mild chest tightness and lipid panel review',
    status: 'pending',
    notes: 'Patient requested Dr. Vance for cardiac follow-up',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    patient: {
      full_name: 'Sarah Chen',
      phone: '(555) 987-6543',
      email: 'sarah.chen@example.com',
      date_of_birth: '1992-04-15',
      gender: 'Female',
      insurance_provider: 'Blue Cross Blue Shield',
    },
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
      specialty: 'Cardiology & Internal Medicine',
    },
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    patient_id: 'p0000000-0000-0000-0000-000000000002',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    scheduled_at: todayAt(14, 30),
    reason: 'Hypertension medication adjustment and blood pressure review',
    status: 'confirmed',
    notes: 'Home blood pressure log showed elevated systolic pressures',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    patient: {
      full_name: 'David Miller',
      phone: '(555) 876-5432',
      email: 'david.miller@example.com',
      date_of_birth: '1984-11-23',
      gender: 'Male',
      insurance_provider: 'Aetna Health Care',
    },
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
      specialty: 'Cardiology & Internal Medicine',
    },
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    patient_id: 'p0000000-0000-0000-0000-000000000003',
    staff_id: 'd0000000-0000-0000-0000-000000000002',
    scheduled_at: tomorrowAt(11, 0),
    reason: 'Annual preventive wellness exam and seasonal allergy review',
    status: 'pending',
    notes: 'First time visit at this clinic location',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    patient: {
      full_name: 'Maya Lin',
      phone: '(555) 765-4321',
      email: 'maya.lin@example.com',
      date_of_birth: '1998-08-30',
      gender: 'Female',
      insurance_provider: 'UnitedHealthcare',
    },
    staff: {
      full_name: 'Nurse Elena Rostova, RN',
      title: 'Lead Nurse Practitioner',
      specialty: 'Family Medicine & Clinical Triage',
    },
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    scheduled_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    reason: 'Initial Cardiology Consultation & Resting EKG',
    status: 'completed',
    notes: 'Resting EKG normal. Ordered lipid panel and recommended lifestyle adjustments.',
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    patient: {
      full_name: 'Sarah Chen',
      phone: '(555) 987-6543',
      email: 'sarah.chen@example.com',
    },
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'm0000000-0000-0000-0000-000000000001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    record_type: 'lab_result',
    title: 'Comprehensive Metabolic & Lipid Panel',
    description: 'Total Cholesterol: 198 mg/dL, HDL: 56 mg/dL, LDL: 118 mg/dL, Triglycerides: 120 mg/dL, Fasting Glucose: 88 mg/dL. Electrolytes (Na, K, Cl) within normal reference limits. Liver and kidney function normal.',
    file_path: 'sarah_chen_lipid_panel_2026.pdf',
    record_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
  {
    id: 'm0000000-0000-0000-0000-000000000002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    record_type: 'visit_summary',
    title: 'Cardiology Consultation Visit Summary',
    description: 'Patient presented for assessment of transient palpitations during exercise. Auscultation clear, regular rhythm, no cardiac murmurs. Resting EKG was normal sinus rhythm. Advised moderate aerobic exercise and prescribed low-dose beta blocker as needed.',
    file_path: null,
    record_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
  {
    id: 'm0000000-0000-0000-0000-000000000003',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    record_type: 'diagnosis',
    title: 'Mild Exercise-Induced Bronchospasm',
    description: 'Spirometry and clinical presentation demonstrate mild reversible airway reactivity with cold dry air and heavy exertion. Recommended pre-exercise albuterol.',
    file_path: null,
    record_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    medication_name: 'Albuterol HFA 90mcg Inhaler',
    dosage: '1-2 puffs',
    frequency: 'Every 4-6 hours as needed for shortness of breath',
    start_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    status: 'active',
    notes: 'Inhale 15 minutes before strenuous aerobic exercise.',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
  {
    id: 'r0000000-0000-0000-0000-000000000002',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    medication_name: 'Atorvastatin',
    dosage: '10mg oral tablet',
    frequency: 'Once daily at bedtime',
    start_date: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    status: 'active',
    notes: 'Take with or without food. Avoid excessive grapefruit consumption.',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
  {
    id: 'r0000000-0000-0000-0000-000000000003',
    patient_id: 'p0000000-0000-0000-0000-000000000001',
    staff_id: 'd0000000-0000-0000-0000-000000000001',
    medication_name: 'Amoxicillin',
    dosage: '500mg capsule',
    frequency: 'Three times daily for 10 days',
    start_date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
    end_date: new Date(Date.now() - 50 * 86400000).toISOString().split('T')[0],
    status: 'completed',
    notes: 'Completed full course for mild upper respiratory tract infection.',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    staff: {
      full_name: 'Dr. Marcus Vance, MD',
      title: 'Cardiologist',
    },
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n0000000-0000-0000-0000-000000000001',
    user_id: 'p0000000-0000-0000-0000-000000000001',
    message: 'Your appointment today at 10:00 AM has been requested and is awaiting staff confirmation.',
    is_read: false,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'n0000000-0000-0000-0000-000000000002',
    user_id: 'p0000000-0000-0000-0000-000000000001',
    message: 'Dr. Marcus Vance uploaded a new lab report: Comprehensive Metabolic & Lipid Panel.',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'n0000000-0000-0000-0000-000000000003',
    user_id: 'p0000000-0000-0000-0000-000000000001',
    message: 'Your prescription for Atorvastatin 10mg was approved and submitted to your pharmacy.',
    is_read: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];
