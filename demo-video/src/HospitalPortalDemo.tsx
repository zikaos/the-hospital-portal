import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper for smooth fade-in and slide-up
const FadeSlide: React.FC<{
  delay?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const translateY = interpolate(progress, [0, 1], [35, 0]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const HospitalPortalDemo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FAFAFA',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#0A0A0A',
      }}
    >
      {/* Background soft ambient dots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(#E8E8EC 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
        }}
      />

      {/* Top persistent header bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 70,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E8E8EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 60px',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              backgroundColor: '#0671B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            +
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>
            The Hospital Portal
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #E8E8EC',
              backgroundColor: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              color: '#0671B8',
            }}
          >
            English / العربية
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              backgroundColor: '#0671B8',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Live Prototype
          </div>
        </div>
      </div>

      {/* SCENE 1: Introduction (Frames 0 - 90 / 0s - 3s) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 120px',
            textAlign: 'center',
          }}
        >
          <FadeSlide delay={5}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 9999,
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 20,
              }}
            >
              Healthcare Web Platform
            </div>
          </FadeSlide>

          <FadeSlide delay={12}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.15,
                marginBottom: 20,
                color: '#0A0A0A',
              }}
            >
              Manage visits, lab records, <br />
              and prescriptions in one place.
            </h1>
          </FadeSlide>

          <FadeSlide delay={20}>
            <p
              style={{
                fontSize: 22,
                color: '#6B6B6B',
                maxWidth: 800,
                lineHeight: 1.5,
                marginBottom: 40,
              }}
            >
              A modern dual-portal system for patients and attending physicians,
              featuring instant login, bilingual English &amp; Arabic RTL, and
              electronic health records.
            </p>
          </FadeSlide>

          <FadeSlide delay={28}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div
                style={{
                  padding: '12px 28px',
                  borderRadius: 8,
                  backgroundColor: '#0671B8',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: '0 4px 14px rgba(6, 113, 184, 0.3)',
                }}
              >
                Launch Patient View
              </div>
              <div
                style={{
                  padding: '12px 28px',
                  borderRadius: 8,
                  border: '1px solid #E8E8EC',
                  backgroundColor: '#FFFFFF',
                  color: '#0A0A0A',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                Staff Clinical Gateway
              </div>
            </div>
          </FadeSlide>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 2: Patient Workspace (Frames 90 - 180 / 3s - 6s) */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '90px 140px 40px 140px',
          }}
        >
          <FadeSlide delay={2}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#0671B8',
                letterSpacing: 1.2,
                marginBottom: 8,
              }}
            >
              Patient Portal • sarah.chen@example.com
            </div>
            <h2
              style={{
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: -0.8,
                marginBottom: 28,
              }}
            >
              Frictionless Patient Experience
            </h2>
          </FadeSlide>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 24,
            }}
          >
            <FadeSlide delay={8}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8EC',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: '#E0F2FE',
                    color: '#0671B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 16,
                    fontWeight: 700,
                  }}
                >
                  CAL
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Book Consultations
                </h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.45 }}>
                  Select attending physician, choose date and time, and submit
                  real-time consultation requests.
                </p>
                <div
                  style={{
                    marginTop: 16,
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Status: Confirmed
                </div>
              </div>
            </FadeSlide>

            <FadeSlide delay={14}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8EC',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: '#CCFBF1',
                    color: '#0F766E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 16,
                    fontWeight: 700,
                  }}
                >
                  DOC
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Medical Records
                </h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.45 }}>
                  Access completed lab diagnostics, pathology reports, and
                  physician consultation summaries.
                </p>
                <div
                  style={{
                    marginTop: 16,
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Download Available
                </div>
              </div>
            </FadeSlide>

            <FadeSlide delay={20}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8EC',
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    marginBottom: 16,
                    fontWeight: 700,
                  }}
                >
                  RX
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  Active Prescriptions
                </h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.45 }}>
                  Track active medications, dosages, dosing frequencies, and
                  physician instructions.
                </p>
                <div
                  style={{
                    marginTop: 16,
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Regimen Active
                </div>
              </div>
            </FadeSlide>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: Arabic & RTL Support (Frames 180 - 270 / 6s - 9s) */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '90px 140px 40px 140px',
            textAlign: 'center',
          }}
        >
          <FadeSlide delay={2}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#00A8A7',
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              Zero-Reload Translation
            </div>
            <h2
              style={{
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: -1,
                marginBottom: 16,
              }}
            >
              Full Arabic &amp; RTL Support
            </h2>
            <p
              style={{
                fontSize: 18,
                color: '#6B6B6B',
                maxWidth: 650,
                marginBottom: 36,
              }}
            >
              One click switches the entire UI to Arabic with native Cairo
              typography, bidirectional layouts, and mirrored controls.
            </p>
          </FadeSlide>

          <FadeSlide delay={12}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E8EC',
                borderRadius: 16,
                padding: '32px 48px',
                display: 'flex',
                alignItems: 'center',
                gap: 40,
                boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
                direction: 'rtl',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#0A0A0A',
                    marginBottom: 6,
                  }}
                >
                  بوابة المستشفى الإكلينيكية
                </h3>
                <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 12 }}>
                  حجز المواعيد • السجلات والتحاليل • الوصفات الدوائية
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      backgroundColor: '#E0F2FE',
                      color: '#0671B8',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    لوحة التحكم
                  </span>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      backgroundColor: '#CCFBF1',
                      color: '#0F766E',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    السجلات الطبية
                  </span>
                </div>
              </div>

              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#0671B8',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                AR
              </div>
            </div>
          </FadeSlide>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 4: Staff Clinical Workspace (Frames 270 - 360 / 9s - 12s) */}
      <Sequence from={270} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '90px 140px 40px 140px',
          }}
        >
          <FadeSlide delay={2}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#0671B8',
                letterSpacing: 1.2,
                marginBottom: 8,
              }}
            >
              Doctor Workspace • Passcode APEX-STAFF-9021
            </div>
            <h2
              style={{
                fontSize: 38,
                fontWeight: 800,
                letterSpacing: -0.8,
                marginBottom: 28,
              }}
            >
              Clinical Triage &amp; Charting
            </h2>
          </FadeSlide>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 28,
            }}
          >
            <FadeSlide delay={8}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8EC',
                  borderRadius: 12,
                  padding: 28,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                  Today's Live Queue
                </h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 20 }}>
                  Incoming patient appointment triage with 1-click status
                  actions.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Confirm Visit
                  </div>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Complete
                  </div>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid #FEE2E2',
                      color: '#DC2626',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            </FadeSlide>

            <FadeSlide delay={16}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E8E8EC',
                  borderRadius: 12,
                  padding: 28,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                }}
              >
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                  Electronic Health Record
                </h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 20 }}>
                  Directly author diagnostic findings and issue electronic
                  prescriptions.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      border: '1px solid #E8E8EC',
                      backgroundColor: '#FAFAFA',
                      color: '#0A0A0A',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    + Add Medical Record
                  </div>
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      backgroundColor: '#0671B8',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    + Issue Prescription
                  </div>
                </div>
              </div>
            </FadeSlide>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 5: Conclusion & Summary (Frames 360 - 450 / 12s - 15s) */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 140px',
            textAlign: 'center',
          }}
        >
          <FadeSlide delay={2}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                backgroundColor: '#0671B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 32,
                fontWeight: 800,
                marginBottom: 20,
                boxShadow: '0 8px 24px rgba(6, 113, 184, 0.3)',
              }}
            >
              +
            </div>
            <h2
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: -1,
                marginBottom: 12,
              }}
            >
              The Hospital Portal
            </h2>
            <p
              style={{
                fontSize: 19,
                color: '#6B6B6B',
                maxWidth: 700,
                marginBottom: 32,
              }}
            >
              Complete prototype with zero email verification friction, full
              Arabic RTL translation, and customer documentation.
            </p>
          </FadeSlide>

          <FadeSlide delay={12}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  padding: '10px 22px',
                  borderRadius: 6,
                  border: '1px solid #E8E8EC',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#0A0A0A',
                }}
              >
                Vercel Deployed
              </div>
              <div
                style={{
                  padding: '10px 22px',
                  borderRadius: 6,
                  border: '1px solid #E8E8EC',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#0A0A0A',
                }}
              >
                User Guide PDF Ready
              </div>
              <div
                style={{
                  padding: '10px 22px',
                  borderRadius: 6,
                  backgroundColor: '#0671B8',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Ready for Demonstration
              </div>
            </div>
          </FadeSlide>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
