import React, { useState, useEffect } from 'react';
import Register from './pages/auth/Register';
import RegistrationStatus from './pages/auth/RegistrationStatus';
import { getMyVoterStatus } from './services/voterService';

function App() {
  const [registrationStatus, setRegistrationStatus] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem('registrationStatus');
  });

  const [activePage, setActivePage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'register';
    }
    const storedStatus = window.localStorage.getItem('registrationStatus');
    return storedStatus ? 'registrationStatus' : 'register';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        const response = await getMyVoterStatus();
        if (!isMounted) return;

        const backendStatus = response && response.data && response.data.status;

        if (backendStatus === 'UNREGISTERED') {
          // Explicitly not registered (200 OK)
          setRegistrationStatus(null);
          window.localStorage.removeItem('registrationStatus');
          setActivePage('register');
        } else if (backendStatus) {
          // Registered with some status (PENDING, APPROVED, etc.)
          setRegistrationStatus(backendStatus);
          window.localStorage.setItem('registrationStatus', backendStatus);
          setActivePage('registrationStatus');
        }
      } catch (error) {
        if (!isMounted) return;

        // Fallback for legacy behavior or real network errors
        const status = error && error.response && error.response.status;
        if (status === 404) {
          setRegistrationStatus(null);
          window.localStorage.removeItem('registrationStatus');
          setActivePage('register');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegistrationSuccess = (status) => {
    const nextStatus = status || 'PENDING';
    setRegistrationStatus(nextStatus);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('registrationStatus', nextStatus);
    }
    setActivePage('registrationStatus');
  };

  const handleNavigateToRegister = () => {
    if (registrationStatus) {
      setActivePage('registrationStatus');
    } else {
      setActivePage('register');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #dcdcdc',
          backgroundColor: '#ffffff',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px' }}>Secure Online Voting System</h1>
      </header>
      <main style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={handleNavigateToRegister}
            style={{
              marginRight: '8px',
              padding: '8px 16px',
              border: '1px solid #b0b0b0',
              backgroundColor: activePage === 'register' ? '#e0e0e0' : '#ffffff',
              cursor: 'pointer',
            }}
          >
            Voter Registration
          </button>
        </div>
        {activePage === 'register' && (
          <Register onSuccess={handleRegistrationSuccess} />
        )}
        {activePage === 'registrationStatus' && (
          <RegistrationStatus status={registrationStatus} />
        )}
      </main>
    </div>
  );
}

export default App;
