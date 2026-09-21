# The Hospital Portal

A modern clinical **Hospital Portal** built with Next.js 14 (App Router), TypeScript, Tailwind CSS (ThaiCloud Design System), and a Supabase PostgreSQL backend architecture with Row Level Security (RLS).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Documentation & Guides
- **[Customer Portal & Credentials Guide (PDF)](docs/The_Hospital_Portal_Customer_Guide.pdf)**: Portal access, credentials, Arabic/English switching, and patient/staff workflows.
- **[Non-Technical User & Patient Guide (PDF)](docs/The_Hospital_Portal_User_Guide.pdf)**: Step-by-step patient journey, appointment scheduling, and FAQ.
- **[Technical Architecture & Workflow Specification (PDF)](docs/The_Hospital_Portal_Technical_Architecture.pdf)**: System topology, PostgreSQL RLS model, dual-mode persistence, and security controls.

---

## 1. Features Overview

### Patient Self-Service
- **Authentication**: Sign up and login with role-isolated credentials.
- **Demographic & Clinical Profile**: Update contact details, emergency contacts, and insurance provider/policy ID (`/patient/profile`).
- **Appointment Scheduling**: Real-time consultation booking with date/time pickers and clinician selection; instant cancellation with status tracking (`/patient/appointments`).
- **Electronic Medical Records**: Diagnostic lab panels, consultation visit summaries, and clinical diagnoses with file downloads (`/patient/records`).
- **Prescriptions & Regimen**: Clear categorization between active medications and completed courses (`/patient/prescriptions`).
- **In-App Notifications**: Real-time updates whenever appointment statuses change or records are uploaded.

### Staff Clinical Workspace
- **Triage Appointment Queue**: Live queue for today's visits with 1-click status actions: **Confirm**, **Complete**, or **Cancel** (`/staff/dashboard`).
- **Searchable Patient Directory**: Fast lookup across patient names, telephone numbers, and insurance policies (`/staff/patients`).
- **Comprehensive Patient Chart**: Unified view of patient demographics, medical history, records, and prescriptions (`/staff/patients/[id]`).
- **Author Medical Records**: Modal with document attachment support (`medical-files` Supabase storage bucket).
- **Issue Prescriptions**: Fast electronic prescription form with dosage, dosing frequency, and clinical notes.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript | Modern, full-stack, typed architecture with edge middleware and server/client components. |
| **Styling** | Tailwind CSS + Accessible Primitives | Medical-grade styling with accessible tap targets, contrast ratios, and clean card layouts. |
| **Icons** | Lucide React | Standard, clinical icon set. |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage) | Integrated RLS security policies, auth sessions, and bucket storage. |
| **Demo Mode** | Dual-Engine Provider (`lib/api.ts`) | Works out of the box in standalone demo mode, or connects to live Supabase cloud. |

---

## 3. Quick Start

### A. Run Immediately (Instant Demo Mode)
The prototype includes pre-configured realistic clinical demo fixtures (`Dr. Marcus Vance, MD`, `Sarah Chen`, `David Miller`). You can run it instantly without creating a database:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Demo Patient View**: Click **"Launch Demo as Patient"** or sign in with `sarah.chen@example.com` (`password123`).
- **Demo Staff View**: Click **"Launch Demo as Staff Doctor"** or sign in with `dr.vance@clinic.demo` (`password123`).
- **1-Click Role Switcher**: Use the top prototype banner to toggle between Doctor and Patient views during demonstrations.

---

### B. Connect to Live Supabase Project

