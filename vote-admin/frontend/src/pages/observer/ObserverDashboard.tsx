import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiCheckCircle, FiClock, FiEye } from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';
import AnimatedCard from '../../components/AnimatedCard';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--text-muted);
  }
`;

const ObserverBadge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--info)15;
  color: var(--info);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const KPICard = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
`;

const IconWrapper = styled.div<{ color: string }>`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-md);
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const KPIInfo = styled.div`
  flex: 1;
  h3 {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  p {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }
`;

const ElectionsSection = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const ElectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ElectionCard = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  h3 {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'PUBLISHED' || props.status === 'ACTIVE') return 'var(--success)15';
    if (props.status === 'ENDED') return 'var(--text-muted)15';
    return 'var(--warning)15';
  }};
  color: ${props => {
    if (props.status === 'PUBLISHED' || props.status === 'ACTIVE') return 'var(--success)';
    if (props.status === 'ENDED') return 'var(--text-muted)';
    return 'var(--warning)';
  }};
`;

interface Election {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
}

const ObserverDashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalElections: 0,
    activeElections: 0,
    publishedElections: 0,
    endedElections: 0,
  });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      setLoading(true);
      const data = await electionService.getAdminElections();
      setElections(data || []);

      const active = data.filter((e: Election) => {
        const now = new Date();
        const start = new Date(e.startDate);
        const end = new Date(e.endDate);
        return now >= start && now <= end && e.status === 'PUBLISHED';
      });

      const published = data.filter((e: Election) => e.status === 'PUBLISHED');
      const ended = data.filter((e: Election) => {
        const now = new Date();
        const end = new Date(e.endDate);
        return now > end;
      });

      setStats({
        totalElections: data.length,
        activeElections: active.length,
        publishedElections: published.length,
        endedElections: ended.length,
      });
    } catch (error) {
      console.error('Failed to load elections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <PageContainer>
      <Header>
        <div>
          <h1>Observer Dashboard</h1>
          <p>Read-only view of election statistics</p>
        </div>
        <ObserverBadge>
          <FiEye />
          Observer Mode
        </ObserverBadge>
      </Header>

      <KPIGrid>
        <KPICard delay={0.1}>
          <IconWrapper color="var(--primary)">
            <FiTrendingUp />
          </IconWrapper>
          <KPIInfo>
            <h3>Total Elections</h3>
            <p>{stats.totalElections}</p>
          </KPIInfo>
        </KPICard>

        <KPICard delay={0.2}>
          <IconWrapper color="var(--success)">
            <FiCheckCircle />
          </IconWrapper>
          <KPIInfo>
            <h3>Active Elections</h3>
            <p>{stats.activeElections}</p>
          </KPIInfo>
        </KPICard>

        <KPICard delay={0.3}>
          <IconWrapper color="var(--info)">
            <FiUsers />
          </IconWrapper>
          <KPIInfo>
            <h3>Published</h3>
            <p>{stats.publishedElections}</p>
          </KPIInfo>
        </KPICard>

        <KPICard delay={0.4}>
          <IconWrapper color="var(--text-muted)">
            <FiClock />
          </IconWrapper>
          <KPIInfo>
            <h3>Ended</h3>
            <p>{stats.endedElections}</p>
          </KPIInfo>
        </KPICard>
      </KPIGrid>

      <ElectionsSection delay={0.5}>
        <SectionTitle>Elections Overview</SectionTitle>
        <ElectionList>
          {elections.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No elections available
            </p>
          ) : (
            elections.map((election) => (
              <ElectionCard key={election.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h3>{election.title}</h3>
                  <StatusBadge status={election.status}>{election.status}</StatusBadge>
                </div>
                <p>{election.description || 'No description'}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <span>Start: {new Date(election.startDate).toLocaleString()}</span>
                  <span>End: {new Date(election.endDate).toLocaleString()}</span>
                </div>
              </ElectionCard>
            ))
          )}
        </ElectionList>
      </ElectionsSection>
    </PageContainer>
  );
};

export default ObserverDashboard;
