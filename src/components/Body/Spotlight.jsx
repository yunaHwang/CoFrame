// Spotlight.jsx
import React, { useEffect, useState } from 'react';

export default function Spotlight({ targetRef, message, duration = 3000 }) {
  const [style, setStyle] = useState(null);

  useEffect(() => {
    const iconEl = document.querySelector('[data-id="fixture-icon"]');
    if (!iconEl) return;

    const rect = iconEl.current.getBoundingClientRect();
    const tooltipX = rect.left + rect.width / 2;
    const tooltipY = rect.bottom + 8;

    setStyle({
      position: 'absolute',
      top: tooltipY + window.scrollY,
      left: tooltipX + window.scrollX,
      transform: 'translateX(-50%)',
      background: 'white',
      color: '#000',
      padding: '10px 14px',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    });

    const timer = setTimeout(() => setStyle(null), duration);
    return () => clearTimeout(timer);
  }, [targetRef, duration]);

  if (!style) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 9998
        }}
      />
      <div style={style}>{message}</div>
    </>
  );
}
