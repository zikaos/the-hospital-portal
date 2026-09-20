-- ==============================================================================
-- PATIENT PORTAL PROTOTYPE — SEED DEMO DATA
-- ==============================================================================

-- Clean existing demo data if needed
delete from notifications;
delete from prescriptions;
delete from medical_records;
delete from appointments;
delete from patients;
delete from staff;
delete from profiles;

-- 1. PROFILES
-- Staff 1: Dr. Marcus Vance
insert into profiles (id, role, full_name, phone, created_at)
values ('d0000000-0000-0000-0000-000000000001', 'staff', 'Dr. Marcus Vance, MD', '(555) 234-5678', now() - interval '90 days');

-- Staff 2: Nurse Elena Rostova
insert into profiles (id, role, full_name, phone, created_at)
values ('d0000000-0000-0000-0000-000000000002', 'staff', 'Nurse Elena Rostova, RN', '(555) 345-6789', now() - interval '90 days');

-- Patient 1: Sarah Chen
insert into profiles (id, role, full_name, phone, created_at)
values ('p0000000-0000-0000-0000-000000000001', 'patient', 'Sarah Chen', '(555) 987-6543', now() - interval '60 days');

-- Patient 2: David Miller
insert into profiles (id, role, full_name, phone, created_at)
values ('p0000000-0000-0000-0000-000000000002', 'patient', 'David Miller', '(555) 876-5432', now() - interval '45 days');

-- Patient 3: Maya Lin
insert into profiles (id, role, full_name, phone, created_at)
values ('p0000000-0000-0000-0000-000000000003', 'patient', 'Maya Lin', '(555) 765-4321', now() - interval '30 days');

-- 2. STAFF METADATA
insert into staff (id, title, specialty, created_at)
values 
  ('d0000000-0000-0000-0000-000000000001', 'Cardiologist', 'Cardiology & Preventive Medicine', now() - interval '90 days'),
  ('d0000000-0000-0000-0000-000000000002', 'Lead Nurse Practitioner', 'Family Medicine & Triage', now() - interval '90 days');

-- 3. PATIENTS METADATA
insert into patients (id, date_of_birth, gender, address, insurance_provider, insurance_number, emergency_contact_name, emergency_contact_phone, created_at)
values
  ('p0000000-0000-0000-0000-000000000001', '1992-04-15', 'Female', '742 Evergreen Terrace, Springfield, OR', 'Blue Cross Blue Shield', 'BCBS-9982410-01', 'Michael Chen (Spouse)', '(555) 987-6544', now() - interval '60 days'),
  ('p0000000-0000-0000-0000-000000000002', '1984-11-23', 'Male', '1004 Pinecrest Blvd, Portland, OR', 'Aetna Health Care', 'AET-4432190-02', 'Jessica Miller (Sister)', '(555) 876-5433', now() - interval '45 days'),
  ('p0000000-0000-0000-0000-000000000003', '1998-08-30', 'Female', '52 Elmwood Avenue, Eugene, OR', 'UnitedHealthcare', 'UHC-7712390-01', 'Robert Lin (Father)', '(555) 765-4322', now() - interval '30 days');

-- 4. APPOINTMENTS
insert into appointments (id, patient_id, staff_id, scheduled_at, reason, status, notes, created_at)
values
  -- Today's appointments (queue for staff dashboard)
  ('a0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', date_trunc('day', now()) + interval '10 hours', 'Follow-up for mild chest discomfort and lipid panel review', 'pending', 'Patient requested Dr. Vance for cardiac follow-up', now() - interval '3 days'),
  ('a0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', date_trunc('day', now()) + interval '14 hours', 'Hypertension medication adjustment and blood pressure check', 'confirmed', 'BP was elevated on home log last week', now() - interval '5 days'),
  -- Tomorrow / Upcoming
  ('a0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002', date_trunc('day', now()) + interval '1 day 11 hours', 'Annual wellness exam and preventive screening', 'pending', 'Routine preventative visit', now() - interval '2 days'),
  -- Past completed
  ('a0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', now() - interval '30 days', 'Initial Cardiology Consultation & resting EKG', 'completed', 'Resting EKG normal. Ordered lipid panel and recommended lifestyle adjustments.', now() - interval '35 days');

-- 5. MEDICAL RECORDS
insert into medical_records (id, patient_id, staff_id, record_type, title, description, file_path, record_date, created_at)
values
  ('m0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'lab_result', 'Comprehensive Metabolic & Lipid Panel', 'Total Cholesterol: 198 mg/dL, HDL: 56 mg/dL, LDL: 118 mg/dL, Triglycerides: 120 mg/dL, Fasting Glucose: 88 mg/dL. All electrolytes within normal reference limits.', 'sarah_chen_lipid_panel_2026.pdf', current_date - interval '25 days', now() - interval '25 days'),
  ('m0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'visit_summary', 'Cardiology Consultation Visit Summary', 'Patient presented for assessment of transient palpitations. Auscultation clear, regular rhythm, no murmurs. Advised moderate aerobic exercise and prescribed low-dose beta blocker as needed.', null, current_date - interval '30 days', now() - interval '30 days'),
  ('m0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'diagnosis', 'Mild Exercise-Induced Bronchospasm', 'Pulmonary function test demonstrates mild reversible airway obstruction. Clinically consistent with mild asthma triggered by cold weather and exertion.', null, current_date - interval '45 days', now() - interval '45 days'),
  ('m0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'lab_result', 'Hemoglobin A1c & Complete Blood Count', 'HbA1c: 5.4% (Normal). WBC: 6.8 K/uL, RBC: 4.6 M/uL, Platelets: 245 K/uL.', null, current_date - interval '20 days', now() - interval '20 days');

-- 6. PRESCRIPTIONS
insert into prescriptions (id, patient_id, staff_id, medication_name, dosage, frequency, start_date, end_date, status, notes, created_at)
values
  ('r0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Albuterol HFA 90mcg Inhaler', '1-2 puffs', 'Every 4-6 hours as needed for shortness of breath', current_date - interval '45 days', current_date + interval '180 days', 'active', 'Use 15 minutes before strenuous exercise if needed.', now() - interval '45 days'),
  ('r0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Atorvastatin', '10mg oral tablet', 'Once daily at bedtime', current_date - interval '25 days', current_date + interval '90 days', 'active', 'Take with or without food. Avoid excessive grapefruit consumption.', now() - interval '25 days'),
  ('r0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Amoxicillin', '500mg capsule', 'Three times daily for 10 days', current_date - interval '60 days', current_date - interval '50 days', 'completed', 'Completed course for mild respiratory infection.', now() - interval '60 days'),
  ('r0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Lisinopril', '20mg oral tablet', 'Once daily in the morning', current_date - interval '90 days', current_date + interval '90 days', 'active', 'Monitor blood pressure weekly and record in health diary.', now() - interval '90 days');

-- 7. NOTIFICATIONS
insert into notifications (id, user_id, message, is_read, created_at)
values
  ('n0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Your appointment on today at 10:00 AM has been scheduled and is pending confirmation.', false, now() - interval '3 hours'),
  ('n0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'Dr. Marcus Vance uploaded a new lab result: Comprehensive Metabolic & Lipid Panel.', false, now() - interval '2 days'),
  ('n0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'Your prescription for Atorvastatin 10mg was sent to your registered pharmacy.', true, now() - interval '25 days');
