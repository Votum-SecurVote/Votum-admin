import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiCalendar, FiClock, FiUsers, FiEye, 
  FiPlay, FiPause, FiCheckCircle, FiClock as FiClockIcon, FiRotateCcw, FiTrash2 
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext.jsx';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, var(--primary), var(--info));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ElectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatusBadge = styled(motion.span)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.draft {
    background: rgba(148, 163, 184, 0.2);
    color: var(--text-muted);
  }
  
  &.published {
    background: rgba(59, 130, 246, 0.2);
    color: var(--primary);
  }
  
  &.active {
    background: rgba(16, 185, 129, 0.2);
    color: var(--success);
  }
  
  &.ended {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
  }
`;

const TimelineContainer = styled.div`
  margin: 2rem 0;
  position: relative;
`;

const Timeline = styled.div`
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  position: relative;
  margin: 2rem 0;
`;

const TimelineProgress = styled(motion.div)`
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
`;

const TimelineMarkers = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
`;

const TimelineMarker = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  .marker-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => props.active ? 'var(--primary)' : 'var(--border-color)'};
    border: 3px solid ${props => props.active ? 'var(--primary)' : 'var(--bg-card)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
  }
  
  .marker-label {
    font-size: 0.75rem;
    color: ${props => props.active ? 'var(--primary)' : 'var(--text-muted)'};
    font-weight: ${props => props.active ? '600' : '400'};
    text-align: center;
  }
`;

const ElectionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary);
  
  .detail-icon {
    color: var(--primary);
    font-size: 1.25rem;
  }
  
  .detail-content {
    flex: 1;
    
    h4 {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }
    
    p {
      color: var(--text-primary);
      font-weight: 500;
    }
  }
`;

const CandidatesSection = styled.div`
  margin-top: 2rem;
`;

const CandidateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const CandidateCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--info));
  }
  
  h4 {
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .candidate-number {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    width: 24px;
    height: 24px;
    background: var(--bg-secondary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatsCard = styled(AnimatedCard)`
  h3 {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(90deg, var(--primary), var(--info));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VersionSelect = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  
  &.publish {
    background: var(--success);
    color: white;
    
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
  
  &.unpublish {
    background: var(--warning);
    color: white;
    
    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ElectionView = ({ mode = 'public' }) => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [selectedBallotId, setSelectedBallotId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ballotLoading, setBallotLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time for auto-updates
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminView = mode === 'admin' && isAdmin;

  // Update current time every second for real-time timeline updates
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timeInterval);
  }, []);

  // Auto-update election statuses every 30 seconds
  useEffect(() => {
    if (elections.length === 0) return;

    const statusInterval = setInterval(() => {
      updateElectionStatuses();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(statusInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elections.length, currentTime, isAdminView]);

  useEffect(() => {
    fetchElections();
  }, [isAdminView]); // Re-fetch when admin view changes

  useEffect(() => {
    if (isAdminView && selectedElection?._id) {
      fetchBallots(selectedElection._id);
    } else {
      setBallots([]);
      setSelectedBallotId(null);
    }
  }, [isAdminView, selectedElection?._id]);

  // Update selected election status when currentTime changes
  useEffect(() => {
    if (!selectedElection || elections.length === 0) return;

    const updatedSelected = elections.find(e => e._id === selectedElection._id);
    if (updatedSelected && updatedSelected.status !== selectedElection.status) {
      setSelectedElection(updatedSelected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, elections]);

  const fetchElections = async () => {
    try {
      const response = isAdminView
        ? await electionService.getAdminElections()
        : await electionService.getActiveElections();

      // Ensure we have data array
      const electionsData = response?.data || response || [];
      
      if (!Array.isArray(electionsData)) {
        console.error('Invalid response format:', response);
        setElections([]);
        setLoading(false);
        return;
      }

      // Update election statuses based on current time for accurate display
      const now = new Date();
      const updatedElections = electionsData.map(election => {
        if (!election) return null;
        
        // Ensure status is set for draft elections
        if (!election.isPublished && !election.status) {
          election.status = 'draft';
        }
        
        if (election.isPublished) {
          if (now >= new Date(election.endDate)) {
            return { ...election, status: 'ended' };
          } else if (now >= new Date(election.startDate)) {
            return { ...election, status: 'active' };
          } else {
            return { ...election, status: 'published' };
          }
        }
        return election;
      }).filter(e => e !== null); // Remove any null entries

      setElections(updatedElections);
      if (updatedElections.length > 0) {
        // Update selected election if it exists
        const currentSelected = updatedElections.find(e => e._id === selectedElection?._id);
        setSelectedElection(currentSelected || updatedElections[0]);
      } else {
        setSelectedElection(null);
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
      // Show error to user
      alert(`Error loading elections: ${error.message || 'Unknown error'}`);
      setElections([]);
      setSelectedElection(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBallots = async (electionId) => {
    setBallotLoading(true);
    try {
      const response = await electionService.getElectionBallots(electionId);
      const list = response.data || [];
      setBallots(list);

      if (list.length > 0) {
        const published = list.find((b) => b.isPublished);
        setSelectedBallotId((published || list[list.length - 1])._id);
      } else {
        setSelectedBallotId(null);
      }
    } catch (error) {
      console.error('Error fetching ballots:', error);
    } finally {
      setBallotLoading(false);
    }
  };

  const currentPublishedBallot = ballots.find((b) => b.isPublished);
  const selectedBallot = ballots.find((b) => b._id === selectedBallotId);

  const handlePublishBallot = async () => {
    if (!isAdminView || !selectedElection || !selectedBallot) return;

    try {
      await electionService.publishBallot(selectedBallot._id);
      alert('Ballot published successfully!');
      await fetchElections();
      await fetchBallots(selectedElection._id);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUnpublishBallot = async () => {
    if (!isAdminView || !selectedElection || !currentPublishedBallot) return;

    try {
      await electionService.unpublishBallot(currentPublishedBallot._id);
      alert('Ballot unpublished successfully!');
      await fetchElections();
      await fetchBallots(selectedElection._id);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRollbackBallot = async () => {
    if (
      !isAdminView ||
      !selectedElection ||
      !selectedBallot
    ) {
      return;
    }

    // Admin has full control - can rollback to any version
    // If no published ballot exists, we need to publish the selected version first
    if (!currentPublishedBallot) {
      // No published ballot, so just publish the selected version
      try {
        await electionService.publishBallot(selectedBallot._id);
        alert(`Published ballot version v${selectedBallot.version}`);
        await fetchElections();
        await fetchBallots(selectedElection._id);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
      return;
    }

    // Prevent rollback if trying to rollback to the same version
    if (currentPublishedBallot.version === selectedBallot.version) {
      alert('Already on this version. Select a different version to rollback.');
      return;
    }

    // Prevent rollback only for ended elections
    if (new Date() > new Date(selectedElection.endDate)) {
      alert('Cannot rollback after election has ended');
      return;
    }

    try {
      await electionService.rollbackBallot(
        currentPublishedBallot._id,
        selectedBallot.version,
      );
      alert(`Rolled back to ballot version v${selectedBallot.version}`);
      await fetchElections();
      await fetchBallots(selectedElection._id);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteElection = async () => {
    if (!isAdminView || !selectedElection) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${selectedElection.title}"?\n\nThis will permanently delete the election and all associated ballots. This action cannot be undone.`
    );

    if (!confirmed) return;

    const deletedId = selectedElection._id;
    try {
      await electionService.deleteElection(deletedId);
      alert('Election deleted successfully!');
      // Fetch fresh elections list
      const response = await electionService.getAdminElections();
      const now = new Date();
      const updatedElections = response.data.map(election => {
        if (election.isPublished) {
          if (now >= new Date(election.endDate)) {
            return { ...election, status: 'ended' };
          } else if (now >= new Date(election.startDate)) {
            return { ...election, status: 'active' };
          } else {
            return { ...election, status: 'published' };
          }
        }
        return election;
      });
      setElections(updatedElections);
      // Select first remaining election or null
      if (updatedElections.length > 0) {
        setSelectedElection(updatedElections[0]);
      } else {
        setSelectedElection(null);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Function to update election statuses based on current time
  const updateElectionStatuses = () => {
    if (elections.length === 0) return;

    const now = currentTime;
    const updatedElections = elections.map(election => {
      if (!election) return null;
      
      // Ensure status is set for draft elections
      if (!election.isPublished && !election.status) {
        return { ...election, status: 'draft' };
      }
      
      if (election.isPublished) {
        if (now >= new Date(election.endDate)) {
          return { ...election, status: 'ended' };
        } else if (now >= new Date(election.startDate)) {
          return { ...election, status: 'active' };
        } else {
          return { ...election, status: 'published' };
        }
      }
      return election;
    }).filter(e => e !== null);

    setElections(updatedElections);
    
    // Update selected election status if it exists
    if (selectedElection) {
      const updatedSelected = updatedElections.find(e => e._id === selectedElection._id);
      if (updatedSelected) {
        setSelectedElection(updatedSelected);
      }
    }
  };

  const calculateProgress = (election) => {
    if (!election) return 0;

    const now = currentTime; // Use currentTime state instead of new Date()
    const start = new Date(election.startDate);
    const end = new Date(election.endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return (elapsed / total) * 100;
  };

  if (loading) {
    return <Loader message="Loading elections..." />;
  }

  if (elections.length === 0) {
    return (
      <PageContainer>
        <AnimatedCard>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              📊
            </motion.div>
            <h3>{isAdminView ? 'No Elections Found' : 'No Active Elections'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {isAdminView 
                ? 'Create a new election to get started' 
                : 'No published elections are currently available'}
            </p>
            {isAdminView && (
              <motion.button
                onClick={fetchElections}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary)',
                  background: 'var(--primary)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Refresh Elections
              </motion.button>
            )}
          </div>
        </AnimatedCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Election Dashboard
        </motion.h1>
      </Header>
      
      <ElectionGrid>
        <div>
          <AnimatedCard>
            {selectedElection && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {selectedElection.title}
                    </h2>
                    <StatusBadge
                      key={`status-${selectedElection.status}-${currentTime.getTime()}`}
                      className={selectedElection.status}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      {selectedElection.status === 'draft' && <FiEye />}
                      {selectedElection.status === 'published' && <FiPlay />}
                      {selectedElection.status === 'active' && <FiClockIcon />}
                      {selectedElection.status === 'ended' && <FiCheckCircle />}
                      {selectedElection.status}
                    </StatusBadge>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Created: {new Date(selectedElection.createdAt).toLocaleDateString()}
                    </div>
                    {isAdminView && (
                      <motion.button
                        onClick={handleDeleteElection}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--danger)',
                          background: 'transparent',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all var(--transition-normal)'
                        }}
                        title="Delete Election"
                      >
                        <FiTrash2 />
                      </motion.button>
                    )}
                  </div>
                </div>
                
                {selectedElection.description && (
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    {selectedElection.description}
                  </p>
                )}
                
                <TimelineContainer>
                  <Timeline>
                    <TimelineProgress
                      key={currentTime.getTime()} // Force re-render on time update
                      style={{ width: `${calculateProgress(selectedElection)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(selectedElection)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </Timeline>
                  
                  <TimelineMarkers>
                    <TimelineMarker active={true}>
                      <div className="marker-dot">
                        <FiCalendar size={12} />
                      </div>
                      <div className="marker-label">
                        Start
                      </div>
                    </TimelineMarker>
                    
                    <TimelineMarker active={currentTime >= new Date(selectedElection.startDate)}>
                      <div className="marker-dot">
                        <FiClock size={12} />
                      </div>
                      <div className="marker-label">
                        Now
                      </div>
                    </TimelineMarker>
                    
                    <TimelineMarker active={currentTime >= new Date(selectedElection.endDate)}>
                      <div className="marker-dot">
                        <FiCheckCircle size={12} />
                      </div>
                      <div className="marker-label">
                        End
                      </div>
                    </TimelineMarker>
                  </TimelineMarkers>
                </TimelineContainer>
                
                <ElectionDetails>
                  <DetailRow>
                    <div className="detail-icon">
                      <FiCalendar />
                    </div>
                    <div className="detail-content">
                      <h4>Start Date</h4>
                      <p>{new Date(selectedElection.startDate).toLocaleString()}</p>
                    </div>
                  </DetailRow>
                  
                  <DetailRow>
                    <div className="detail-icon">
                      <FiClock />
                    </div>
                    <div className="detail-content">
                      <h4>End Date</h4>
                      <p>{new Date(selectedElection.endDate).toLocaleString()}</p>
                    </div>
                  </DetailRow>
                  
                  <DetailRow>
                    <div className="detail-icon">
                      <FiUsers />
                    </div>
                    <div className="detail-content">
                      <h4>Candidates</h4>
                      <p>{selectedElection.candidates?.length || 0} candidates</p>
                    </div>
                  </DetailRow>
                </ElectionDetails>
                
                {selectedElection.candidates && selectedElection.candidates.length > 0 && (
                  <CandidatesSection>
                    <h3 style={{ marginBottom: '1rem' }}>Ballot Candidates</h3>
                    <CandidateGrid>
                      {selectedElection.candidates.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                        >
                          <div className="candidate-number">
                            {index + 1}
                          </div>
                          <h4>{candidate.name}</h4>
                          {candidate.party && (
                            <p style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '0.25rem' }}>
                              {candidate.party}
                            </p>
                          )}
                          {candidate.description && (
                            <p>{candidate.description}</p>
                          )}
                        </CandidateCard>
                      ))}
                    </CandidateGrid>
                  </CandidatesSection>
                )}
              </>
            )}
          </AnimatedCard>
        </div>
        
        <Sidebar>
          <StatsCard>
            <h3>Total Elections</h3>
            <div className="stat-value">{elections.length}</div>
            <div className="stat-label">Active: {elections.filter(e => e.status === 'active').length}</div>
          </StatsCard>
          
          <AnimatedCard delay={0.1}>
            <h3 style={{ marginBottom: '1rem' }}>Election List</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {elections.map((election) => (
                <motion.div
                  key={election._id}
                  className="glass"
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: selectedElection?._id === election._id ? '1px solid var(--primary)' : '1px solid transparent',
                    background: selectedElection?._id === election._id ? 'rgba(37, 99, 235, 0.08)' : 'transparent'
                  }}
                  onClick={() => {
                    setSelectedElection(election);
                    if (isAdminView) {
                      fetchBallots(election._id);
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px'
                    }}>
                      {election.title}
                    </span>
                    <StatusBadge className={election.status} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      {election.status.charAt(0)}
                    </StatusBadge>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date(election.startDate).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>
          
          {selectedElection && isAdminView && (
            <AnimatedCard delay={0.2}>
              <h3 style={{ marginBottom: '1rem' }}>Ballot Versions</h3>
              {ballotLoading ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Loading ballots...
                </p>
              ) : ballots.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No ballots created yet for this election.
                </p>
              ) : (
                <>
                  <VersionSelect
                    value={selectedBallotId || ''}
                    onChange={(e) => setSelectedBallotId(e.target.value)}
                  >
                    {ballots.map((ballot) => (
                      <option key={ballot._id} value={ballot._id}>
                        {`v${ballot.version} – ${ballot.isPublished ? 'Published' : 'Draft'}`}
                      </option>
                    ))}
                  </VersionSelect>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Current published:{' '}
                    {currentPublishedBallot
                      ? `v${currentPublishedBallot.version}`
                      : 'none'}
                  </p>
                </>
              )}
              <ActionButtons>
                <ActionButton
                  className="publish"
                  onClick={handlePublishBallot}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    !selectedBallot ||
                    !selectedBallot.options ||
                    selectedBallot.options.length < 2
                  }
                  title={
                    !selectedBallot
                      ? 'Select a ballot version to publish'
                      : selectedBallot.options.length < 2
                      ? 'Ballot must have at least 2 candidates'
                      : undefined
                  }
                >
                  <FiPlay /> Publish Selected
                </ActionButton>

                <ActionButton
                  className="unpublish"
                  onClick={handleUnpublishBallot}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    !currentPublishedBallot ||
                    new Date() >= new Date(selectedElection.startDate)
                  }
                  title={
                    !currentPublishedBallot
                      ? 'No published ballot to unpublish'
                      : new Date() >= new Date(selectedElection.startDate)
                      ? 'You cannot unpublish after the election start time'
                      : undefined
                  }
                >
                  <FiPause /> Unpublish Current
                </ActionButton>

                <ActionButton
                  className="unpublish"
                  onClick={handleRollbackBallot}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={
                    !selectedBallot ||
                    !selectedElection ||
                    (currentPublishedBallot && currentPublishedBallot?.version === selectedBallot?.version) ||
                    (selectedElection && new Date() > new Date(selectedElection.endDate)) ||
                    (selectedBallot && (!selectedBallot.options || selectedBallot.options.length < 2))
                  }
                  title={
                    !selectedBallot
                      ? 'Select a target ballot version to rollback to'
                      : !selectedElection
                      ? 'No election selected'
                      : selectedBallot && (!selectedBallot.options || selectedBallot.options.length < 2)
                      ? 'Ballot must have at least 2 candidates'
                      : currentPublishedBallot && currentPublishedBallot?.version === selectedBallot?.version
                      ? 'Already on this version. Select a different version.'
                      : selectedElection && new Date() > new Date(selectedElection.endDate)
                      ? 'You cannot rollback after the election has ended'
                      : currentPublishedBallot
                      ? `Rollback from v${currentPublishedBallot.version} to v${selectedBallot.version}`
                      : `Publish version v${selectedBallot.version}`
                  }
                >
                  <FiRotateCcw /> {currentPublishedBallot ? 'Rollback to Selected' : 'Publish Selected'}
                </ActionButton>
              </ActionButtons>
            </AnimatedCard>
          )}
        </Sidebar>
      </ElectionGrid>
    </PageContainer>
  );
};

export default ElectionView;
