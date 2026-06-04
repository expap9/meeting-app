import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [meeting, setMeeting] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    pdpaConsent: false
  });

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const meetings = await api.get('getMeetings');
        const m = meetings.find(item => String(item.id) === String(id));
        setMeeting(m);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "กรุณากรอกชื่อ-นามสกุล";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "รูปแบบอีเมลไม่ถูกต้อง";
    if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/\D/g, ''))) return "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก";
    if (!formData.pdpaConsent) return "กรุณายอมรับนโยบายความเป็นส่วนตัว (PDPA)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        meetingId: id,
        meetingTitle: meeting?.title || 'Unknown',
        ...formData
      };
      const res = await api.post('register', payload);
      
      if (res.status === 'success') {
        navigate('/thank-you', { state: { meeting, registrationId: res.registrationId } });
      } else {
        setError("ลงทะเบียนไม่สำเร็จ: " + res.message);
        setLoading(false);
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', padding: '3rem 1.5rem' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '500' }}>
        &larr; กลับไปหน้ารายการ
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>แบบฟอร์มลงทะเบียน</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          รหัสการประชุม: {id}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ชื่อ - นามสกุล *</label>
            <input 
              type="text" name="fullName" className="form-input" required 
              value={formData.fullName} onChange={handleChange} 
              placeholder="นพ. / พญ. / นาย / นางสาว"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">อีเมล (สำหรับรับแจ้งเตือน) *</label>
            <input 
              type="email" name="email" className="form-input" required 
              value={formData.email} onChange={handleChange} 
              placeholder="example@hospital.com"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">เบอร์โทรศัพท์ *</label>
            <input 
              type="tel" name="phone" className="form-input" required 
              value={formData.phone} onChange={handleChange} 
              placeholder="08X-XXX-XXXX"
              maxLength={15}
            />
          </div>

          <div className="form-group">
            <label className="form-label">หน่วยงาน / โรงพยาบาล</label>
            <input 
              type="text" name="organization" className="form-input" 
              value={formData.organization} onChange={handleChange} 
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ตำแหน่ง</label>
            <input 
              type="text" name="position" className="form-input" 
              value={formData.position} onChange={handleChange} 
              maxLength={100}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '2rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
            <input 
              type="checkbox" 
              id="pdpaConsent" 
              name="pdpaConsent" 
              checked={formData.pdpaConsent} 
              onChange={handleChange}
              style={{ marginTop: '0.3rem', width: '1.2rem', height: '1.2rem' }}
            />
            <label htmlFor="pdpaConsent" style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
              <strong>นโยบายความเป็นส่วนตัว (PDPA)</strong><br />
              ข้าพเจ้ายินยอมให้ทางผู้จัดงานเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลที่ให้ไว้ เพื่อวัตถุประสงค์ในการบริหารจัดการการประชุม และเพื่อส่งข้อมูลข่าวสารที่เกี่ยวข้องกับการประชุมนี้เท่านั้น
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการลงทะเบียน'}
          </button>
        </form>
      </div>
    </div>
  );
}
