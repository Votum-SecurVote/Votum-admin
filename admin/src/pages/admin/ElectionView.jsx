import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiClock, FiUsers, FiCheckCircle, FiXCircle, 
  FiEye, FiEdit, FiTrash2, FiRefreshCw, FiUpload, FiDownload,
  FiActivity, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* =====================
   Time helpers
   - formatIST: shows stored UTC timestamps in IST for the admin
   - getProgress: drives the "progress" bar for an election
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

const getProgress = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
};

/* =====================
   Dashboard layout + card styles
   for "Election Dashboard" (Step 3 of 3)
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

const ElectionCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 25px 70px rgba(0,0,0,0.4);
  }

  ${props => props.$selected && `
    border: 2px solid var(--primary);
    transform: scale(1.01);
  `}
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.draft { 
    background: linear-gradient(135deg, #e5e7eb, #d1d5db);
    color: #374151;
  }
  &.published { 
    background: linear-gradient(135deg, #bfdbfe, #93c5fd);
    color: #1e40af;
  }
  &.active { 
    background: linear-gradient(135deg, #bbf7d0, #86efac);
    color: #15803d;
    animation: pulse 2s infinite;
  }
  &.ended { 
    background: linear-gradient(135deg, #fecaca, #fca5a5);
    color: #991b1b;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 0.8rem 0;
  font-size: 0.95rem;
  color: #4b5563;

  svg {
    color: var(--primary);
    flex-shrink: 0;
  }
`;

const ProgressBar = styled.div`
  margin-top: 1.5rem;
  
  .label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 600;
  }

  .bar {
    height: 12px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    position: relative;

    .fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--primary-hover));
      border-radius: 999px;
      transition: width 1s ease;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: shimmer 2s infinite;
      }
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
    color: white;
    box-shadow: var(--shadow-md);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
  }

  &.success {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
    }
  }

  &.danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
    }
  }

  &.secondary {
    background: white;
    color: var(--primary);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--primary);
      color: white;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const BallotHistory = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border-color);

  h3 {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
    font-size: 1.1rem;

    svg {
      color: var(--primary);
    }
  }
`;

const CandidateAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  overflow: hidden;
`;

const CandidateAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BallotVersion = styled(motion.div)`
  background: ${props => props.$isPublished ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : '#f9fafb'};
  border: 2px solid ${props => props.$isPublished ? '#10b981' : '#e5e7eb'};
  border-radius: 12px;
  padding: 1.2rem;
  margin-bottom: 1rem;
  position: relative;

  .version-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;

    .version-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .version-number {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1f2937;
      }

      .published-badge {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.8rem;
        background: #10b981;
        color: white;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }

    .version-actions {
      display: flex;
      gap: 0.5rem;
    }
  }

  .ballot-details {
    color: #6b7280;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .candidates-list {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;

    .candidate-item {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.6rem;
      background: white;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);

      .candidate-name {
        font-weight: 600;
        color: #1f2937;
      }

      .candidate-party {
        color: var(--primary);
        font-size: 0.85rem;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #9ca3af;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    font-size: 1.1rem;
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

const StatCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;

  .stat-icon {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1f2937;
    margin-bottom: 0.3rem;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

/* =====================
   COMPONENT
===================== */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

