import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

export default function AdminMeetingForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    speakerName: '',
    deadline: '',
    documentUrl: '',
    speakerPhotoUrl: ''
  });

  useEffect(() => {
    if (isEditMode) {
      // In production, fetch specific meeting details
      // api.get('getMeetingDetails&id=' + id).then(data => setFormData(data))
      
      // Mock data for demo
      setTimeout(() => {
        setFormData({
          title: 'การประชุมวิชาการประจำปี 2026',
          description: 'อัปเดตเทคโนโลยีทางการแพทย์',
          date: '15 ก.ค. 2026',
          time: '09:00 - 16:00 น.',
          location: 'ห้องประชุมใหญ่',
          speakerName: 'นพ. สมชาย ใจดี',
          deadline: '2026-07-10T23:59',
          documentUrl: '',
          speakerPhotoUrl: ''
        });
      }, 500);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (type === 'doc') setUploadingDoc(true);
    if (type === 'img') setUploadingImg(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Mock upload delay
        setTimeout(() => {
          if (type === 'doc') {
            setFormData(prev => ({ ...prev, documentUrl: 'https://example.com/mock-doc.pdf' }));
            setUploadingDoc(false);
          } else {
            setFormData(prev => ({ ...prev, speakerPhotoUrl: 'https://example.com/mock-img.jpg' }));
            setUploadingImg(false);
          }
          alert('อัปโหลดไฟล์จำลองเสร็จสิ้น (ในการใช้งานจริงจะไปบันทึกที่ Google Drive)');
        }, 1500);
        
        /* 
        // Real upload logic:
        const payload = {
          filename: file.name,
          mimeType: file.type,
          base64: reader.result,
          registrationId: 'ADMIN_UPLOAD' // mock id for folder prefix
        };
        const res = await api.post('uploadFile', payload);
        if (type === 'doc') setFormData(prev => ({ ...prev, documentUrl: res.fileUrl }));
        if (type === 'img') setFormData(prev => ({ ...prev, speakerPhotoUrl: res.fileUrl }));
        */
      } catch (err) {
        alert('อัปโหลดล้มเหลว');
      } finally {
        // setUploadingDoc(false); setUploadingImg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const action = isEditMode ? 'updateMeeting' : 'createMeeting';
    const payload = { ...formData, id: id };
    
    // api.post(action, payload).then(() => navigate('/admin'))
    
    setTimeout(() => {
      setLoading(false);
      navigate('/admin');
    }, 1000);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px', padding: '3rem 1.5rem' }}>
      <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--primary)', marginBottom: '2rem', fontWeight: '500' }}>
        &larr; กลับไปแผงควบคุม
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
          {isEditMode ? 'แก้ไขงานประชุม' : 'สร้างงานประชุมใหม่'}
        </h1>

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

          <div className="form-group" style={{ padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <label className="form-label">เอกสารประกอบการประชุม (เช่น กำหนดการ, แบบฟอร์มเบิกจ่าย)</label>
            <input type="file" className="form-input" accept=".pdf" onChange={(e) => handleFileUpload(e, 'doc')} disabled={uploadingDoc} />
            {uploadingDoc && <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>กำลังอัปโหลดเอกสาร...</p>}
            {formData.documentUrl && <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>แนบเอกสารแล้ว: <a href={formData.documentUrl} target="_blank" rel="noreferrer">ดูเอกสาร</a></p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">ชื่อวิทยากร</label>
              <input type="text" name="speakerName" className="form-input" value={formData.speakerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">รูปภาพวิทยากร</label>
              <input type="file" className="form-input" accept="image/*" onChange={(e) => handleFileUpload(e, 'img')} disabled={uploadingImg} />
              {uploadingImg && <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>กำลังอัปโหลดรูปภาพ...</p>}
              {formData.speakerPhotoUrl && <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>แนบรูปภาพแล้ว</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">วัน/เวลาปิดรับสมัคร (Countdown Deadline) *</label>
            <input type="datetime-local" name="deadline" className="form-input" required value={formData.deadline} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || uploadingDoc || uploadingImg}>
            {loading ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'สร้างงานประชุม')}
          </button>
        </form>
      </div>
    </div>
  );
}
