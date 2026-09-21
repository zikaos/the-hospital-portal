const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const FFMPEG = 'C:\\Users\\zika\\AppData\\Local\\ms-playwright\\ffmpeg-1011\\ffmpeg-win64.exe';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TEMP_DIR = path.resolve(__dirname, 'temp-recordings');
const FINAL_MP4 = path.resolve(__dirname, '../docs/The_Hospital_Portal_Demo.mp4');

async function runDemo() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  console.log('Launching browser for live portal recording...');
  const browser = await chromium.launch({
    executablePath: EDGE,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: TEMP_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  // Helper to display an on-screen guide badge at the bottom of the real page
  async function setGuide(step, title, detail) {
    await page.evaluate(
      ({ step, title, detail }) => {
        let el = document.getElementById('demo-guide-badge');
        if (!el) {
          el = document.createElement('div');
          el.id = 'demo-guide-badge';
          el.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #0A0A0A;
            color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12);
            padding: 12px 22px;
            display: flex;
            align-items: center;
            gap: 14px;
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 85%;
            pointer-events: none;
            transition: all 0.3s ease;
          `;
          document.body.appendChild(el);
        }
        el.innerHTML = `
          <div style="width:32px;height:32px;border-radius:8px;background:#0671B8;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#ffffff;flex-shrink:0;">
            ${step}
          </div>
          <div>
            <div style="font-size:14px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;">${title}</div>
            <div style="font-size:11.5px;color:#A0AEC0;margin-top:1px;">${detail}</div>
          </div>
        `;
      },
      { step, title, detail }
    );
  }

  // Helper to move fake cursor and click smoothly
  async function clickWithCursor(selector) {
    try {
      const el = await page.waitForSelector(selector, { timeout: 4000 });
      const box = await el.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.evaluate(
          ({ x, y }) => {
            let cur = document.getElementById('demo-fake-cursor');
            if (!cur) {
              cur = document.createElement('div');
              cur.id = 'demo-fake-cursor';
              cur.style.cssText = `
                position: fixed;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                background: rgba(6, 113, 184, 0.7);
                border: 2px solid #FFFFFF;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                pointer-events: none;
                z-index: 1000000;
                transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1);
                transform: translate(200px, 200px);
              `;
              document.body.appendChild(cur);
            }
            cur.style.transform = `translate(${x - 11}px, ${y - 11}px)`;
          },
          { x, y }
        );
        await page.waitForTimeout(400);
        await el.click();
        await page.waitForTimeout(200);
      } else {
        await el.click();
      }
    } catch (e) {
      console.warn('Click selector fallback:', selector, e.message);
    }
  }

  console.log('1. Navigating to landing page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await setGuide(
    '1/7',
    'The Hospital Portal Home',
    'Clinical portal homepage with instant access to patient & staff workspaces'
  );
  await page.waitForTimeout(2200);

  console.log('2. Demonstrating Language Switcher...');
  await setGuide(
    '2/7',
    'Instant Arabic Translation',
    'One-click switch to العربية with Cairo typography and full RTL layout'
  );
  await clickWithCursor('button[aria-label="Toggle language"]');
  await setGuide(
    '2/7',
    'التحويل الفوري إلى اللغة العربية',
    'تصميم كامل من اليمين إلى اليسار مع خط Cairo وتحديث فوري بدون إعادة تحميل'
  );
  await page.waitForTimeout(2500);

  // Switch back to English for remaining walkthrough
  await clickWithCursor('button[aria-label="Toggle language"]');
  await setGuide(
    '2/7',
    'Bilingual Architecture',
    'Language preference persists across sessions with zero page reload'
  );
  await page.waitForTimeout(1400);

  console.log('3. Navigating to Patient Login...');
  await setGuide(
    '3/7',
    'Patient Sign-In',
    'Using pre-configured demo credentials for Sarah Chen (Zero email confirmation)'
  );
  await clickWithCursor('header a[href="/login"] button');
  await page.waitForURL('**/login', { timeout: 5000 });
  await page.waitForTimeout(1200);

  // Click Quick Fill button
  await setGuide(
    '3/7',
    'Instant Demo Fill',
    'Clicking "Demo: Fill Sarah Chen credentials" to auto-populate email and password'
  );
  await clickWithCursor('button:has-text("Sarah Chen")');
  await page.waitForTimeout(1200);

  // Submit login
  await clickWithCursor('button[type="submit"]');
  await page.waitForURL('**/patient/dashboard', { timeout: 5000 });
  await page.waitForTimeout(800);

  console.log('4. Exploring Patient Dashboard...');
  await setGuide(
    '4/7',
    'Patient Overview Dashboard',
    'Real-time view of upcoming consultations, active prescriptions, and updates'
  );
  await page.waitForTimeout(2500);

  console.log('5. Booking an Appointment...');
  await setGuide(
    '5/7',
    'Appointment Scheduling',
    'Navigating to Appointments to book a consultation with Dr. Marcus Vance'
  );
  await clickWithCursor('aside a[href="/patient/appointments"]');
  await page.waitForURL('**/patient/appointments', { timeout: 5000 });
  await page.waitForTimeout(1400);

  // Open booking modal
  await clickWithCursor('button:has-text("Book appointment")');
  await page.waitForTimeout(1000);

  // Fill appointment reason
  await page.fill(
    'textarea[placeholder*="reason" i], textarea#reason, textarea',
    'Annual cardiovascular follow-up and blood pressure review'
  );
  await page.waitForTimeout(1000);

  // Submit appointment
  await clickWithCursor('button:has-text("Confirm Booking")');
  await setGuide(
    '5/7',
    'Consultation Confirmed',
    'New visit submitted with status Pending for clinical review'
  );
  await page.waitForTimeout(2000);

  console.log('6. Reviewing Records & Prescriptions...');
  await setGuide(
    '6/7',
    'Diagnostic Medical Records',
    'Categorized lab panels, visit summaries, and downloadable findings'
  );
  await clickWithCursor('aside a[href="/patient/records"]');
  await page.waitForURL('**/patient/records', { timeout: 5000 });
  await page.waitForTimeout(2200);

  await setGuide(
    '6/7',
    'Active Prescriptions',
    'Dosage instructions, daily frequency, treatment dates, and physician notes'
  );
  await clickWithCursor('aside a[href="/patient/prescriptions"]');
  await page.waitForURL('**/patient/prescriptions', { timeout: 5000 });
  await page.waitForTimeout(2200);

  console.log('7. Switching to Staff Clinical Workspace...');
  await setGuide(
    '7/7',
    'Staff Clinical Gateway',
    'Entering the secure staff portal protected by clinic passcode APEX-STAFF-9021'
  );
  await page.goto('http://localhost:3000/staff-portal', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Click Quick Fill for Dr. Vance
  await setGuide(
    '7/7',
    'Doctor Authentication',
    'Auto-populating credentials for Dr. Marcus Vance + Security Passcode'
  );
  await clickWithCursor('button:has-text("Marcus Vance")');
  await page.waitForTimeout(1200);

  // Sign in to staff workspace
  await clickWithCursor('button[type="submit"]');
  await page.waitForURL('**/staff/dashboard', { timeout: 5000 });
  await setGuide(
    '7/7',
    'Clinical Triage Queue',
    'Review incoming patient appointments with 1-click triage actions'
  );
  await page.waitForTimeout(2500);

  console.log('8. Opening Patient Chart...');
  await setGuide(
    '7/7',
    'Electronic Health Record (EHR)',
    'Full clinical history, demographics, add medical record modal, & prescriptions'
  );
  await clickWithCursor('aside a[href="/staff/patients"]');
  await page.waitForURL('**/staff/patients', { timeout: 5000 });
  await page.waitForTimeout(1200);

  // Click open chart on first patient
  await clickWithCursor('table tbody tr:first-child a button, a:has-text("Open Chart"):first-of-type, button:has-text("Open Chart")');
  await page.waitForTimeout(2500);

  await setGuide(
    'Complete',
    'The Hospital Portal Guide Finished',
    'Fully functional, bilingual, zero-friction healthcare portal'
  );
  await page.waitForTimeout(2500);

  console.log('Finishing recording and saving video...');
  const video = page.video();
  await context.close();
  await browser.close();

  const videoPath = await video.path();
  console.log('Recorded raw webm video:', videoPath);

  // Convert to high-compatibility MP4 using playwright ffmpeg
  console.log('Encoding to MP4:', FINAL_MP4);
  execFileSync(FFMPEG, [
    '-i',
    videoPath,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '22',
    '-pix_fmt',
    'yuv420p',
    '-y',
    FINAL_MP4,
  ]);

  const stats = fs.statSync(FINAL_MP4);
  console.log(`SUCCESS! Live portal demo video generated: ${FINAL_MP4} (${stats.size} bytes)`);
}

runDemo().catch((err) => {
  console.error('Demo recording error:', err);
  process.exit(1);
});
