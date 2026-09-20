# The Hospital Portal — User & Patient Guide

> **Audience:** Patients, Caregivers, Clinic Receptionists, and Hospital Staff  
> **Document Type:** Non-Technical User Manual & Patient Guide  
> **PDF Download:** [The_Hospital_Portal_User_Guide.pdf](./The_Hospital_Portal_User_Guide.pdf)  
> **Version:** 1.0.0 (Production)  

---

## 1. Welcome to The Hospital Portal

**The Hospital Portal** is a patient-centric, web-based healthcare platform designed to make clinical care accessible, understandable, and stress-free. Whether you are scheduling a check-up, checking lab results, or reviewing prescriptions, the portal gives you immediate access without long phone queues or complicated paperwork.

### Core Principles
- **Clear Clinical Communication:** Every diagnosis, medication frequency, and appointment status is written in plain, accessible language.
- **Privacy & Protection:** Your medical records are protected by database-level security policies (Row Level Security), guaranteeing that only you and your verified healthcare team can view your health data.
- **Works on Any Device:** Fully responsive across mobile phones, tablets, and desktop computers without installing any app from an app store.

---

## 2. Key Features at a Glance

| Feature | What It Does | Who Uses It |
|---|---|---|
| **24/7 Appointment Scheduling** | Browse attending physicians by specialty (Cardiology, Pediatrics, General Practice), select preferred time slots, and submit booking requests. | Patients & Clinical Staff |
| **Diagnostic Records & Lab Results** | Instant access to completed blood counts, imaging summaries, doctor notes, and follow-up recommendations. | Patients & Attending Physicians |
| **Medication & Prescription Tracking** | View active medications, precise dosages, refill dates, and prescribing physician notes. | Patients & Pharmacists/Doctors |
| **Health Profile & Emergency Care** | Update blood type, known allergies, insurance carrier ID, and emergency contact details. | Patients & Care Teams |

---

## 3. Step-by-Step Patient Walkthrough

### Step 1: Creating Your Account
1. Visit the portal homepage and click **"Create Patient Account"**.
2. Enter your full name, email address, and a secure password.
3. Click **"Register"**. Your account is created instantly with patient data privacy protections.

### Step 2: Navigating Your Dashboard
Once logged in, your personal dashboard displays:
- **Upcoming Appointments:** Your next scheduled doctor visit with date, time, and room details.
- **Recent Medical Records:** Fast access to your latest test results or visit summaries.
- **Active Prescriptions:** Current medications with dosages and refill status.
- **Clinical Notifications:** Alerts from your care team regarding scheduled appointments or new results.

### Step 3: Booking a Doctor Appointment
1. In the sidebar, click **"Appointments"** &rarr; **"Book Appointment"**.
2. Select your attending doctor from the staff directory.
3. Choose your preferred date and time.
4. Enter the reason for your visit (e.g. *"Annual cardiovascular check-up"*).
5. Click **"Confirm Booking"**. Your request will show as *Pending* until confirmed by clinic staff.

### Step 4: Accessing Lab Results & Doctor Summaries
1. In the sidebar, click **"Medical Records"**.
2. View diagnostic test records categorized by type: *Lab Results*, *Visit Summaries*, or *Clinical Diagnoses*.
3. Click on any record to read the doctor’s findings and recommendations.

### Step 5: Managing Prescriptions & Refills
1. In the sidebar, click **"Prescriptions"**.
2. Review clear directions (e.g. *"Take 1 tablet every morning after meals"*).
3. Check status (*Active*, *Completed*, or *Refill Needed*).

---

## 4. For Clinical & Hospital Staff

Hospital doctors, nurses, and administrative staff use the **Dedicated Staff Portal** (`/staff-portal`):

- **Staff Security Verification:** Access is guarded by a hospital clinical passcode (`APEX-STAFF-9021`) and verified staff account credentials.
- **Patient Management:** Staff can look up patient attendance history, past lab results, and consultation notes.
- **Appointment Processing:** Staff review pending appointments and mark them as *Confirmed* or *Completed*.
- **Issuing Records:** Attending doctors upload diagnostic test results and write visit summaries directly to the patient's record.

---

## 5. Frequently Asked Questions (FAQ)

#### Can other patients see my medical information?
**No.** The portal uses Row Level Security (RLS) in PostgreSQL. Every query is locked strictly to your authenticated patient account.

#### Can anyone register as a doctor or nurse?
**No.** Public registration is locked exclusively to patients. Staff accounts cannot be self-registered and require clinical provisioning.

#### What should I do in an emergency?
The portal is designed for routine appointments, records, and prescriptions. In a medical emergency, call **911** or visit your nearest emergency room immediately.

---

*Document generated for The Hospital Portal &bull; Version 1.0.0*
