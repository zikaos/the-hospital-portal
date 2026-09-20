-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX RLS RECURSION ERROR (42P17)
-- ==============================================================================

-- 1. Create helper function with SECURITY DEFINER (bypasses RLS to avoid recursion)
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

-- 2. Update Profiles policies
drop policy if exists "staff read all profiles" on profiles;
create policy "staff read all profiles" on profiles
  for select using (public.is_staff());

drop policy if exists "users insert own profile" on profiles;
create policy "users insert own profile" on profiles
  for insert with check (id = auth.uid() and role = 'patient');

-- 3. Update Patients policies
drop policy if exists "staff read all patients" on patients;
create policy "staff read all patients" on patients
  for select using (public.is_staff());

-- 4. Update Appointments policies
drop policy if exists "staff read all appointments" on appointments;
create policy "staff read all appointments" on appointments
  for select using (public.is_staff());

drop policy if exists "staff update appointments" on appointments;
create policy "staff update appointments" on appointments
  for update using (public.is_staff());

-- 5. Update Medical Records & Prescriptions policies
drop policy if exists "staff manage records" on medical_records;
create policy "staff manage records" on medical_records
  for all using (public.is_staff());

drop policy if exists "staff manage prescriptions" on prescriptions;
create policy "staff manage prescriptions" on prescriptions
  for all using (public.is_staff());

-- 6. Update Storage policies
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
