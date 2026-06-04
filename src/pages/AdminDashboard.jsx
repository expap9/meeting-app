import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaTrash, FaCog, FaHistory } from 'react-icons/fa';

export default function AdminDashboard() {
  const [meetings, setMeetings] = useState([]);
  const [settings, setSettings] = useState({ 
    siteTitle: '', 
    siteSubtitle: '',
    contactName: '',
    contactPhone: '',
    contactEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history, settings

  useEffect(() => {
    // Mock Fetch
    setTimeout(() => {
      setMeetings([
        { id: 'MTG-001', title: 'การประชุมวิชาการประจำปี 2026', date: '15 ก.ค. 2026', status: 'ACTIVE' },
        { id: 'MTG-002', title: 'สัมมนาการใช้ AI ในโรงพยาบาล', date: '10 ม.ค. 2025', status: 'HISTORY' }
      ]);
      setSettings({
        siteTitle: 'ระบบลงทะเบียนการประชุมออนไลน์',
        siteSubtitle: 'ยินดีต้อนรับสู่ระบบลงทะเบียน'
      });
      setLoading(false);
    }, 800);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบงานประชุมนี้?')) {
      setMeetings(meetings.filter(m => m.id !== id));
      // Call GAS action=deleteMeeting
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    }, 1000);
  };

  const activeMeetings = meetings.filter(m => m.status === 'ACTIVE' && new Date(m.deadline) > new Date());
  const historyMeetings = meetings.filter(m => m.status === 'HISTORY' || (m.status === 'ACTIVE' && new Date(m.deadline) <= new Date()));

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>กำลังโหลดข้อมูล Admin...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>แผงควบคุม (Admin Dashboard)</h1>
        <Link to="/" className="btn btn-secondary">กลับหน้าหลัก</Link>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('active')}>
          งานประชุมปัจจุบัน
        </button>
        <button className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('history')}>
          <FaHistory style={{ marginRight: '0.5rem' }}/> ประวัติงานประชุม
        </button>
        <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('settings')}>
          <FaCog style={{ marginRight: '0.5rem' }}/> ตั้งค่าระบบ
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {activeTab === 'settings' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>ตั้งค่าข้อความหน้าเว็บ</h2>
            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">หัวข้อหลัก (Site Title)</label>
                <input 
                  type="text" className="form-input" 
                  value={settings.siteTitle} 
                  onChange={e => setSettings({...settings, siteTitle: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">คำอธิบายย่อย (Site Subtitle)</label>
                <input 
                  type="text" className="form-input" 
                  value={settings.siteSubtitle || ''} 
                  onChange={e => setSettings({...settings, siteSubtitle: e.target.value})}
                  required 
                />
              </div>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>ข้อมูลติดต่อผู้รับผิดชอบ</h3>
              <div className="form-group">
                <label className="form-label">ชื่อผู้รับผิดชอบ</label>
                <input 
                  type="text" className="form-input" 
                  value={settings.contactName || ''} 
                  onChange={e => setSettings({...settings, contactName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">เบอร์โทรศัพท์ติดต่อ</label>
                <input 
                  type="text" className="form-input" 
                  value={settings.contactPhone || ''} 
                  onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">อีเมลติดต่อ</label>
                <input 
                  type="email" className="form-input" 
                  value={settings.contactEmail || ''} 
                  onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>งานประชุมที่กำลังเปิดรับสมัคร</h2>
              <Link to="/admin/create" className="btn btn-primary">
                <FaPlus style={{ marginRight: '0.5rem' }}/> สร้างงานประชุมใหม่
              </Link>
            </div>
            
            {activeMeetings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีงานประชุม</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>ชื่อการประชุม</th>
                    <th style={{ padding: '1rem' }}>วันที่</th>
                    <th style={{ padding: '1rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeetings.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{m.title}</td>
                      <td style={{ padding: '1rem' }}>{m.date}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/edit/${m.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          แก้ไข
                        </Link>
                        <button onClick={() => handleDelete(m.id)} className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem 1rem' }}>
                          <FaTrash /> ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>ประวัติงานประชุมที่ผ่านมา</h2>
            {historyMeetings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>ไม่มีประวัติงานประชุม</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>ชื่อการประชุม</th>
                    <th style={{ padding: '1rem' }}>วันที่</th>
                    <th style={{ padding: '1rem' }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {historyMeetings.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', opacity: '0.8' }}>
                      <td style={{ padding: '1rem' }}>{m.title}</td>
                      <td style={{ padding: '1rem' }}>{m.date}</td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/admin/edit/${m.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          แก้ไข
                        </Link>
                        <button onClick={() => handleDelete(m.id)} className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '0.5rem 1rem' }}>
                          <FaTrash /> ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
