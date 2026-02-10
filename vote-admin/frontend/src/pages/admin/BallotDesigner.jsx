import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import styled from 'styled-components';
import {
  FiPlus, FiTrash2, FiSave, FiUser, FiList, FiCheck,
  FiRefreshCw, FiInfo, FiChevronDown
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

/* -------------------- Styled Components -------------------- */

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-page);
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: var(--bg-card);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
`;

const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: ${(p) => (p.$type === 'warning' ? '#fef3c7' : 'var(--bg-secondary)')};
  border-left: 4px solid ${(p) => (p.$type === 'warning' ? 'var(--warning)' : 'var(--primary)')};
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #374151;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${(p) => (p.$type === 'warning' ? '#d97706' : '#1d4ed8')};
  }
`;

const Select = styled.select`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 44px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const Button = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &.primary {
    background: linear-gradient(135deg, var(--primary), var(--primary-hover));
    color: white;
    box-shadow: var(--shadow-md);
  }

  &.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
  }

  &.success {
    background: linear-gradient(135deg, var(--success), #15803d);
    color: white;
    box-shadow: var(--shadow-md);
  }

  &.success:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.5);
  }

  &.secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid var(--border-color);
  }

  &.secondary:hover:not(:disabled) {
    background: #e2e8f0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
`;

const CandidateList = styled(Reorder.Group)`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  margin: 0;
`;

const CandidateItem = styled(Reorder.Item)`
  list-style: none;
`;

const CandidateCard = styled.div`
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px solid var(--border-color);
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s;

  &:hover {
    border-color: #cbd5e1;
  }
`;

const AddCandidateForm = styled.div`
  background: #f8fafc;
  border: 2px dashed var(--border-color);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  padding: 0.65rem 0.9rem;
  width: 100%;
  margin-bottom: 0.6rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const TextArea = styled.textarea`
  padding: 0.65rem 0.9rem;
  width: 100%;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px dashed var(--border-color);
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
  background: #f9fafb;

  &:hover {
    background: var(--bg-hover);
    color: var(--primary);
  }
`;

const ImagePreview = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-muted);
`;

const PreviewThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--border-color);
  background: #e5e7eb;
`;

const CandidateAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  overflow: hidden;
`;

const CandidateAvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, var(--success), #15803d);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: center;
  box-shadow: var(--shadow-md);

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  p {
    margin: 0;
    opacity: 0.95;
    font-size: 0.95rem;
  }

  .version-saved {
    font-weight: 700;
    font-size: 1.1rem;
    margin-top: 0.5rem;
  }

  .create-another {
    margin-top: 1rem;
  }
`;

const ExistingVersions = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.95rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .version-chip {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 0.85rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
    color: #475569;
  }

  .version-chip.published {
    background: #dcfce7;
    color: #166534;
    font-weight: 600;
  }
`;

