import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const STEPS = [
  { label: 'รายละเอียดการประชุม', icon: '📋' },
  { label: 'ข้อมูลส่วนตัว', icon: '👤' },
  { label: 'ยินยอม PDPA', icon: '🔒' },
];

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
  });
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('getMeetings');
        const meetings = res.meetings || res.data || res;
        const found = Array.isArray(meetings)
          ? meetings.find((m) => String(m.id) === String(id))
          : null;
        if (found) {
          setMeeting(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => true;

  const validateStep2 = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!form.email.trim()) {
      errs.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (!form.phone.trim()) {
      errs.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else if (!/^[0-9\-+() ]{9,15}$/.test(form.phone)) {
      errs.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    }
    if (!form.organization.trim()) errs.organization = 'กรุณากรอกหน่วยงาน/องค์กร';
    if (!form.position.trim()) errs.position = 'กรุณากรอกตำแหน่ง';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    if (!pdpaConsent) {
      setErrors({ pdpa: 'กรุณายินยอมข้อกำหนด PDPA เพื่อดำเนินการต่อ' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validators = [validateStep1, validateStep2, validateStep3];

  const handleNext = () => {
    if (validators[step]()) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        meetingId: id,
        meetingTitle: meeting.title || meeting.name || '',
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        organization: form.organization.trim(),
        position: form.position.trim(),
        pdpaConsent: true,
      };
      const res = await api.post('register', payload);
      navigate('/thank-you', {
        state: { meeting, registrationId: res.registrationId },
      });
    } catch (err) {
      setSubmitError(err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Styles ─── */
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f5f0ff 50%, #fff0f6 100%)',
      fontFamily: "'Prompt', 'Inter', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      padding: '24px 16px 48px',
      boxSizing: 'border-box',
    },
    container: {
      width: '100%',
      maxWidth: 580,
    },
    card: {
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(80,60,180,0.10)',
      padding: '36px 28px',
      marginBottom: 20,
    },
    heading: {
      fontSize: 22,
      fontWeight: 700,
      color: '#1e1e2f',
      margin: '0 0 4px',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: '#7b7b8e',
      textAlign: 'center',
      margin: '0 0 28px',
    },
    /* progress */
    progressWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      marginBottom: 32,
    },
    stepCircle: (active, done) => ({
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: done ? '#fff' : active ? '#fff' : '#a0a0b8',
      background: done
        ? 'linear-gradient(135deg,#34d399,#10b981)'
        : active
        ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
        : '#eaeaf3',
      transition: 'all .3s',
      flexShrink: 0,
      boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
    }),
    stepLine: (done) => ({
      width: 48,
      height: 3,
      borderRadius: 2,
      background: done
        ? 'linear-gradient(90deg,#34d399,#10b981)'
        : '#eaeaf3',
      transition: 'background .3s',
      margin: '0 4px',
    }),
    stepLabel: (active) => ({
      fontSize: 11,
      color: active ? '#6366f1' : '#a0a0b8',
      fontWeight: active ? 600 : 400,
      textAlign: 'center',
      marginTop: 6,
      transition: 'color .3s',
    }),
    /* meeting card */
    meetingCard: {
      background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
      borderRadius: 16,
      padding: '22px 20px',
      marginBottom: 28,
      color: '#fff',
    },
    meetingTitle: {
      fontSize: 18,
      fontWeight: 700,
      margin: '0 0 14px',
    },
    meetingRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 1.5,
    },
    meetingIcon: {
      flexShrink: 0,
      width: 20,
      textAlign: 'center',
      opacity: 0.85,
    },
    /* form */
    fieldGroup: {
      marginBottom: 18,
    },
    label: {
      display: 'block',
      fontSize: 14,
      fontWeight: 600,
      color: '#1e1e2f',
      marginBottom: 6,
    },
    input: (hasError) => ({
      width: '100%',
      padding: '12px 14px',
      fontSize: 15,
      fontFamily: "'Prompt', 'Inter', sans-serif",
      border: `1.5px solid ${hasError ? '#ef4444' : '#e0e0ee'}`,
      borderRadius: 12,
      outline: 'none',
      transition: 'border .2s, box-shadow .2s',
      boxSizing: 'border-box',
      background: '#fafafe',
    }),
    inputFocus: {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
    },
    errorText: {
      fontSize: 12,
      color: '#ef4444',
      marginTop: 4,
      fontWeight: 500,
    },
    /* pdpa */
    pdpaBox: {
      background: '#f8f8fd',
      borderRadius: 14,
      padding: '20px 18px',
      border: '1px solid #e8e8f4',
      marginBottom: 18,
      maxHeight: 220,
      overflowY: 'auto',
      fontSize: 13,
      lineHeight: 1.8,
      color: '#444',
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      cursor: 'pointer',
      marginTop: 10,
    },
    checkbox: {
      width: 22,
      height: 22,
      accentColor: '#6366f1',
      cursor: 'pointer',
      flexShrink: 0,
      marginTop: 2,
    },
    /* buttons */
    btnRow: {
      display: 'flex',
      gap: 12,
      marginTop: 28,
    },
    btnPrimary: (disabled) => ({
      flex: 1,
      padding: '14px 0',
      background: disabled
        ? '#c4c4d8'
        : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: '#fff',
      border: 'none',
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 700,
      fontFamily: "'Prompt', 'Inter', sans-serif",
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'transform .15s, box-shadow .2s',
      boxShadow: disabled ? 'none' : '0 4px 16px rgba(99,102,241,0.30)',
    }),
    btnSecondary: {
      flex: 1,
      padding: '14px 0',
      background: '#f0f0fa',
      color: '#6366f1',
      border: '1.5px solid #e0e0f0',
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 600,
      fontFamily: "'Prompt', 'Inter', sans-serif",
      cursor: 'pointer',
      transition: 'background .15s',
    },
    /* status */
    center: {
      textAlign: 'center',
      padding: '48px 20px',
    },
    spinner: {
      width: 44,
      height: 44,
      border: '4px solid #e0e0ee',
      borderTop: '4px solid #6366f1',
      borderRadius: '50%',
      animation: 'regSpin 0.8s linear infinite',
      margin: '0 auto 16px',
    },
  };

  /* ─── Loading / Not Found ─── */
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.container, ...styles.center }}>
          <style>{`@keyframes regSpin{to{transform:rotate(360deg)}}`}</style>
          <div style={styles.spinner} />
          <p style={{ color: '#7b7b8e', fontSize: 15 }}>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.container, ...styles.center }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
          <h2 style={{ ...styles.heading, marginBottom: 10 }}>ไม่พบการประชุม</h2>
          <p style={{ color: '#7b7b8e', fontSize: 15, margin: '0 0 24px' }}>
            ไม่พบข้อมูลการประชุมที่ระบุ กรุณาตรวจสอบลิงก์อีกครั้ง
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              ...styles.btnPrimary(false),
              flex: 'none',
              padding: '12px 32px',
              display: 'inline-block',
            }}
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  /* ─── Progress Indicator ─── */
  const ProgressBar = () => (
    <div>
      <div style={styles.progressWrap}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={styles.stepCircle(i === step, i < step)}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && <div style={styles.stepLine(i < step)} />}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 8px',
          marginBottom: 4,
        }}
      >
        {STEPS.map((s, i) => (
          <span key={i} style={{ ...styles.stepLabel(i === step), flex: 1 }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );

  /* ─── Step 1: Meeting Details ─── */
  const Step1 = () => (
    <div>
      <div style={styles.meetingCard}>
        <h3 style={styles.meetingTitle}>
          {meeting.title || meeting.name || 'การประชุม'}
        </h3>
        {(meeting.date || meeting.meetingDate) && (
          <div style={styles.meetingRow}>
            <span style={styles.meetingIcon}>📅</span>
            <span>
              <strong>วันที่:</strong>{' '}
              {meeting.date || meeting.meetingDate}
            </span>
          </div>
        )}
        {(meeting.time || meeting.meetingTime) && (
          <div style={styles.meetingRow}>
            <span style={styles.meetingIcon}>🕐</span>
            <span>
              <strong>เวลา:</strong>{' '}
              {meeting.time || meeting.meetingTime}
            </span>
          </div>
        )}
        {(meeting.location || meeting.venue) && (
          <div style={styles.meetingRow}>
            <span style={styles.meetingIcon}>📍</span>
            <span>
              <strong>สถานที่:</strong>{' '}
              {meeting.location || meeting.venue}
            </span>
          </div>
        )}
        {(meeting.speaker || meeting.organizer) && (
          <div style={styles.meetingRow}>
            <span style={styles.meetingIcon}>🎤</span>
            <span>
              <strong>วิทยากร:</strong>{' '}
              {meeting.speaker || meeting.organizer}
            </span>
          </div>
        )}
        {meeting.description && (
          <div style={{ ...styles.meetingRow, marginTop: 12, opacity: 0.9 }}>
            <span style={styles.meetingIcon}>📝</span>
            <span>{meeting.description}</span>
          </div>
        )}
      </div>
      <p
        style={{
          fontSize: 14,
          color: '#7b7b8e',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        กรุณาตรวจสอบรายละเอียดการประชุมด้านบน
        <br />
        แล้วกด <strong>"ถัดไป"</strong> เพื่อกรอกข้อมูลลงทะเบียน
      </p>
    </div>
  );

  /* ─── Step 2: Personal Info ─── */
  const fields = [
    { key: 'fullName', label: 'ชื่อ-นามสกุล', type: 'text', placeholder: 'เช่น นายสมชาย ใจดี' },
    { key: 'email', label: 'อีเมล', type: 'email', placeholder: 'example@email.com' },
    { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'tel', placeholder: '08x-xxx-xxxx' },
    { key: 'organization', label: 'หน่วยงาน / องค์กร', type: 'text', placeholder: 'เช่น โรงพยาบาลศิริราช' },
    { key: 'position', label: 'ตำแหน่ง', type: 'text', placeholder: 'เช่น แพทย์ผู้เชี่ยวชาญ' },
  ];

  const Step2 = () => (
    <div>
      {fields.map((f) => (
        <div key={f.key} style={styles.fieldGroup}>
          <label style={styles.label}>{f.label} *</label>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={handleChange(f.key)}
            placeholder={f.placeholder}
            style={styles.input(!!errors[f.key])}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = errors[f.key] ? '#ef4444' : '#e0e0ee';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors[f.key] && <div style={styles.errorText}>{errors[f.key]}</div>}
        </div>
      ))}
    </div>
  );

  /* ─── Step 3: PDPA ─── */
  const Step3 = () => (
    <div>
      <div style={styles.pdpaBox}>
        <strong style={{ fontSize: 14, color: '#1e1e2f' }}>
          ข้อกำหนดการคุ้มครองข้อมูลส่วนบุคคล (PDPA)
        </strong>
        <br />
        <br />
        ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (Personal Data Protection Act:
        PDPA) ข้าพเจ้ายินยอมให้หน่วยงานผู้จัดการประชุมเก็บรวบรวม ใช้
        และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้า ดังต่อไปนี้:
        <br />
        <br />
        <strong>1. ข้อมูลที่เก็บรวบรวม:</strong> ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์,
        หน่วยงาน/องค์กร, ตำแหน่ง
        <br />
        <br />
        <strong>2. วัตถุประสงค์:</strong> เพื่อใช้ในการลงทะเบียนเข้าร่วมการประชุม
        การติดต่อสื่อสารเกี่ยวกับการประชุม การจัดทำใบประกาศนียบัตร
        และการรายงานผลการจัดประชุมต่อหน่วยงานที่เกี่ยวข้อง
        <br />
        <br />
        <strong>3. ระยะเวลาจัดเก็บ:</strong>{' '}
        ข้อมูลจะถูกจัดเก็บเป็นระยะเวลาไม่เกิน 1 ปี นับจากวันที่จัดประชุม
        หลังจากนั้นข้อมูลจะถูกลบหรือทำให้ไม่สามารถระบุตัวตนได้
        <br />
        <br />
        <strong>4. สิทธิของเจ้าของข้อมูล:</strong> ท่านมีสิทธิเข้าถึง แก้ไข ลบ
        หรือเพิกถอนความยินยอมในข้อมูลส่วนบุคคลของท่านได้ตลอดเวลา
        โดยติดต่อผู้จัดงานผ่านช่องทางที่กำหนด
        <br />
        <br />
        <strong>5. มาตรการรักษาความปลอดภัย:</strong>{' '}
        ข้อมูลของท่านจะได้รับการปกป้องด้วยมาตรการรักษาความปลอดภัยที่เหมาะสม
        เพื่อป้องกันการเข้าถึง การใช้ การเปลี่ยนแปลง หรือการเปิดเผยข้อมูลโดยมิชอบ
      </div>

      <label style={styles.checkboxRow} onClick={() => setPdpaConsent((v) => !v)}>
        <input
          type="checkbox"
          checked={pdpaConsent}
          onChange={(e) => {
            setPdpaConsent(e.target.checked);
            if (errors.pdpa) setErrors({});
          }}
          style={styles.checkbox}
        />
        <span style={{ fontSize: 14, color: '#1e1e2f', lineHeight: 1.6 }}>
          ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
          ตามข้อกำหนดข้างต้น
        </span>
      </label>
      {errors.pdpa && (
        <div style={{ ...styles.errorText, marginTop: 8 }}>{errors.pdpa}</div>
      )}

      {submitError && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            color: '#dc2626',
            fontSize: 14,
          }}
        >
          ⚠️ {submitError}
        </div>
      )}
    </div>
  );

  const stepContent = [<Step1 key={0} />, <Step2 key={1} />, <Step3 key={2} />];

  return (
    <div style={styles.page}>
      <style>
        {`@keyframes regSpin{to{transform:rotate(360deg)}}
          @media(max-width:480px){
            .reg-card{padding:24px 16px !important}
          }`}
      </style>
      <div style={styles.container}>
        <div style={styles.card} className="reg-card">
          <h1 style={styles.heading}>ลงทะเบียนเข้าร่วมประชุม</h1>
          <p style={styles.subtitle}>
            ขั้นตอนที่ {step + 1} จาก {STEPS.length} — {STEPS[step].label}
          </p>

          <ProgressBar />

          {stepContent[step]}

          <div style={styles.btnRow}>
            {step > 0 && (
              <button
                style={styles.btnSecondary}
                onClick={handleBack}
                disabled={submitting}
              >
                ← ย้อนกลับ
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button style={styles.btnPrimary(false)} onClick={handleNext}>
                ถัดไป →
              </button>
            ) : (
              <button
                style={styles.btnPrimary(submitting)}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        borderTop: '2.5px solid #fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'regSpin 0.7s linear infinite',
                      }}
                    />
                    กำลังส่ง...
                  </span>
                ) : (
                  'ยืนยันลงทะเบียน ✓'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
