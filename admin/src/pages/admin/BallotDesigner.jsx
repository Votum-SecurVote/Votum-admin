import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import styled from 'styled-components';
import {
  FiPlus, FiTrash2, FiSave, FiUser, FiCheck,
  FiLayout, FiGrid, FiArrowRight, FiUploadCloud, FiMoreVertical, FiEdit3
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Styled Components --- */

const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Header = styled.header`
  max-width: 1400px;
  margin: 0 auto 2rem;
  h1 { font-size: 1.8rem; font-weight: 700; color: #0f172a; margin: 0; }
  p { color: #64748b; margin-top: 0.5rem; }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;
  height: calc(100vh - 150px);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

/* --- LEFT SIDEBAR (Election & Ballot List) --- */
const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fdfdfd;

  label {
    font-size: 0.75rem; font-weight: 600; color: #94a3b8; 
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; display: block;
  }
`;

const Select = styled.select`
  width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px;
  font-size: 0.9rem; background: white; cursor: pointer;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const BallotList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const BallotItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  position: relative;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -2px rgba(0,0,0,0.05);
  }

  h4 { margin: 0; font-size: 0.95rem; color: ${props => props.$active ? '#1e3a8a' : '#334155'}; }
  span { font-size: 0.8rem; color: ${props => props.$active ? '#60a5fa' : '#94a3b8'}; }
  
  .indicator {
    position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
    opacity: ${props => props.$active ? 1 : 0};
    color: #3b82f6;
  }
`;

const CreateBallotBox = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;

  input {
    width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 0.75rem;
    &:focus { outline: none; border-color: #3b82f6; }
  }
`;

/* --- RIGHT MAIN AREA (Candidate Editor) --- */
const Workspace = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WorkspaceHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;
  background: white;

  h2 { margin: 0; font-size: 1.25rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
  .badge { background: #e0f2fe; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
`;

const WorkspaceContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 3rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

/* Form Components */
const FormSection = styled.div`
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  height: fit-content;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  label { display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; }
  input, textarea {
    width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem;
    &:focus { outline: none; border-color: #3b82f6; background: white; }
  }
`;

const UploadZone = styled.label`
  display: flex; align-items: center; gap: 1rem;
  padding: 1rem; border: 1px dashed #cbd5e1; border-radius: 8px; cursor: pointer; background: white;
  &:hover { border-color: #3b82f6; background: #eff6ff; }
  input { display: none; }
  .preview { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }
  .text { font-size: 0.85rem; color: #64748b; }
`;

const Button = styled(motion.button)`
  width: ${props => props.$full ? '100%' : 'auto'};
  padding: 0.7rem 1.2rem; border-radius: 6px; font-weight: 600; border: none; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  
  &.primary { background: #0f172a; color: white; }
  &.secondary { background: white; border: 1px solid #cbd5e1; color: #475569; }
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { filter: brightness(1.2); }
`;

/* Candidate List Items */
const CandidateItem = styled(Reorder.Item)`
  background: white; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);

  .avatar {
    width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9;
    display: flex; align-items: center; justify-content: center; font-weight: 700; color: #64748b;
    border: 1px solid #e2e8f0; overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .info { flex: 1; h4 { margin: 0; color: #1e293b; } p { margin: 0; font-size: 0.85rem; color: #64748b; } }
  .actions { button { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; &:hover { color: #ef4444; } } }
`;

const EmptyState = styled.div`
  height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8;
  svg { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
`;

/* --- Component --- */
const BallotDesigner = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');

  // State for the list of ballots in the selected election
  const [ballots, setBallots] = useState([]);
  const [activeBallot, setActiveBallot] = useState(null); // The ballot currently being edited
  const [newBallotTitle, setNewBallotTitle] = useState('');

  // State for Candidates within the Active Ballot
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', image: null });

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // 1. Load Elections on Mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await electionService.getAdminElections();
        setElections(data || []);
        if (data?.length) setElectionId(data[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  // 2. Load Ballots when Election changes
  useEffect(() => {
    if (!electionId) { setBallots([]); setActiveBallot(null); return; }

    const loadBallots = async () => {
      try {
        const data = await electionService.getElectionBallots(electionId);
        setBallots(data || []);
        setActiveBallot(null); // Reset active view
      } catch (e) { console.error(e); }
    };
    loadBallots();
  }, [electionId]);

  // 3. Load Candidates when Active Ballot changes
  useEffect(() => {
    if (!activeBallot) {
      setCandidates([]);
      return;
    }

    const loadCandidates = async () => {
      try {
        const data = await electionService.getBallotCandidates(activeBallot.id);
        setCandidates(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCandidates();
  }, [activeBallot]);

  /* --- Actions --- */

  const handleCreateBallot = async () => {
    if (!newBallotTitle.trim()) return alert("Enter a title");

    setProcessing(true);

    try {
      const ballot = await electionService.createBallot(electionId, {
        title: newBallotTitle,
        description: "Standard Vote",
        maxSelections: 1
      });

      setBallots([...ballots, ballot]);
      setNewBallotTitle('');
      setActiveBallot(ballot);

    } catch (e) {
      console.error(e);
      alert("Failed to create ballot");
    } finally {
      setProcessing(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party) {
      return alert("Name and Party required");
    }

    if (!activeBallot) return;

    setProcessing(true);

    try {
      const createdCandidate = await electionService.createCandidate(
        activeBallot.id,
        {
          name: newCandidate.name,
          party: newCandidate.party,
          symbol: newCandidate.image?.src || null
        }
      );

      setCandidates(prev => [...prev, createdCandidate]);

      setNewCandidate({ name: '', party: '', image: null });

    } catch (e) {
      console.error(e);
      alert("Failed to add candidate");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveCandidate = (candidateId) => {
    const updatedList = candidates.filter(c => c.id !== candidateId);
    setCandidates(updatedList);
    setBallots(ballots.map(b => b.id === activeBallot.id ? { ...b, options: updatedList } : b));
    // In real app: call API deleteCandidate(candidateId)
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setNewCandidate(p => ({ ...p, image: { src: URL.createObjectURL(file), fileName: file.name } }));
  };

  const getInitials = (n) => n ? n[0].toUpperCase() : '?';

  if (loading) return <Loader message="Loading workspace..." />;

  return (
    <Page>
      <Header>
        <h1>Ballot Designer</h1>
        <p>Create ballots and manage candidates for your elections.</p>
      </Header>

      <Layout>
        {/* --- LEFT SIDEBAR: Context & Navigation --- */}
        <Sidebar>
          <SidebarHeader>
            <label>1. Select Election</label>
            <Select value={electionId} onChange={e => setElectionId(e.target.value)}>
              {elections.map(e => (
                <option key={e._id || e.id} value={e._id || e.id}>{e.title}</option>
              ))}
            </Select>
          </SidebarHeader>

          <div style={{ padding: '1rem 1.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
            2. Manage Ballots
          </div>

          <BallotList>
            {ballots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                No ballots yet. Create one below.
              </div>
            ) : (
              ballots.map(b => (
                <BallotItem
                  key={b.id}
                  $active={activeBallot?.id === b.id}
                  onClick={() => setActiveBallot(b)}
                >
                  <h4>{b.title}</h4>
                  <span>{(b.options || []).length} Candidates</span>
                  <FiArrowRight className="indicator" />
                </BallotItem>
              ))
            )}
          </BallotList>

          <CreateBallotBox>
            <input
              placeholder="e.g. Presidential Ballot"
              value={newBallotTitle}
              onChange={(e) => setNewBallotTitle(e.target.value)}
            />
            <Button className="primary" $full onClick={handleCreateBallot} disabled={processing || !electionId}>
              <FiPlus /> Create New Ballot
            </Button>
          </CreateBallotBox>
        </Sidebar>

        {/* --- RIGHT AREA: Workspace --- */}
        <Workspace>
          {activeBallot ? (
            <>
              <WorkspaceHeader>
                <h2><FiLayout /> {activeBallot.title}</h2>
                <span className="badge">Draft Mode</span>
              </WorkspaceHeader>

              <WorkspaceContent>
                {/* 1. Add Candidate Form */}
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#334155' }}>Add Candidate</h3>
                  <FormSection>
                    <FormGroup>
                      <label>Name</label>
                      <input
                        placeholder="Full Name"
                        value={newCandidate.name}
                        onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Party / Affiliation</label>
                      <input
                        placeholder="Party Name"
                        value={newCandidate.party}
                        onChange={e => setNewCandidate({ ...newCandidate, party: e.target.value })}
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Photo / Logo</label>
                      <UploadZone>
                        {newCandidate.image ? (
                          <img src={newCandidate.image.src} className="preview" alt="" />
                        ) : (
                          <FiUploadCloud size={20} color="#94a3b8" />
                        )}
                        <span className="text">{newCandidate.image ? 'Change Image' : 'Upload Image'}</span>
                        <input type="file" onChange={handleFile} accept="image/*" />
                      </UploadZone>
                    </FormGroup>
                    <Button className="primary" $full onClick={handleAddCandidate} disabled={processing}>
                      <FiPlus /> Add to Ballot
                    </Button>
                  </FormSection>
                </div>

                {/* 2. Candidate List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: '#334155' }}>Candidates ({candidates.length})</h3>
                    <Button className="secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => alert('Save Order')}>
                      <FiSave /> Save Order
                    </Button>
                  </div>

                  {candidates.length === 0 ? (
                    <div style={{ border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                      No candidates in this ballot yet.
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={candidates} onReorder={setCandidates} style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                      <AnimatePresence>
                        {candidates.map(c => (
                          <CandidateItem key={c.id} value={c}>
                            <div style={{ cursor: 'grab', color: '#cbd5e1', paddingRight: '0.5rem' }}><FiGrid /></div>
                            <div className="avatar">
                              {c.imageUrl || c.image ? <img src={c.imageUrl || c.image.src} alt="" /> : getInitials(c.name)}
                            </div>
                            <div className="info">
                              <h4>{c.name}</h4>
                              <p>{c.party}</p>
                            </div>
                            <div className="actions">
                              <button onClick={() => handleRemoveCandidate(c.id)}><FiTrash2 /></button>
                            </div>
                          </CandidateItem>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  )}
                </div>
              </WorkspaceContent>
            </>
          ) : (
            <EmptyState>
              <FiEdit3 />
              <p>Select a ballot from the left to manage candidates</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Or create a new ballot to get started.</p>
            </EmptyState>
          )}
        </Workspace>
      </Layout>
    </Page>
  );
};

export default BallotDesigner;