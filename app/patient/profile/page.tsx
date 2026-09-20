'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getMyProfile, updateMyProfile } from '@/lib/api';
import { PatientProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile();
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          const pd = data.patient_details;
          if (pd) {
            setDob(pd.date_of_birth || '');
            setGender(pd.gender || 'Female');
            setAddress(pd.address || '');
            setInsuranceProvider(pd.insurance_provider || '');
            setInsuranceNumber(pd.insurance_number || '');
            setEmergencyName(pd.emergency_contact_name || '');
            setEmergencyPhone(pd.emergency_contact_phone || '');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await updateMyProfile({
        full_name: fullName,
        phone,
        date_of_birth: dob,
        gender,
        address,
        insurance_provider: insuranceProvider,
        insurance_number: insuranceNumber,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-[#E8E8EC] rounded-[6px]" />
        <div className="h-80 bg-[#E8E8EC] rounded-[12px]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">My Profile</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-0.5">
          Update your contact details, insurance information, and emergency contact.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-[6px] text-[13px] flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-[#00A8A7]/10 border border-[#00A8A7]/30 text-[#007372]'
              : 'bg-[#F37521]/10 border border-[#F37521]/30 text-[#C25208]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-[#00A8A7] flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-[#F37521] flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact Info Card */}
        <Card>
          <CardHeader className="pb-3 border-b border-[#E8E8EC]">
            <CardTitle className="text-[16px]">Contact Information</CardTitle>
            <CardDescription className="text-[13px]">
              Your legal name, phone number, and residential address
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="fullName">
                Full name
              </label>
              <Input
                id="fullName"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="phone">
                Phone number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="dob">
                Date of birth
              </label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="gender">
                Gender
              </label>
              <Select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Prefer not to say</option>
              </Select>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="address">
                Home address
              </label>
              <Textarea
                id="address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, State, ZIP code"
              />
            </div>
          </CardContent>
        </Card>

        {/* Insurance Card */}
        <Card>
          <CardHeader className="pb-3 border-b border-[#E8E8EC]">
            <CardTitle className="text-[16px]">Health Insurance</CardTitle>
            <CardDescription className="text-[13px]">
              Details of your health insurance plan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="insuranceProvider">
                Insurance provider
              </label>
              <Input
                id="insuranceProvider"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g. Blue Cross, Aetna, Medicare"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="insuranceNumber">
                Member ID / Policy number
              </label>
              <Input
                id="insuranceNumber"
                value={insuranceNumber}
                onChange={(e) => setInsuranceNumber(e.target.value)}
                placeholder="Policy or group ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        <Card>
          <CardHeader className="pb-3 border-b border-[#E8E8EC]">
            <CardTitle className="text-[16px]">Emergency Contact</CardTitle>
            <CardDescription className="text-[13px]">
              Someone we can reach in case of an urgent medical situation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="emergencyName">
                Contact name & relationship
              </label>
              <Input
                id="emergencyName"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. John Doe (Spouse)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[#0A0A0A] block" htmlFor="emergencyPhone">
                Contact phone number
              </label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="(555) 000-0000"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t border-[#E8E8EC] py-3.5 bg-[#FAFAFA]">
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
