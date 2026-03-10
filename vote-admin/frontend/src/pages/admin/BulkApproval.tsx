import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiFilter, FiSearch } from 'react-icons/fi';
import candidateService, { Candidate } from '../../services/candidateService';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';
import AnimatedCard from '../../components/AnimatedCard';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
  }
`;

const FiltersBar = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  select,
  input {
    padding: 0.5rem 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-size: 0.95rem;
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'success' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-fast);
  background: ${props => {
    if (props.variant === 'success') return 'var(--success)';
    if (props.variant === 'danger') return 'var(--danger)';
    return 'var(--primary)';
  }};
  color: white;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableContainer = styled(AnimatedCard)`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  thead {
    background: var(--bg-secondary);
    tr {
      border-bottom: 2px solid var(--border-color);
    }
    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
  tbody {
    tr {
      border-bottom: 1px solid var(--border-color);
      transition: background var(--transition-fast);
      &:hover {
        background: var(--bg-hover);
      }
    }
    td {
      padding: 1rem;
      color: var(--text-primary);
    }
  }
`;

const Checkbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.status === 'APPROVED') return 'var(--success)15';
    if (props.status === 'REJECTED') return 'var(--danger)15';
    return 'var(--warning)15';
  }};
  color: ${props => {
    if (props.status === 'APPROVED') return 'var(--success)';
    if (props.status === 'REJECTED') return 'var(--danger)';
    return 'var(--warning)';
  }};
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(AnimatedCard)`
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  h2 {
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  p {
    margin-bottom: 1.5rem;
    color: var(--text-muted);
  }
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--radius-sm);
    margin-bottom: 1.5rem;
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
`;

const BulkApproval: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [elections, setElections] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    electionId: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [candidatesData, electionsData] = await Promise.all([
        candidateService.getCandidates(),
        electionService.getAdminElections(),
      ]);
      setCandidates(candidatesData);
      setElections(electionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    if (filters.electionId) {
      filtered = filtered.filter(c => c.electionId === filters.electionId);
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.party.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = filteredCandidates
        .filter(c => c.status === 'PENDING')
        .map(c => c.id);
      setSelectedIds(new Set(pendingIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectCandidate = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (action: 'APPROVE' | 'REJECT') => {
    if (selectedIds.size === 0) return;
    setModalAction(action);
    setShowModal(true);
  };

  const confirmBulkAction = async () => {
    if (!modalAction || selectedIds.size === 0) return;

    try {
      setProcessing(true);
      await candidateService.bulkApproveCandidates({
        candidateIds: Array.from(selectedIds),
        action: modalAction,
        remarks: remarks || undefined,
      });
      setShowModal(false);
      setRemarks('');
      setSelectedIds(new Set());
      await loadData();
      // Show success toast (you can add a toast library)
      alert(`${modalAction === 'APPROVE' ? 'Approved' : 'Rejected'} ${selectedIds.size} candidates`);
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Failed to process bulk action');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loader message="Loading candidates..." />;
  }

  const pendingCount = filteredCandidates.filter(c => c.status === 'PENDING').length;
  const allSelected = pendingCount > 0 && selectedIds.size === pendingCount;

  return (
    <PageContainer>
      <Header>
        <h1>Bulk Candidate Approval</h1>
      </Header>

      <FiltersBar>
        <FilterGroup>
          <label>Election</label>
          <select
            value={filters.electionId}
            onChange={e => setFilters({ ...filters, electionId: e.target.value })}
          >
            <option value="">All Elections</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup>
          <label>Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </FilterGroup>

        <FilterGroup style={{ flex: 1, minWidth: '200px' }}>
          <label>Search</label>
          <div style={{ position: 'relative' }}>
            <FiSearch
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search by name or party..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </FilterGroup>
      </FiltersBar>

      <ActionBar>
        <Button
          variant="success"
          onClick={() => handleBulkAction('APPROVE')}
          disabled={selectedIds.size === 0 || processing}
        >
          <FiCheck />
          Approve Selected ({selectedIds.size})
        </Button>
        <Button
          variant="danger"
          onClick={() => handleBulkAction('REJECT')}
          disabled={selectedIds.size === 0 || processing}
        >
          <FiX />
          Reject Selected ({selectedIds.size})
        </Button>
      </ActionBar>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>
                <Checkbox
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Name</th>
              <th>Party</th>
              <th>Election</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No candidates found
                </td>
              </tr>
            ) : (
              filteredCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td>
                    <Checkbox
                      type="checkbox"
                      checked={selectedIds.has(candidate.id)}
                      onChange={e => handleSelectCandidate(candidate.id, e.target.checked)}
                      disabled={candidate.status !== 'PENDING'}
                    />
                  </td>
                  <td>{candidate.name}</td>
                  <td>{candidate.party}</td>
                  <td>{elections.find(e => e.id === candidate.electionId)?.title || 'N/A'}</td>
                  <td>
                    <StatusBadge status={candidate.status}>{candidate.status}</StatusBadge>
                  </td>
                  <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !processing && setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h2>
                {modalAction === 'APPROVE' ? 'Approve' : 'Reject'} {selectedIds.size} Candidates
              </h2>
              <p>Are you sure you want to {modalAction?.toLowerCase()} these candidates?</p>
              <textarea
                placeholder="Add remarks (optional)..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
              />
              <div className="modal-actions">
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowModal(false);
                    setRemarks('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant={modalAction === 'APPROVE' ? 'success' : 'danger'}
                  onClick={confirmBulkAction}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm'}
                </Button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default BulkApproval;
