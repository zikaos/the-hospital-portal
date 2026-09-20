-- ==============================================================================
-- PATIENT PORTAL PROTOTYPE — SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'staff')),
  full_name text not null,
  phone text,
  created_at timestamptz default now()
);

-- 2. Patients (extra info only patients have)
create table if not exists patients (
  id uuid primary key references profiles(id) on delete cascade,
  date_of_birth date,
  gender text,
  address text,
  insurance_provider text,
  insurance_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_at timestamptz default now()
);

-- 3. Staff (extra info only staff have)
create table if not exists staff (
  id uuid primary key references profiles(id) on delete cascade,
  title text, -- e.g. 'Doctor', 'Nurse', 'Admin'
  specialty text,
  created_at timestamptz default now()
);

-- 4. Appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  staff_id uuid references staff(id),
  scheduled_at timestamptz not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- 5. Medical Records
create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  staff_id uuid references staff(id),
  record_type text not null check (record_type in ('lab_result','diagnosis','visit_summary')),
  title text not null,
  description text,
  file_path text, -- path in Supabase storage bucket
  record_date date default current_date,
  created_at timestamptz default now()
);

-- 6. Prescriptions
create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  staff_id uuid references staff(id),
  medication_name text not null,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- 7. Notifications (simple in-app list, no real email/SMS)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table profiles enable row level security;
alter table patients enable row level security;
alter table staff enable row level security;
alter table appointments enable row level security;
alter table medical_records enable row level security;
alter table prescriptions enable row level security;
alter table notifications enable row level security;

-- Helper function to avoid RLS recursion on profiles table
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

-- Profiles: users read own profile, staff can read profiles to see patient names
drop policy if exists "users read own profile" on profiles;
create policy "users read own profile" on profiles
  for select using (id = auth.uid());

drop policy if exists "staff read all profiles" on profiles;
create policy "staff read all profiles" on profiles
  for select using (public.is_staff());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile" on profiles
  for insert with check (id = auth.uid() and role = 'patient');

drop policy if exists "users update own profile" on profiles;
create policy "users update own profile" on profiles
  for update using (id = auth.uid());

-- Patients: patient reads/updates own row, staff reads all
drop policy if exists "patients read own patient row" on patients;
create policy "patients read own patient row" on patients
  for select using (id = auth.uid());

drop policy if exists "patients insert own patient row" on patients;
create policy "patients insert own patient row" on patients
  for insert with check (id = auth.uid());

drop policy if exists "patients update own patient row" on patients;
create policy "patients update own patient row" on patients
  for update using (id = auth.uid());

drop policy if exists "staff read all patients" on patients;
create policy "staff read all patients" on patients
  for select using (public.is_staff());

-- Staff: everyone can view staff directory (e.g. for booking doctor selection)
drop policy if exists "anyone read staff directory" on staff;
create policy "anyone read staff directory" on staff
  for select using (auth.role() = 'authenticated');

-- Appointments: patient sees own, staff sees all
drop policy if exists "patients read own appointments" on appointments;
create policy "patients read own appointments" on appointments
  for select using (patient_id = auth.uid());

drop policy if exists "patients create own appointments" on appointments;
create policy "patients create own appointments" on appointments
  for insert with check (patient_id = auth.uid());

drop policy if exists "patients cancel own appointments" on appointments;
create policy "patients cancel own appointments" on appointments
  for update using (patient_id = auth.uid());

drop policy if exists "staff read all appointments" on appointments;
create policy "staff read all appointments" on appointments
  for select using (public.is_staff());

drop policy if exists "staff update appointments" on appointments;
create policy "staff update appointments" on appointments
  for update using (public.is_staff());

-- Medical records & prescriptions: patient read-only own, staff full access
drop policy if exists "patients read own records" on medical_records;
create policy "patients read own records" on medical_records
  for select using (patient_id = auth.uid());

drop policy if exists "staff manage records" on medical_records;
create policy "staff manage records" on medical_records
  for all using (public.is_staff());

drop policy if exists "patients read own prescriptions" on prescriptions;
create policy "patients read own prescriptions" on prescriptions
  for select using (patient_id = auth.uid());

drop policy if exists "staff manage prescriptions" on prescriptions;
create policy "staff manage prescriptions" on prescriptions
  for all using (public.is_staff());

-- Notifications: everyone reads and marks read only their own
drop policy if exists "read own notifications" on notifications;
create policy "read own notifications" on notifications
  for select using (user_id = auth.uid());

drop policy if exists "update own notifications" on notifications;
create policy "update own notifications" on notifications
  for update using (user_id = auth.uid());

drop policy if exists "insert notifications" on notifications;
create policy "insert notifications" on notifications
  for insert with check (true);

-- Storage bucket for medical files
insert into storage.buckets (id, name, public)
values ('medical-files', 'medical-files', false)
on conflict (id) do nothing;

drop policy if exists "Staff upload medical files" on storage.objects;
create policy "Staff upload medical files" on storage.objects
  for insert with check (
    bucket_id = 'medical-files' and
    public.is_staff()
  );

drop policy if exists "Staff manage medical files" on storage.objects;
create policy "Staff manage medical files" on storage.objects
  for all using (
    bucket_id = 'medical-files' and
    public.is_staff()
  );

drop policy if exists "Patients read assigned medical files" on storage.objects;
create policy "Patients read assigned medical files" on storage.objects
  for select using (
    bucket_id = 'medical-files' and
    auth.role() = 'authenticated'
  );
