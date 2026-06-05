import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiCheckCircle, FiClock, FiFileText, FiUsers } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { api } from '../api';

export default function AdminRegistrants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [registrants, setRegistrants] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch meeting details for the title
        try {
          const meetingRes = await api.post('getMeeting', { meetingId: id });
          if (meetingRes && meetingRes.success) {
            setMeeting(meetingRes.meeting);
          }
        } catch (err) {
          console.error("Failed to fetch meeting", err);
        }

        const res = await api.post('getRegistrations', { meetingId: id });
        if (res && res.success && res.registrations) {
          setRegistrants(res.registrations);
        } else if (Array.isArray(res)) {
          setRegistrants(res);
        } else if (res && res.data && Array.isArray(res.data)) {
          setRegistrants(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch registrations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const isCheckedIn = (status) => {
    return status === 'Checked-In' || status === 'checked-in' || status === true;
  };

  const checkedInCount = registrants.filter(r => isCheckedIn(r.checkInStatus)).length;
  const totalCount = registrants.length;

  const handleDownloadExcel = () => {
    const dataForExcel = registrants.map((r, index) => ({
      'ลำดับ': index + 1,
      'รหัสลงทะเบียน': r.id,
      'ชื่อ-นามสกุล': r.name || r.fullName,
      'เบอร์โทร': r.phone || r.phoneNumber,
      'สังกัด': r.organization || r.department || '-',
      'ตำแหน่ง': r.position || r.jobTitle || '-',
      'สถานะเช็คอิน': isCheckedIn(r.checkInStatus) ? 'เช็คอินแล้ว' : 'รอดำเนินการ',
      'เวลาเช็คอิน': r.checkInTime ? new Date(r.checkInTime).toLocaleString('th-TH') : '-',
      'จุดเช็คอิน': r.checkInLocation || '-',
      'ต้องการความช่วยเหลือ': r.specialRequest || r.col15 || '-',
      'เอกสารแนบ': r.uploadedFileUrl || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrants');
    
    const wscols = [
      {wch: 8}, {wch: 15}, {wch: 25}, {wch: 15}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 20}, {wch: 15}, {wch: 25}, {wch: 30}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `registrants_meeting_${id}.xlsx`);
  };

  const getStatusBadge = (status) => {
    if (isCheckedIn(status)) {
      return (
        <span style={styles.badgeSuccess}>
          <FiCheckCircle style={styles.badgeIcon} />
          เช็คอินแล้ว
        </span>
      );
    }
    return (
      <span style={styles.badgePending}>
        <FiClock style={styles.badgeIcon} />
        รอดำเนินการ
      </span>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleString('th-TH', { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return timeString;
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .admin-table-row:hover {
            background-color: rgba(55, 65, 81, 0.5) !important;
          }
        `}
      </style>
      <div style={styles.content}>
        
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.backButton} onClick={() => navigate('/admin')}>
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 style={styles.title}>รายชื่อผู้ลงทะเบียน</h1>
              <p style={styles.subtitle}>{meeting?.title || `รหัสการประชุม: ${id}`}</p>
            </div>
          </div>
          <button style={styles.downloadButton} onClick={handleDownloadExcel} disabled={loading || registrants.length === 0}>
            <FiDownload size={18} />
            <span style={{ marginLeft: '8px' }}>ดาวน์โหลด Excel</span>
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <div style={styles.statIconContainer}>
                  <FiUsers size={24} color="#8b5cf6" />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>ยอดผู้ลงทะเบียนทั้งหมด</p>
                  <p style={styles.statValue}>{totalCount}</p>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIconContainer, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <FiCheckCircle size={24} color="#10b981" />
                </div>
                <div style={styles.statInfo}>
                  <p style={styles.statLabel}>เช็คอินแล้ว</p>
                  <p style={styles.statValue}>{checkedInCount}</p>
                </div>
              </div>
            </div>

            <div style={styles.tableContainer}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>รหัสลงทะเบียน</th>
                      <th style={styles.th}>ชื่อ-นามสกุล</th>
                      <th style={styles.th}>เบอร์โทร</th>
                      <th style={styles.th}>สังกัด</th>
                      <th style={styles.th}>ตำแหน่ง</th>
                      <th style={styles.th}>สถานะเช็คอิน</th>
                      <th style={styles.th}>เวลาเช็คอิน</th>
                      <th style={styles.th}>จุดเช็คอิน</th>
                      <th style={styles.th}>สลิป/เอกสาร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrants.length > 0 ? (
                      registrants.map((reg, index) => (
                        <tr key={reg.id || index} style={styles.tr} className="admin-table-row">
                          <td style={styles.td}>
                            <span style={styles.idText}>{reg.id || '-'}</span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.nameText}>{reg.name || reg.fullName || '-'}</div>
                          </td>
                          <td style={styles.td}>{reg.phone || reg.phoneNumber || '-'}</td>
                          <td style={styles.td}>{reg.organization || reg.department || '-'}</td>
                          <td style={styles.td}>{reg.position || reg.jobTitle || '-'}</td>
                          <td style={styles.td}>
                            {getStatusBadge(reg.checkInStatus)}
                          </td>
                          <td style={styles.td}>{formatTime(reg.checkInTime)}</td>
                          <td style={styles.td}>{reg.checkInLocation || '-'}</td>
                          <td style={styles.td}>
                            {reg.uploadedFileUrl ? (
                              <a 
                                href={reg.uploadedFileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                style={styles.fileLink}
                              >
                                <FiFileText size={16} />
                                ดูเอกสาร
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" style={styles.emptyState}>
                          ไม่พบข้อมูลผู้ลงทะเบียน
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    color: '#f9fafb',
    fontFamily: "'Prompt', 'Inter', sans-serif",
    padding: '32px 16px',
  },
  content: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'inherit',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 4px 0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    lineHeight: 1,
  },
  tableContainer: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  th: {
    padding: '16px 24px',
    backgroundColor: '#111827',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #374151',
  },
  tr: {
    borderBottom: '1px solid #374151',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#d1d5db',
  },
  idText: {
    color: '#9ca3af',
    fontFamily: 'monospace',
    fontSize: '13px',
    backgroundColor: '#374151',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  nameText: {
    fontWeight: '500',
    color: '#f9fafb',
  },
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#34d399',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  badgePending: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#fbbf24',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  badgeIcon: {
    marginRight: '6px',
  },
  fileLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '13px',
    padding: '6px 10px',
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
    border: '1px solid rgba(96, 165, 250, 0.2)',
  },
  emptyState: {
    padding: '64px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '15px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    borderTopColor: '#3b82f6',
    animation: 'spin 1s ease-in-out infinite',
    marginBottom: '16px',
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: '15px',
  },
};
