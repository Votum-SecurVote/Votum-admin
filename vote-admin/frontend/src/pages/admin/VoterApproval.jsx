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

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: var(--text-muted);
  }
`;

const ModalTextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--field-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  min-height: 120px;
  resize: vertical;
  margin-bottom: 1.5rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
    background: #ffffff;
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all var(--transition-normal);

  &.cancel {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--bg-hover);
    }
  }

  &.confirm {
    background: linear-gradient(135deg, var(--danger), #b91c1c);
    color: white;
    box-shadow: var(--shadow-md);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(198, 40, 40, 0.5);
    }
  }
`;

/* =====================
   Voter Approval Component
   - Main page for admin to review and approve/reject newly registered voters
   - Displays voter personal info, Aadhaar verification details, and Aadhaar card image
   - Allows approval or rejection with rejection reason message sent to voter
===================== */
const VoterApproval = () => {
  // State: List of pending voters awaiting approval/rejection
  const [voters, setVoters] = useState([]);
  // State: Loading indicator while fetching voters
  const [loading, setLoading] = useState(true);
  // State: Tracks which voter action (approve/reject) is currently loading
  const [actionLoading, setActionLoading] = useState({});
  // State: Controls rejection reason modal (open/close, voter info, rejection message)
  const [rejectModal, setRejectModal] = useState({ open: false, userId: null, voterName: '', message: '' });

  // Load pending voters on component mount
  useEffect(() => {
    loadVoters();
  }, []);

  /* Load pending voters from service
     - Fetches all voters with status='PENDING' and verification_status='PENDING'
     - Updates voters state to display in the UI
  */
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

  /* Handle voter approval
     - Called when admin clicks "Approve" button on a voter card
     - Updates voter status to 'APPROVED' and verification_status to 'VERIFIED'
     - Reloads voter list to remove approved voter from pending list
  */
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

  /* Open rejection reason modal
     - Called when admin clicks "Reject" button on a voter card
     - Opens modal prompting admin to enter rejection reason
     - Stores voter ID and name for the rejection action
  */
  const openRejectModal = (userId, voterName) => {
    setRejectModal({
      open: true,
      userId,
      voterName,
      message: '',
    });
  };

  /* Close rejection reason modal
     - Resets modal state when admin cancels or completes rejection
  */
  const closeRejectModal = () => {
    setRejectModal({ open: false, userId: null, voterName: '', message: '' });
  };

  /* Handle voter rejection with rejection message
     - Called when admin submits rejection reason in modal
     - Validates that rejection message is provided (required)
     - Updates voter status to 'REJECTED' and stores rejection_message
     - Rejection message will be sent to the voter (in real system via email/notification)
     - Reloads voter list to remove rejected voter from pending list
  */
  const handleReject = async () => {
    if (!rejectModal.message.trim()) {
      alert('Please provide a reason for rejection. This message will be sent to the voter.');
      return;
    }

    setActionLoading((prev) => ({ ...prev, [rejectModal.userId]: true }));
    try {
      await voterService.rejectVoter(rejectModal.userId, rejectModal.message.trim());
      await loadVoters();
      alert(`Voter rejected successfully! A rejection message has been sent to ${rejectModal.voterName}.`);
      closeRejectModal();
    } catch (err) {
      alert('Failed to reject voter: ' + err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [rejectModal.userId]: false }));
    }
  };

  if (loading) {
    return <Loader message="Loading pending voters..." />;
  }

  const stats = {
    total: voters.length,
    pending: voters.filter((v) => v.status === 'PENDING').length,
  };

  // Calculate stats for dashboard cards
  const stats = {
    total: voters.length,
    pending: voters.filter((v) => v.status === 'PENDING').length,
  };

  return (
    <Page>
      <Container>
        {/* Page Header */}
        <Header>
          <h1>Voter Approval</h1>
          <p>Review and approve or reject newly registered voters</p>
        </Header>

        {/* Stats Dashboard Cards - Shows pending review count */}
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

        {/* Empty State - No pending voters */}
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
          /* Voter Cards Grid - Displays each pending voter with full details */
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
                  {/* Voter Card Header - Name, ID, Status Badge */}
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

                  {/* Personal Information Section - Email, Phone, Gender, DOB, Address, Registration Date */}
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

                  {/* Aadhaar Verification Section - Hash, Status, Aadhaar Card Image Display */}
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
                    {/* Aadhaar Card Image Display - Shows uploaded Aadhaar card image */}
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

                  {/* Action Buttons - Approve and Reject */}
                  <ActionButtons>
                    {/* Approve Button - Immediately approves voter */}
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
                    {/* Reject Button - Opens modal to enter rejection reason */}
                    <Button
                      className="reject"
                      onClick={() => openRejectModal(voter.user_id, voter.full_name)}
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

        {/* Rejection Reason Modal - Opens when admin clicks "Reject" button
            - Prompts admin to enter rejection reason
            - Rejection message is required and will be sent to the voter
            - Modal has Cancel and Confirm actions
        */}
        <AnimatePresence>
          {rejectModal.open && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRejectModal}
            >
              <ModalContent
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalHeader>
                  <h2>Reject Voter Registration</h2>
                  <p>Please provide a reason for rejecting {rejectModal.voterName}'s registration. This message will be sent to the voter.</p>
                </ModalHeader>
                {/* Rejection Reason Text Area - Admin enters reason here */}
                <ModalTextArea
                  placeholder="Enter rejection reason (e.g., Invalid Aadhaar document, Information mismatch, Incomplete details, etc.)"
                  value={rejectModal.message}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, message: e.target.value }))}
                />
                <ModalActions>
                  <ModalButton className="cancel" onClick={closeRejectModal}>
                    Cancel
                  </ModalButton>
                  {/* Confirm Rejection Button - Submits rejection with message */}
                  <ModalButton
                    className="confirm"
                    onClick={handleReject}
                    disabled={actionLoading[rejectModal.userId] || !rejectModal.message.trim()}
                  >
                    {actionLoading[rejectModal.userId] ? 'Rejecting...' : 'Reject & Send Message'}
                  </ModalButton>
                </ModalActions>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </Container>
    </Page>
  );
};

export default VoterApproval;
