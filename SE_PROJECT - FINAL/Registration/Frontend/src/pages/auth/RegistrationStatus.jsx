function RegistrationStatus({ status }) {
  const displayStatus = String(status || 'PENDING').toUpperCase();
  const isPending = displayStatus === 'PENDING';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
      }}
    >
      <section
        style={{
          maxWidth: '640px',
          width: '100%',
          margin: '0 auto',
          padding: '24px',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid #dcdcdc',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
          Voter Registration Status
        </h2>

        <p style={{ marginBottom: '12px', fontSize: '14px' }}>
          Your voter registration has been submitted successfully.
        </p>

        <div style={{ marginBottom: isPending ? '12px' : 0, fontSize: '14px' }}>
          <span style={{ fontWeight: 500 }}>Status: </span>
          <span>{displayStatus}</span>
        </div>

        {isPending && (
          <p style={{ margin: 0, fontSize: '14px' }}>
            Your application is under review. You will be notified after admin approval.
          </p>
        )}
      </section>
    </div>
  );
}

export default RegistrationStatus;
