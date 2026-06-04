import { useState, useEffect } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const blockStyle = {
    background: 'rgba(255,255,255,0.8)',
    color: 'var(--danger)',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    fontWeight: 'bold',
    minWidth: '50px',
    boxShadow: 'var(--shadow-sm)'
  };

  const labelStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'block',
    fontWeight: 'normal'
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div style={blockStyle}>{timeLeft.days} <span style={labelStyle}>วัน</span></div>
      <div style={blockStyle}>{timeLeft.hours} <span style={labelStyle}>ชม.</span></div>
      <div style={blockStyle}>{timeLeft.minutes} <span style={labelStyle}>นาที</span></div>
      <div style={blockStyle}>{timeLeft.seconds} <span style={labelStyle}>วิ</span></div>
    </div>
  );
}
