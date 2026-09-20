'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  isRTL: boolean;
}

// Comprehensive English -> Arabic healthcare dictionary
const DICTIONARY: Record<string, string> = {
  // Brand & Navigation
  'The Hospital Portal': 'بوابة المستشفى',
  'Patient Portal': 'بوابة المرضى',
  'Staff Portal': 'بوابة الكادر الطبي',
  'Staff Workspace': 'مساحة عمل الكادر',
  'Menu': 'القائمة',
  'Dashboard': 'لوحة التحكم',
  'Appointments': 'المواعيد',
  'Medical Records': 'السجلات الطبية',
  'Prescriptions': 'الوصفات الطبية',
  'My Profile': 'ملفي الشخصي',
  'My profile': 'ملفي الشخصي',
  'Today’s Queue': 'قائمة مواعيد اليوم',
  "Today's Queue": 'قائمة مواعيد اليوم',
  'Patients': 'سجل المرضى',
  'Patient': 'المريض',
  'Patient list': 'قائمة المرضى',
  'Sign in': 'تسجيل الدخول',
  'Sign out': 'تسجيل الخروج',
  'Create account': 'إنشاء حساب',
  'Patient Sign In': 'تسجيل دخول المرضى',
  'Create an account': 'إنشاء حساب جديد',
  'Go to Dashboard': 'الانتقال للوحة التحكم',
  'Switch to Staff View': 'التبديل لعرض الكادر',
  'Switch to Patient View': 'التبديل لعرض المريض',
  'Patient view': 'عرض المريض',
  'Staff view': 'عرض الكادر الطبي',
  'Home': 'الرئيسية',
  'Return to home page': 'العودة إلى الصفحة الرئيسية',
  'Return to The Hospital Portal': 'العودة إلى بوابة المستشفى',
  'Staff access': 'دخول الكادر الطبي',
  'Prototype': 'نسخة تجريبية',
  'Prototype Mode': 'الوضع التجريبي',

  // Landing Page
  'Manage your healthcare visits, records, and prescriptions.': 'إدارة مواعيدك وسجلاتك الطبية ووصفاتك الدوائية.',
  'Welcome to The Hospital Portal. Schedule consultations with your doctor, view diagnostic lab results, and check your current medications anytime.': 'مرحباً بكم في بوابة المستشفى. احجز استشاراتك الطبية واطلع على نتائج التحاليل وتابع أدويتك بكل سهولة.',
  'Sign in to your account': 'تسجيل الدخول إلى حسابك',
  'New patient registration': 'تسجيل مريض جديد',
  'Continue as': 'المتابعة كـ',
  'Schedule visits with your provider, choose available time slots, and view your upcoming or past consultations.': 'احجز مواعيدك مع الطبيب واختر التوقيت المناسب واطلع على استشاراتك السابقة والقادمة.',
  'Read lab results, pathology reports, and physician consultation notes as soon as they are added by your care team.': 'اطلع على نتائج التحاليل المخبرية وتقارير الفحوصات وملاحظات الطبيب فور إضافتها.',
  'Keep track of your active medications, dosages, frequency instructions, and prescription end dates.': 'تابع أدويتك النشطة وجرعاتها ومواعيد تناولها وتواريخ انتهائها.',

  // Auth Forms
  'Enter your credentials to access your patient records': 'أدخل بياناتك للوصول إلى ملفك الطبي',
  'Register to view your records and book visits': 'سجل حساباً لمشاهدة سجلاتك وحجز المواعيد',
  'Email address': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'Full name': 'الاسم الكامل',
  'At least 6 characters': '6 أحرف على الأقل',
  'Signing in...': 'جاري تسجيل الدخول...',
  'Creating account...': 'جاري إنشاء الحساب...',
  'Creating staff account...': 'جاري إنشاء حساب الكادر...',
  'Don’t have an account?': 'ليس لديك حساب؟',
  "Don't have an account?": 'ليس لديك حساب؟',
  'Already have an account?': 'لديك حساب بالفعل؟',
  'Clinic staff?': 'من الكادر الطبي؟',
  'Staff sign in': 'تسجيل دخول الكادر',
  'Demo: Fill Sarah Chen credentials': 'تجربة: تعبئة بيانات سارة تشن',
  'Demo: Fill Dr. Marcus Vance credentials': 'تجربة: تعبئة بيانات د. ماركوس فانس',
  'Clinical workspace for physicians, nurses, and administrative personnel.': 'مساحة العمل الإكلينيكية للأطباء والتمريض والإداريين.',
  'Sign In': 'تسجيل الدخول',
  'Register Staff': 'تسجيل كادر طبي',
  'Staff email address': 'بريد الكادر الطبي',
  'Clinic security passcode': 'رمز الأمان للعيادة',
  'Required': 'مطلوب',
  'Required authorization': 'تصريح مطلوب',
  'Enter password': 'أدخل كلمة المرور',
  'Enter clinic passcode...': 'أدخل رمز أمان العيادة...',
  'Sign in to workspace': 'تسجيل الدخول لمساحة العمل',
  'Create staff account': 'إنشاء حساب كادر طبي',
  'Title / Role': 'المسمى الوظيفي',
  'Specialty': 'التخصص',
  'Authorized clinic personnel only. Requires clinic security passcode': 'للكوادر المعتمدة فقط. يتطلب رمز الأمان للعيادة',

  // Patient Dashboard & Sections
  'Welcome,': 'مرحباً،',
  'Here is an overview of your visits, medications, and messages.': 'إليك نظرة شاملة على مواعيدك وأدويتك ورسائلك.',
  'Book appointment': 'حجز موعد',
  'Book Consultation': 'حجز استشارة',
  'Book New Appointment': 'حجز موعد جديد',
  'Next appointment': 'الموعد القادم',
  'Next Visit': 'الموعد القادم',
  'Your next scheduled consultation': 'استشارتك الطبية المجدولة القادمة',
  'All appointments': 'كافة المواعيد',
  'Recent updates': 'آخر التحديثات',
  'Messages from your clinic': 'رسائل وتنبيهات العيادة',
  'Active Prescriptions': 'الوصفات النشطة',
  'Active prescriptions': 'الوصفات النشطة',
  'Unread Messages': 'رسائل غير مقروءة',
  'Upcoming Consultation': 'الاستشارة القادمة',
  'Cancel Visit': 'إلغاء الموعد',
  'Cancel': 'إلغاء',
  'View All Appointments': 'عرض كافة المواعيد',
  'No upcoming appointments': 'لا توجد مواعيد قادمة',
  'No upcoming appointments. Schedule a consultation whenever you need care.': 'لا توجد مواعيد قادمة. احجز استشارة عندما تحتاج إلى رعاية.',
  'Schedule a visit whenever you need to see a doctor.': 'احجز موعداً متى احتجت لزيارة الطبيب.',
  'Schedule a visit': 'حجز موعد',
  'Active Medications': 'الأدوية الحالية',
  'Medications you are currently taking': 'الأدوية التي تتناولها حالياً',
  'View All Prescriptions': 'عرض كافة الوصفات',
  'All prescriptions': 'كافة الوصفات',
  'No active medications recorded.': 'لا توجد أدوية نشطة مسجلة.',
  'No active prescriptions on file.': 'لا توجد وصفات نشطة مسجلة.',
  'Clinic Notifications': 'إشعارات العيادة',
  'Notifications': 'الإشعارات',
  'Mark all read': 'تحديد الكل كمقروء',
  'Mark as read': 'تحديد كمقروء',
  'No notifications right now.': 'لا توجد إشعارات حالياً.',
  'No new messages': 'لا توجد رسائل جديدة',
  'Loading The Hospital Portal...': 'جاري تحميل بوابة المستشفى...',
  'Loading workspace...': 'جاري تحميل مساحة العمل...',
  'General checkup': 'فحص عام',
  'Clinic doctor': 'طبيب المركز',
  'Clinic physician': 'طبيب المركز',
  'new': 'جديد',

  // Appointments Page
  'My Appointments': 'مواعيدي',
  'View upcoming visits and previous clinic consultations': 'استعرض المواعيد القادمة والاستشارات السابقة',
  'All': 'الكل',
  'Upcoming': 'القادمة',
  'Past': 'السابقة',
  'Date & Time': 'التاريخ والوقت',
  'Doctor / Clinic': 'الطبيب / العيادة',
  'Reason': 'السبب',
  'Status': 'الحالة',
  'Actions': 'الإجراءات',
  'Select Doctor / Physician': 'اختر الطبيب المعالج',
  'Select Date & Time': 'اختر التاريخ والوقت',
  'Consultation Reason': 'سبب الاستشارة',
  'Confirm Booking': 'تأكيد الحجز',
  'Booking...': 'جاري الحجز...',
  'Close': 'إغلاق',
  'No appointments found matching this filter.': 'لا توجد مواعيد تطابق هذا الفلتر.',

  // Medical Records Page
  'Diagnostic reports, laboratory results, and consultation summaries': 'التقارير التشخيصية ونتائج التحاليل وملخصات الاستشارات',
  'All Categories': 'كافة الفئات',
  'Lab Results': 'نتائج التحاليل',
  'Summaries': 'ملخصات طبية',
  'Diagnoses': 'التشخيصات',
  'Export as Text': 'تصدير كنص',
  'Download': 'تنزيل',
  'Attending Physician': 'الطبيب المشرف',
  'Record Date': 'تاريخ السجل',
  'Diagnosis': 'التشخيص',
  'Notes & Findings': 'الملاحظات والنتائج',
  'No medical records found.': 'لا توجد سجلات طبية مسجلة.',
  'Lab result': 'نتيجة تحليل',
  'Visit summary': 'ملخص زيارة',

  // Prescriptions Page
  'Active and historical prescription medications': 'الأدوية والوصفات الطبية الحالية والسابقة',
  'Past Medications': 'أدوية سابقة',
  'Dosage': 'الجرعة',
  'Dosage:': 'الجرعة:',
  'Frequency': 'التكرار',
  'Frequency:': 'التكرار:',
  'Instructions': 'تعليمات الاستخدام',
  'Instructions:': 'التعليمات:',
  'Prescribed:': 'تاريخ الوصفة:',
  'End date:': 'تاريخ الانتهاء:',
  'Prescribed by': 'تمت الوصفة بواسطة',
  'Start Date': 'تاريخ البدء',
  'Started:': 'تاريخ البدء:',
  'End Date': 'تاريخ الانتهاء',
  'Doctor:': 'الطبيب:',
  'As directed': 'حسب الإرشادات',
  'Daily': 'يومياً',
  'No prescriptions found.': 'لا توجد وصفات طبية مسجلة.',

  // Profile Page
  'Personal information and emergency contacts': 'البيانات الشخصية وجهات الاتصال في حالات الطوارئ',
  'Contact Details': 'بيانات التواصل',
  'Phone': 'رقم الهاتف',
  'Phone number': 'رقم الهاتف',
  'Date of Birth': 'تاريخ الميلاد',
  'Gender': 'الجنس',
  'Male': 'ذكر',
  'Female': 'أنثى',
  'Address': 'العنوان',
  'Insurance Information': 'معلومات التأمين الصحي',
  'Insurance Provider': 'شركة التأمين',
  'Insurance Policy Number': 'رقم وثيقة التأمين',
  'Emergency Contact': 'جهة الاتصال للطوارئ',
  'Contact Name': 'اسم جهة الاتصال',
  'Emergency Phone': 'هاتف الطوارئ',
  'Save Changes': 'حفظ التغييرات',
  'Saving...': 'جاري الحفظ...',
  'Profile updated successfully.': 'تم تحديث الملف الشخصي بنجاح.',

  // Staff Views
  'Today’s Clinical Queue': 'قائمة الانتظار الإكلينيكية لليوم',
  'Manage incoming appointments and consultation triage': 'إدارة المواعيد وتوجيه الاستشارات الطبية',
  'Total Today': 'إجمالي اليوم',
  'Pending Triage': 'قيد التقييم',
  'Confirmed': 'مؤكد',
  'Completed': 'مكتمل',
  'Confirm Visit': 'تأكيد الموعد',
  'Complete Visit': 'إنهاء الاستشارة',
  'Open Patient Chart': 'فتح ملف المريض',
  'Patient Directory': 'دليل المرضى',
  'Patient directory': 'دليل المرضى',
  'Registered patients and electronic medical records': 'سجل المرضى والملفات الطبية الإلكترونية',
  'Search patients by name, email, or phone...': 'ابحث عن مريض بالاسم أو البريد أو الهاتف...',
  'Search patients to view medical charts, add records, or manage prescriptions.': 'ابحث عن المرضى لعرض الملفات الطبية أو إضافة التقارير أو إدارة الوصفات.',
  'Search by name, phone number, or email...': 'ابحث بالاسم أو رقم الهاتف أو البريد الإلكتروني...',
  'Registered Date': 'تاريخ التسجيل',
  'Open Chart': 'فتح الملف',
  'No patients found matching your search.': 'لم يتم العثور على مريض يطابق بحثك.',
  'No patients found': 'لم يتم العثور على مرضى',
  'Loading patients...': 'جاري تحميل سجلات المرضى...',
  'Name & email': 'الاسم والبريد',
  'Date of birth': 'تاريخ الميلاد',
  'Insurance': 'التأمين',
  'Action': 'الإجراء',
  'patient': 'مريض',
  'patients': 'مرضى',
  'Review upcoming visits and update statuses.': 'مراجعة الزيارات القادمة وتحديث الحالات.',
  'Welcome back,': 'مرحباً بعودتك،',
  'Electronic Health Record': 'السجل الصحي الإلكتروني',
  'Add Record': 'إضافة سجل',
  'Issue Prescription': 'إصدار وصفة',
  'Add Medical Record': 'إضافة تقرير طبي',
  'Issue New Prescription': 'إصدار وصفة جديدة',
  'Category': 'الفئة',
  'Details & Findings': 'التفاصيل والنتائج',
  'Medication Name': 'اسم الدواء',
  'Doctor / Prescriber': 'الطبيب الواصف',
  'Confirm': 'تأكيد',
  'Complete': 'إنهاء',
  'Personal info': 'البيانات الشخصية',
  'Patient not found': 'لم يتم العثور على المريض',
  'Back to patient list': 'العودة إلى قائمة المرضى',
  'Patient chart & medical history': 'ملف المريض والسجل الطبي',
  'Add record': 'إضافة سجل',
  'Add prescription': 'إضافة وصفة',
  'Patient details': 'بيانات المريض',
  'Phone & email': 'الهاتف والبريد',
  'None provided': 'غير متوفر',
  'Not specified': 'غير محدد',
  'Unspecified': 'غير محدد',
  'Self-pay': 'دفع ذاتي',
  'No ID on file': 'لا يوجد رقم مسجل',
  'Emergency contact': 'جهة الاتصال للطوارئ',
  'None listed': 'غير مسجل',
  'No phone': 'لا يوجد هاتف',
  'Medical records': 'السجلات الطبية',
  'Lab tests, diagnostic reports, and visit summaries.': 'التحاليل والتقارير التشخيصية وملخصات الزيارات.',
  'No medical records entered for this patient yet.': 'لا توجد سجلات طبية مسجلة لهذا المريض بعد.',
  'Medications prescribed for this patient.': 'الأدوية الموصوفة لهذا المريض.',
  'No prescriptions registered for this patient.': 'لا توجد وصفات مسجلة لهذا المريض.',
  'Medication': 'الدواء',
  'Dosage & frequency': 'الجرعة والتكرار',
  'Dates': 'التواريخ',
  'Appointment history': 'سجل المواعيد',
  'No appointments on record for this patient.': 'لا توجد مواعيد مسجلة لهذا المريض.',
  'Date & time': 'التاريخ والوقت',
  'Update status': 'تحديث الحالة',
  'Add medical record': 'إضافة سجل طبي',
  'Upload or add a report, lab result, or visit summary for': 'رفع أو إضافة تقرير، نتيجة تحليل، أو ملخص زيارة للمريض',
  'Record category': 'فئة السجل',
  'Record title': 'عنوان السجل',
  'Notes & clinical details': 'الملاحظات والتفاصيل السريرية',
  'Attach document (optional)': 'إرفاق مستند (اختياري)',
  'Supported formats: PDF, PNG, JPG.': 'الملفات المدعومة: PDF, PNG, JPG.',
  'Save record': 'حفظ السجل',
  'Saving record...': 'جاري حفظ السجل...',
  'Create a new prescription for': 'إنشاء وصفة طبية جديدة للمريض',
  'Medication name': 'اسم الدواء',
  'End date (optional)': 'تاريخ الانتهاء (اختياري)',
  'Instructions / Notes': 'التعليمات / الملاحظات',
  'Save prescription': 'حفظ الوصفة',
  'Saving prescription...': 'جاري حفظ الوصفة...',
  'Dismiss': 'إغلاق',
  'Standard': 'قياسي',
  'Start': 'البدء',
  'End': 'الانتهاء',
  'Start:': 'البدء:',
  'End:': 'الانتهاء:',
  'Staff doctor': 'طبيب العيادة',
  'Date': 'التاريخ',
  'Date:': 'التاريخ:',
  'By': 'بواسطة',
  'By:': 'بواسطة:',

  // Statuses
  'pending': 'قيد الانتظار',
  'confirmed': 'مؤكد',
  'completed': 'مكتمل',
  'cancelled': 'ملغي',
  'active': 'نشط',
  'Pending': 'قيد الانتظار',
  'Cancelled': 'ملغي',
  'Active': 'نشط',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('portal_lang') as Language;
      if (saved === 'ar' || saved === 'en') {
        setLangState(saved);
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = saved;
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('portal_lang', newLang);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
  };

  const t = (text: string): string => {
    if (lang !== 'ar' || !text) return text;
    const trimmed = text.trim();
    if (DICTIONARY[trimmed]) return DICTIONARY[trimmed];
    // Case-insensitive lookup fallback
    const lower = trimmed.toLowerCase();
    const entry = Object.entries(DICTIONARY).find(([k]) => k.toLowerCase() === lower);
    return entry ? entry[1] : text;
  };

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
