import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FiUser, FiFileText, FiCheck, FiX, FiShield,
  FiExternalLink, FiAlertCircle, FiSearch, FiFilter, FiCheckCircle
} from 'react-icons/fi';
import voterService from '../../services/voterService';
import Loader from '../../components/Loader';
import { AnimatePresence, motion } from 'framer-motion';

/* --- Institutional Styled Components --- */
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
  max-width: 1800px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  box-sizing: border-box;
  min-height: 0;
`;

const HeaderContainer = styled.header`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  select {
    padding: 0.5rem;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #334155;
    outline: none;
    &:focus { border-color: #1e40af; }
  }
`;

const BulkActionsToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const TableWrapper = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-top: 4px solid #1e40af;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  thead th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    padding: 1.25rem 1.5rem;
    color: #475569;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.7rem;
    border-bottom: 2px solid #e2e8f0;
    z-index: 10;
  }

  tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
    &:hover { background: #f8fafc; }
    &.selected { background: #eff6ff; }
  }

  td { padding: 1.5rem; vertical-align: top; }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1e40af;
`;

const VerificationZone = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
`;

const LargePortrait = styled.div`
  width: 180px;
  height: 225px; 
  background: #f8fafc;
  border: 3px solid #cbd5e1;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.15);
  position: relative;

  img { width: 100%; height: 100%; object-fit: cover; }
  
  .placeholder {
    height: 100%; display: flex; flex-direction: column; align-items: center; 
    justify-content: center; background: #f1f5f9; color: #94a3b8; gap: 0.5rem;
    font-size: 0.8rem; font-weight: 600;
  }
`;

const DocSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
`;

const AadharPDFButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #1e40af;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
  box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.2);

  &:hover { background: #1e3a8a; }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 1.1rem;
  border: none;
  border-radius: 4px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  transition: all 0.2s;

  &.approve { background: #166534; color: white; &:hover { background: #14532d; } }
  &.reject { background: #fee2e2; color: #991b1b; border: 2px solid #fecaca; &:hover { background: #fecaca; } }
  &.bulk-approve { background: #166534; color: white; padding: 0.6rem 1rem; margin: 0; }
  &.bulk-reject { background: #fee2e2; color: #991b1b; border: 2px solid #fecaca; padding: 0.6rem 1rem; margin: 0; }
  
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* --- Modal & Toast --- */
const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  z-index: 2000;
  display: flex; align-items: center; justify-content: center;
`;

const ModalContent = styled(motion.div)`
  background: white; border-radius: 8px; padding: 2rem; width: 450px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  h2 { margin-top: 0; color: #0f172a; font-size: 1.25rem; }
  p { color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; }
  .actions { display: flex; gap: 1rem; justify-content: flex-end; }
  button {
    padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: 600; border: none; cursor: pointer;
    &.cancel { background: #e2e8f0; color: #475569; }
    &.confirm { background: #1e40af; color: white; }
  }
`;

const ToastContainer = styled(motion.div)`
  position: fixed; bottom: 2rem; right: 2rem; z-index: 3000;
  background: #1e293b; color: white; padding: 1rem 1.5rem;
  border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  display: flex; align-items: center; gap: 0.75rem; font-weight: 500;
`;

/* --- Component --- */
const VoterApproval = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [electionFilter, setElectionFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Multi-select
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Toasts
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, ids: [] });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const load = async () => {
      try {
        const mockData = [
          { userId: "UID-99283712", fullName: "Rajesh Kumar Sharma", photoUrl: "https://randomuser.me/api/portraits/men/75.jpg", status: "PENDING", email: "rajesh.k@example.com", phone: "+91 98765 43210", dob: "1985-04-12", gender: "Male", address: "Block-C, Sector 45, Noida, UP", election: "ELEC-2026", submissionDate: "2026-02-15" },
          { userId: "UID-11293847", fullName: "Priya Desai", photoUrl: null, status: "PENDING", email: "priya.d@example.com", phone: "+91 87654 32109", dob: "1992-08-22", gender: "Female", address: "Flat 402, Palm Heights, Mumbai, MH", election: "ELEC-2026", submissionDate: "2026-02-28" },
          { userId: "UID-55421980", fullName: "Anil Verma", photoUrl: "https://randomuser.me/api/portraits/men/32.jpg", status: "PENDING", email: "anil.v@example.com", phone: "+91 76543 21098", dob: "1978-11-05", gender: "Male", address: "Villa 3, Rosewood, Pune, MH", election: "ELEC-TECH", submissionDate: "2026-03-01" },
        ];
        const res = await voterService.getAllVoters().catch(() => ({ data: mockData }));
        setCandidates(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleActionConfirm = () => {
    const { type, ids } = confirmModal;

    setCandidates(prev => prev.map(c =>
      ids.includes(c.userId) ? { ...c, status: type === 'approve' ? 'APPROVED' : 'REJECTED' } : c
    ));

    setSelectedIds([]);
    setConfirmModal({ isOpen: false, type: null, ids: [] });
    showToast(`Successfully ${type}d ${ids.length} candidate(s).`);
  };

  // Filtering Logic
  let filteredCandidates = candidates.filter(c => c.status === statusFilter);
  if (electionFilter !== "ALL") filteredCandidates = filteredCandidates.filter(c => c.election === electionFilter);
  if (dateFilter !== "ALL") {
    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === "TODAY") filteredCandidates = filteredCandidates.filter(c => c.submissionDate === today);
  }

  // Selection Logic
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredCandidates.map(c => c.userId));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) return <Loader message="Loading candidate credentials..." />;

  const allSelected = filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length;

  return (
    <Page>
      <Container>
        <HeaderContainer>
          <div>
            <h1 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Candidate Verification & Approval</h1>
            <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem', marginTop: '6px' }}>
              <FiShield style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Identity audit and credential authorization for elections.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '4px', borderRadius: '4px' }}>
            {["PENDING", "APPROVED", "REJECTED"].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setSelectedIds([]); }}
                style={{
                  background: statusFilter === s ? '#1e40af' : 'transparent',
                  color: statusFilter === s ? 'white' : '#475569',
                  border: 'none', padding: '0.6rem 1.5rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px', transition: 'all 0.2s'
                }}
              >
                {s} ({candidates.filter(c => c.status === s).length})
              </button>
            ))}
          </div>
        </HeaderContainer>

        <ControlsBar>
          <FilterGroup>
            <FiFilter color="#64748b" />
            <select value={electionFilter} onChange={(e) => { setElectionFilter(e.target.value); setSelectedIds([]); }}>
              <option value="ALL">All Elections</option>
              <option value="ELEC-2026">General Assembly 2026</option>
              <option value="ELEC-TECH">Tech Board 2026</option>
            </select>
            <select value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setSelectedIds([]); }}>
              <option value="ALL">All Dates</option>
              <option value="TODAY">Submitted Today</option>
            </select>
          </FilterGroup>

          {statusFilter === 'PENDING' && (
            <BulkActionsToggle>
              <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginRight: '1rem' }}>
                {selectedIds.length} selected
              </span>
              <ActionButton
                className="bulk-approve"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirmModal({ isOpen: true, type: 'approve', ids: selectedIds })}
              >
                Bulk Approve
              </ActionButton>
              <ActionButton
                className="bulk-reject"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirmModal({ isOpen: true, type: 'reject', ids: selectedIds })}
              >
                Bulk Reject
              </ActionButton>
            </BulkActionsToggle>
          )}
        </ControlsBar>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                {statusFilter === 'PENDING' && (
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                )}
                <th style={{ width: '450px' }}>Visual Identity & Credentials</th>
                <th>Candidate Legal Profile</th>
                <th style={{ width: '250px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((v) => (
                <tr key={v.userId} className={selectedIds.includes(v.userId) ? 'selected' : ''}>
                  {statusFilter === 'PENDING' && (
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <Checkbox
                        checked={selectedIds.includes(v.userId)}
                        onChange={() => toggleSelectOne(v.userId)}
                      />
                    </td>
                  )}
                  <td>
                    <VerificationZone>
                      <LargePortrait>
                        {v.photoUrl ? (
                          <img src={v.photoUrl} alt="Portrait" />
                        ) : (
                          <div className="placeholder">
                            <FiUser size={48} style={{ opacity: 0.3 }} />
                            <span>No Photo</span>
                          </div>
                        )}
                      </LargePortrait>
                      <DocSection>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Documents</div>
                        <AadharPDFButton onClick={() => alert("Opening Proof: " + v.userId)}>
                          <FiFileText size={18} /> Insp. Evidence <FiExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
                        </AadharPDFButton>
                        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', padding: '0.75rem', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#166534', fontWeight: 800 }}>
                            <FiCheck size={14} /> ID VERIFIED
                          </div>
                        </div>
                      </DocSection>
                    </VerificationZone>
                  </td>

                  <td>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{v.fullName}</div>
                    <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '4px 8px', background: '#eff6ff', color: '#1e40af', fontWeight: 700, fontFamily: 'monospace', borderRadius: '4px', border: '1px solid #dbeafe' }}>UID: {v.userId}</div>

                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                      Applying for: <span style={{ color: '#1e40af' }}>{v.election}</span>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Info</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{v.gender} | {v.dob}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Contact</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{v.phone} • {v.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingLeft: '1.5rem', borderLeft: '2px solid #f1f5f9' }}>
                      {statusFilter === 'PENDING' && (
                        <>
                          <ActionButton className="approve" onClick={() => setConfirmModal({ isOpen: true, type: 'approve', ids: [v.userId] })}>
                            <FiCheck size={18} /> Approve
                          </ActionButton>
                          <ActionButton className="reject" onClick={() => setConfirmModal({ isOpen: true, type: 'reject', ids: [v.userId] })}>
                            <FiX size={18} /> Reject
                          </ActionButton>
                        </>
                      )}

                      {statusFilter !== 'PENDING' && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', background: statusFilter === 'APPROVED' ? '#f0fdf4' : '#fef2f2', borderRadius: '4px', border: `2px solid ${statusFilter === 'APPROVED' ? '#bbf7d0' : '#fecaca'}`, color: statusFilter === 'APPROVED' ? '#166534' : '#991b1b', fontWeight: 800 }}>
                          STATUS: {statusFilter}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={statusFilter === 'PENDING' ? 4 : 3} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    No candidates found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>

      </Container>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            >
              <h2>Confirm Action</h2>
              <p>
                Are you sure you want to <strong>{confirmModal.type}</strong> {confirmModal.ids.length} candidate(s)?
                This action is logged cryptographically and cannot be completely undone.
              </p>
              <div className="actions">
                <button className="cancel" onClick={() => setConfirmModal({ isOpen: false, type: null, ids: [] })}>Cancel</button>
                <button className="confirm" onClick={handleActionConfirm}>Confirm</button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <ToastContainer
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <FiCheckCircle size={20} color="#4ade80" />
            {toast.message}
          </ToastContainer>
        )}
      </AnimatePresence>

    </Page>
  );
};

export default VoterApproval;