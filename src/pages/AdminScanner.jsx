import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../api';

const AdminScanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true
      },
      false
    );
    
    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText) => {
      // Prevent multiple consecutive scans
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // Assume API returns user details upon successful check-in
        const res = await api.post('checkIn', { 
          registrationId: decodedText, 
          location, 
          meetingId: id 
        });

        setScanResult({
          type: 'success',
          message: 'เช็คอินสำเร็จ',
          attendeeName: res?.fullName || res?.name || 'ผู้เข้าร่วม (ไม่ระบุชื่อ)',
          time: new Date().toLocaleTimeString('th-TH')
        });
      } catch (err) {
        setScanResult({
          type: 'error',
          message: err?.message || 'ไม่พบข้อมูลหรือเช็คอินไปแล้ว',
        });
      } finally {
        setTimeout(() => {
          setScanResult(null);
          processingRef.current = false;
        }, 3000);
      }
    };

    const onScanFailure = (error) => {
      // Handle scan failure, usually silent as it fires continuously when no QR is found
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear html5QrcodeScanner', error);
        });
      }
    };
  }, [isScanning, id, location]);

  const handleStartScan = (e) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('กรุณาระบุจุดเช็คอินก่อนเริ่มสแกน');
      return;
    }
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/admin')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 style={styles.title}>สแกนคิวอาร์โค้ด</h1>
        <div style={{ width: 24 }}></div> {/* Spacer for center alignment */}
      </header>

      <main style={styles.main}>
        {!isScanning ? (
          <div style={styles.setupCard}>
            <div style={styles.iconContainer}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h2 style={styles.cardTitle}>ตั้งค่าจุดเช็คอิน</h2>
            <p style={styles.cardSubtitle}>กรุณาระบุตำแหน่งหรือจุดเช็คอินเพื่อเก็บสถิติ</p>
            
            <form onSubmit={handleStartScan} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>จุดเช็คอิน (Location)</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="เช่น หน้างาน, ประตู 1, โซน VIP"
                  style={styles.input}
                  required
                />
              </div>
              <button type="submit" style={styles.primaryButton}>
                เริ่มสแกน
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.scannerContainer}>
            <div style={styles.scannerHeader}>
              <div>
                <span style={styles.badge}>จุดเช็คอิน</span>
                <span style={styles.locationText}>{location}</span>
              </div>
              <button onClick={stopScanning} style={styles.stopButton}>
                หยุดสแกน
              </button>
            </div>

            {/* html5-qrcode renders here */}
            <div id="qr-reader" style={styles.qrReader}></div>

            {/* Custom Overlay for Scanner */}
            <div style={styles.instructions}>
              เล็งคิวอาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
            </div>

            {/* Result Popup overlay */}
            {scanResult && (
              <div style={scanResult.type === 'success' ? styles.resultSuccess : styles.resultError}>
                {scanResult.type === 'success' ? (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <h3 style={styles.resultTitle}>{scanResult.message}</h3>
                    <p style={styles.resultDesc}>{scanResult.attendeeName}</p>
                    <p style={styles.resultTime}>เวลา: {scanResult.time}</p>
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <h3 style={styles.resultTitle}>ข้อผิดพลาด</h3>
                    <p style={styles.resultDesc}>{scanResult.message}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#121212',
    fontFamily: "'Prompt', 'Inter', sans-serif",
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    backgroundColor: '#1e1e1e',
    borderBottom: '1px solid #333',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#e0e0e0',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    color: '#ffffff',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 20px',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  setupCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '16px',
    padding: '32px 24px',
    border: '1px solid #333',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '20px',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: '0.95rem',
    color: '#a0a0a0',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  label: {
    fontSize: '0.9rem',
    color: '#e0e0e0',
    marginBottom: '8px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '1rem',
    fontFamily: "'Prompt', sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  scannerContainer: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    height: '100%',
    minHeight: '60vh',
  },
  scannerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    backgroundColor: '#1e1e1e',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #333',
  },
  badge: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: '0.75rem',
    padding: '4px 8px',
    borderRadius: '6px',
    marginRight: '8px',
    fontWeight: '600',
  },
  locationText: {
    fontSize: '1rem',
    color: '#ffffff',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'Prompt', sans-serif",
  },
  qrReader: {
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid #333',
    backgroundColor: '#000',
  },
  instructions: {
    textAlign: 'center',
    color: '#a0a0a0',
    marginTop: '20px',
    fontSize: '0.95rem',
  },
  resultSuccess: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    color: '#ffffff',
    padding: '32px 24px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    zIndex: 20,
    width: '80%',
    maxWidth: '320px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    animation: 'fadeIn 0.3s ease',
  },
  resultError: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    color: '#ffffff',
    padding: '32px 24px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    zIndex: 20,
    width: '80%',
    maxWidth: '320px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    animation: 'fadeIn 0.3s ease',
  },
  resultTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  resultDesc: {
    margin: '0 0 12px 0',
    fontSize: '1.1rem',
  },
  resultTime: {
    margin: 0,
    fontSize: '0.85rem',
    opacity: 0.8,
  }
};

export default AdminScanner;
