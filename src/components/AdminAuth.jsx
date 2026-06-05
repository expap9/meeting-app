import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { FiLock, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('adminToken') === 'verified') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('กรุณากรอกรหัสผ่าน');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('verifyAdmin', { password });
      if (res && (res.valid || res.success)) {
        sessionStorage.setItem('adminToken', 'verified');
        navigate('/admin');
      } else {
        setError(res?.message || 'รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Background decoration */}
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.card}>
        {/* Lock icon */}
        <div style={styles.iconWrap}>
          <FiLock size={32} color="#fff" />
        </div>

        <h1 style={styles.title}>เข้าสู่ระบบผู้ดูแล</h1>
        <p style={styles.subtitle}>กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบจัดการ</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>รหัสผ่าน</label>
          <div style={styles.inputWrap}>
            <FiLock size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
              style={styles.input}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff size={18} color="#94a3b8" /> : <FiEye size={18} color="#94a3b8" />}
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              <span style={{ marginRight: 6 }}>⚠</span>{error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>

        <a href="/" style={styles.backLink}>
          <FiArrowLeft size={16} style={{ marginRight: 6 }} />
          กลับหน้าหลัก
        </a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes adminauth-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes adminauth-fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: "'Prompt', 'Inter', sans-serif",
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    top: -100,
    right: -100,
    pointerEvents: 'none',
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
    bottom: -80,
    left: -80,
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: 20,
    padding: '48px 36px 36px',
    width: '100%',
    maxWidth: 420,
    textAlign: 'center',
    animation: 'adminauth-fadeIn 0.5s ease-out',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
  },
  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: '#f1f5f9',
    margin: '0 0 6px',
    fontFamily: "'Prompt', sans-serif",
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    margin: '0 0 28px',
    fontFamily: "'Prompt', sans-serif",
    fontWeight: 300,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: 4,
    fontFamily: "'Prompt', sans-serif",
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: 12,
    padding: '0 14px',
    transition: 'border-color 0.2s',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f1f5f9',
    fontSize: 15,
    padding: '14px 0',
    fontFamily: "'Prompt', sans-serif",
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: "'Prompt', sans-serif",
    textAlign: 'left',
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 12,
    padding: '14px 0',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  spinner: {
    width: 22,
    height: 22,
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'adminauth-spin 0.7s linear infinite',
    display: 'inline-block',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#94a3b8',
    fontSize: 14,
    textDecoration: 'none',
    marginTop: 20,
    fontFamily: "'Prompt', sans-serif",
    transition: 'color 0.2s',
  },
};
