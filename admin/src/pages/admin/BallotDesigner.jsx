import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import styled from 'styled-components';
import {
  FiPlus, FiTrash2, FiSave, FiUser, FiCheck,
  FiLayout, FiGrid, FiArrowRight, FiUploadCloud, FiShield, FiAlertCircle
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Institutional Styled Components --- */

const Page = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* No page scroll */
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
  min-height: 0; /* Important for flex child scrolling */
`;

const ProgressTracker = styled.div`
  display: flex;
  gap: 3rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #cbd5e1;
  padding-bottom: 1rem;
  flex-shrink: 0;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.$active ? '#1e40af' : (props.$completed ? '#1e40af' : '#64748b')};
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  .num {
    width: 24px;
    height: 24px;
    background: ${props => props.$active || props.$completed ? '#1e40af' : '#cbd5e1'};
    color: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
  flex: 1;
  min-height: 0;
`;

/* --- SIDEBAR: Registry List --- */
const Sidebar = styled.div`
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  border-top: 4px solid #1e40af;
  display: flex;
  flex-direction: column;
  height: 90%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  label {
    font-size: 0.7rem; font-weight: 800; color: #475569; 
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; display: block;
  }
`;

const Select = styled.select`
  width: 100%; padding: 0.75rem; border: 2px solid #cbd5e1; border-radius: 4px;
  font-size: 0.9rem; background: white; font-weight: 600;
  &:focus { outline: none; border-color: #1e40af; }
`;

const BallotList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const BallotItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid ${props => props.$active ? '#1e40af' : '#f1f5f9'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  transition: all 0.2s;

  h4 { margin: 0; font-size: 0.9rem; color: #1e293b; text-transform: uppercase; }
  span { font-size: 0.75rem; color: #64748b; font-weight: 600; }
`;

const CreateBallotBox = styled.div`
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;

  input {
    width: 100%; padding: 0.75rem; border: 2px solid #cbd5e1; border-radius: 4px; margin-bottom: 1rem;
    box-sizing: border-box;
    &:focus { outline: none; border-color: #1e40af; }
  }
`;

/* --- MAIN WORKSPACE --- */
const Workspace = styled.div`
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  height: 90%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const WorkspaceHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f1f5f9;
  display: flex; justify-content: space-between; align-items: center;

  h2 { margin: 0; font-size: 1.25rem; color: #0f172a; display: flex; align-items: center; gap: 0.75rem; text-transform: uppercase; }
  .status-tag { 
    background: #fef3c7; color: #92400e; padding: 0.4rem 0.8rem; border-radius: 4px; 
    font-size: 0.7rem; font-weight: 800; border: 1px solid #fde68a;
  }
`;

const WorkspaceContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 3rem;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; }
`;

const FieldLabel = styled.label`
  display: block; font-size: 0.8rem; font-weight: 700; color: #334155; 
  margin-bottom: 0.5rem; text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%; padding: 0.8rem; border: 2px solid #e2e8f0; border-radius: 4px;
  margin-bottom: 1.5rem; font-size: 1rem; box-sizing: border-box;
  &:focus { outline: none; border-color: #1e40af; }
`;

const PrimaryButton = styled.button`
  background: #1e40af; color: white; border: none; padding: 1rem;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 4px;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; transition: background 0.2s;
  &:disabled { background: #94a3b8; }
`;

/* Candidate Row Layout */
const CandidateRow = styled(Reorder.Item)`
  background: white; border: 2px solid #f1f5f9; border-radius: 4px;
  padding: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem;
  
  .avatar {
    width: 50px; height: 50px; border-radius: 4px; background: #f8fafc;
    border: 1px solid #e2e8f0; overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .info { flex: 1; h4 { margin: 0; color: #1e293b; font-size: 1rem; } p { margin: 0; font-size: 0.8rem; color: #64748b; font-weight: 600; } }
`;

/* --- Component --- */
const BallotDesigner = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [ballots, setBallots] = useState([]);
  const [activeBallot, setActiveBallot] = useState(null);
  const [newBallotTitle, setNewBallotTitle] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', imageFile: null, imagePreview: null });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  useEffect(() => {
    if (!electionId) { setBallots([]); setActiveBallot(null); return; }
    const loadBallots = async () => {
      try {
        const data = await electionService.getElectionBallots(electionId);
        setBallots(data || []);
        setActiveBallot(null);
      } catch (e) { console.error(e); }
    };
    loadBallots();
  }, [electionId]);

  useEffect(() => {
    if (!activeBallot) { setCandidates([]); return; }
    const loadCandidates = async () => {
      try {
        const data = await electionService.getBallotCandidates(activeBallot.id);
        setCandidates(data || []);
      } catch (err) { console.error(err); }
    };
    loadCandidates();
  }, [activeBallot]);

  const handleCreateBallot = async () => {
    if (!newBallotTitle.trim()) return;
    setProcessing(true);
    try {
      const ballot = await electionService.createBallot(electionId, {
        title: newBallotTitle, description: "Official Ballot", maxSelections: 1
      });
      setBallots([...ballots, ballot]);
      setNewBallotTitle('');
      setActiveBallot(ballot);
    } catch (e) { alert("Registration Error"); }
    finally { setProcessing(false); }
  };

  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.party) return;
    setProcessing(true);
    try {
      const createdCandidate = await electionService.createCandidate(
        activeBallot.id,
        { name: newCandidate.name, party: newCandidate.party },
        newCandidate.imageFile || null   // pass file for multipart upload
      );
      setCandidates(prev => [...prev, createdCandidate]);
      setBallots(prev => prev.map(b => b.id === activeBallot.id ? { ...b, options: [...(b.options || []), createdCandidate] } : b));
      setNewCandidate({ name: '', party: '', imageFile: null, imagePreview: null });
    } catch (e) { console.error(e); alert("Candidate Entry Failed"); }
    finally { setProcessing(false); }
  };

  if (loading) return <Loader message="Accessing secure workspace..." />;

  return (
    <Page>
      <Container>
        <ProgressTracker>
          <Step $completed><div className="num">1</div> General Configuration</Step>
          <Step $active><div className="num">2</div> Ballot Specification</Step>
          <Step><div className="num">3</div> Voter Authorization</Step>
        </ProgressTracker>

        <MainGrid>
          <Sidebar>
            <SidebarHeader>
              <label>Select Election Record</label>
              <Select value={electionId} onChange={e => setElectionId(e.target.value)}>
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </Select>
            </SidebarHeader>

            <div style={{ padding: '1.25rem 1.5rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Ballot Registry
            </div>

            <BallotList>
              {ballots.map(b => (
                <BallotItem key={b.id} $active={activeBallot?.id === b.id} onClick={() => setActiveBallot(b)}>
                  <h4>{b.title}</h4>
                  <span>{(b.options || []).length} Registered Candidates</span>
                </BallotItem>
              ))}
            </BallotList>

            <CreateBallotBox>
              <input
                placeholder="Enter Ballot Designation"
                value={newBallotTitle}
                onChange={e => setNewBallotTitle(e.target.value)}
              />
              <PrimaryButton onClick={handleCreateBallot} disabled={processing || !electionId}>
                <FiPlus /> Initialize New Ballot
              </PrimaryButton>
            </CreateBallotBox>
          </Sidebar>

          <Workspace>
            {activeBallot ? (
              <>
                <WorkspaceHeader>
                  <h2><FiShield /> {activeBallot.title}</h2>
                  <span className="status-tag">UNOFFICIAL DRAFT - PENDING REGISTRATION</span>
                </WorkspaceHeader>

                <WorkspaceContent>
                  <div>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', color: '#1e293b' }}>Candidate Registration</h3>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                      <FieldLabel>Full Legal Name</FieldLabel>
                      <Input
                        placeholder="John Doe"
                        value={newCandidate.name}
                        onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      />

                      <FieldLabel>Political Affiliation</FieldLabel>
                      <Input
                        placeholder="Party or Independent"
                        value={newCandidate.party}
                        onChange={e => setNewCandidate({ ...newCandidate, party: e.target.value })}
                      />

                      <FieldLabel>Official Symbol / Portrait</FieldLabel>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px dashed #cbd5e1', cursor: 'pointer', background: 'white', marginBottom: '1.5rem' }}>
                         {newCandidate.imagePreview ? <img src={newCandidate.imagePreview} style={{ width: 40, height: 40 }} alt="" /> : <FiUploadCloud color="#1e40af" />}
                         <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{newCandidate.imagePreview ? 'Replace Image' : 'Select Official File'}</span>
                         <input type="file" hidden accept="image/*" onChange={e => {
                           const file = e.target.files?.[0];
                           if (file) setNewCandidate({ ...newCandidate, imageFile: file, imagePreview: URL.createObjectURL(file) });
                         }} />
                       </label>

                      <PrimaryButton onClick={handleAddCandidate} disabled={processing}>
                        <FiCheck /> Register to Ballot
                      </PrimaryButton>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>Registered Candidates ({candidates.length})</h3>
                      <button style={{ background: 'white', border: '2px solid #1e40af', color: '#1e40af', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}>
                        <FiSave /> SAVE BALLOT ORDER
                      </button>
                    </div>

                    <Reorder.Group axis="y" values={candidates} onReorder={setCandidates} style={{ listStyle: 'none', padding: 0 }}>
                      <AnimatePresence>
                        {candidates.map(c => (
                          <CandidateRow key={c.id} value={c}>
                            <FiGrid style={{ color: '#cbd5e1', cursor: 'grab' }} />
                             <div className="avatar">
                               {c.photoUrl || c.symbol ? <img src={c.photoUrl || c.symbol} alt="" /> : <FiUser size={24} color="#cbd5e1" style={{ margin: 12 }} />}
                             </div>
                            <div className="info">
                              <h4>{c.name}</h4>
                              <p>{c.party}</p>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} onClick={() => setCandidates(candidates.filter(item => item.id !== c.id))}>
                              <FiTrash2 size={18} />
                            </button>
                          </CandidateRow>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                  </div>
                </WorkspaceContent>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <FiLayout size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                <h3 style={{ margin: 0 }}>No Ballot Selected</h3>
                <p style={{ fontSize: '0.9rem' }}>Initialize or select a ballot record from the registry to manage candidate specifications.</p>
              </div>
            )}
          </Workspace>
        </MainGrid>
      </Container>
    </Page>
  );
};

export default BallotDesigner;