import React from 'react';

const getStatusStyles = (status) => {
  const normalized = (status || '').toString().toLowerCase();

  if (normalized === 'approved') {
    return { backgroundColor: '#e0f2e9', color: '#22543d', borderColor: '#9ae6b4' };
  }

  if (normalized === 'rejected') {
    return { backgroundColor: '#ffecec', color: '#822727', borderColor: '#feb2b2' };
  }

  return { backgroundColor: '#edf2f7', color: '#2d3748', borderColor: '#cbd5e0' };
};

function StatusBadge({ status }) {
  const styles = getStatusStyles(status);

  return (
    <span
      style={
        {
          display: 'inline-block',
          padding: '2px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          border: `1px solid ${styles.borderColor}`,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }
      }
    >
      {status}
    </span>
  );
}

export default StatusBadge;
