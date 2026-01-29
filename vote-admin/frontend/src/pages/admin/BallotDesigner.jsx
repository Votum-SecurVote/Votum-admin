import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import styled from 'styled-components';
import { 
  FiPlus, FiTrash2, FiEdit2, FiSave, 
  FiUser, FiType, FiList, FiCheck 
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import AnimatedCard from '../../components/AnimatedCard';
import Loader from '../../components/Loader';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, var(--primary), var(--info));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    color: var(--text-secondary);
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  
  &.primary {
    background: var(--primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--primary-hover);
    }
  }
  
  &.secondary {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover {
      background: var(--bg-hover);
    }
  }
  
  &.success {
    background: var(--success);
    color: white;
    
    &:hover {
      opacity: 0.9;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CandidateList = styled(Reorder.Group)`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CandidateItem = styled(Reorder.Item)`
  list-style: none;
  position: relative;
  
  &.editing {
    .candidate-content {
      border-color: var(--primary);
      box-shadow: var(--shadow-glow);
    }
  }
`;

const CandidateCard = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: grab;
  
  &:hover {
    border-color: var(--primary);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.div`
  color: var(--text-muted);
  font-size: 1.25rem;
  cursor: grab;
  padding: 0.5rem;
  
  &:hover {
    color: var(--primary);
  }
`;

const CandidateInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`;

const CandidateActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled(motion.button)`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--bg-hover);
    color: var(--primary);
  }
  
  &.delete:hover {
    background: var(--danger);
    color: white;
    border-color: var(--danger);
  }
`;

const AddCandidateForm = styled(motion.div)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-color);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  
  h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary);
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: all var(--transition-normal);
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const EditForm = styled(motion.div)`
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 0.5rem;
  border: 1px solid var(--border-color);
`;

