import { useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../api';
import { FaCheckCircle } from 'react-icons/fa';

export default function ThankYou() {
  const location = useLocation();
  const { meeting, registrationId } = location.state || {};

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  const handleFile = (f) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setUploadError('รองรับเฉพาะไฟล์ PDF และรูปภาพ (PNG, JPG, GIF, WEBP)');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 10 MB');
      return;
    }
    setFile(f);
    setUploadError('');
    setUploaded(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await api.post('uploadFile', {
        filename: file.name,
        mimeType: file.type,
        base64,
        registrationId,
      });
      setUploaded(true);
      setFile(null);
    } catch (err) {
      setUploadError(err?.message || 'อัปโหลดไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /* ─── Styles ─── */
  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f0fe 0%, #f5f0ff 50%, #fff0f6 100%)',
      fontFamily: "'Prompt', 'Inter', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      padding: '32px 16px 48px',
      boxSizing: 'border-box',
    },
    container: {
      width: '100%',
      maxWidth: 540,
    },
    card: {
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(80,60,180,0.10)',
      padding: '40px 28px',
      marginBottom: 20,
      textAlign: 'center',
    },
    iconWrap: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 88,
      height: 88,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
      marginBottom: 20,
      animation: 'tyPop 0.6s cubic-bezier(.17,.67,.29,1.3)',
    },
    icon: {
      color: '#10b981',
      fontSize: 48,
      animation: 'tyCheck 0.5s ease 0.3s both',
    },
    heading: {
      fontSize: 24,
      fontWeight: 700,
      color: '#1e1e2f',
      margin: '0 0 8px',
    },
    subtitle: {
      fontSize: 15,
      color: '#7b7b8e',
      margin: '0 0 24px',
      lineHeight: 1.6,
    },
    idBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      color: '#fff',
      padding: '10px 28px',
      borderRadius: 14,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 1,
      marginBottom: 8,
      boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
    },
    idLabel: {
      fontSize: 12,
      color: '#a0a0b8',
      marginBottom: 20,
    },
    meetingName: {
      fontSize: 16,
      color: '#4b5563',
      background: '#f8f8fd',
      borderRadius: 12,
      padding: '12px 18px',
      margin: '0 0 8px',
      border: '1px solid #eee',
      fontWeight: 500,
    },
    /* Upload section */
    uploadCard: {
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(80,60,180,0.10)',
      padding: '28px 24px',
      marginBottom: 20,
    },
    uploadTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: '#1e1e2f',
      margin: '0 0 6px',
      textAlign: 'center',
    },
    uploadSub: {
      fontSize: 13,
      color: '#7b7b8e',
      textAlign: 'center',
      margin: '0 0 18px',
    },
    dropzone: (active) => ({
      border: `2px dashed ${active ? '#6366f1' : '#d0d0e0'}`,
      borderRadius: 16,
      padding: '32px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all .2s',
      background: active ? '#f5f3ff' : '#fafafe',
    }),
    dropIcon: {
      fontSize: 36,
      marginBottom: 8,
    },
    dropText: {
      fontSize: 14,
      color: '#6b7280',
      margin: '0 0 4px',
    },
    dropHint: {
      fontSize: 12,
      color: '#a0a0b8',
      margin: 0,
    },
    filePreview: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 14px',
      background: '#f8f8fd',
      borderRadius: 12,
      marginTop: 14,
      border: '1px solid #eee',
    },
    fileIcon: {
      fontSize: 28,
      flexShrink: 0,
    },
    fileInfo: {
      flex: 1,
      textAlign: 'left',
    },
    fileName: {
      fontSize: 14,
      fontWeight: 600,
      color: '#1e1e2f',
      margin: 0,
      wordBreak: 'break-all',
    },
    fileSize: {
      fontSize: 12,
      color: '#a0a0b8',
      margin: 0,
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#ef4444',
      fontSize: 18,
      cursor: 'pointer',
      padding: 4,
    },
    uploadBtn: (disabled) => ({
      width: '100%',
      padding: '14px 0',
      marginTop: 14,
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
      boxShadow: disabled ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
      transition: 'all .2s',
    }),
    successBanner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '14px 18px',
      background: '#ecfdf5',
      border: '1px solid #a7f3d0',
      borderRadius: 12,
      marginTop: 14,
      color: '#059669',
      fontWeight: 600,
      fontSize: 14,
    },
    errorBanner: {
      padding: '12px 16px',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: 12,
      color: '#dc2626',
      fontSize: 14,
      marginTop: 14,
      textAlign: 'center',
    },
    homeBtn: {
      display: 'inline-block',
      padding: '14px 36px',
      background: '#f0f0fa',
      color: '#6366f1',
      border: '1.5px solid #e0e0f0',
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 600,
      fontFamily: "'Prompt', 'Inter', sans-serif",
      textDecoration: 'none',
      transition: 'background .15s',
    },
  };

  /* ─── No state guard ─── */
  if (!registrationId) {
    return (
      <div style={s.page}>
        <div style={s.container}>
          <div style={{ ...s.card }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
            <h2 style={{ ...s.heading, marginBottom: 10 }}>ไม่พบข้อมูลการลงทะเบียน</h2>
            <p style={{ color: '#7b7b8e', fontSize: 15, margin: '0 0 24px' }}>
              กรุณาลงทะเบียนใหม่อีกครั้ง
            </p>
            <Link to="/" style={s.homeBtn}>
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes tyPop {
          0% { transform: scale(0); opacity: 0 }
          60% { transform: scale(1.15) }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes tyCheck {
          0% { transform: scale(0) rotate(-45deg); opacity: 0 }
          100% { transform: scale(1) rotate(0); opacity: 1 }
        }
        @keyframes tySpin {
          to { transform: rotate(360deg) }
        }
      `}</style>

      <div style={s.container}>
        {/* ── Success Card ── */}
        <div style={s.card}>
          <div style={s.iconWrap}>
            <FaCheckCircle style={s.icon} />
          </div>

          <h1 style={s.heading}>ลงทะเบียนสำเร็จ!</h1>
          <p style={s.subtitle}>
            ขอบคุณที่ลงทะเบียนเข้าร่วมการประชุม
            <br />
            กรุณาบันทึกรหัสลงทะเบียนด้านล่างไว้เป็นหลักฐาน
          </p>

          <div style={s.idBadge}>{registrationId}</div>
          <p style={s.idLabel}>รหัสลงทะเบียนของท่าน</p>

          {meeting && (
            <div style={s.meetingName}>
              📋 {meeting.title || meeting.name || 'การประชุม'}
            </div>
          )}
        </div>

        {/* ── Upload Card ── */}
        <div style={s.uploadCard}>
          <h2 style={s.uploadTitle}>📎 อัปโหลดเอกสารเพิ่มเติม</h2>
          <p style={s.uploadSub}>
            หากต้องการแนบเอกสาร เช่น สำเนาบัตรประจำตัว ใบรับรอง ฯลฯ
          </p>

          <div
            style={s.dropzone(dragOver)}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={s.dropIcon}>
              {dragOver ? '📥' : '☁️'}
            </div>
            <p style={s.dropText}>
              {dragOver
                ? 'ปล่อยไฟล์ที่นี่'
                : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
            </p>
            <p style={s.dropHint}>รองรับ PDF, PNG, JPG, GIF, WEBP (สูงสุด 10 MB)</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {file && (
            <div style={s.filePreview}>
              <span style={s.fileIcon}>
                {file.type === 'application/pdf' ? '📄' : '🖼️'}
              </span>
              <div style={s.fileInfo}>
                <p style={s.fileName}>{file.name}</p>
                <p style={s.fileSize}>{formatSize(file.size)}</p>
              </div>
              <button
                style={s.removeBtn}
                onClick={() => {
                  setFile(null);
                  setUploadError('');
                }}
                title="ลบไฟล์"
              >
                ✕
              </button>
            </div>
          )}

          {file && !uploaded && (
            <button
              style={s.uploadBtn(uploading)}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: '2.5px solid rgba(255,255,255,0.3)',
                      borderTop: '2.5px solid #fff',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'tySpin 0.7s linear infinite',
                    }}
                  />
                  กำลังอัปโหลด...
                </span>
              ) : (
                'อัปโหลดไฟล์'
              )}
            </button>
          )}

          {uploaded && (
            <div style={s.successBanner}>
              <FaCheckCircle /> อัปโหลดไฟล์สำเร็จ
            </div>
          )}

          {uploadError && (
            <div style={s.errorBanner}>⚠️ {uploadError}</div>
          )}
        </div>

        {/* ── Home Button ── */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/" style={s.homeBtn}>
            🏠 กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
