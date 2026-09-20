# The Hospital Portal — Technical Architecture & Workflow Specification

> **Audience:** Software Engineers, System Architects, DevOps, and Technical Evaluators  
> **Document Type:** System Architecture, Data Flow, and Security Specification  
> **PDF Download:** [The_Hospital_Portal_Technical_Architecture.pdf](./The_Hospital_Portal_Technical_Architecture.pdf)  
> **Version:** 1.0.0 (Production)  

---

## 1. System Overview & Technology Stack

The Hospital Portal is a full-stack healthcare web application built using the **Next.js 14 App Router** with TypeScript strict typing, styled with the **ThaiCloud Design System** tokenized in Tailwind CSS, and backed by a dual-mode persistence layer powered by **Supabase PostgreSQL**.

```
+-------------------------------------------------------------------------+
|                         Next.js 14 App Router                           |
|       (React 18 + RSC Boundaries + Lucide Icons + ThaiCloud UI)         |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  Client State & Route Middleware Layer                  |
|    (auth-context.tsx | middleware.ts | /staff-portal Clinical Gate)     |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                 Dual-Mode Persistence API (lib/api.ts)                  |
|     [isSupabaseConfigured() ? Live PostgreSQL : Local Mock Fallback]    |
+------------------+------------------------------------+-----------------+
                   |                                    |
                   v                                    v
+---------------------------------------+  +------------------------------+
|     Supabase Cloud Infrastructure     |  |   Local In-Memory Cache      |
|  - PostgreSQL 15 (7 Core Tables)      |  |   - localStorage fallback    |
|  - Row Level Security (RLS)           |  |   - Standalone offline demo  |
|  - Storage Bucket (medical-files)     |  +------------------------------+
|  - Auth JWT Tokens                    |
+---------------------------------------+
```

### Core Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `14.2.35` | React Server Components, file-based App Router, route optimization. |
| `react` / `react-dom` | `^18` | Presentation framework and UI lifecycle. |
| `@supabase/supabase-js` | `^2.49.1` | PostgreSQL database connection, auth state handling, and RLS queries. |
| `tailwindcss` | `^3.4.1` | ThaiCloud design tokens (`#0671B8` Primary, `#00A8A7` Secondary, `#0A0A0A` Neutral). |
| `lucide-react` | `^0.359.0` | Accessible clinical iconography. |

---

## 2. Authentication & Role-Based Access Control (RBAC)

The application enforces **strict perimeter isolation** between patients and clinical staff:

### Patient Perimeter
- **Registration (`/signup`):** Open to the public. Inserts into `profiles` with `role = 'patient'`.
- **Database Enforcement:** PostgreSQL RLS policy `users insert own profile` guarantees `role = 'patient'`:
  ```sql
  create policy "users insert own profile" on profiles
    for insert with check (id = auth.uid() and role = 'patient');
  ```
- **Login (`/login`):** Validates email & password. Rejects staff credentials with an explicit redirect to `/staff-portal`.

### Staff Perimeter
- **Clinical Gate (`/staff-portal`):** Completely separated route.
- **Two-Factor Access:**
  1. **Clinical Passcode:** Evaluated against `NEXT_PUBLIC_STAFF_PASSCODE` (`APEX-STAFF-9021`).
  2. **Role Verification:** Authenticates credentials and verifies `role = 'staff'` in PostgreSQL.
- **Route Guarding:** `middleware.ts` intercepts `/staff/*` routes and enforces active staff sessions.

---

## 3. Relational Database Schema

The database model is defined in [`supabase/schema.sql`](../supabase/schema.sql) across 7 normalized tables:

```
auth.users (Supabase Auth)
    │
    ▼ (1:1 cascade)
 public.profiles (id, role, full_name, phone, created_at)
    ├──► public.patients (id, date_of_birth, gender, insurance, emergency_contact)
    └──► public.staff (id, title, specialty)
             │
             ├──► public.appointments (id, patient_id, staff_id, scheduled_at, status, reason, notes)
             ├──► public.medical_records (id, patient_id, staff_id, record_type, title, file_path)
             └──► public.prescriptions (id, patient_id, staff_id, medication_name, dosage, frequency)

 public.notifications (id, user_id, message, is_read, created_at)
```

---

## 4. PostgreSQL Row Level Security (RLS) & The Recursion Resolution

### The Recursion Problem (PostgreSQL Error `42P17`)
When an RLS policy on `profiles` attempts to check if the current user is staff by querying `profiles`:
```sql
-- DANGEROUS: Causes infinite recursion!
create policy "staff read all profiles" on profiles
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'staff')
  );
```
PostgreSQL re-evaluates the policy on every subquery, resulting in error `42P17: infinite recursion detected in policy for relation "profiles"`.

### The Resolution (`SECURITY DEFINER`)
To eliminate recursion and optimize query planning, we implement a `SECURITY DEFINER` function that executes with database administrator privileges, bypassing RLS during role verification:

```sql
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'staff' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Clean, zero-overhead RLS policy
create policy "staff read all profiles" on profiles
  for select using (public.is_staff());
```

---

## 5. End-to-End Workflow Sequences

### Sequence 1: Patient Appointment Booking
1. **User Action:** Patient submits booking modal on `/patient/appointments`.
2. **API Handler:** `api.ts` -> `createAppointment()`.
3. **Session Check:** Verifies active JWT session via `supabase.auth.getUser()`.
4. **PostgreSQL Mutation:** `supabase.from('appointments').insert({ patient_id: auth.uid(), ... })`.
5. **Notification:** Inserts an alert into `notifications` for the assigned doctor and patient.
6. **UI Hydration:** Client refreshes local appointment list displaying the status as `pending`.

### Sequence 2: Clinical Staff Consultation Note & File Attachment
1. **Staff Authentication:** Physician unlocks `/staff-portal` with passcode and logs in.
2. **Schedule View:** Fetches scheduled appointments for the day via `is_staff()` policy.
3. **Record Submission:** Physician inputs diagnosis and attaches lab result PDF.
4. **Storage Upload:** PDF uploaded to Supabase Storage bucket `medical-files` via `Staff upload medical files` policy.
5. **DB Insertion:** Record inserted into `medical_records` with storage path.
6. **Patient Visibility:** Patient instantly sees the record under `/patient/records`.

---

## 6. Cloud Deployment & Environment Configuration

### Vercel Deployment Architecture
- **Trigger:** Automatic webhook on Git push to branch `main`.
- **Build Step:** `next build` (zero errors, code 0).
- **Runtime:** Vercel Edge Network + Serverless Node.js.

### Environment Variable Matrix

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Supabase project URL endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Supabase public/anon publishable JWT key. |
| `NEXT_PUBLIC_STAFF_PASSCODE` | Client & Server | Clinical staff entry gatekeeper passcode (`APEX-STAFF-9021`). |

---

*Specification maintained by The Hospital Portal Engineering Team*
