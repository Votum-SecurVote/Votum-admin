import React, { useState } from 'react';
import { registerVoter, fetchPublicKey } from '../../services/voterService';
import { encryptData } from '../../utils/encryption';
import { isChecked, validateIdentity } from '../../utils/validation';
import Loader from '../../components/Loader';


function Register({ onSuccess }) {
  const [identityType, setIdentityType] = useState('National ID');
  const [identityProof, setIdentityProof] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(null);

  const getIdentityPlaceholder = () => {
    if (identityType === 'National ID') {
      return 'Enter 12-digit National ID (e.g. 123456789012)';
    }
    if (identityType === 'Voter ID') {
      return 'Enter Voter ID (e.g. ABC1234567)';
    }
    if (identityType === 'Passport') {
      return 'Enter Passport No. (e.g. A1234567 or AB12345678)';
    }
    return 'Enter government-issued identity reference';
  };

  const handleIdentityTypeChange = (event) => {
    const nextType = event.target.value;
    setIdentityType(nextType);
    setIdentityProof(''); // Reset proof on type change to avoid format mismatch
    if (message) setMessage('');
    if (messageType === 'error') setMessageType(null);
  };

  const handleIdentityProofChange = (event) => {
    const nextValue = event.target.value;
    setIdentityProof(nextValue);
    if (message) setMessage('');
    if (messageType === 'error') setMessageType(null);
  };

  const handleEncryption = async (identity) => {
    try {
      console.log("Fetching public key...");
      const publicKey = await fetchPublicKey();
      console.log("Public Key fetch success, encrypting...");
      const encrypted = await encryptData(identity, publicKey);
      console.log("Encryption success.");
      return encrypted;
    } catch (e) {
      console.error("Encryption flow failed: ", e);
      throw new Error('Security Error: Unable to encrypt data. Please refresh and try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    if (submitting) return; // Prevent double submit

    if (!identityProof) {
      setMessage('Please enter a valid identity proof.');
      setMessageType('error');
      return;
    }

    const identityValidation = validateIdentity(identityType, identityProof);
    if (!identityValidation.valid) {
      setMessage(identityValidation.message);
      setMessageType('error');
      return;
    }

    if (!isChecked(declaration)) {
      setMessage('You must confirm the declaration to proceed.');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setFormDisabled(true);
    setMessage('');

    try {
      // 1. Encrypt Data
      const encryptedIdentity = await handleEncryption(identityProof.trim());

      // 2. Prepare Payload
      const payload = {
        identityType,
        identityProof: encryptedIdentity,
        declarationAccepted: declaration,
      };

      // 3. Submit
      const response = await registerVoter(payload);

      // Axios resolves for 2xx
      if (response.status === 201) {
        setMessage('Registration successful! Waiting for admin approval.');
        setMessageType('success');

        // Notify parent after short delay or immediately
        const nextStatus = (response.data && response.data.status) || 'PENDING';
        if (typeof onSuccess === 'function') {
          setTimeout(() => onSuccess(nextStatus), 1500);
        }
      } else {
        throw new Error("Unexpected response status from server.");
      }
    } catch (error) {
      console.error("Registration Error", error);
      let errorMsg = 'Unable to complete registration.';

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setMessage(errorMsg);
      setMessageType('error');
      setFormDisabled(false); // Re-enable form on error
    } finally {
      setSubmitting(false);
    }
  };

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
          Voter Registration
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="identityType"
              style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}
            >
              Identity Type
            </label>
            <select
              id="identityType"
              value={identityType}
              disabled={formDisabled}
              onChange={handleIdentityTypeChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '2px',
                border: '1px solid #b0b0b0',
                backgroundColor: formDisabled ? '#f5f5f5' : '#ffffff',
              }}
            >
              <option value="National ID">National ID</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Passport">Passport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="identityProof"
              style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}
            >
              Identity Proof
            </label>
            <input
              id="identityProof"
              type="text"
              value={identityProof}
              disabled={formDisabled}
              placeholder={getIdentityPlaceholder()}
              onChange={handleIdentityProofChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '2px',
                border: '1px solid #b0b0b0',
                backgroundColor: formDisabled ? '#f5f5f5' : '#ffffff',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={declaration}
                disabled={formDisabled}
                onChange={(e) => setDeclaration(e.target.checked)}
                style={{ marginRight: '8px', marginTop: '2px' }}
              />
              <span>
                I confirm that the information provided is accurate and I am eligible to vote.
              </span>
            </label>
          </div>

          {submitting && <Loader />}

          {message && (
            <div
              style={{
                marginBottom: '16px',
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '2px',
                border: '1px solid',
                borderColor: messageType === 'success' ? '#9ae6b4' : '#feb2b2',
                backgroundColor: messageType === 'success' ? '#e6fffa' : '#fff5f5',
                color: messageType === 'success' ? '#22543d' : '#822727',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || formDisabled}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '2px',
              border: '1px solid #2d3748',
              backgroundColor: (submitting || formDisabled) ? '#e2e8f0' : '#2d3748',
              color: (submitting || formDisabled) ? '#4a5568' : '#ffffff',
              cursor: (submitting || formDisabled) ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Processing...' : 'Submit Registration'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Register;