/* -------------------- Component -------------------- */

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const BallotDesigner = () => {
  const [elections, setElections] = useState([]);
  const [electionId, setElectionId] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [nextVersion, setNextVersion] = useState(1);

  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    party: '',
    description: '',
    image: null, // { src, fileName }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { version, ballotId }
  const [loadError, setLoadError] = useState('');

  /* Load admin elections */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await electionService.getAdminElections();
        if (!cancelled && res.data?.length) {
          setElections(res.data);
          // Always fall back to the first static/mock election so this
          // screen works even if you never created one via the form.
          const first = res.data[0];
          const id = first._id || first.id;
          setElectionId(id);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'Failed to load elections');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  /* When electionId changes, load election details and ballots */
  useEffect(() => {
    if (!electionId) {
      setSelectedElection(null);
      setBallots([]);
      setNextVersion(1);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const [electionRes, ballotsRes] = await Promise.all([
          electionService.getAdminElections(),
          electionService.getElectionBallots(electionId),
        ]);
        if (cancelled) return;
        const list = electionRes.data || [];
        const el = list.find((e) => (e._id || e.id) === electionId);
        setSelectedElection(el || null);
        const ballotList = ballotsRes.data || [];
        setBallots(ballotList);
        const maxV = ballotList.length
          ? Math.max(...ballotList.map((b) => b.version || 0))
          : 0;
        setNextVersion(maxV + 1);
      } catch (e) {
        if (!cancelled) {
          setSelectedElection(null);
          setBallots([]);
          setNextVersion(1);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [electionId]);

  /* Redirect if no elections at all */
  // In UI-only mode we seed a static mock election in electionService,
  // so this page will always have something to work with. No redirect.

  const isDraft = selectedElection
    ? (selectedElection.isPublished ?? selectedElection.is_published) === false
    : true;

  const hasDuplicateCandidate = (list) => {
    const seen = new Set();
    for (const c of list) {
      const name = (c.name || '').trim().toLowerCase();
      const party = (c.party || '').trim().toLowerCase();
      if (!name || !party) {
        return 'Candidate name and party are required for every candidate';
      }
      const key = `${name}::${party}`;
      if (seen.has(key)) {
        return 'Duplicate candidate with the same name and party is not allowed (case-insensitive)';
      }
      seen.add(key);
    }
    return null;
  };

  const addCandidate = () => {
    const name = newCandidate.name?.trim();
    const party = newCandidate.party?.trim();

    if (!name || !party) {
      alert('Candidate name and party are required');
      return;
    }

    const candidateToAdd = { ...newCandidate, name, party, id: Date.now().toString() };
    const nextList = [...candidates, candidateToAdd];
    const duplicateError = hasDuplicateCandidate(nextList);
    if (duplicateError) {
      alert(duplicateError);
      return;
    }

    setCandidates(nextList);
    setNewCandidate({ name: '', party: '', description: '', image: null });
  };

  const removeCandidate = (id) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const saveBallot = async () => {
    if (candidates.length < 2) {
      alert('At least 2 candidates are required');
      return;
    }

    const duplicateError = hasDuplicateCandidate(candidates);
    if (duplicateError) {
      alert(duplicateError);
      return;
    }
    if (!electionId) {
      alert('Please select an election');
      return;
    }
    if (!isDraft) {
      alert('Cannot create new ballot versions when the election is published. Unpublish the election first (from the View dashboard).');
      return;
    }
    setLoading(true);
    setSuccess(null);
    try {
      const res = await electionService.createBallot(electionId, {
        title: `Ballot v${nextVersion}`,
        options: candidates.map((c) => ({
          name: c.name?.trim(),
          party: c.party?.trim(),
          description: c.description,
          imageUrl: c.image?.src || null,
        })),
        maxSelections: 1,
      });
      const data = res.data ?? res;
      const id = data?.id;
      const version = data?.version ?? nextVersion;
      setSuccess({ version, ballotId: id });
      setBallots((prev) => [...prev, { id, version, ...data }]);
      setNextVersion(version + 1);
      setCandidates([]);
    } catch (err) {
      alert(err.message || 'Failed to save ballot');
    } finally {
      setLoading(false);
    }
  };

  const createAnotherVersion = () => {
    setSuccess(null);
  };

  const publishElection = async () => {
    if (!electionId) return;
    try {
      await electionService.publishElection(electionId);
      alert('Election published successfully');
      const res = await electionService.getAdminElections();
      const list = res.data || [];
      const el = list.find((e) => (e._id || e.id) === electionId);
      setSelectedElection(el || null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loadError && elections.length === 0) {
    return (
      <PageContainer>
        <Header>
          <h1>Ballot Designer</h1>
          <p>Create and manage ballot versions</p>
        </Header>
        <InfoBanner $type="warning">
          <FiInfo />
          <span>{loadError}</span>
        </InfoBanner>
        <Button className="secondary" onClick={() => window.location.href = '/admin/election/create'}>
          Create an election first
        </Button>
      </PageContainer>
    );
  }

  if (loading) {
    return <Loader message="Saving ballot..." />;
  }

  return (
    <PageContainer>
      <Header>
        <h1>Ballot Designer</h1>
        <p>Create and manage ballot versions for an election</p>
      </Header>

      <Card>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>
          Select election
        </label>
        <Select
          value={electionId}
          onChange={(e) => {
            setElectionId(e.target.value);
          }}
        >
          <option value="">-- Choose election --</option>
          {elections.map((e) => (
            <option key={e._id ?? e.id} value={e._id ?? e.id}>
              {e.title} {e.isPublished || e.is_published ? '(Published)' : '(Draft)'}
            </option>
          ))}
        </Select>

        {selectedElection && (
          <ExistingVersions>
            <h4>
              <FiList /> Existing ballot versions: {ballots.length}
              {ballots.length > 0 && ` (next will be Version ${nextVersion})`}
            </h4>
            {ballots.map((b) => (
              <span
                key={b.id}
                className={`version-chip ${b.isPublished ? 'published' : ''}`}
                title={b.isPublished ? 'Currently published' : 'Draft'}
              >
                v{b.version} {b.isPublished ? '✓ Published' : ''}
              </span>
            ))}
          </ExistingVersions>
        )}
      </Card>

      {!isDraft && (
        <InfoBanner $type="warning">
          <FiInfo />
          <span>
            <strong>Election is published.</strong> New ballot versions can only be created when the election is in <strong>Draft</strong>. Unpublish the election from the <strong>View</strong> dashboard if you need to add more versions.
          </span>
        </InfoBanner>
      )}

      <AnimatePresence>
        {success && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h3>
              <FiCheck size={24} /> Ballot saved
            </h3>
            <p className="version-saved">Version {success.version} created successfully.</p>
            <p>You can publish or rollback this version from the View dashboard.</p>
            <div className="create-another">
              <Button className="secondary" onClick={createAnotherVersion}>
                <FiRefreshCw /> Create another version
              </Button>
            </div>
          </SuccessMessage>
        )}
      </AnimatePresence>

      <Card>
        <Controls>
          <Button className="primary" onClick={addCandidate}>
            <FiPlus /> Add candidate
          </Button>
          <Button
            className="success"
            onClick={saveBallot}
            disabled={candidates.length < 2 || !isDraft}
          >
            <FiSave /> Save as new version (Version {nextVersion})
          </Button>
          {selectedElection && (
            <Button
              className="secondary"
              onClick={publishElection}
              disabled={candidates.length < 2 || !isDraft}
            >
              <FiCheck /> Publish election
            </Button>
          )}
        </Controls>

        <AddCandidateForm>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#334155' }}>New candidate</h3>
          <Input
            placeholder="Name"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
          />
          <Input
            placeholder="Party"
            value={newCandidate.party}
            onChange={(e) => setNewCandidate({ ...newCandidate, party: e.target.value })}
          />
          <TextArea
            placeholder="Description (optional)"
            value={newCandidate.description}
            onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
          />
          <div style={{ marginTop: '0.5rem' }}>
            <HiddenFileInput
              id="candidate-image"
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!/^image\/(png|jpe?g)$/.test(file.type)) {
                  alert('Please upload a PNG or JPG image for the party logo.');
                  return;
                }
                const src = URL.createObjectURL(file);
                setNewCandidate((prev) => ({
                  ...prev,
                  image: { src, fileName: file.name },
                }));
              }}
            />
            <FileLabel htmlFor="candidate-image">
              <FiUser />
              {newCandidate.image ? 'Change party logo' : 'Upload party logo (PNG/JPG, optional)'}
            </FileLabel>

            {newCandidate.image && (
              <ImagePreview>
                <PreviewThumb src={newCandidate.image.src} alt="Party logo preview" />
                <span>{newCandidate.image.fileName}</span>
              </ImagePreview>
            )}
          </div>
          <Button className="secondary" onClick={addCandidate} style={{ marginTop: '0.5rem' }}>
            <FiPlus /> Add to list
          </Button>
        </AddCandidateForm>

        {candidates.length === 0 ? (
          <AnimatedCard>
            <p style={{ color: '#64748b', margin: 0 }}>No candidates added yet. Add at least 2 to save a new version.</p>
          </AnimatedCard>
        ) : (
          <>
            <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#475569' }}>
              Candidates in this version ({candidates.length})
            </p>
            <CandidateList axis="y" values={candidates} onReorder={setCandidates}>
              {candidates.map((c) => (
                <CandidateItem key={c.id} value={c}>
                  <CandidateCard>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CandidateAvatar>
                        {c.image?.src ? (
                          <CandidateAvatarImage
                            src={c.image.src}
                            alt={`${c.party || c.name} logo`}
                          />
                        ) : (
                          <span>{getInitials(c.name)}</span>
                        )}
                      </CandidateAvatar>
                      <div>
                        <strong>{c.name}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{c.party}</div>
                        {c.description && (
                          <div
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.85rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            {c.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button className="secondary" onClick={() => removeCandidate(c.id)}>
                      <FiTrash2 />
                    </Button>
                  </CandidateCard>
                </CandidateItem>
              ))}
            </CandidateList>
          </>
        )}
      </Card>
    </PageContainer>
  );
};

export default BallotDesigner;