1. Create a free project on [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard:
   - Run the contents of `supabase/schema.sql` (creates all tables, RLS policies, and storage buckets).
   - Run the contents of `supabase/seed.sql` (populates demo doctors, patients, and initial records).
3. Create your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart your development server: `npm run dev`.

---

## 4. Database Schema & Row Level Security (RLS)

All database operations enforce strict Row Level Security policies:

```
[Browser Client]
       │
       ▼
[Next.js App Router (app/)]
   ├── / (Landing & Role Switcher / Demo Login)
   ├── /(auth)/login & /(auth)/signup
   ├── /patient/* (Dashboard, Profile, Appointments, Records, Prescriptions)
   └── /staff/* (Dashboard Queue, Patient Directory, Patient Chart [id])
       │
       ├── Supabase Client (@supabase/supabase-js & @supabase/ssr)
       ▼
[Supabase Backend / Postgres]
   ├── profiles (id references auth.users, role: 'patient' | 'staff', full_name, phone)
   ├── patients (id references profiles, DOB, gender, address, insurance_provider, insurance_number, emergency_contact)
   ├── staff (id references profiles, title, specialty)
   ├── appointments (id, patient_id, staff_id, scheduled_at, reason, status: 'pending'|'confirmed'|'completed'|'cancelled')
   ├── medical_records (id, patient_id, staff_id, record_type, title, description, file_path, record_date)
   ├── prescriptions (id, patient_id, staff_id, medication_name, dosage, frequency, dates, status: 'active'|'completed'|'cancelled')
   ├── notifications (id, user_id, message, is_read)
   └── storage.buckets (bucket_id: 'medical-files')
```

### RLS Policies
- **Patients**: Can select and update only their own row in `profiles`, `patients`, `appointments`, `medical_records`, `prescriptions`, and `notifications`.
- **Staff**: Authorized to read all patient demographic rows, manage all appointments in the clinic queue, and create medical records/prescriptions.

---

## 5. Staff Access Restriction & Security Isolation

To prevent unauthorized public users from creating or logging into clinical staff accounts:

1. **Public Site is 100% Patient-Facing**:
   - `/signup` only registers patients. Public staff self-registration is permanently disabled.
   - `/login` only allows patients. Attempting to log in with a staff account redirects with an access denial notice.
2. **Private Staff Gateway (`/staff-portal`)**:
   - Staff members must access the portal through the dedicated, private `/staff-portal` gateway.
   - Authentication requires **both** staff credentials AND a **Clinic Security Passcode** (`APEX-STAFF-9021`).
   - Requests directly hitting `/staff/*` without verified staff authentication are automatically redirected to `/staff-portal`.

---

## 6. Live Demo Walkthrough Script (For Interviews)

1. **Patient Booking Flow**:
   - Open the portal as patient **Sarah Chen**.
   - Navigate to `/patient/appointments` and click **"Book New Appointment"**.
   - Select tomorrow's date, pick a time slot (e.g., 10:00 AM), choose **Dr. Marcus Vance**, and enter a reason: *"Follow-up on blood pressure log."*
   - Submit request and show the appointment status badge: `PENDING`.
2. **Accessing the Staff Portal**:
   - Click **"Staff Gateway"** in the top demo banner or footer link to navigate to `/staff-portal`.
   - Use the **"Auto-fill Dr. Marcus Vance"** button (pre-populates credentials + Clinic Passcode `APEX-STAFF-9021`).
   - Click **"Authenticate & Enter Workspace"** to unlock the clinical queue at `/staff/dashboard`.
3. **Doctor Triage Flow**:
   - Go to `/staff/dashboard` to view today's queue.
   - Click **"Confirm"** on Sarah's pending appointment.
4. **Clinical Record & Prescription**:
   - In the queue, click **"Chart"** to open Sarah's clinical record (`/staff/patients/[id]`).
   - Click **"Add Medical Record"** -> Category: *Lab Result*, Title: *Repeat Lipid Panel*, add clinical impressions.
   - Click **"Add Prescription"** -> Medication: *Lisinopril 10mg*, Frequency: *Once daily with breakfast*.
5. **Patient Verification**:
   - Click **"Patient View"** in the top banner.
   - Observe the notification bell counter increment with the confirmation alert.
   - Check `/patient/records` and `/patient/prescriptions` to verify the newly authored record and active medication regimen appear immediately.

---

## 7. Security & Compliance Notes (Interview Talking Points)

- **Prototype Scope**: As a working prototype, this system demonstrates production architectural patterns (RLS, typed schemas, role isolation, clean separation of concerns).
- **Staff Access Isolation**: Public users cannot sign up or sign in as staff; clinical access is segregated to `/staff-portal` with passcode verification.
- **HIPAA Equivalency**: In a production healthcare deployment, additional enterprise controls would include:
  - Encryption at rest (AES-256) and in transit (TLS 1.3 enforced).
  - Comprehensive immutable audit logging for all PHI (Protected Health Information) access.
  - Business Associate Agreements (BAAs) with hosting and database cloud providers.
  - Multi-factor authentication (MFA / 2FA) required for all clinician accounts.
- **Synthetic Data**: All data fixtures use synthetic names and numbers.
