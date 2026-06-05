import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaClipboardList,
  FaUsers,
  FaFileDownload,
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaUserCircle,
  FaHospital,
  FaChevronDown,
} from 'react-icons/fa';
import Countdown from '../components/Countdown';

/* ——— helpers ——— */
function getMeetingStatus(mtg) {
  const now = new Date();
  if (mtg.deadline) {
    const dl = new Date(mtg.deadline);
    if (dl <= now) return 'closed';
  }
  if (mtg.status === 'closed') return 'closed';
  if (mtg.status === 'upcoming') return 'upcoming';
  return 'active';
}

function StatusBadge({ status }) {
  const map = {
    active: {
      label: 'กำลังเปิดรับสมัคร',
      cls: 'badge badge-active',
    },
    closed: {
      label: 'ปิดรับสมัครแล้ว',
      cls: 'badge badge-closed',
    },
    upcoming: {
      label: 'เร็ว ๆ นี้',
      cls: 'badge badge-upcoming',
    },
  };
  const info = map[status] || map.active;
  return <span className={info.cls}>{info.label}</span>;
}

const formatTimeString = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    try {
      const d = new Date(timeStr);
      if (!isNaN(d)) {
        return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      }
    } catch { }
  }
  return timeStr;
};

/* ——— Skeleton Loader ——— */
function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="glass-panel-static animate-fade-in"
      style={{
        padding: '2rem',
        animationDelay: `${delay}s`,
      }}
    >
      <div className="skeleton skeleton-pill" style={{ marginBottom: '1.25rem' }} />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text" style={{ width: '85%' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', margin: '1.25rem 0' }}>
        <div className="skeleton skeleton-pill" style={{ width: '7rem' }} />
        <div className="skeleton skeleton-pill" style={{ width: '6rem' }} />
        <div className="skeleton skeleton-pill" style={{ width: '9rem' }} />
      </div>
      <div className="skeleton" style={{ height: '4.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }} />
      <div className="skeleton skeleton-button" />
    </div>
  );
}

