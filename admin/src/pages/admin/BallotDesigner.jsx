import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import styled from 'styled-components';
import {
  FiPlus, FiTrash2, FiSave, FiUser, FiCheck,
  FiRefreshCw, FiInfo, FiUploadCloud, FiGrid, FiMenu
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* --- Styled Components --- */

const Page = styled.div`
  min-height: 100vh;
  background-color: #f8fafc; /* Slate-50 */
  padding: 2rem;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 2rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }
  p {
    color: #64748b;
    margin-top: 0.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fdfdfd;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SectionBody = styled.div`
  padding: 1.5rem;
`;

/* Form Elements */
const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

/* File Upload Zone */
const UploadZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  text-align: center;

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  input { display: none; }
  
  .icon { font-size: 1.5rem; color: #94a3b8; margin-bottom: 0.5rem; }
  .text { font-size: 0.85rem; color: #64748b; font-weight: 500; }
  .sub { font-size: 0.75rem; color: #94a3b8; }
`;

const PreviewImage = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f1f5f9;
  border-radius: 6px;

  img {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #e2e8f0;
  }
  
  .name { font-size: 0.85rem; font-weight: 500; color: #334155; }
  .remove { 
    margin-left: auto; color: #ef4444; cursor: pointer; font-size: 0.8rem; 
    &:hover { text-decoration: underline; }
  }
`;

/* Buttons */
const Button = styled(motion.button)`
  width: ${props => props.$full ? '100%' : 'auto'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;

  &.primary {
    background: #0f172a; color: white;
    &:hover:not(:disabled) { background: #334155; }
  }
  &.success {
    background: #10b981; color: white;
    &:hover:not(:disabled) { background: #059669; }
  }
  &.ghost {
    background: transparent; color: #64748b;
    &:hover { background: #f1f5f9; color: #334155; }
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/* List Items */
const ItemCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);

  .drag-handle { color: #cbd5e1; cursor: grab; font-size: 1.2rem; }
  
  .avatar {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 0.9rem; color: #64748b;
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .content {
    flex: 1;
    h4 { margin: 0; font-size: 0.95rem; color: #1e293b; }
    p { margin: 0; font-size: 0.85rem; color: #64748b; }
  }

  .actions {
    button {
      padding: 0.4rem;
      color: #94a3b8;
      background: transparent;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: #fee2e2; color: #ef4444; }
    }
  }
`;

const Alert = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  display: flex;
  gap: 0.75rem;
  
  &.warning { background: #fffbeb; color: #92400e; border: 1px solid #fcd34d; }
  &.success { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
`;

const Badge = styled.span`
  background: #e0f2fe; color: #0284c7;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

/* --- Helpers --- */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/* --- Component --- */
const BallotDesigner = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [nextVersion, setNextVersion] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form State
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '', image: null });
  const [success, setSuccess] = useState(null);

  // --- Loading Logic ---
  useEffect(() => {
    const load = async () => {
      try {
        const res = await electionService.getAdminElections();
        setElections(res.data || []);
        if (res.data?.length) {
          const first = res.data[0];
          setElectionId(first._id || first.id);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!electionId) {
      setSelectedElection(null); setBallots([]); setNextVersion(1); return;
    }
    const load = async () => {
      try {
        const [elRes, balRes] = await Promise.all([
          electionService.getAdminElections(),
          electionService.getElectionBallots(electionId)
        ]);
        const el = (elRes.data || []).find(e => (e._id || e.id) === electionId);
        setSelectedElection(el);

        const bList = balRes.data || [];
        setBallots(bList);
        const maxV = bList.length ? Math.max(...bList.map(b => b.version || 0)) : 0;
        setNextVersion(maxV + 1);
      } catch (e) { console.error(e); }
    };
    load();
  }, [electionId]);

  const isDraft = selectedElection ? !(selectedElection.isPublished ?? selectedElection.is_published) : true;

  // --- Handlers ---
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) return alert('PNG or JPG only');
    setNewCandidate(p => ({ ...p, image: { src: URL.createObjectURL(file), fileName: file.name } }));
  };

  const addCandidate = () => {
    if (!newCandidate.name.trim() || !newCandidate.party.trim()) return alert('Name and Party required');
    if (candidates.some(c => c.name.toLowerCase() === newCandidate.name.toLowerCase() && c.party.toLowerCase() === newCandidate.party.toLowerCase())) return alert('Duplicate candidate');

    setCandidates([...candidates, { ...newCandidate, id: Date.now().toString() }]);
    setNewCandidate({ name: '', party: '', description: '', image: null });
  };

  const saveBallot = async () => {
    if (candidates.length < 2) return alert('Need 2+ candidates');
    setLoading(true);
    setSuccess(null);
    try {
      const res = await electionService.createBallot(electionId, {
        title: `Ballot v${nextVersion}`,
        options: candidates.map(c => ({
          name: c.name, party: c.party, description: c.description, imageUrl: c.image?.src
        })),
        maxSelections: 1,
      });

      setSuccess({ version: res.data?.version || nextVersion });
      setBallots(p => [...p, { ...(res.data || {}), id: res.data?.id, version: nextVersion }]);
      setNextVersion(prev => prev + 1);
      setCandidates([]);
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  if (loading && !elections.length) return <Loader message="Loading Designer..." />;

  return (
    <Page>
      <Header>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '0.5rem' }}>Step 2 of 3</div>
        <h1>Ballot Designer</h1>
        <p>Configure candidates and generate ballot versions.</p>
      </Header>

      {/* Global Alerts */}
      {!isDraft && (
        <Alert className="warning" style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <FiInfo size={20} />
          <div>
            <strong>Election is Published.</strong> You must unpublish the election from the dashboard before adding new ballot versions.
          </div>
        </Alert>
      )}

      {success && (
        <Alert className="success" style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <FiCheck size={20} />
          <div>
            <strong>Success!</strong> Version {success.version} created.
            <span style={{ marginLeft: '1rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSuccess(null)}>Create another</span>
          </div>
        </Alert>
      )}

      <Grid>
        {/* LEFT COLUMN: Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* 1. Select Election */}
          <Section>
            <SectionHeader><h3><FiGrid /> Select Election</h3></SectionHeader>
            <SectionBody>
              <Select value={electionId} onChange={e => setElectionId(e.target.value)}>
                {elections.map(e => (
                  <option key={e._id || e.id} value={e._id || e.id}>
                    {e.title} {e.isPublished ? '(Live)' : '(Draft)'}
                  </option>
                ))}
              </Select>
              {selectedElection && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                  Current: <strong>{ballots.length}</strong> versions created.
                  Next will be: <Badge>v{nextVersion}</Badge>
                </div>
              )}
            </SectionBody>
          </Section>

          {/* 2. Add Candidate Form */}
          <Section>
            <SectionHeader><h3><FiUser /> New Candidate</h3></SectionHeader>
            <SectionBody>
              <FormGroup>
                <label>Full Name</label>
                <Input
                  placeholder="e.g. Jane Doe"
                  value={newCandidate.name}
                  onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Party / Affiliation</label>
                <Input
                  placeholder="e.g. Independent"
                  value={newCandidate.party}
                  onChange={e => setNewCandidate({ ...newCandidate, party: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <label>Description (Optional)</label>
                <Input
                  placeholder="Short tagline..."
                  value={newCandidate.description}
                  onChange={e => setNewCandidate({ ...newCandidate, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <label>Party Logo</label>
                {!newCandidate.image ? (
                  <UploadZone>
                    <div className="icon"><FiUploadCloud /></div>
                    <div className="text">Click to upload logo</div>
                    <div className="sub">PNG or JPG (Max 2MB)</div>
                    <input type="file" onChange={handleFile} accept="image/png, image/jpeg" />
                  </UploadZone>
                ) : (
                  <PreviewImage>
                    <img src={newCandidate.image.src} alt="Preview" />
                    <span className="name">{newCandidate.image.fileName}</span>
                    <span className="remove" onClick={() => setNewCandidate(p => ({ ...p, image: null }))}>Remove</span>
                  </PreviewImage>
                )}
              </FormGroup>

              <Button
                className="primary"
                $full
                onClick={addCandidate}
                disabled={!isDraft}
                whileTap={{ scale: 0.98 }}
              >
                <FiPlus /> Add Candidate
              </Button>
            </SectionBody>
          </Section>
        </div>

        {/* RIGHT COLUMN: Preview & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <SectionHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3><FiMenu /> Ballot Preview (v{nextVersion})</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{candidates.length} Candidates</span>
            </SectionHeader>

            <SectionBody style={{ flex: 1, background: '#f8fafc' }}>
              {candidates.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
                  <FiUser size={48} style={{ opacity: 0.2 }} />
                  <p>Candidate list is empty.<br />Use the form to add candidates.</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={candidates} onReorder={setCandidates} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <AnimatePresence>
                    {candidates.map(c => (
                      <Reorder.Item key={c.id} value={c} style={{ marginBottom: '0.75rem' }}>
                        <ItemCard>
                          <div className="drag-handle">⋮⋮</div>
                          <div className="avatar">
                            {c.image ? <img src={c.image.src} alt="" /> : getInitials(c.name)}
                          </div>
                          <div className="content">
                            <h4>{c.name}</h4>
                            <p>{c.party}</p>
                          </div>
                          <div className="actions">
                            <button onClick={() => setCandidates(candidates.filter(i => i.id !== c.id))}>
                              <FiTrash2 />
                            </button>
                          </div>
                        </ItemCard>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </SectionBody>

            <div style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Button className="ghost" onClick={() => setCandidates([])} disabled={candidates.length === 0}>
                Clear All
              </Button>
              <Button
                className="success"
                onClick={saveBallot}
                disabled={candidates.length < 2 || !isDraft}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSave /> Save Ballot Version
              </Button>
            </div>
          </Section>
        </div>
      </Grid>
    </Page>
  );
};

export default BallotDesigner;