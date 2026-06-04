import { useState, useEffect } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function AdminAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if session exists
    if (sessionStorage.getItem('adminToken') === 'verified') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('verifyAdmin', { password });
      if (res.valid) {
        sessionStorage.setItem('adminToken', 'verified');
        setIsAuthenticated(true);
      } else {
        setError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '400px', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '500' }}>
        &larr; กลับหน้าหลัก
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>เข้าสู่ระบบผู้ดูแล (Admin)</h2>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="password"
            className="form-input"
            placeholder="ใส่รหัสผ่านแอดมิน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '1rem' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