/* ——— Main Component ——— */
export default function Home() {
  const [meetings, setMeetings] = useState([]);
  const [settings, setSettings] = useState({
    siteTitle: 'ระบบลงทะเบียนการประชุมออนไลน์',
    siteSubtitle: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsData, settingsData] = await Promise.all([
          api.get('getMeetings'),
          api.get('getSettings'),
        ]);
        setMeetings(meetingsData || []);
        setSettings((prev) => ({ ...prev, ...(settingsData || {}) }));
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const open = meetings.filter((m) => getMeetingStatus(m) === 'active').length;
    const total = meetings.reduce((sum, m) => sum + (Number(m.registeredCount) || 0), 0);
    return { open, total, all: meetings.length };
  }, [meetings]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero">
        <div className="hero-content animate-fade-in">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.18)',
              marginBottom: '1.5rem',
            }}
            className="animate-float"
          >
            <FaHospital size={32} color="#FFFFFF" />
          </div>

          <h1 className="hero-title">{settings.siteTitle}</h1>

          {settings.siteSubtitle && (
            <p className="hero-subtitle">{settings.siteSubtitle}</p>
          )}

          <div
            style={{
              marginTop: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: 0.5,
              fontSize: '0.875rem',
            }}
            className="animate-pulse"
          >
            <FaChevronDown />
            <span>เลื่อนลงเพื่อดูรายการประชุม</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <div className="stats-bar animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="stat-card">
          <div className="stat-number text-gradient">{loading ? '—' : stats.all}</div>
          <div className="stat-label">การประชุมทั้งหมด</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--emerald)' }}>
            {loading ? '—' : stats.open}
          </div>
          <div className="stat-label">เปิดรับสมัคร</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--amber)' }}>
            {loading ? '—' : stats.total}
          </div>
          <div className="stat-label">ผู้ลงทะเบียนทั้งหมด</div>
        </div>
      </div>

      {/* ═══════════════════ MEETINGS GRID ═══════════════════ */}
      <main className="container" style={{ flex: 1, paddingTop: '1rem', paddingBottom: '3rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}
          className="animate-fade-in"
        >
          <FaClipboardList size={20} color="var(--primary)" />
          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            รายการประชุมที่เปิดรับสมัคร
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            }}
          >
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} delay={i * 0.12} />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div
            className="glass-panel-static animate-fade-in"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <FaCalendarAlt
              size={48}
              color="var(--text-faint)"
              style={{ marginBottom: '1rem' }}
            />
            <h3
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
              }}
            >
              ยังไม่มีการประชุมในขณะนี้
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
              กรุณากลับมาตรวจสอบอีกครั้งในภายหลัง
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            }}
          >
            {meetings.map((mtg, idx) => {
              const status = getMeetingStatus(mtg);
              const isClosed = status === 'closed';

              return (
                <div
                  key={mtg.id}
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: '1.75rem',
                    animationDelay: `${idx * 0.1}s`,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: isClosed
                        ? 'linear-gradient(135deg, transparent 50%, rgba(239,68,68,0.06) 100%)'
                        : 'linear-gradient(135deg, transparent 50%, rgba(59,130,246,0.06) 100%)',
                      borderRadius: '0 var(--radius-2xl) 0 0',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Status badge */}
                  <div style={{ marginBottom: '1rem' }}>
                    <StatusBadge status={status} />
                  </div>

                  {/* Title */}
                  <h3
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {mtg.title}
                  </h3>

                  {/* Description */}
                  {mtg.description && (
                    <p
                      className="line-clamp-3"
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: 'var(--text-sm)',
                        marginBottom: '1.25rem',
                        lineHeight: 1.7,
                      }}
                    >
                      {mtg.description}
                    </p>
                  )}

                  {/* Info pills */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {mtg.date && (
                        <span className="info-pill">
                          <FaCalendarAlt /> {mtg.date}
                        </span>
                      )}
                      {mtg.time && (
                        <span className="info-pill">
                          <FaClock /> {formatTimeString(mtg.time)}
                        </span>
                      )}
                    </div>
                    {mtg.location && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="info-pill">
                          <FaMapMarkerAlt /> {mtg.location}
                        </span>
                      </div>
                    )}
                    {mtg.speakerName && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="info-pill">
                          <FaUserTie /> วิทยากร/ผู้จัด: {mtg.speakerName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Countdown */}
                  {!isClosed && mtg.deadline && (
                    <div
                      style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: 'var(--danger-muted)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid rgba(239,68,68,0.12)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--danger)',
                          marginBottom: '0.5rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <FaClock size={11} />
                        ปิดรับสมัครในอีก
                      </div>
                      <Countdown targetDate={mtg.deadline} />
                    </div>
                  )}

                  {/* Spacer to push buttons to bottom */}
                  <div style={{ flex: 1 }} />

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {isClosed ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          textAlign: 'center',
                          borderRadius: 'var(--radius-lg)',
                          background: 'var(--border-light)',
                          color: 'var(--text-faint)',
                          fontWeight: 600,
                          fontSize: 'var(--text-sm)',
                          cursor: 'not-allowed',
                        }}
                      >
                        ปิดรับสมัครแล้ว
                      </div>
                    ) : (
                      <Link
                        to={`/register/${mtg.id}`}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        ลงทะเบียนเข้าร่วม
                        <FaArrowRight size={14} />
                      </Link>
                    )}

                    {mtg.documentUrl && mtg.documentUrl !== '#' && (
                      <a
                        href={mtg.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        <FaFileDownload size={15} />
                        ดาวน์โหลดเอกสารประกอบ
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      {!loading &&
        (settings.contactName || settings.contactPhone || settings.contactEmail) && (
          <footer className="site-footer animate-fade-in">
            <h3 className="footer-title">
              <FaUsers
                size={18}
                style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--primary)' }}
              />
              ติดต่อสอบถามเพิ่มเติม
            </h3>

            <div className="footer-info">
              {settings.contactName && (
                <span className="footer-item">
                  <FaUserCircle />
                  {settings.contactName}
                </span>
              )}
              {settings.contactPhone && (
                <span className="footer-item">
                  <FaPhone />
                  {settings.contactPhone}
                </span>
              )}
              {settings.contactEmail && (
                <span className="footer-item">
                  <FaEnvelope />
                  {settings.contactEmail}
                </span>
              )}
            </div>

          </footer>
        )}

      {/* Admin Link at the very bottom */}
      <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
        <Link to="/admin-login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <FaUserCircle /> สำหรับผู้ดูแลระบบ
        </Link>
      </div>
    </div>
  );
}
