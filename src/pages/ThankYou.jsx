import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';

export default function ThankYou() {
  const location = useLocation();
  const regId = location.state?.regId || "REG-UNKNOWN";
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    
    // Mock base64 conversion and GAS upload
    const reader = new FileReader();
    reader.onload = () => {
      // const base64 = reader.result;
      setTimeout(() => {
        setUploading(false);
        setUploaded(true);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <FaCheckCircle color="var(--secondary)" size={80} style={{ marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>ลงทะเบียนสำเร็จ!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        ระบบได้ส่งอีเมลยืนยันไปยังอีเมลของคุณเรียบร้อยแล้ว
      </p>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '3rem' }}>
        รหัสอ้างอิง: <span style={{ color: 'var(--primary)' }}>{regId}</span>
      </p>

      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          <FaCloudUploadAlt /> อัปโหลดเอกสารเพิ่มเติม (ถ้ามี)
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          รองรับไฟล์ PDF หรือรูปภาพ (สลิปโอนเงิน, ใบรับรอง ฯลฯ)
        </p>

        {uploaded ? (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: '500' }}>
            อัปโหลดเอกสารเรียบร้อยแล้ว
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="file" className="form-input" accept=".pdf,image/*" onChange={handleFileChange} />
            <button 
              className="btn btn-primary" 
              onClick={handleUpload} 
              disabled={!file || uploading}
              style={{ justifyContent: 'center' }}
            >
              {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดเอกสาร'}
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem' }}>
        <Link to="/" className="btn btn-secondary">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    </div>
  );
}
