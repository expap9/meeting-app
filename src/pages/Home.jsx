import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa';
import Countdown from '../components/Countdown';

// Mock data (replace with GAS fetch later)
const MOCK_MEETINGS = [
  {
    id: 'MTG-001',
    title: 'การประชุมวิชาการประจำปี 2026',
    description: 'อัปเดตเทคโนโลยีทางการแพทย์และนวัตกรรม AI สำหรับโรงพยาบาลยุคใหม่',
    date: '15 ก.ค. 2026',
    time: '09:00 - 16:00 น.',
    location: 'ห้องประชุมใหญ่ ชั้น 5',
    speakerName: 'นพ. สมชาย ใจดี',
    deadline: '2026-07-10T23:59:59',
    documentUrl: '#'
  }
];

export default function Home() {
  const [meetings, setMeetings] = useState([]);
  const [settings, setSettings] = useState({
    siteTitle: 'ระบบลงทะเบียนการประชุมออนไลน์',
    siteSubtitle: 'กำลังโหลดตั้งค่า...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from GAS API (both getMeetings and getSettings)
    setTimeout(() => {
      setMeetings(MOCK_MEETINGS);
      setSettings({
        siteTitle: 'ระบบลงทะเบียนการประชุมออนไลน์',
        siteSubtitle: 'ยินดีต้อนรับสู่ระบบลงทะเบียน'
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {settings.siteTitle}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          {settings.siteSubtitle}
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {meetings.map((mtg, idx) => (
            <div key={mtg.id} className="glass-panel animate-fade-in" style={{ padding: '2rem', animationDelay: `${idx * 0.1}s` }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ 
                  background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600'
                }}>
                  กำลังเปิดรับสมัคร
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{mtg.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{mtg.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCalendarAlt color="var(--primary)" /> <span>{mtg.date} | {mtg.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaMapMarkerAlt color="var(--primary)" /> <span>{mtg.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUserTie color="var(--primary)" /> <span>วิทยากร: {mtg.speakerName}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '0.5rem', fontWeight: '500' }}>
                  ปิดรับสมัครในอีก:
                </div>
                <Countdown targetDate={mtg.deadline} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Link to={`/register/${mtg.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  ลงทะเบียนเข้าร่วม
                </Link>
                {mtg.documentUrl && mtg.documentUrl !== '#' && (
                  <a href={mtg.documentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                    ดาวน์โหลดเอกสาร (PDF)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
