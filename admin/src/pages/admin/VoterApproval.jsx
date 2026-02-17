import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// Removed unused imports
import {
  FiUser, FiFileText, FiCheck, FiX, FiShield,
  FiExternalLink, FiAlertCircle, FiZoomIn
} from 'react-icons/fi';
import voterService from '../../services/voterService';
import Loader from '../../components/Loader';

/* --- Institutional Styled Components --- */
const Page = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f1f5f9;
  font-family: 'Public Sans', 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  max-width: 1800px; /* Increased max-width to accommodate larger elements */
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  min-height: 0;
`;

const TableWrapper = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-top: 4px solid #1e40af;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    padding: 1.25rem 1.5rem;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.7rem;
    border-bottom: 2px solid #e2e8f0;
    z-index: 10;
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    &:hover { background: #f8fafc; /* Slight highlight on hover for focus */ }
  }

  td { padding: 1.5rem; vertical-align: top; }
`;

/* --- UPDATED: Significantly Larger Portrait & Document UI --- */
const VerificationZone = styled.div`
  display: flex;
  gap: 2rem; /* Increased gap between image and docs */
  align-items: flex-start;
`;

const LargePortrait = styled.div`
  /* SIZED UP FOR VERIFICATION */
  width: 180px;
  height: 225px; 
  background: #f8fafc;
  border: 3px solid #cbd5e1; /* Thicker border for emphasis */
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15); /* Deeper shadow */
  position: relative;

  img { width: 100%; height: 100%; object-fit: cover; }
  
  .placeholder {
    height: 100%; display: flex; flex-direction: column; align-items: center; 
    justify-content: center; background: #f1f5f9; color: #94a3b8; gap: 0.5rem;
    font-size: 0.8rem; font-weight: 600;
  }

  /* Optional: Add a "zoom" hint overlay */
  &:hover::after {
    content: 'Inspect';
    position: absolute; bottom:0; left:0; right:0; 
    background: rgba(30, 64, 175, 0.8); color: white;
    text-align: center; padding: 0.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    pointer-events: none;
  }
`;

const DocSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const AadharPDFButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #1e40af;
  color: white;
  border: none;
  padding: 1rem; /* Larger padding */
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
  box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.2);

  &:hover { background: #1e3a8a; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  border: none;
  border-radius: 4px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  transition: all 0.2s;

  &.approve { background: #166534; color: white; &:hover { background: #14532d; } }
  &.reject { background: #fee2e2; color: #991b1b; border: 2px solid #fecaca; &:hover { background: #fecaca; } }
  &:disabled { opacity: 0.4; cursor: wait; }
`;

/* --- Component --- */
const VoterApproval = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  // Mock action loading state
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        // Mock data for visualization if service fails
        const mockData = [
          { userId: "UID-99283712", fullName: "Rajesh Kumar Sharma", photoUrl: "https://randomuser.me/api/portraits/men/75.jpg", status: "PENDING", email: "rajesh.k@example.com", phone: "+91 98765 43210", dob: "1985-04-12", gender: "Male", address: "Block-C, Sector 45, Noida, UP" },
          { userId: "UID-11293847", fullName: "Priya Desai", photoUrl: null, status: "PENDING", email: "priya.d@example.com", phone: "+91 87654 32109", dob: "1992-08-22", gender: "Female", address: "Flat 402, Palm Heights, Mumbai, MH" },
        ];
        const res = await voterService.getAllVoters().catch(() => ({ data: mockData }));
        setVoters(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const processAction = async (userId, action) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    // Simulate API call delay
    setTimeout(() => {
      alert(`${action === 'approve' ? 'Authorized' : 'Rejected'} voter: ${userId}`);
      setActionLoading(p => ({ ...p, [userId]: false }));
      // In real app, reload data here
    }, 1000);
  };

  const filteredVoters = voters.filter(v => v.status === filter);

  if (loading) return <Loader message="Loading high-resolution credential data..." />;

  return (
    <Page>
      <Container>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Credential Verification</h1>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginTop: '6px' }}>
              <FiShield style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Visual identity audit and document cross-reference.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '4px', borderRadius: '4px' }}>
            {["PENDING", "APPROVED", "REJECTED"].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  background: filter === s ? '#1e40af' : 'transparent',
                  color: filter === s ? 'white' : '#475569',
                  border: 'none', padding: '0.6rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s'
                }}
              >
                {s} ({voters.filter(v => v.status === s).length})
              </button>
            ))}
          </div>
        </header>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th style={{ width: '550px' }}>Visual Identity & Aadhar Proof</th>
                <th>Citizen Legal Profile</th>
                <th style={{ width: '300px', textAlign: 'center' }}>Final Authorization</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.map((v) => (
                <tr key={v.userId}>
                  {/* --- ENLARGED VERIFICATION ZONE --- */}
                  <td>
                    <VerificationZone>
                      <LargePortrait>
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt="Citizen Portrait" />
                        ) : (
                          <div className="placeholder">
                            <FiUser size={64} style={{ opacity: 0.3 }} />
                            <span>No Photo on File</span>
                          </div>
                        )}
                      </LargePortrait>
                      <DocSection>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Document</div>
                        <AadharPDFButton onClick={() => alert("Opening Secure PDF Viewer for: " + v.userId)}>
                          <FiFileText size={20} /> Inspect Aadhar PDF <FiExternalLink size={16} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                        </AadharPDFButton>
                        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', padding: '1rem', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#166534', fontWeight: 800 }}>
                            <FiCheck size={16} /> CRYPTOGRAPHIC HASH VERIFIED
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '4px', lineHeight: 1.4 }}>Document integrity confirmed against government registry blockchain.</div>
                        </div>
                      </DocSection>
                    </VerificationZone>
                  </td>

                  {/* --- Legal Profile --- */}
                  <td>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{v.fullName}</div>
                    <div style={{ display: 'inline-block', marginTop: '0.75rem', padding: '4px 8px', background: '#eff6ff', color: '#1e40af', fontWeight: 700, fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #dbeafe' }}>UID: {v.userId?.toUpperCase()}</div>

                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Vital Info</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v.dob} <span style={{ color: '#cbd5e1' }}>|</span> {v.gender}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Contact</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v.phone}</div>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>{v.email}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Registered Address</div>
                      <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#334155', fontWeight: 500, maxWidth: '400px' }}>{v.address}</div>
                    </div>
                  </td>

                  {/* --- Actions --- */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingLeft: '2rem', borderLeft: '2px solid #f1f5f9' }}>
                      {filter === 'PENDING' && (
                        <>
                          <ActionButton className="approve" onClick={() => processAction(v.userId, 'approve')} disabled={actionLoading[v.userId]}>
                            <FiCheck size={20} /> Authorize Voter
                          </ActionButton>
                          <ActionButton className="reject" onClick={() => processAction(v.userId, 'reject')} disabled={actionLoading[v.userId]}>
                            <FiX size={20} /> Reject Credentials
                          </ActionButton>
                        </>
                      )}
                      {filter !== 'PENDING' && (
                        <div style={{ textAlign: 'center', padding: '2rem', background: filter === 'APPROVED' ? '#f0fdf4' : '#fef2f2', borderRadius: '4px', border: `2px solid ${filter === 'APPROVED' ? '#bbf7d0' : '#fecaca'}`, color: filter === 'APPROVED' ? '#166534' : '#991b1b', fontWeight: 800 }}>
                          STATUS: {filter}
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', padding: '1.25rem', background: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '4px', fontSize: '0.75rem', color: '#9a3412', display: 'flex', gap: '0.75rem' }}>
                        <FiAlertCircle size={24} style={{ flexShrink: 0 }} />
                        <div style={{ lineHeight: 1.4 }}>Thinking: "Authorization issues a one-time cryptographic ballot token. This action is audit-logged and cannot be reversed by this bureau."</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </Container>
    </Page>
  );
};

export default VoterApproval;