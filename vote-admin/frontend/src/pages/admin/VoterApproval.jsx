import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiCheckCircle, FiXCircle,
  FiShield, FiClock, FiAlertCircle, FiCheck, FiX
} from 'react-icons/fi';
import voterService from '../../services/voterService';
import Loader from '../../components/Loader';

/* =====================
   Time formatting helper
   - formatIST: displays stored UTC timestamps in IST
===================== */
const formatIST = (utc) => {
  if (!utc) return '—';
  return new Date(utc).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

/* =====================
   Styled Components
   - Professional layout matching the admin theme
===================== */
const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-page);
  padding: 5rem 2rem 2rem;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: left;
  margin-bottom: 2.5rem;
  color: var(--text-secondary);

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: 0.95rem;
    color: var(--text-muted);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  text-align: center;

  .stat-icon {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 0.3rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const VoterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const VoterCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--primary-hover));
  }
`;

const VoterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);

  .voter-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
  }

  .voter-id {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-family: monospace;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 1.5rem;

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.6rem 0;
  font-size: 0.95rem;
  color: var(--text-primary);

  svg {
    color: var(--primary);
    flex-shrink: 0;
    width: 18px;
  }

  .label {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 100px;
  }

  .value {
    color: var(--text-primary);
  }
`;

const AadhaarSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
`;

const AadhaarImageContainer = styled.div`
  margin-top: 1rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid var(--border-color);
  background: var(--field-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 250px;

  img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  flex: 1;

  &.approve {
    background: linear-gradient(135deg, var(--success), #059669);
    color: white;
    box-shadow: var(--shadow-md);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(20, 122, 63, 0.5);
    }
  }

  &.reject {
    background: linear-gradient(135deg, var(--danger), #b91c1c);
    color: white;
    box-shadow: var(--shadow-md);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(198, 40, 40, 0.5);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted);

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
    color: var(--text-muted);
  }

  p {
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.pending {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #92400e;
  }
`;

/* =====================
   Component
===================== */
const VoterApproval = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const res = await voterService.getPendingVoters();
      setVoters(res.data || []);
    } catch (err) {
      console.error('Failed to load voters:', err);
      setVoters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await voterService.approveVoter(userId);
      await loadVoters();
      alert('Voter approved successfully!');
    } catch (err) {
      alert('Failed to approve voter: ' + err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this voter? This action cannot be undone.')) {
      return;
    }
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await voterService.rejectVoter(userId);
      await loadVoters();
      alert('Voter rejected successfully!');
    } catch (err) {
      alert('Failed to reject voter: ' + err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return <Loader message="Loading pending voters..." />;
  }

  const stats = {
    total: voters.length,
    pending: voters.filter((v) => v.status === 'PENDING').length,
  };

  return (
    <Page>
      <Container>
        <Header>
          <h1>Voter Approval</h1>
          <p>Review and approve or reject newly registered voters</p>
        </Header>

        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon"><FiUser /></div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Pending Review</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon"><FiShield /></div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Awaiting Approval</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon"><FiClock /></div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Pending</div>
          </StatCard>
        </StatsGrid>

        {voters.length === 0 ? (
          <VoterCard>
            <EmptyState>
              <FiCheckCircle />
              <p>No pending voters to review</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                All voter registrations have been processed.
              </p>
            </EmptyState>
          </VoterCard>
        ) : (
          <VoterGrid>
            <AnimatePresence>
              {voters.map((voter, idx) => (
                <VoterCard
                  key={voter.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <VoterHeader>
                    <div>
                      <div className="voter-name">{voter.full_name}</div>
                      <div className="voter-id">ID: {voter.user_id.slice(0, 8)}...</div>
                    </div>
                    <Badge className="pending">
                      <FiClock size={12} />
                      {voter.status}
                    </Badge>
                  </VoterHeader>

                  <InfoSection>
                    <h3>
                      <FiUser size={14} />
                      Personal Information
                    </h3>
                    <InfoRow>
                      <FiMail />
                      <span className="label">Email:</span>
                      <span className="value">{voter.email}</span>
                    </InfoRow>
                    <InfoRow>
                      <FiPhone />
                      <span className="label">Phone:</span>
                      <span className="value">{voter.phone}</span>
                    </InfoRow>
                    <InfoRow>
                      <FiUser />
                      <span className="label">Gender:</span>
                      <span className="value">{voter.gender}</span>
                    </InfoRow>
                    <InfoRow>
                      <FiCalendar />
                      <span className="label">Date of Birth:</span>
                      <span className="value">{voter.date_of_birth}</span>
                    </InfoRow>
                    <InfoRow>
                      <FiMapPin />
                      <span className="label">Address:</span>
                      <span className="value">{voter.address}</span>
                    </InfoRow>
                    <InfoRow>
                      <FiClock />
                      <span className="label">Registered:</span>
                      <span className="value">{formatIST(voter.created_at)}</span>
                    </InfoRow>
                  </InfoSection>

                  <AadhaarSection>
                    <h3>
                      <FiShield size={14} />
                      Identity Verification
                    </h3>
                    <InfoRow>
                      <span className="label">Aadhaar Hash:</span>
                      <span className="value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {voter.verification.aadhaar_hash}
                      </span>
                    </InfoRow>
                    <InfoRow>
                      <span className="label">Status:</span>
                      <span className="value">{voter.verification.verification_status}</span>
                    </InfoRow>
                    <AadhaarImageContainer>
                      <img
                        src={voter.verification.aadhaar_image}
                        alt={`Aadhaar card for ${voter.full_name}`}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x250/0050a4/ffffff?text=Aadhaar+Card+Image';
                        }}
                      />
                    </AadhaarImageContainer>
                  </AadhaarSection>

                  <ActionButtons>
                    <Button
                      className="approve"
                      onClick={() => handleApprove(voter.user_id)}
                      disabled={actionLoading[voter.user_id]}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiCheck size={18} />
                      Approve
                    </Button>
                    <Button
                      className="reject"
                      onClick={() => handleReject(voter.user_id)}
                      disabled={actionLoading[voter.user_id]}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiX size={18} />
                      Reject
                    </Button>
                  </ActionButtons>
                </VoterCard>
              ))}
            </AnimatePresence>
          </VoterGrid>
        )}
      </Container>
    </Page>
  );
};

export default VoterApproval;