const SuccessMessage = styled(motion.div)`
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  text-align: center;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const BallotDesigner = () => {
  const [candidates, setCandidates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '', description: '' });
  const [editingCandidate, setEditingCandidate] = useState({ name: '', party: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ballotId, setBallotId] = useState(null);
  const [electionId] = useState(localStorage.getItem('lastElectionId') || '');
  
  // Load existing ballot (published if exists, otherwise latest draft)
  useEffect(() => {
    if (!electionId) return;

    (async () => {
      try {
        const res = await electionService.getElectionBallots(electionId);
        const list = res.data || [];
        if (list.length === 0) return;

        const published = list.find((b) => b.isPublished);
        const toEdit = published || list[list.length - 1];

        if (!toEdit || !Array.isArray(toEdit.options)) return;

        setBallotId(toEdit._id);
        setCandidates(
          toEdit.options.map((opt, index) => ({
            id: opt.id || opt._id || `candidate_${index}`,
            name: opt.name,
            party: opt.party || '',
            description: opt.description || '',
            order: typeof opt.order === 'number' ? opt.order : index,
          }))
        );
      } catch (error) {
        console.error('Error loading existing ballot:', error);
      }
    })();
  }, [electionId]);
  
  const addCandidate = () => {
    const name = newCandidate.name.trim();
    const party = newCandidate.party.trim();
    
    if (!name) {
      alert('Candidate name is required');
      return;
    }
    
    if (!party) {
      alert('Party name is required');
      return;
    }

    // Prevent duplicate candidates with same name AND same party (case-insensitive)
    const exists = candidates.some(
      (c) => 
        c.name.trim().toLowerCase() === name.toLowerCase() &&
        c.party.trim().toLowerCase() === party.toLowerCase()
    );
    if (exists) {
      alert('Invalid ballot: Duplicate candidate with same name and same party name. Please enter again.');
      return;
    }
    
    const candidate = {
      id: `candidate_${Date.now()}`,
      name,
      party,
      description: newCandidate.description.trim(),
      order: candidates.length
    };
    
    setCandidates([...candidates, candidate]);
    setNewCandidate({ name: '', party: '', description: '' });
  };
  
  const removeCandidate = (id) => {
    setCandidates(candidates.filter(c => c.id !== id));
    if (editingId === id) setEditingId(null);
  };
  
  const startEditing = (candidate) => {
    setEditingId(candidate.id);
    setEditingCandidate({
      name: candidate.name,
      party: candidate.party || '',
      description: candidate.description || ''
    });
  };
  
  const saveEdit = () => {
    const name = editingCandidate.name.trim();
    const party = editingCandidate.party.trim();
    
    if (!name) {
      alert('Candidate name is required');
      return;
    }
    
    if (!party) {
      alert('Party name is required');
      return;
    }

    // Prevent editing into a duplicate candidate (same name AND same party)
    const exists = candidates.some(
      (c) =>
        c.id !== editingId &&
        c.name.trim().toLowerCase() === name.toLowerCase() &&
        c.party.trim().toLowerCase() === party.toLowerCase()
    );
    if (exists) {
      alert('Invalid ballot: Duplicate candidate with same name and same party name. Please enter again.');
      return;
    }
    
    setCandidates(
      candidates.map((c) =>
        c.id === editingId
          ? { ...c, name, party, description: editingCandidate.description.trim() }
          : c
      )
    );
    setEditingId(null);
  };
  
  const cancelEdit = () => {
    setEditingId(null);
  };
  
  const saveBallot = async () => {
    if (candidates.length < 2) {
      alert('Ballot must have at least 2 candidates');
      return;
    }

    // Validate all candidates have required fields
    const invalidCandidates = candidates.filter(
      (c) => !c.name?.trim() || !c.party?.trim()
    );
    if (invalidCandidates.length > 0) {
      alert('All candidates must have both name and party');
      return;
    }

    // Check for duplicates
    const candidateKeys = candidates.map((c) => 
      `${c.name.trim().toLowerCase()}_${c.party.trim().toLowerCase()}`
    );
    const hasDuplicates = new Set(candidateKeys).size !== candidateKeys.length;
    if (hasDuplicates) {
      alert('Invalid ballot: Duplicate candidate with same name and same party name. Please enter again.');
      return;
    }

    if (!electionId) {
      alert('No election selected');
      return;
    }
    
    setLoading(true);
    
    try {
      const ballotData = {
        title: `Ballot for Election ${electionId}`,
        description: 'Ballot created via admin dashboard',
        options: candidates.map((c, index) => ({
          name: c.name.trim(),
          party: c.party.trim(),
          description: c.description?.trim() || '',
          order: index
        })),
        maxSelections: 1
      };
      
      const response = await electionService.createBallot(electionId, ballotData);
      setBallotId(response.data._id);
      setSuccess(true);
      
      // Clear form after success
      setTimeout(() => {
        setSuccess(false);
        setCandidates([]);
      }, 3000);
    } catch (error) {
      console.error('Error saving ballot:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const publishElection = async () => {
    if (!electionId) {
      alert('No election selected');
      return;
    }
    
    try {
      await electionService.publishElection(electionId);
      alert('Election published successfully!');
    } catch (error) {
      console.error('Error publishing election:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  if (loading) {
    return <Loader message="Saving ballot..." />;
  }
  
  return (
    <PageContainer>
      <Header>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ballot Designer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Design your ballot by adding, editing, and arranging candidates
        </motion.p>
      </Header>
      
      <AnimatePresence>
        {success && (
          <SuccessMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: 'backOut' }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <FiCheck size={48} />
            </motion.div>
            <h3>Ballot Saved Successfully!</h3>
            <p>Ballot ID: {ballotId}</p>
          </SuccessMessage>
        )}
      </AnimatePresence>
      
      <Controls>
        <Button
          className="primary"
          onClick={() => {
            if (!newCandidate.name.trim()) {
              document.getElementById('candidateName')?.focus();
            } else if (!newCandidate.party.trim()) {
              document.getElementById('candidateParty')?.focus();
            } else {
              addCandidate();
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> Add Candidate
        </Button>
        
        <Button
          className="success"
          onClick={saveBallot}
          disabled={candidates.length < 2}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSave /> Save Ballot
        </Button>
        
        {electionId && (
          <Button
            className="secondary"
            onClick={publishElection}
            disabled={candidates.length < 2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCheck /> Publish Election
          </Button>
        )}
      </Controls>
      
      <AddCandidateForm
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3><FiUser /> New Candidate</h3>
        
        <FormGroup>
          <Label><FiType /> Candidate Name *</Label>
          <Input
            id="candidateName"
            type="text"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
            placeholder="Enter candidate name"
            onKeyPress={(e) => e.key === 'Enter' && addCandidate()}
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FiUser /> Party Name *</Label>
          <Input
            id="candidateParty"
            type="text"
            value={newCandidate.party}
            onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
            placeholder="Enter party name"
            onKeyPress={(e) => e.key === 'Enter' && addCandidate()}
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FiList /> Description (Optional)</Label>
          <TextArea
            value={newCandidate.description}
            onChange={(e) => setNewCandidate({...newCandidate, description: e.target.value})}
            placeholder="Brief description or platform"
          />
        </FormGroup>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            className="secondary"
            onClick={addCandidate}
            disabled={!newCandidate.name.trim() || !newCandidate.party.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Ballot
          </Button>
        </div>
      </AddCandidateForm>
      
      <AnimatePresence>
        {candidates.length > 0 ? (
          <>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiList /> Candidates ({candidates.length})
            </motion.h3>
            
            <CandidateList
              axis="y"
              values={candidates}
              onReorder={setCandidates}
            >
              <AnimatePresence>
                {candidates.map((candidate, index) => (
                  <CandidateItem
                    key={candidate.id}
                    value={candidate}
                    className={editingId === candidate.id ? 'editing' : ''}
                  >
                    <CandidateCard
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DragHandle>
                        ⋮⋮
                      </DragHandle>
                      
                      <CandidateInfo>
                        <h3>
                          {candidate.name}
                          <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)',
                            fontWeight: 'normal'
                          }}>
                            #{index + 1}
                          </span>
                        </h3>
                        {candidate.party && (
                          <p style={{ color: 'var(--primary)', fontWeight: '500', marginBottom: '0.25rem' }}>
                            {candidate.party}
                          </p>
                        )}
                        {candidate.description && (
                          <p>{candidate.description}</p>
                        )}
                      </CandidateInfo>
                      
                      <CandidateActions>
                        {editingId === candidate.id ? (
                          <>
                            <IconButton
                              onClick={saveEdit}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiCheck />
                            </IconButton>
                            <IconButton
                              onClick={cancelEdit}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              ✕
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => startEditing(candidate)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiEdit2 />
                            </IconButton>
                            <IconButton
                              className="delete"
                              onClick={() => removeCandidate(candidate.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </>
                        )}
                      </CandidateActions>
                    </CandidateCard>
                    
                    {editingId === candidate.id && (
                      <EditForm
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <FormGroup>
                          <Label>Name *</Label>
                          <Input
                            type="text"
                            value={editingCandidate.name}
                            onChange={(e) => setEditingCandidate({
                              ...editingCandidate,
                              name: e.target.value
                            })}
                            autoFocus
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>Party *</Label>
                          <Input
                            type="text"
                            value={editingCandidate.party}
                            onChange={(e) => setEditingCandidate({
                              ...editingCandidate,
                              party: e.target.value
                            })}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label>Description</Label>
                          <TextArea
                            value={editingCandidate.description}
                            onChange={(e) => setEditingCandidate({
                              ...editingCandidate,
                              description: e.target.value
                            })}
                          />
                        </FormGroup>
                      </EditForm>
                    )}
                  </CandidateItem>
                ))}
              </AnimatePresence>
            </CandidateList>
          </>
        ) : (
          <AnimatedCard>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
                style={{ fontSize: '3rem', marginBottom: '1rem' }}
              >
                📋
              </motion.div>
              <h3>No Candidates Added Yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Start by adding candidates using the form above
              </p>
            </div>
          </AnimatedCard>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default BallotDesigner;