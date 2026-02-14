import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiCheck, FiX,
  FiShield, FiClock, FiAlertTriangle, FiFileText, FiHash
} from 'react-icons/fi';
import voterService from '../../services/voterService';
import Loader from '../../components/Loader';

/* --- Helpers --- */
const formatIST = (utc) => {
  if (!utc) return '—';
  return new Date(utc).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

/* --- Styled Components --- */
const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* Slate-50 */
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2.5rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }
  p {
    color: #64748b;
    margin-top: 0.5rem;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);

  .icon {
    width: 48px; height: 48px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #475569;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
  }
  .info {
    h3 { margin: 0; font-size: 1.5rem; color: #0f172a; }
    span { color: #64748b; font-size: 0.85rem; font-weight: 500; }
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
`;

const Card = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .user-info {
    h3 { margin: 0 0 0.25rem 0; font-size: 1.1rem; color: #1e293b; }
    .id-tag { font-family: monospace; font-size: 0.75rem; color: #94a3b8; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #fff7ed; 
  color: #c2410c; 
  border: 1px solid #ffedd5;
`;

const CardBody = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  .full-width { grid-column: 1 / -1; }
`;

const InfoItem = styled.div`
  font-size: 0.9rem;
  
  label { display: flex; align-items: center; gap: 0.4rem; color: #64748b; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.25rem; font-weight: 600; }
  div { color: #334155; font-weight: 500; }
`;

const SecureSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;

  .section-title {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.8rem; font-weight: 600; color: #475569;
    margin-bottom: 1rem;
  }
`;

const CodeBlock = styled.div`
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
  color: #475569;
  word-break: break-all;
  margin-bottom: 1rem;
`;

const DocPreview = styled.div`
  width: 100%;
  height: 200px;
  background-color: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  &:hover img { transform: scale(1.05); }

  .placeholder { color: #94a3b8; font-size: 0.85rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  background: #fdfdfd;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &.approve {
    background: #10b981; color: white;
    &:hover:not(:disabled) { background: #059669; }
  }
  &.reject {
    background: white; color: #ef4444; border: 1px solid #fecaca;
    &:hover:not(:disabled) { background: #fef2f2; border-color: #ef4444; }
  }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

/* Modal Styles */
const Overlay = styled(motion.div)`
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white;
  width: 100%; max-width: 480px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  h2 { margin-top: 0; color: #1e293b; }
  p { color: #64748b; margin-bottom: 1.5rem; font-size: 0.95rem; }
  
  textarea {
    width: 100%; padding: 0.75rem;
    border: 1px solid #cbd5e1; border-radius: 8px;
    min-height: 100px; font-family: inherit; font-size: 0.95rem;
    margin-bottom: 1.5rem;
    &:focus { outline: none; border-color: #ef4444; ring: 2px solid #fecaca; }
  }

  .actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
`;

/* --- Component --- */
const VoterApproval = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, voterName: '', message: '' });

  useEffect(() => { loadVoters(); }, []);

  const loadVoters = async () => {
    try {
      const res = await voterService.getPendingVoters();
      setVoters(res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (userId) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await voterService.approveVoter(userId);
      await loadVoters();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(p => ({ ...p, [userId]: false })); }
  };

  const handleReject = async () => {
    if (!rejectModal.message.trim()) return alert('Reason is required');
    setActionLoading(p => ({ ...p, [rejectModal.userId]: true }));
    try {
      await voterService.rejectVoter(rejectModal.userId, rejectModal.message.trim());
      await loadVoters();
      setRejectModal({ open: false, userId: null, voterName: '', message: '' });
    } catch (err) { alert(err.message); }
    finally { setActionLoading(p => ({ ...p, [rejectModal.userId]: false })); }
  };

  if (loading) return <Loader message="Fetching pending registrations..." />;

  return (
    <Page>
      <Container>
        <Header>
          <h1>Voter Verification</h1>
          <p>Review registration documents and approve identity verifications.</p>
        </Header>

        <StatsRow>
          <StatCard initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="icon"><FiUser /></div>
            <div className="info"><h3>{voters.length}</h3><span>Pending Review</span></div>
          </StatCard>
          <StatCard initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="icon"><FiShield /></div>
            <div className="info"><h3>0</h3><span>Flagged Issues</span></div>
          </StatCard>
        </StatsRow>

        {voters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <FiCheck size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>All caught up! No pending registrations.</p>
          </div>
        ) : (
          <Grid>
            <AnimatePresence>
              {voters.map((v) => (
                <Card key={v.user_id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <CardHeader>
                    <div className="user-info">
                      <h3>{v.full_name}</h3>
                      <span className="id-tag">ID: {v.user_id.slice(0, 8)}</span>
                    </div>
                    <Badge><FiClock /> Pending</Badge>
                  </CardHeader>

                  <CardBody>
                    <InfoGrid>
                      <InfoItem>
                        <label><FiMail /> Email</label>
                        <div>{v.email}</div>
                      </InfoItem>
                      <InfoItem>
                        <label><FiPhone /> Phone</label>
                        <div>{v.phone}</div>
                      </InfoItem>
                      <InfoItem>
                        <label><FiCalendar /> DOB</label>
                        <div>{v.date_of_birth}</div>
                      </InfoItem>
                      <InfoItem>
                        <label><FiUser /> Gender</label>
                        <div>{v.gender}</div>
                      </InfoItem>
                      <InfoItem className="full-width">
                        <label><FiMapPin /> Address</label>
                        <div>{v.address}</div>
                      </InfoItem>
                    </InfoGrid>

                    <SecureSection>
                      <div className="section-title"><FiShield /> Aadhaar Verification Data</div>
                      <CodeBlock title="Aadhaar Hash">{v.verification.aadhaar_hash}</CodeBlock>
                      <DocPreview>
                        {v.verification.aadhaar_image ? (
                          <img src={v.verification.aadhaar_image} alt="Aadhaar Doc" />
                        ) : (
                          <div className="placeholder"><FiFileText size={24} /> No Document</div>
                        )}
                      </DocPreview>
                    </SecureSection>
                  </CardBody>

                  <CardFooter>
                    <Button
                      className="reject"
                      onClick={() => setRejectModal({ open: true, userId: v.user_id, voterName: v.full_name, message: '' })}
                      disabled={actionLoading[v.user_id]}
                    >
                      <FiX /> Reject
                    </Button>
                    <Button
                      className="approve"
                      onClick={() => handleApprove(v.user_id)}
                      disabled={actionLoading[v.user_id]}
                    >
                      <FiCheck /> Approve Voter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        <AnimatePresence>
          {rejectModal.open && (
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectModal({ ...rejectModal, open: false })}>
              <Modal initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                <h2>Reject Registration</h2>
                <p>Provide a reason for rejecting <strong>{rejectModal.voterName}</strong>. This will be emailed to them.</p>
                <textarea
                  placeholder="e.g. Document image is blurry, Name mismatch..."
                  value={rejectModal.message}
                  onChange={e => setRejectModal(p => ({ ...p, message: e.target.value }))}
                  autoFocus
                />
                <div className="actions">
                  <Button className="reject" style={{ border: 'none', background: '#f1f5f9', color: '#64748b' }} onClick={() => setRejectModal({ ...rejectModal, open: false })}>
                    Cancel
                  </Button>
                  <Button className="reject" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={handleReject}>
                    {actionLoading[rejectModal.userId] ? 'Processing...' : 'Confirm Rejection'}
                  </Button>
                </div>
              </Modal>
            </Overlay>
          )}
        </AnimatePresence>
      </Container>
    </Page>
  );
};

export default VoterApproval;