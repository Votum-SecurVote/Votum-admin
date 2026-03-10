import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';
import dashboardService, { DashboardStats } from '../../services/dashboardService';
import Loader from '../../components/Loader';
import AnimatedCard from '../../components/AnimatedCard';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--text-muted);
  }
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
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
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

const RecentActivitySection = styled(AnimatedCard)`
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

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StyledActivityItem = styled.div`
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--bg-hover);
  }
`;

const ActivityInfo = styled.div`
  flex: 1;
  h4 {
    font-size: 0.95rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }
  p {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-muted);
`;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (!stats) {
    return <div>Failed to load dashboard data</div>;
  }

  return (
    <PageContainer>
      <Header>
        <h1>Admin Dashboard</h1>
        <p>Overview of your voting system</p>
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
          <IconWrapper color="var(--warning)">
            <FiClock />
          </IconWrapper>
          <KPIInfo>
            <h3>Pending Candidates</h3>
            <p>{stats.pendingCandidates}</p>
          </KPIInfo>
        </KPICard>

        <KPICard delay={0.4}>
          <IconWrapper color="var(--info)">
            <FiUsers />
          </IconWrapper>
          <KPIInfo>
            <h3>Approved Candidates</h3>
            <p>{stats.approvedCandidates}</p>
          </KPIInfo>
        </KPICard>
      </KPIGrid>

      <RecentActivitySection delay={0.5}>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {stats.recentActivity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No recent activity
            </p>
          ) : (
            stats.recentActivity.map((activity) => (
              <StyledActivityItem key={activity.id}>
                <ActivityInfo>
                  <h4>{activity.description}</h4>
                  <p>{activity.action} • {activity.user || 'System'}</p>
                </ActivityInfo>
                <ActivityTime>
                  {new Date(activity.timestamp).toLocaleString()}
                </ActivityTime>
              </StyledActivityItem>
            ))
          )}
        </ActivityList>
      </RecentActivitySection>
    </PageContainer>
  );
};

export default Dashboard;
