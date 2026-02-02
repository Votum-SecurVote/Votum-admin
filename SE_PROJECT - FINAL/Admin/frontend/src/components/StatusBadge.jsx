const statusStyles = {
  PENDING: {
    backgroundColor: '#fff7e6',
    color: '#8a6d3b',
    borderColor: '#faebcc',
  },
  APPROVED: {
    backgroundColor: '#e6f9f0',
    color: '#2f7a4f',
    borderColor: '#b2e2c6',
  },
  REJECTED: {
    backgroundColor: '#fdecea',
    color: '#a94442',
    borderColor: '#f5c6cb',
  },
}

const StatusBadge = ({ status }) => {
  const normalized = typeof status === 'string' ? status.toUpperCase() : ''
  const baseStyle = {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.03em',
  }

  const variant = statusStyles[normalized] || {
    backgroundColor: '#f0f0f0',
    color: '#555',
    borderColor: '#ddd',
  }

  const label = normalized ? normalized.charAt(0) + normalized.slice(1).toLowerCase() : ''

  return <span style={{ ...baseStyle, ...variant }}>{label}</span>
}

export default StatusBadge
