// Self-check for account authentication without email verification
const assert = require('assert');

const CLINIC_STAFF_PASSCODE = 'APEX-STAFF-9021';

const DEFAULT_ACCOUNTS = [
  {
    id: 'p-default',
    email: 'sarah.chen@example.com',
    password: 'password123',
    role: 'patient',
    full_name: 'Sarah Chen',
  },
  {
    id: 'd-default',
    email: 'dr.vance@clinic.demo',
    password: 'password123',
    role: 'staff',
    full_name: 'Dr. Marcus Vance',
    title: 'Lead Cardiologist',
  },
];

let accounts = [...DEFAULT_ACCOUNTS];

function signUp(email, password, fullName) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return { error: 'Email address is required.' };
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { error: 'An account with this email already exists.' };
  }
  const newPatient = {
    id: `p-${Date.now()}`,
    email: cleanEmail,
    password,
    role: 'patient',
    full_name: (fullName || cleanEmail.split('@')[0]).trim(),
  };
  accounts.push(newPatient);
  return { user: newPatient };
}

function login(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const acc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!acc || acc.password !== password) {
    return { error: 'Invalid email address or password.' };
  }
  if (acc.role !== 'patient') {
    return { error: 'This is a staff account. Please sign in via the Staff Portal.' };
  }
  return { user: acc };
}

function registerStaff(email, password, fullName, passcode) {
  if (passcode !== CLINIC_STAFF_PASSCODE) {
    return { error: 'Invalid clinic security passcode.' };
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return { error: 'Staff email is required.' };
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
    return { error: 'An account with this email already exists.' };
  }
  const newStaff = {
    id: `s-${Date.now()}`,
    email: cleanEmail,
    password,
    role: 'staff',
    full_name: fullName || 'Staff Physician',
  };
  accounts.push(newStaff);
  return { user: newStaff };
}

// 1. Default patient login works
const r1 = login('sarah.chen@example.com', 'password123');
assert(!r1.error, 'Sarah Chen should login');
assert.strictEqual(r1.user.full_name, 'Sarah Chen');

// 2. Reject wrong password
const r2 = login('sarah.chen@example.com', 'wrongpassword');
assert(r2.error, 'Wrong password must be rejected');

// 3. Reject staff logging in at patient portal
const r3 = login('dr.vance@clinic.demo', 'password123');
assert.strictEqual(r3.error, 'This is a staff account. Please sign in via the Staff Portal.');

// 4. Patient sign up creates account immediately without email verification
const r4 = signUp('ezzat.osama1700@gmail.com', 'password123', 'Ezzat Osama');
assert(!r4.error, 'Patient registration must succeed');
assert.strictEqual(r4.user.email, 'ezzat.osama1700@gmail.com');

// 5. Patient can immediately log in with no email confirmation
const r5 = login('ezzat.osama1700@gmail.com', 'password123');
assert(!r5.error, 'Newly registered patient must be able to log in immediately');
assert.strictEqual(r5.user.full_name, 'Ezzat Osama');

// 6. Duplicate registration rejected
const r6 = signUp('ezzat.osama1700@gmail.com', 'password123', 'Duplicate');
assert.strictEqual(r6.error, 'An account with this email already exists.');

// 7. Staff registration requires passcode
const r7 = registerStaff('nurse.alex@hospital.com', 'password123', 'Nurse Alex', 'WRONG');
assert.strictEqual(r7.error, 'Invalid clinic security passcode.');

// 8. Staff registration with valid passcode succeeds immediately
const r8 = registerStaff('nurse.alex@hospital.com', 'password123', 'Nurse Alex', CLINIC_STAFF_PASSCODE);
assert(!r8.error, 'Staff registration must succeed with passcode');
assert.strictEqual(r8.user.role, 'staff');

console.log('All auth unit checks passed successfully.');
