import React from 'react';
import styled from 'styled-components';
import { FiActivity, FiUsers, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';

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
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: #f8fafc; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const Header = styled.header`
  margin-bottom: 2.5rem;
  h1 {
    font-size: 1.75rem;
    color: #0f172a;
    margin: 0;
  }
  p {
    color: #64748b;
    margin-top: 0.5rem;
  }
`;

const KPIContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const KPICard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;

  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .content {
    h3 {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    p {
      margin: 0.25rem 0 0 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;

  h2 {
    font-size: 1.25rem;
    color: #0f172a;
    margin: 0 0 1.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .time {
    font-size: 0.875rem;
    color: #64748b;
    min-width: 100px;
  }

  .details {
    p {
      margin: 0;
      color: #0f172a;
      font-weight: 500;
      font-size: 0.95rem;
    }
    span {
      font-size: 0.85rem;
      color: #64748b;
    }
  }
`;

const Dashboard = () => {
    return (
        <Page>
            <Container>
                <Header>
                    <h1>Admin Dashboard</h1>
                    <p>Overview of election metrics and administrative activity.</p>
                </Header>

                <KPIContainer>
                    <KPICard>
                        <div className="icon-wrapper" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                            <FiFileText />
                        </div>
                        <div className="content">
                            <h3>Total Elections</h3>
                            <p>12</p>
                        </div>
                    </KPICard>

                    <KPICard>
                        <div className="icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
                            <FiActivity />
                        </div>
                        <div className="content">
                            <h3>Active Elections</h3>
                            <p>3</p>
                        </div>
                    </KPICard>

                    <KPICard>
                        <div className="icon-wrapper" style={{ background: '#fef3c7', color: '#b45309' }}>
                            <FiUsers />
                        </div>
                        <div className="content">
                            <h3>Pending Candidates</h3>
                            <p>28</p>
                        </div>
                    </KPICard>

                    <KPICard>
                        <div className="icon-wrapper" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                            <FiCheckCircle />
                        </div>
                        <div className="content">
                            <h3>Approved Candidates</h3>
                            <p>145</p>
                        </div>
                    </KPICard>
                </KPIContainer>

                <Section>
                    <h2><FiClock /> Recent Activity</h2>
                    <ActivityList>
                        <ActivityItem>
                            <div className="time">10 mins ago</div>
                            <div className="details">
                                <p>New candidate registration submitted for General Assembly</p>
                                <span>Candidate: Jane Doe</span>
                            </div>
                        </ActivityItem>
                        <ActivityItem>
                            <div className="time">1 hour ago</div>
                            <div className="details">
                                <p>Election "Tech Board 2026" status changed to Active</p>
                                <span>Action by: Admin</span>
                            </div>
                        </ActivityItem>
                        <ActivityItem>
                            <div className="time">3 hours ago</div>
                            <div className="details">
                                <p>Bulk approved 15 candidates for Engineering Student Council</p>
                                <span>Action by: Admin</span>
                            </div>
                        </ActivityItem>
                    </ActivityList>
                </Section>
            </Container>
        </Page>
    );
};

export default Dashboard;