// ElectionView – admin dashboard (Step 3)
// Shows election list, details, candidates and ballot history.
const ElectionView = () => {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Initial load of all elections for the left-hand list.
  const loadElections = async () => {
    try {
      const res = await electionService.getAdminElections();
      setElections(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load elections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all ballot versions for whichever election is selected.
  const loadBallots = async (electionId) => {
    if (!electionId) return;
    try {
      const res = await electionService.getElectionBallots(electionId);
      setBallots(res.data || []);
    } catch (err) {
      console.error('Failed to load ballots:', err);
      setBallots([]);
    }
  };

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selected) {
      loadBallots(selected._id);
    }
  }, [selected]);

  // Returns "draft" / "published" / "active" / "ended"
  // for a single election, used to show the colored badge.
  const statusOf = (e) => {
    const startDate = e.startDate ?? e.start_date;
    const endDate = e.endDate ?? e.end_date;
    const isPublished = e.isPublished ?? e.is_published;
    if (!isPublished) return 'draft';
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const t = now.getTime();
    if (t >= end) return 'ended';
    if (t >= start) return 'active';
    return 'published';
  };

  // Top-right action: publish the selected election
  const handlePublish = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await electionService.publishElection(selected._id);
      await loadElections();
      alert('Election published successfully!');
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Top-right action: unpublish the selected election
  const handleUnpublish = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await electionService.unpublishElection(selected._id);
      await loadElections();
      alert('Election unpublished successfully!');
    } catch (err) {
      alert('Failed to unpublish: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Top-right action: delete the selected election entirely
  // (this also clears its ballots in the mock service).
  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Delete "${selected.title}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await electionService.deleteElection(selected._id);
      await loadElections();
      alert('Election deleted successfully!');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Per-version action: publish a ballot version
  const handlePublishBallot = async (ballotId) => {
    setActionLoading(true);
    try {
      await electionService.publishBallot(ballotId);
      await loadBallots(selected._id);
      await loadElections();
      alert('Ballot published successfully!');
    } catch (err) {
      alert('Failed to publish ballot: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Per-version action: unpublish a ballot version
  const handleUnpublishBallot = async (ballotId) => {
    setActionLoading(true);
    try {
      await electionService.unpublishBallot(ballotId);
      await loadBallots(selected._id);
      await loadElections();
      alert('Ballot unpublished successfully!');
    } catch (err) {
      alert('Failed to unpublish ballot: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Per-version action: rollback – clones an older version into
  // a brand new ballot version (v+1) based on targetVersion.
  const handleRollback = async (ballotId, targetVersion) => {
    if (!confirm(`Rollback to version ${targetVersion}? This will create a new ballot version.`)) return;
    setActionLoading(true);
    try {
      await electionService.rollbackBallot(ballotId, targetVersion);
      await loadBallots(selected._id);
      await loadElections();
      alert('Ballot rolled back successfully!');
    } catch (err) {
      alert('Failed to rollback: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Per-version action: delete a single ballot version from history.
  const handleDeleteBallot = async (ballotId) => {
    if (!confirm('Delete this ballot version? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await electionService.deleteBallot(ballotId);
      await loadBallots(selected._id);
      await loadElections();
      alert('Ballot version deleted successfully!');
    } catch (err) {
      alert('Failed to delete ballot: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Loading elections..." />;

  const stats = {
    total: elections.length,
    active: elections.filter(e => statusOf(e) === 'active').length,
    draft: elections.filter(e => statusOf(e) === 'draft').length,
  };

  return (
    <Page>
      <Container>
        <Header>
          <div
            style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              marginBottom: '0.3rem',
            }}
          >
            Step 3 of 3
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Election Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Manage elections, ballots, and track voting progress in real-time
          </motion.p>
        </Header>

        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon"><FiActivity /></div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Elections</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon"><FiTrendingUp /></div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Now</div>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon"><FiEdit /></div>
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">In Draft</div>
          </StatCard>
        </StatsGrid>

        <Grid>
          <div>
            <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              All Elections
            </h2>
            {elections.length === 0 ? (
              <Card>
                <EmptyState>
                  <FiAlertCircle />
                  <p>No elections found. Create your first election!</p>
                </EmptyState>
              </Card>
            ) : (
              <AnimatePresence>
                {elections.map((e, idx) => (
                  <ElectionCard
                    key={e._id ?? e.id}
                    $selected={selected?._id === e._id}
                    onClick={() => setSelected(e)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>{e.title}</h3>
                      <Badge className={statusOf(e)}>
                        {statusOf(e) === 'active' && <FiActivity />}
                        {statusOf(e)}
                      </Badge>
                    </div>

                    {e.description && (
                      <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1rem' }}>
                        {e.description}
                      </p>
                    )}

                    <InfoRow>
                      <FiCalendar />
                      <span>Start: {formatIST(e.startDate ?? e.start_date)}</span>
                    </InfoRow>

                    <InfoRow>
                      <FiClock />
                      <span>End: {formatIST(e.endDate ?? e.end_date)}</span>
                    </InfoRow>

                    <InfoRow>
                      <FiUsers />
                      <span>{e.candidates?.length || 0} Candidates</span>
                    </InfoRow>

                    {(e.isPublished ?? e.is_published) && (
                      <ProgressBar>
                        <div className="label">
                          <span>Progress</span>
                          <span>{getProgress(e.startDate ?? e.start_date, e.endDate ?? e.end_date)}%</span>
                        </div>
                        <div className="bar">
                          <div 
                            className="fill" 
                            style={{ width: `${getProgress(e.startDate ?? e.start_date, e.endDate ?? e.end_date)}%` }}
                          />
                        </div>
                      </ProgressBar>
                    )}
                  </ElectionCard>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* RIGHT: Election Details & Ballot History */}
          <div>
            {selected ? (
              <Card initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Election Details</h2>

                <ActionButtons>
                  {!selected.isPublished ? (
                    <Button className="success" onClick={handlePublish} disabled={actionLoading}>
                      <FiUpload /> Publish Election
                    </Button>
                  ) : (
                    <Button className="secondary" onClick={handleUnpublish} disabled={actionLoading}>
                      <FiDownload /> Unpublish
                    </Button>
                  )}

                  <Button className="danger" onClick={handleDelete} disabled={actionLoading}>
                    <FiTrash2 /> Delete
                  </Button>
                </ActionButtons>

                {selected.votingRules && (
                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      borderLeft: `4px solid var(--primary)`,
                    }}
                  >
                    <strong style={{ color: 'var(--text-secondary)' }}>Voting Rules:</strong>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-primary)' }}>
                      {selected.votingRules}
                    </p>
                  </div>
                )}

                {selected.candidates && selected.candidates.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                      <FiUsers style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      Candidates ({selected.candidates.length})
                    </h4>
                    {selected.candidates.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.8rem',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          borderLeft: '3px solid var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <CandidateAvatar>
                          {c.imageUrl ? (
                            <CandidateAvatarImage
                              src={c.imageUrl}
                              alt={`${c.party || c.name} logo`}
                            />
                          ) : (
                            <span>{getInitials(c.name)}</span>
                          )}
                        </CandidateAvatar>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{c.party}</div>
                          {c.description && (
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.3rem',
                              }}
                            >
                              {c.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <BallotHistory>
                  <h3>
                    <FiRefreshCw />
                    Ballot History ({ballots.length} versions)
                  </h3>

                  {ballots.length === 0 ? (
                    <EmptyState>
                      <FiAlertCircle />
                      <p>No ballots created yet for this election.</p>
                    </EmptyState>
                  ) : (
                    <AnimatePresence>
                      {ballots.map((ballot, idx) => (
                        <BallotVersion
                          key={ballot.id}
                          $isPublished={ballot.isPublished}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="version-header">
                            <div className="version-info">
                              <div className="version-number">Version {ballot.version}</div>
                              {ballot.isPublished && (
                                <div className="published-badge">
                                  <FiCheckCircle /> PUBLISHED
                                </div>
                              )}
                            </div>

                            <div className="version-actions">
                              {!ballot.isPublished ? (
                                <Button 
                                  className="success" 
                                  onClick={() => handlePublishBallot(ballot.id)}
                                  disabled={actionLoading}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                  <FiUpload /> Publish
                                </Button>
                              ) : (
                                <Button 
                                  className="secondary" 
                                  onClick={() => handleUnpublishBallot(ballot.id)}
                                  disabled={actionLoading}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                  <FiDownload /> Unpublish
                                </Button>
                              )}

                              {ballot.version > 1 && (
                                <Button 
                                  className="primary" 
                                  onClick={() => handleRollback(ballot.id, ballot.version - 1)}
                                  disabled={actionLoading}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                >
                                  <FiRefreshCw /> Rollback
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="ballot-details">
                            <strong>{ballot.title || 'Untitled Ballot'}</strong>
                            {ballot.description && <div>{ballot.description}</div>}
                            <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                              Created: {formatIST(ballot.createdAt)}
                            </div>
                          </div>

                          {ballot.options && ballot.options.length > 0 && (
                            <div className="candidates-list">
                              {ballot.options.map((opt, i) => (
                                <div key={i} className="candidate-item">
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CandidateAvatar>
                                      {opt.imageUrl ? (
                                        <CandidateAvatarImage
                                          src={opt.imageUrl}
                                          alt={`${opt.party || opt.name} logo`}
                                        />
                                      ) : (
                                        <span>{getInitials(opt.name)}</span>
                                      )}
                                    </CandidateAvatar>
                                    <div>
                                      <div className="candidate-name">{opt.name}</div>
                                      <div className="candidate-party">{opt.party}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </BallotVersion>
                      ))}
                    </AnimatePresence>
                  )}
                </BallotHistory>
              </Card>
            ) : (
              <Card>
                <EmptyState>
                  <FiEye />
                  <p>Select an election to view details</p>
                </EmptyState>
              </Card>
            )}
          </div>
        </Grid>
      </Container>
    </Page>
  );
};

export default ElectionView;
