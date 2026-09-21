# The Hospital Portal — Customer & User Guide

This guide explains how to access the portal, which credentials to use, and how to navigate both the Patient and Staff workspaces.

---

## 1. Access & Credentials

The portal runs in instant prototype mode. No email verification is required; accounts work immediately.

### Patient Access

- **Sign In URL**: `/login`
- **Registration URL**: `/signup` (open to any new patient)
- **Demo Patient Credentials**:
  - **Email**: `sarah.chen@example.com`
  - **Password**: `password123`
- **Quick Fill**: On `/login`, click **"Demo: Fill Sarah Chen credentials"** to fill the form in one click.

### Staff Access

Staff access is restricted to medical personnel and requires a clinic security passcode.

- **Staff Gateway URL**: `/staff-portal`
- **Clinic Security Passcode**: `APEX-STAFF-9021`
- **Demo Staff Credentials**:
  - **Email**: `dr.vance@clinic.demo`
  - **Password**: `password123`
  - **Passcode**: `APEX-STAFF-9021`
- **Quick Fill**: On `/staff-portal`, click **"Demo: Fill Dr. Marcus Vance credentials"** to pre-populate all fields.

---

## 2. Language & Layout

- **Language Switcher**: Located on the top-right of the navigation bar on every page (`العربية` / `English`).
- **One-Click Switch**: Changes all headings, tables, forms, and alerts immediately without page reload.
- **Arabic Mode**: Automatically aligns text, tables, and navigation right-to-left (RTL) using the Cairo typeface.

---

## 3. Patient Portal Guide

### Dashboard (`/patient/dashboard`)
Displays your next upcoming consultation, active medications, and recent updates from the clinic.

### Booking an Appointment (`/patient/appointments`)
1. Click **"Book appointment"** in the top navigation or on the appointments page.
2. Select your attending doctor from the dropdown list.
3. Choose your preferred date and time.
4. Enter the reason for your visit (e.g., *"Routine blood pressure check"*).
5. Click **"Confirm Booking"**. Your visit will show as **Pending** until confirmed by clinic staff.

### Viewing Medical Records (`/patient/records`)
1. Click **"Medical Records"** in the sidebar.
2. Filter records by category: **Lab Results**, **Summaries**, or **Diagnoses**.
3. Review clinical notes, diagnoses, and attending doctor details.
4. Click **"Export as Text"** or **"Download"** to save records locally.

### Reviewing Prescriptions (`/patient/prescriptions`)
1. Click **"Prescriptions"** in the sidebar.
2. Toggle between **Active Prescriptions** and **Past Medications**.
3. View medication name, dosage (e.g., *10mg tablet*), frequency (e.g., *Once daily with meals*), start and end dates, and prescribing physician notes.

### Updating Your Profile (`/patient/profile`)
1. Click **"My Profile"** in the sidebar.
2. Review or edit your phone number, date of birth, gender, address, insurance details, and emergency contact.
3. Click **"Save Changes"**.

---

## 4. Staff Portal Guide

### Today's Clinical Queue (`/staff/dashboard`)
1. View all appointments scheduled for the day.
2. Review patient names, appointment times, and consultation reasons.
3. Action buttons:
   - **Confirm**: Confirms a pending appointment request.
   - **Complete**: Marks the consultation as finished.
   - **Cancel**: Cancels the appointment.
4. Click **"Open Patient Chart"** on any appointment row to jump directly to that patient's health record.

### Patient Directory (`/staff/patients`)
1. Search patients by full name, email address, or phone number.
2. View patient cards displaying contact info, date of birth, and insurance provider.
3. Click **"Open Chart"** on any patient to view their full record.

### Electronic Health Chart (`/staff/patients/[id]`)
- **Demographics Card**: Shows phone, email, date of birth, insurance carrier, policy number, emergency contact, and address.
- **Medical Records Section**:
  - Click **"Add record"** to open the record modal.
  - Choose category (*Lab result*, *Visit summary*, or *Diagnosis*).
  - Enter title, clinical findings/notes, and attach files (PDF, PNG, JPG).
  - Click **"Save record"**.
- **Prescriptions Section**:
  - Click **"Add prescription"** to open the prescription modal.
  - Enter medication name, dosage, frequency, start date, optional end date, and pharmacy notes.
  - Click **"Save prescription"**.
- **Appointment History**: View full past visit history with the ability to update statuses.

---

## 5. Quick Reference Table

| Role | Sign-In Path | Required Credentials | Main Tasks |
|---|---|---|---|
| **Patient** | `/login` | `sarah.chen@example.com` / `password123` | Book visits, view lab results, check prescriptions, update contact details |
| **New Patient** | `/signup` | Name, Email, Password (min 6 chars) | Create a personal medical account instantly |
| **Staff Doctor** | `/staff-portal` | `dr.vance@clinic.demo` / `password123` + Passcode `APEX-STAFF-9021` | Triage queue, manage patient directory, author medical records, write prescriptions |
| **New Staff** | `/staff-portal` &rarr; Register Staff | Full Name, Title, Specialty, Email, Password + Passcode `APEX-STAFF-9021` | Provision a new medical staff account |
