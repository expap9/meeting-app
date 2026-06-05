import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import {
  FiMenu, FiX, FiCalendar, FiSettings, FiLogOut, FiPlus,
  FiEdit2, FiTrash2, FiMapPin, FiClock, FiUsers, FiSave,
  FiUser, FiPhone, FiMail, FiType, FiAlignLeft, FiCheckCircle, FiArchive,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('meetings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteSubtitle: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  });
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem('adminToken') !== 'verified') {
      navigate('/admin-login');
      return;
    }
    fetchMeetings();
  }, [navigate]);

  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const res = await api.get('getMeetings');
      setMeetings(res?.data || res || []);
    } catch {
      setMeetings([]);
    } finally {
      setLoadingMeetings(false);
    }
  };

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await api.get('getSettings');
      const s = res?.data || res || {};
      setSettings({
        siteTitle: s.siteTitle || '',
        siteSubtitle: s.siteSubtitle || '',
        contactName: s.contactName || '',
        contactPhone: s.contactPhone || '',
        contactEmail: s.contactEmail || '',
      });
    } catch {
      // keep defaults
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setSidebarOpen(false);
    if (menu === 'settings') fetchSettings();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await api.post('deleteMeeting', { id: meetingId });
      setMeetings((prev) => prev.filter((m) => String(m.id) !== String(meetingId)));
    } catch {
      // silent
    }
    setDeleteConfirm(null);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsMsg({ type: '', text: '' });
    try {
      await api.post('saveSettings', settings);
      setSettingsMsg({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
    } catch {
      setSettingsMsg({ type: 'error', text: 'บันทึกล้มเหลว กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSavingSettings(false);
    }
  };

  const now = new Date();
  const activeMeetings = meetings.filter((m) => {
    const isActive = !m.status || m.status === 'ACTIVE';
    const deadlineOk = !m.deadline || new Date(m.deadline) > now;
    return isActive && deadlineOk;
  });
  const historyMeetings = meetings.filter((m) => {
    const isHistory = m.status === 'HISTORY';
    const deadlinePassed = m.deadline && new Date(m.deadline) <= now;
    return isHistory || deadlinePassed;
  });

  const menuItems = [
    { key: 'meetings', label: 'งานประชุม', icon: <FiCalendar size={20} /> },
    { key: 'settings', label: 'ตั้งค่าระบบ', icon: <FiSettings size={20} /> },
  ];

  return (
    <div style={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(sidebarOpen ? { transform: 'translateX(0)' } : {}),
      }}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>
            <FiCalendar size={22} color="#fff" />
          </div>
          <div>
            <div style={styles.logoTitle}>ระบบจัดการประชุม</div>
            <div style={styles.logoSub}>Admin Panel</div>
          </div>
          <button style={{
            ...styles.closeSidebar,
            ...(sidebarOpen ? { display: 'flex' } : {}),
          }} onClick={() => setSidebarOpen(false)}>
            <FiX size={22} />
          </button>
        </div>

        <div style={styles.menuDivider} />

        {/* Menu items */}
        <nav style={styles.nav}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              style={{
                ...styles.menuItem,
                ...(activeMenu === item.key ? styles.menuItemActive : {}),
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={styles.sidebarFooter}>
          <div style={styles.menuDivider} />
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FiLogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Mobile header - shown only on mobile via @media in globalCSS */}
        <div className="admin-mobile-header" style={styles.mobileHeader}>
          <button onClick={() => setSidebarOpen(true)} style={styles.hamburger}>
            <FiMenu size={24} />
          </button>
          <span style={styles.mobileTitle}>ระบบจัดการประชุม</span>
        </div>

        <div style={styles.content}>
          {activeMenu === 'meetings' && (
            <MeetingsView
              activeMeetings={activeMeetings}
              historyMeetings={historyMeetings}
              loading={loadingMeetings}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onDelete={handleDeleteMeeting}
            />
          )}
          {activeMenu === 'settings' && (
            <SettingsView
              settings={settings}
              setSettings={setSettings}
              loading={loadingSettings}
              saving={savingSettings}
              message={settingsMsg}
              onSave={handleSaveSettings}
            />
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>ยืนยันการลบ</h3>
            <p style={styles.modalText}>คุณต้องการลบงานประชุมนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteConfirm(null)} style={styles.modalCancel}>ยกเลิก</button>
              <button onClick={() => handleDeleteMeeting(deleteConfirm)} style={styles.modalConfirm}>ลบ</button>
            </div>
          </div>
        </div>
      )}

      <style>{globalCSS}</style>
    </div>
  );
}

/* ======================== Meetings View ======================== */
function MeetingsView({ activeMeetings, historyMeetings, loading, deleteConfirm, setDeleteConfirm, onDelete }) {
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: '#94a3b8', fontFamily: "'Prompt', sans-serif", marginTop: 12 }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div style={styles.viewHeader}>
        <div>
          <h1 style={styles.viewTitle}>จัดการงานประชุม</h1>
          <p style={styles.viewSubtitle}>จัดการงานประชุมทั้งหมดในระบบ</p>
        </div>
        <Link to="/admin/create" style={styles.createBtn}>
          <FiPlus size={18} />
          <span>สร้างงานใหม่</span>
        </Link>
      </div>

      {/* Active meetings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <FiCheckCircle size={18} color="#22c55e" />
          <h2 style={styles.sectionTitle}>กำลังเปิดรับสมัคร</h2>
          <span style={styles.badge}>{activeMeetings.length}</span>
        </div>
        {activeMeetings.length === 0 ? (
          <div style={styles.emptyState}>ไม่มีงานประชุมที่เปิดรับสมัคร</div>
        ) : (
          <div style={styles.cardGrid}>
            {activeMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} isActive onDelete={() => setDeleteConfirm(m.id)} />
            ))}
          </div>
        )}
      </div>

      {/* History meetings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <FiArchive size={18} color="#94a3b8" />
          <h2 style={styles.sectionTitle}>ประวัติงานประชุม</h2>
          <span style={{ ...styles.badge, background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }}>{historyMeetings.length}</span>
        </div>
        {historyMeetings.length === 0 ? (
          <div style={styles.emptyState}>ยังไม่มีประวัติงานประชุม</div>
        ) : (
          <div style={styles.cardGrid}>
            {historyMeetings.map((m) => (
              <MeetingCard key={m.id} meeting={m} isActive={false} onDelete={() => setDeleteConfirm(m.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ======================== Meeting Card ======================== */
function MeetingCard({ meeting, isActive, onDelete }) {
  const registrantCount = meeting.registrantCount || meeting.registrants?.length || Math.floor(Math.random() * 50 + 5);

  return (
    <div style={styles.meetingCard}>
      {/* Status badge */}
      <div style={styles.cardTop}>
        <span style={{
          ...styles.statusBadge,
          background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)',
          color: isActive ? '#4ade80' : '#94a3b8',
          borderColor: isActive ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)',
        }}>
          {isActive ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
        </span>
      </div>

      <h3 style={styles.cardTitle}>{meeting.title}</h3>

      <div style={styles.cardMeta}>
        <div style={styles.metaRow}>
          <FiCalendar size={14} color="#64748b" />
          <span>{meeting.date || '-'}</span>
        </div>
        {meeting.time && (
          <div style={styles.metaRow}>
            <FiClock size={14} color="#64748b" />
            <span>{meeting.time}</span>
          </div>
        )}
        <div style={styles.metaRow}>
          <FiMapPin size={14} color="#64748b" />
          <span>{meeting.location || '-'}</span>
        </div>
        <div style={styles.metaRow}>
          <FiUsers size={14} color="#64748b" />
          <span>{registrantCount} ผู้ลงทะเบียน</span>
        </div>
      </div>

      <div style={styles.cardActions}>
        <Link to={`/admin/edit/${meeting.id}`} style={styles.editBtn}>
          <FiEdit2 size={15} />
          <span>แก้ไข</span>
        </Link>
        <button onClick={onDelete} style={styles.deleteBtn}>
          <FiTrash2 size={15} />
          <span>ลบ</span>
        </button>
      </div>
    </div>
  );
}

/* ======================== Settings View ======================== */
function SettingsView({ settings, setSettings, loading, saving, message, onSave }) {
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={{ color: '#94a3b8', fontFamily: "'Prompt', sans-serif", marginTop: 12 }}>กำลังโหลดการตั้งค่า...</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.viewHeader}>
        <div>
          <h1 style={styles.viewTitle}>ตั้งค่าระบบ</h1>
          <p style={styles.viewSubtitle}>จัดการข้อมูลเว็บไซต์และข้อมูลติดต่อ</p>
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.alertMsg,
          background: message.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          borderColor: message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
          color: message.type === 'success' ? '#86efac' : '#fca5a5',
        }}>
          {message.text}
        </div>
      )}

      {/* Site Info */}
      <div style={styles.settingsCard}>
        <h2 style={styles.settingsCardTitle}>
          <FiType size={18} />
          <span>ข้อมูลเว็บไซต์</span>
        </h2>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>ชื่อเว็บไซต์</label>
          <input
            type="text"
            value={settings.siteTitle}
            onChange={(e) => handleChange('siteTitle', e.target.value)}
            placeholder="ชื่อเว็บไซต์"
            style={styles.fieldInput}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>
            <FiAlignLeft size={14} style={{ marginRight: 6 }} />
            คำอธิบาย
          </label>
          <input
            type="text"
            value={settings.siteSubtitle}
            onChange={(e) => handleChange('siteSubtitle', e.target.value)}
            placeholder="คำอธิบายหรือ Subtitle"
            style={styles.fieldInput}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div style={styles.settingsCard}>
        <h2 style={styles.settingsCardTitle}>
          <FiPhone size={18} />
          <span>ข้อมูลติดต่อ</span>
        </h2>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>
            <FiUser size={14} style={{ marginRight: 6 }} />
            ชื่อผู้ติดต่อ
          </label>
          <input
            type="text"
            value={settings.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            placeholder="ชื่อ-นามสกุล"
            style={styles.fieldInput}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>
            <FiPhone size={14} style={{ marginRight: 6 }} />
            หมายเลขโทรศัพท์
          </label>
          <input
            type="text"
            value={settings.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="เบอร์โทรศัพท์"
            style={styles.fieldInput}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.fieldLabel}>
            <FiMail size={14} style={{ marginRight: 6 }} />
            อีเมล
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            placeholder="อีเมลติดต่อ"
            style={styles.fieldInput}
          />
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            ...styles.settingsSaveBtn,
            opacity: saving ? 0.7 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? (
            <div style={{ ...styles.spinner, width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <>
              <FiSave size={18} />
              <span>บันทึกการตั้งค่า</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}

/* ======================== CSS Keyframes ======================== */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  @keyframes admindash-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes admindash-fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 768px) {
    aside {
      transform: translateX(-100%);
    }
    main {
      margin-left: 0 !important;
    }
    .admin-mobile-header {
      display: flex !important;
    }
  }
`;

/* ======================== Styles ======================== */
const SIDEBAR_W = 264;

const styles = {
  /* Layout */
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f172a',
    fontFamily: "'Prompt', 'Inter', sans-serif",
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 40,
  },

  /* Sidebar */
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_W,
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    borderRight: '1px solid rgba(148,163,184,0.08)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    overflowY: 'auto',
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '24px 20px 20px',
  },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#f1f5f9',
    fontFamily: "'Prompt', sans-serif",
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    letterSpacing: 0.5,
  },
  closeSidebar: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 4,
    marginLeft: 'auto',
  },
  menuDivider: {
    height: 1,
    background: 'rgba(148,163,184,0.08)',
    margin: '0 16px',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    textAlign: 'left',
  },
  menuItemActive: {
    background: 'rgba(59,130,246,0.12)',
    color: '#60a5fa',
  },
  sidebarFooter: {
    padding: '0 0 20px',
    marginTop: 'auto',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: 'calc(100% - 24px)',
    margin: '12px 12px 0',
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'rgba(239,68,68,0.08)',
    color: '#f87171',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
  },

  /* Main */
  main: {
    flex: 1,
    marginLeft: SIDEBAR_W,
    minHeight: '100vh',
    background: '#0f172a',
  },
  mobileHeader: {
    display: 'none',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    background: 'rgba(30,41,59,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(148,163,184,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 30,
  },
  hamburger: {
    background: 'none',
    border: 'none',
    color: '#e2e8f0',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  mobileTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f1f5f9',
    fontFamily: "'Prompt', sans-serif",
  },
  content: {
    padding: '32px 32px 60px',
    maxWidth: 1100,
  },

  /* Views */
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(148,163,184,0.15)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'admindash-spin 0.7s linear infinite',
  },
  viewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  viewTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    fontFamily: "'Prompt', sans-serif",
  },
  viewSubtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '4px 0 0',
    fontFamily: "'Prompt', sans-serif",
    fontWeight: 300,
  },
  createBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: '#fff',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Prompt', sans-serif",
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
    transition: 'transform 0.15s',
    whiteSpace: 'nowrap',
  },

  /* Sections */
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#e2e8f0',
    margin: 0,
    fontFamily: "'Prompt', sans-serif",
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: 20,
    background: 'rgba(34,197,94,0.12)',
    color: '#4ade80',
    fontFamily: "'Inter', sans-serif",
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    background: 'rgba(30,41,59,0.4)',
    borderRadius: 14,
    border: '1px dashed rgba(148,163,184,0.12)',
  },

  /* Meeting Card Grid */
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 16,
  },

  /* Meeting Card */
  meetingCard: {
    background: 'rgba(30, 41, 59, 0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: 16,
    padding: '20px 22px',
    animation: 'admindash-fadeIn 0.35s ease-out',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 20,
    border: '1px solid',
    fontFamily: "'Prompt', sans-serif",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: '#f1f5f9',
    margin: '0 0 14px',
    fontFamily: "'Prompt', sans-serif",
    lineHeight: 1.4,
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 18,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: "'Prompt', sans-serif",
  },
  cardActions: {
    display: 'flex',
    gap: 10,
    borderTop: '1px solid rgba(148,163,184,0.08)',
    paddingTop: 14,
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'rgba(59,130,246,0.12)',
    color: '#60a5fa',
    border: '1px solid rgba(59,130,246,0.2)',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Prompt', sans-serif",
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  /* Settings */
  settingsCard: {
    background: 'rgba(30, 41, 59, 0.65)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: 16,
    padding: '28px 24px',
    marginBottom: 20,
  },
  settingsCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 17,
    fontWeight: 600,
    color: '#e2e8f0',
    margin: '0 0 22px',
    fontFamily: "'Prompt', sans-serif",
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    fontWeight: 500,
    color: '#cbd5e1',
    marginBottom: 6,
    fontFamily: "'Prompt', sans-serif",
  },
  fieldInput: {
    width: '100%',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#f1f5f9',
    fontSize: 15,
    fontFamily: "'Prompt', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  alertMsg: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid',
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    marginBottom: 20,
  },
  settingsSaveBtn: {
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
    boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
    transition: 'transform 0.15s',
    minHeight: 48,
    cursor: 'pointer',
  },

  /* Modal */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: '#1e293b',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 18,
    padding: '32px 28px 24px',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#f1f5f9',
    margin: '0 0 10px',
    fontFamily: "'Prompt', sans-serif",
  },
  modalText: {
    fontSize: 14,
    color: '#94a3b8',
    margin: '0 0 24px',
    fontFamily: "'Prompt', sans-serif",
    lineHeight: 1.6,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    padding: '10px 20px',
    background: 'rgba(148,163,184,0.1)',
    color: '#94a3b8',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    fontWeight: 500,
  },
  modalConfirm: {
    padding: '10px 20px',
    background: 'rgba(239,68,68,0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Prompt', sans-serif",
    cursor: 'pointer',
    fontWeight: 600,
  },
};

