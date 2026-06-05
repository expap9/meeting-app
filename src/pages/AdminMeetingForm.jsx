import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { FiArrowLeft, FiSave, FiUpload, FiFile, FiImage, FiTrash2, FiCalendar, FiClock, FiMapPin, FiUser } from 'react-icons/fi';

export default function AdminMeetingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    speakerName: '',
    deadline: '',
    documents: [],
    speakerPhoto: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await api.get('getMeetings');
          const meetings = res?.data || res || [];
          const meeting = meetings.find((m) => String(m.id) === String(id));
          if (meeting) {
            setForm({
              title: meeting.title || '',
              description: meeting.description || '',
              date: meeting.date || '',
              time: meeting.time || '',
              location: meeting.location || '',
              speakerName: meeting.speakerName || '',
              deadline: meeting.deadline || '',
              documents: meeting.documents || [],
              speakerPhoto: meeting.speakerPhoto || '',
            });
          } else {
            setMessage({ type: 'error', text: 'ไม่พบข้อมูลงานประชุมนี้' });
          }
        } catch {
          setMessage({ type: 'error', text: 'โหลดข้อมูลล้มเหลว' });
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ type: '', text: '' });
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const payload = { fileName: file.name, fileType: file.type, fileData: reader.result };
        const res = await api.post('uploadFile', payload);
        const url = res?.url || res?.fileUrl || '#';
        setForm((prev) => ({
          ...prev,
          documents: [...prev.documents, { name: file.name, url }],
        }));
        setUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ type: 'error', text: 'อัปโหลดเอกสารล้มเหลว' });
      setUploadingDoc(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const payload = { fileName: file.name, fileType: file.type, fileData: reader.result };
        const res = await api.post('uploadFile', payload);
        const url = res?.url || res?.fileUrl || '';
        setForm((prev) => ({ ...prev, speakerPhoto: url }));
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ type: 'error', text: 'อัปโหลดรูปภาพล้มเหลว' });
      setUploadingPhoto(false);
    }
  };

  const removeDoc = (idx) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date.trim()) {
      setMessage({ type: 'error', text: 'กรุณากรอกชื่องานประชุมและวันที่' });
      return;
    }
    setLoading(true);
    try {
      const action = isEdit ? 'updateMeeting' : 'createMeeting';
      const payload = isEdit ? { id, ...form } : form;
      await api.post(action, payload);
      setMessage({ type: 'success', text: isEdit ? 'บันทึกข้อมูลเรียบร้อยแล้ว' : 'สร้างงานประชุมเรียบร้อยแล้ว' });
      setTimeout(() => navigate('/admin'), 1200);
    } catch {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={{ color: '#94a3b8', fontFamily: "'Prompt', sans-serif", marginTop: 12 }}>กำลังโหลดข้อมูล...</p>
        </div>
        <style>{spinnerCSS}</style>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link to="/admin" style={styles.backBtn}>
            <FiArrowLeft size={20} />
            <span>กลับ</span>
          </Link>
          <h1 style={styles.pageTitle}>{isEdit ? 'แก้ไขงานประชุม' : 'สร้างงานประชุมใหม่'}</h1>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            ...styles.message,
            background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            borderColor: message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
            color: message.type === 'success' ? '#86efac' : '#fca5a5',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>ข้อมูลทั่วไป</h2>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>ชื่องานประชุม *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="กรอกชื่องานประชุม"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>รายละเอียด</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงานประชุม"
                rows={4}
                style={{ ...styles.input, resize: 'vertical', minHeight: 100 }}
              />
            </div>

            <div style={styles.row}>
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label style={styles.label}>
                  <FiCalendar size={14} style={{ marginRight: 6 }} />
                  วันที่ *
                </label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  placeholder="เช่น 15 มิ.ย. 2569"
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label style={styles.label}>
                  <FiClock size={14} style={{ marginRight: 6 }} />
                  เวลา
                </label>
                <input
                  type="text"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  placeholder="เช่น 09:00 - 16:00 น."
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <FiMapPin size={14} style={{ marginRight: 6 }} />
                สถานที่
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="สถานที่จัดงานประชุม"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                <FiUser size={14} style={{ marginRight: 6 }} />
                ชื่อวิทยากร
              </label>
              <input
                type="text"
                value={form.speakerName}
                onChange={(e) => handleChange('speakerName', e.target.value)}
                placeholder="ชื่อ-นามสกุลวิทยากร"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>กำหนดปิดรับสมัคร</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Speaker Photo Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <FiImage size={18} style={{ marginRight: 8 }} />
              รูปวิทยากร
            </h2>

            {form.speakerPhoto ? (
              <div style={styles.photoPreview}>
                <img src={form.speakerPhoto} alt="วิทยากร" style={styles.photoImg} />
                <button
                  type="button"
                  onClick={() => handleChange('speakerPhoto', '')}
                  style={styles.removePhotoBtn}
                >
                  <FiTrash2 size={14} />
                  <span>ลบรูป</span>
                </button>
              </div>
            ) : (
              <label style={styles.uploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                {uploadingPhoto ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    <FiImage size={32} color="#64748b" />
                    <span style={styles.uploadText}>คลิกเพื่ออัปโหลดรูปวิทยากร</span>
                    <span style={styles.uploadHint}>รองรับ JPG, PNG, WEBP</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Documents Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <FiFile size={18} style={{ marginRight: 8 }} />
              เอกสารประกอบ
            </h2>

            {form.documents.length > 0 && (
              <div style={styles.docList}>
                {form.documents.map((doc, idx) => (
                  <div key={idx} style={styles.docItem}>
                    <FiFile size={16} color="#3b82f6" />
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.docLink}
                    >
                      {doc.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDoc(idx)}
                      style={styles.docRemoveBtn}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label style={styles.uploadArea}>
              <input
                type="file"
                accept=".pdf"
                onChange={handleDocUpload}
                style={{ display: 'none' }}
              />
              {uploadingDoc ? (
                <div style={styles.spinner} />
              ) : (
                <>
                  <FiUpload size={32} color="#64748b" />
                  <span style={styles.uploadText}>คลิกเพื่ออัปโหลดเอกสาร PDF</span>
                  <span style={styles.uploadHint}>รองรับไฟล์ PDF</span>
                </>
              )}
            </label>
          </div>

          {/* Submit */}
          <div style={styles.submitRow}>
            <Link to="/admin" style={styles.cancelBtn}>ยกเลิก</Link>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.saveBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <div style={{ ...styles.spinner, width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>
                  <FiSave size={18} />
                  <span>{isEdit ? 'บันทึกการแก้ไข' : 'สร้างงานประชุม'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{spinnerCSS}</style>
    </div>
  );
}

const spinnerCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  @keyframes meetingform-spin {
    to { transform: rotate(360deg); }
  }
`;

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: "'Prompt', 'Inter', sans-serif",
    padding: '24px 16px 60px',
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  header: {
    marginBottom: 28,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    marginBottom: 12,
    transition: 'color 0.2s',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    fontFamily: "'Prompt', sans-serif",
  },
  message: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    marginBottom: 20,
  },
  card: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: 16,
    padding: '28px 24px',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 20px',
    fontFamily: "'Prompt', sans-serif",
    display: 'flex',
    alignItems: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: 6,
    fontFamily: "'Prompt', sans-serif",
  },
  input: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#f1f5f9',
    fontSize: 15,
    fontFamily: "'Prompt', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  row: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '32px 20px',
    border: '2px dashed rgba(148, 163, 184, 0.2)',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'rgba(15, 23, 42, 0.3)',
    marginTop: 8,
  },
  uploadText: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
  },
  uploadHint: {
    color: '#64748b',
    fontSize: 12,
    fontFamily: "'Prompt', sans-serif",
  },
  photoPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  photoImg: {
    width: 160,
    height: 160,
    objectFit: 'cover',
    borderRadius: 16,
    border: '2px solid rgba(148, 163, 184, 0.15)',
  },
  removePhotoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 10,
    border: '1px solid rgba(148, 163, 184, 0.08)',
  },
  docLink: {
    flex: 1,
    color: '#93c5fd',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  docRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    padding: '12px 24px',
    background: 'rgba(148, 163, 184, 0.1)',
    color: '#94a3b8',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: 12,
    fontSize: 15,
    fontFamily: "'Prompt', sans-serif",
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
    transition: 'transform 0.15s',
    minHeight: 48,
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid rgba(148,163,184,0.2)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'meetingform-spin 0.7s linear infinite',
  },
};
