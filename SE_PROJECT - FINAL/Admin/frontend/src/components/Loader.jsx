const Loader = ({ message = 'Loading...' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div
        style={{
          width: '1rem',
          height: '1rem',
          borderRadius: '999px',
          border: '2px solid #ccc',
          borderTopColor: '#555',
          marginRight: '0.5rem',
          animation: 'spin 1s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.9rem', color: '#444' }}>{message}</span>
    </div>
  )
}

export default Loader
