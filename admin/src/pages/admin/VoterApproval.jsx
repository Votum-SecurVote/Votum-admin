import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin,
  FiCheck, FiX
} from 'react-icons/fi';
import voterService from '../../services/voterService';
import Loader from '../../components/Loader';

/* --- Styled Components --- */
const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
  h1 { font-size: 1.8rem; font-weight: 700; margin: 0; }
  p { color: #64748b; margin-top: 0.5rem; }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  border: ${({ active }) => active ? "none" : "1px solid #cbd5e1"};
  background: ${({ active }) => active ? "#2563eb" : "white"};
  color: ${({ active }) => active ? "white" : "#334155"};
  transition: 0.2s;
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
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.75rem;
  label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
  div { font-weight: 500; }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;

  &.approve {
    background: #10b981;
    color: white;
  }

  &.reject {
    background: white;
    color: #ef4444;
    border: 1px solid #fecaca;
  }

  &:disabled {
    opacity: 0.6;
    cursor: wait;
  }
`;

const StatusBadge = styled.span`
  font-weight: 600;
  color: ${({ status }) =>
    status === "APPROVED"
      ? "#16a34a"
      : status === "REJECTED"
        ? "#dc2626"
        : "#c2410c"};
`;

/* --- Component --- */
const VoterApproval = () => {

  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async () => {
    try {
      const res = await voterService.getAllVoters();
      setVoters(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await voterService.approveVoter(userId);
      await loadVoters();
    } catch {
      alert("Approval failed");
    } finally {
      setActionLoading(p => ({ ...p, [userId]: false }));
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(p => ({ ...p, [userId]: true }));
    try {
      await voterService.rejectVoter(userId);
      await loadVoters();
    } catch {
      alert("Rejection failed");
    } finally {
      setActionLoading(p => ({ ...p, [userId]: false }));
    }
  };

  const filteredVoters = voters.filter(v => v.status === filter);

  if (loading) return <Loader message="Fetching users..." />;

  return (
    <Page>
      <Container>

        <Header>
          <h1>Voter Management</h1>
          <p>Filter and manage voter approvals.</p>
        </Header>

        {/* FILTER BUTTONS */}
        <FilterRow>
          {["PENDING", "APPROVED", "REJECTED"].map(status => (
            <FilterButton
              key={status}
              active={filter === status}
              onClick={() => setFilter(status)}
            >
              {status} ({voters.filter(v => v.status === status).length})
            </FilterButton>
          ))}
        </FilterRow>

        {filteredVoters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
            <FiCheck size={48} />
            <p>No users in this category.</p>
          </div>
        ) : (
          <Grid>
            <AnimatePresence>
              {filteredVoters.map((v) => (
                <Card key={v.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}>

                  <CardHeader>
                    <div>
                      <h3>{v.fullName}</h3>
                      <small style={{ color: "#94a3b8" }}>
                        ID: {v.userId?.slice(0, 8)}
                      </small>
                    </div>
                    <StatusBadge status={v.status}>
                      {v.status}
                    </StatusBadge>
                  </CardHeader>

                  <CardBody>
                    <InfoItem>
                      <label>Email</label>
                      <div>{v.email}</div>
                    </InfoItem>
                    <InfoItem>
                      <label>Phone</label>
                      <div>{v.phone}</div>
                    </InfoItem>
                    <InfoItem>
                      <label>Date of Birth</label>
                      <div>{v.dob}</div>
                    </InfoItem>
                    <InfoItem>
                      <label>Gender</label>
                      <div>{v.gender}</div>
                    </InfoItem>
                    <InfoItem>
                      <label>Address</label>
                      <div>{v.address}</div>
                    </InfoItem>
                  </CardBody>

                  {v.status === "PENDING" && (
                    <CardFooter>
                      <Button
                        className="reject"
                        onClick={() => handleReject(v.userId)}
                        disabled={actionLoading[v.userId]}
                      >
                        <FiX /> Reject
                      </Button>

                      <Button
                        className="approve"
                        onClick={() => handleApprove(v.userId)}
                        disabled={actionLoading[v.userId]}
                      >
                        <FiCheck /> Approve
                      </Button>
                    </CardFooter>
                  )}

                </Card>
              ))}
            </AnimatePresence>
          </Grid>
        )}

      </Container>
    </Page>
  );
};

export default VoterApproval;
