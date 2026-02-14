import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUsers, FiCheckCircle, FiTrash2,
  FiUpload, FiDownload, FiActivity, FiLayers, FiAlertCircle, FiChevronRight
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Helpers --- */
const formatIST = (utc) => {
  if (!utc) return '—';
  return new Date(utc).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
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

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/* --- Styled Components --- */
const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* Slate-50 */
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
`;

const Header = styled.header`
  margin-bottom: 2rem;
  max-width: 1600px;
  margin: 0 auto 2rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }
  p {
    color: #64748b;
    margin-top: 0.5rem;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* --- List Section Styles --- */
const ListColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const MiniStat = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  text-align: center;
  
  .val { font-size: 1.25rem; font-weight: 700; color: #334155; }
  .lbl { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-top: 0.2rem; }
`;

const ElectionListItem = styled(motion.div)`
  background: ${props => props.$active ? '#fff' : '#fff'};
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e2e8f0'};
  box-shadow: ${props => props.$active ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0,0,0,0.05)'};
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${props => props.$active ? '#3b82f6' : '#cbd5e1'};
    transform: translateY(-1px);
  }

  ${props => props.$active && `
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: #3b82f6;
    }
  `}

  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: ${props => props.$active ? '#1e40af' : '#1e293b'};
  }
`;

/* --- Details Section Styles --- */
const DetailPanel = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 600px;
`;

const DetailHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
`;

const DetailBody = styled.div`
  padding: 2rem;
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 700;
  margin: 2.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:first-child { margin-top: 0; }
`;

/* --- Components --- */
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.draft { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
  &.published { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
  &.active { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
  &.ended { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
`;

const StatusDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background-color: ${props => {
    if (props.status === 'active') return '#22c55e';
    if (props.status === 'ended') return '#ef4444';
    if (props.status === 'published') return '#3b82f6';
    return '#94a3b8';
  }};
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #475569;
  
  svg { color: #94a3b8; }
`;

const ProgressBar = styled.div`
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.75rem;
  
  div {
    height: 100%;
    background: #3b82f6;
    transition: width 0.5s ease;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &.primary {
    background: #0f172a; color: white;
    &:hover { background: #334155; }
  }
  &.secondary {
    background: white; color: #334155; border-color: #cbd5e1;
    &:hover { background: #f8fafc; border-color: #94a3b8; }
  }
  &.danger {
    background: white; color: #ef4444; border-color: #fecaca;
    &:hover { background: #fef2f2; border-color: #ef4444; }
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const CandidateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
`;

const CandidateCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  background: #fdfdfd;

  .avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 0.8rem; color: #64748b;
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .info {
    h5 { margin: 0; font-size: 0.95rem; color: #1e293b; }
    span { font-size: 0.8rem; color: #64748b; }
  }
`;

const BallotItem = styled(motion.div)`
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => props.$isPublished ? '#10b981' : '#cbd5e1'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .ballot-meta {
    h5 { margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #334155; }
    p { margin: 0; font-size: 0.8rem; color: #94a3b8; }
  }
  .actions { display: flex; gap: 0.5rem; }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #94a3b8;
  text-align: center;
  
  svg { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
  p { font-size: 1rem; }
`;

/* --- Main Component --- */
const ElectionView = () => {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Fetching Logic (Same as original) ---
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    loadElections();
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (selected) loadBallots(selected._id);
  }, [selected]);

  const loadElections = async () => {
    try {
      const res = await electionService.getAdminElections();
      setElections(res.data || []);
      if (res.data?.length > 0 && !selected) setSelected(res.data[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadBallots = async (electionId) => {
    try {
      const res = await electionService.getElectionBallots(electionId);
      setBallots(res.data || []);
    } catch (err) { setBallots([]); }
  };

  // --- Helpers ---
  const statusOf = (e) => {
    const start = new Date(e.startDate || e.start_date).getTime();
    const end = new Date(e.endDate || e.end_date).getTime();
    const isPub = e.isPublished || e.is_published;
    const t = now.getTime();

    if (!isPub) return 'draft';
    if (t >= end) return 'ended';
    if (t >= start) return 'active';
    return 'published';
  };

  // --- Handlers (Simplified for brevity, same logic) ---
  const handleAction = async (actionFn, successMsg) => {
    setActionLoading(true);
    try {
      await actionFn();
      await loadElections();
      if (selected) await loadBallots(selected._id);
      // Ideally use a toast notification here
      console.log(successMsg);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Loading dashboard..." />;

  const stats = {
    total: elections.length,
    active: elections.filter(e => statusOf(e) === 'active').length,
    draft: elections.filter(e => statusOf(e) === 'draft').length,
  };

  return (
    <Page>
      <Header>
        <h1>Election Dashboard</h1>
        <p>Overview of all voting events and ballot configurations</p>
      </Header>

      <Layout>
        {/* Left Column: Stats & List */}
        <ListColumn>
          <StatsRow>
            <MiniStat><div className="val">{stats.total}</div><div className="lbl">Total</div></MiniStat>
            <MiniStat><div className="val">{stats.active}</div><div className="lbl">Active</div></MiniStat>
            <MiniStat><div className="val">{stats.draft}</div><div className="lbl">Draft</div></MiniStat>
          </StatsRow>

          <AnimatePresence>
            {elections.map((e) => {
              const status = statusOf(e);
              const isActive = selected?._id === e._id;
              const progress = getProgress(e.startDate || e.start_date, e.endDate || e.end_date);

              return (
                <ElectionListItem
                  key={e._id}
                  $active={isActive}
                  onClick={() => setSelected(e)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3>{e.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <StatusDot status={status} />
                        <span style={{ textTransform: 'capitalize' }}>{status}</span>
                        <span>•</span>
                        <span>{e.candidates?.length || 0} Candidates</span>
                      </div>
                    </div>
                    {isActive && <FiChevronRight style={{ color: '#3b82f6' }} />}
                  </div>

                  {status === 'active' && (
                    <ProgressBar><div style={{ width: `${progress}%` }} /></ProgressBar>
                  )}
                </ElectionListItem>
              );
            })}
          </AnimatePresence>

          {elections.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>No elections found.</div>
          )}
        </ListColumn>

        {/* Right Column: Details */}
        <div>
          {selected ? (
            <DetailPanel initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <DetailHeader>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1e293b' }}>{selected.title}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Badge className={statusOf(selected)}>{statusOf(selected)}</Badge>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center' }}>ID: {selected._id.slice(-6)}</span>
                  </div>
                </div>

                <ButtonGroup>
                  {!selected.isPublished ? (
                    <Button className="primary" disabled={actionLoading} onClick={() => handleAction(() => electionService.publishElection(selected._id), 'Published')}>
                      <FiUpload /> Publish
                    </Button>
                  ) : (
                    <Button className="secondary" disabled={actionLoading} onClick={() => handleAction(() => electionService.unpublishElection(selected._id), 'Unpublished')}>
                      <FiDownload /> Unpublish
                    </Button>
                  )}
                  <Button className="danger" disabled={actionLoading} onClick={() => { if (confirm('Delete?')) handleAction(() => electionService.deleteElection(selected._id), 'Deleted') }}>
                    <FiTrash2 /> Delete
                  </Button>
                </ButtonGroup>
              </DetailHeader>

              <DetailBody>
                <MetaGrid>
                  <MetaItem>
                    <FiCalendar size={18} />
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>Start Date</div>
                      <div>{formatIST(selected.startDate || selected.start_date)}</div>
                    </div>
                  </MetaItem>
                  <MetaItem>
                    <FiClock size={18} />
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8' }}>End Date</div>
                      <div>{formatIST(selected.endDate || selected.end_date)}</div>
                    </div>
                  </MetaItem>
                  {selected.description && (
                    <MetaItem style={{ gridColumn: '1 / -1', borderLeft: '3px solid #e2e8f0', paddingLeft: '1rem' }}>
                      {selected.description}
                    </MetaItem>
                  )}
                </MetaGrid>

                <SectionTitle><FiUsers /> Candidates</SectionTitle>
                <CandidateGrid>
                  {selected.candidates?.map((c, i) => (
                    <CandidateCard key={i}>
                      <div className="avatar">
                        {c.imageUrl ? <img src={c.imageUrl} alt="" /> : getInitials(c.name)}
                      </div>
                      <div className="info">
                        <h5>{c.name}</h5>
                        <span>{c.party || 'Independent'}</span>
                      </div>
                    </CandidateCard>
                  ))}
                  {(!selected.candidates || selected.candidates.length === 0) && (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No candidates added yet.</span>
                  )}
                </CandidateGrid>

                <SectionTitle><FiLayers /> Ballot Versions</SectionTitle>
                <div>
                  {ballots.length === 0 ? (
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                      No ballot versions created.
                    </div>
                  ) : (
                    ballots.map((ballot) => (
                      <BallotItem key={ballot.id} $isPublished={ballot.isPublished} layout>
                        <div className="ballot-meta">
                          <h5>
                            Version {ballot.version}
                            {ballot.isPublished && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>● LIVE</span>}
                          </h5>
                          <p>Created {formatIST(ballot.createdAt)}</p>
                        </div>
                        <div className="actions">
                          {!ballot.isPublished ? (
                            <Button className="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleAction(() => electionService.publishBallot(ballot.id))}>
                              Activate
                            </Button>
                          ) : (
                            <Button className="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleAction(() => electionService.unpublishBallot(ballot.id))}>
                              Deactivate
                            </Button>
                          )}
                          {ballot.version > 1 && (
                            <Button className="secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleAction(() => electionService.rollbackBallot(ballot.id, ballot.version - 1))}>
                              Rollback
                            </Button>
                          )}
                        </div>
                      </BallotItem>
                    ))
                  )}
                </div>
              </DetailBody>
            </DetailPanel>
          ) : (
            <DetailPanel>
              <EmptyState>
                <FiActivity />
                <p>Select an election from the list to view details.</p>
              </EmptyState>
            </DetailPanel>
          )}
        </div>
      </Layout>
    </Page>
  );
};

export default ElectionView;