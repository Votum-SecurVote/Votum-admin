import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiTrash2, FiUpload,
  FiDownload, FiLayers, FiCheckCircle, FiCircle, FiBox, FiShield, FiExternalLink
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Formal Helpers --- */
const formatIST = (utc) => {
  if (!utc) return '—';
  return new Date(utc).toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

/* --- Styled Components (Gov Registry Aesthetic) --- */
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
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  min-height: 0;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    margin: 0;
  }
`;

const StatBar = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const StatBadge = styled.div`
  background: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.$color || '#475569'};
  text-transform: uppercase;

  span { font-size: 1rem; color: #0f172a; }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
`;

/* --- Sidebar: Election Registry --- */
const Sidebar = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-top: 4px solid #1e40af;
  display: flex;
  flex-direction: column;
  height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; }
`;

const ElectionCard = styled.div`
  padding: 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  border-left: 4px solid ${props => props.$active ? '#1e40af' : 'transparent'};
  transition: all 0.2s;

  &:hover { background: #f8fafc; }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #1e293b;
  }
`;

const StatusChip = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 2px;
  font-weight: 800;
  background: ${props => props.$status === 'PUBLISHED' ? '#166534' : '#64748b'};
  color: white;
`;

/* --- Detail View: Formal Record --- */
const DetailPanel = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  height: 90%;
  overflow-y: auto;
  box-sizing: border-box;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; }
`;

const RecordHeader = styled.div`
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 2rem;
  margin-bottom: 2rem;

  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  h2 { font-size: 1.75rem; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.01em; }
  .ledger-id { color: #94a3b8; font-family: monospace; font-size: 0.8rem; margin-top: 0.5rem; font-weight: 600; }
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
`;

const MetaItem = styled.div`
  small { color: #64748b; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.4rem; }
  div { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid #f1f5f9;
`;

const PrimaryButton = styled.button`
  background: ${props => props.$variant === 'danger' ? '#b91c1c' : '#1e40af'};
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 2px;

  &:hover { opacity: 0.9; }
  &:disabled { background: #cbd5e1; cursor: not-allowed; }
`;

/* --- Component --- */
const ElectionView = () => {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadElections(); }, []);
  useEffect(() => { if (selected) loadBallots(selected.id); }, [selected]);

  const loadElections = async () => {
    try {
      const res = await electionService.getAdminElections();
      setElections(res || []);
      if (res?.length > 0 && !selected) setSelected(res[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadBallots = async (id) => {
    try {
      const res = await electionService.getElectionBallots(id);
      setBallots(res || []);
    } catch { setBallots([]); }
  };

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      await actionFn();
      await loadElections();
    } catch (err) { alert("Authorization Denied: Action failed."); }
    finally { setActionLoading(false); }
  };

  if (loading) return <Loader message="Verifying administrative credentials..." />;

  const stats = {
    total: elections.length,
    published: elections.filter(e => e.status === "PUBLISHED").length,
    draft: elections.filter(e => e.status === "DRAFT").length,
  };

  return (
    <Page>
      <Container>
        <Header>
          <h1>Election Registry</h1>
          <StatBar>
            <StatBadge>Registry Size: <span>{stats.total}</span></StatBadge>
            <StatBadge $color="#166534"><FiCheckCircle /> Live: <span>{stats.published}</span></StatBadge>
            <StatBadge $color="#b45309"><FiCircle /> Drafts: <span>{stats.draft}</span></StatBadge>
          </StatBar>
        </Header>

        <DashboardGrid>
          <Sidebar>
            {elections.map((e) => (
              <ElectionCard
                key={e.id}
                $active={selected?.id === e.id}
                onClick={() => setSelected(e)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{e.title}</h3>
                  <StatusChip $status={e.status}>{e.status}</StatusChip>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                  RECORDED: {new Date(e.startDate).toLocaleDateString('en-IN')}
                </div>
              </ElectionCard>
            ))}
          </Sidebar>

          <AnimatePresence mode="wait">
            {selected ? (
              <DetailPanel
                key={selected.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <RecordHeader>
                  <div className="top">
                    <div>
                      <h2>{selected.title}</h2>
                      <div className="ledger-id">REGISTRY_UID: {selected.id.toUpperCase()}</div>
                    </div>
                    <FiShield size={32} color="#1e40af" />
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '1.5rem', lineHeight: '1.6' }}>
                    {selected.description || "Official preamble not provided for this record."}
                  </p>
                </RecordHeader>

                <MetaGrid>
                  <MetaItem>
                    <small><FiCalendar /> Commencement</small>
                    <div>{formatIST(selected.startDate)}</div>
                  </MetaItem>
                  <MetaItem>
                    <small><FiClock /> Conclusion</small>
                    <div>{formatIST(selected.endDate)}</div>
                  </MetaItem>
                  <MetaItem>
                    <small><FiLayers /> Active Ballots</small>
                    <div>{ballots.length} Sub-modules Configured</div>
                  </MetaItem>
                </MetaGrid>

                <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: '#64748b', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  Attached Ballot Specifications
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {ballots.map(b => (
                    <div key={b.id} style={{ border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '2px' }}>
                      <FiBox color="#94a3b8" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{b.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>STATUS: {b.status}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <ActionRow>
                  {selected.status !== "PUBLISHED" ? (
                    <PrimaryButton
                      disabled={actionLoading}
                      onClick={() => handleAction(() => electionService.publishElection(selected.id))}
                    >
                      <FiUpload /> Finalize & Publish to Ledger
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      disabled={actionLoading}
                      onClick={() => handleAction(() => electionService.unpublishElection(selected.id))}
                    >
                      <FiDownload /> Revoke Publication
                    </PrimaryButton>
                  )}

                  <PrimaryButton
                    $variant="danger"
                    disabled={actionLoading}
                    onClick={() => {
                      if (window.confirm("CRITICAL ACTION: Are you sure you want to purge this record?")) {
                        handleAction(() => electionService.deleteElection(selected.id));
                      }
                    }}
                  >
                    <FiTrash2 /> Purge Record
                  </PrimaryButton>

                </ActionRow>
              </DetailPanel>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0' }}>
                Select an entry from the registry to view administrative details.
              </div>
            )}
          </AnimatePresence>
        </DashboardGrid>
      </Container>
    </Page>
  );
};

export default ElectionView;