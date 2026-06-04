import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminMeetingForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    speakerName: '',
    deadline: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Call GAS action=createMeeting
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', padding: '3rem 1.5rem' }}>
      <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '500' }}>
        &larr; กลับไปแผงควบคุม
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>สร้างงานประชุมใหม่</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ชื่อการประชุม *</label>
            <input type="text" name="title" className="form-input" required value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">รายละเอียด / หัวข้อย่อย *</label>
            <textarea name="description" className="form-input" rows="3" required value={formData.description} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">วันที่จัดงาน *</label>
              <input type="text" name="date" className="form-input" required placeholder="เช่น 15 ก.ค. 2026" value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">เวลา *</label>
              <input type="text" name="time" className="form-input" required placeholder="เช่น 09:00 - 16:00 น." value={formData.time} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">สถานที่จัดงาน *</label>
            <input type="text" name="location" className="form-input" required value={formData.location} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อวิทยากร</label>
            <input type="text" name="speakerName" className="form-input" value={formData.speakerName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">วัน/เวลาปิดรับสมัคร (Countdown Deadline) *</label>
            <input type="datetime-local" name="deadline" className="form-input" required value={formData.deadline} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'สร้างงานประชุม'}
          </button>
        </form>
      </div>
    </div>
  );
}
