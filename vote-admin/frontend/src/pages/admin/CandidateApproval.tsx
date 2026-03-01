import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiArrowLeft, FiFile, FiDownload } from 'react-icons/fi';
import candidateService, { Candidate } from '../../services/candidateService';
import Loader from '../../components/Loader';
import AnimatedCard from '../../components/AnimatedCard';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  button {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
    transition: background var(--transition-fast);
    &:hover {
      background: var(--bg-hover);
    }
  }
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
  }
`;

const ProfileCard = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  border: 3px solid var(--primary);
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  h2 {
    font-size: 1.75rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 1rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'APPROVED') return 'var(--success)15';
    if (props.status === 'REJECTED') return 'var(--danger)15';
    return 'var(--warning)15';
  }};
  color: ${props => {
    if (props.status === 'APPROVED') return 'var(--success)';
    if (props.status === 'REJECTED') return 'var(--danger)';
    return 'var(--warning)';
  }};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  h3 {
    font-size: 0.875rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1rem;
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const DocumentsSection = styled.div`
  margin-bottom: 2rem;
  h3 {
    font-size: 1.25rem;
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
`;

const DocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DocumentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  a {
    color: var(--primary);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActionSection = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
`;

const ActionTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled(motion.button)<{ variant?: 'success' | 'danger' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-fast);
  background: ${props => {
    if (props.variant === 'success') return 'var(--success)';
    if (props.variant === 'danger') return 'var(--danger)';
    return 'var(--primary)';
  }};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CandidateApproval: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (candidateId) {
      loadCandidate();
    }
  }, [candidateId]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      const data = await candidateService.getCandidate(candidateId!);
      setCandidate(data);
    } catch (error) {
      console.error('Failed to load candidate:', error);
      alert('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!candidateId) return;

    try {
      setProcessing(true);
      await candidateService.approveCandidate({
        candidateId,
        action: 'APPROVE',
        remarks: remarks || undefined,
      });
      alert('Candidate approved successfully');
      navigate(-1);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve candidate');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!candidateId) return;

    if (!remarks.trim()) {
      alert('Please provide remarks for rejection');
      return;
    }

    try {
      setProcessing(true);
      await candidateService.approveCandidate({
        candidateId,
        action: 'REJECT',
        remarks,
      });
      alert('Candidate rejected');
      navigate(-1);
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Failed to reject candidate');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loader message="Loading candidate details..." />;
  }

  if (!candidate) {
    return <div>Candidate not found</div>;
  }

  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer>
      <Header>
        <button onClick={() => navigate(-1)}>
          <FiArrowLeft />
          Back
        </button>
        <h1>Candidate Approval</h1>
      </Header>

      <ProfileCard>
        <ProfileHeader>
          <Avatar>
            {candidate.imageUrl ? (
              <img src={candidate.imageUrl} alt={candidate.name} />
            ) : (
              initials
            )}
          </Avatar>
          <ProfileInfo>
            <h2>{candidate.name}</h2>
            <p>{candidate.party}</p>
            <StatusBadge status={candidate.status}>{candidate.status}</StatusBadge>
          </ProfileInfo>
        </ProfileHeader>

        <InfoGrid>
          <InfoItem>
            <h3>Election ID</h3>
            <p>{candidate.electionId}</p>
          </InfoItem>
          <InfoItem>
            <h3>Ballot ID</h3>
            <p>{candidate.ballotId}</p>
          </InfoItem>
          <InfoItem>
            <h3>Submitted On</h3>
            <p>{new Date(candidate.createdAt).toLocaleString()}</p>
          </InfoItem>
          <InfoItem>
            <h3>Last Updated</h3>
            <p>{new Date(candidate.updatedAt).toLocaleString()}</p>
          </InfoItem>
        </InfoGrid>

        {candidate.description && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Description
            </h3>
            <p style={{ color: 'var(--text-primary)' }}>{candidate.description}</p>
          </div>
        )}

        {candidate.documents && candidate.documents.length > 0 && (
          <DocumentsSection>
            <h3>Documents</h3>
            <DocumentList>
              {candidate.documents.map((doc, index) => (
                <DocumentItem key={index}>
                  <FiFile />
                  <span style={{ flex: 1 }}>Document {index + 1}</span>
                  <a href={doc} target="_blank" rel="noopener noreferrer">
                    <FiDownload />
                    View
                  </a>
                </DocumentItem>
              ))}
            </DocumentList>
          </DocumentsSection>
        )}
      </ProfileCard>

      {candidate.status === 'PENDING' && (
        <ActionSection>
          <ActionTitle>Review & Decision</ActionTitle>
          <TextArea
            placeholder="Add remarks (required for rejection)..."
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
          <ActionButtons>
            <Button variant="danger" onClick={handleReject} disabled={processing}>
              <FiX />
              Reject
            </Button>
            <Button variant="success" onClick={handleApprove} disabled={processing}>
              <FiCheck />
              Approve
            </Button>
          </ActionButtons>
        </ActionSection>
      )}
    </PageContainer>
  );
};

export default CandidateApproval;
