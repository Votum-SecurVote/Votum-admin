import { useEffect, useState } from 'react';
import { getPendingVoters, approveVoter, rejectVoter } from '../../services/voterService';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

const AdminApproval = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPendingVoters();
        setVoters(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load pending voters', err);
        setError('Failed to load pending voters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const setProcessing = (voterId, isProcessing) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (isProcessing) {
        next.add(voterId);
      } else {
        next.delete(voterId);
      }
      return next;
    });
  };

  const handleAction = async (voterId, action) => {
    setError('');
    setProcessing(voterId, true);
    try {
      if (action === 'approve') {
        await approveVoter(voterId);
      } else {
        await rejectVoter(voterId);
      }
      setVoters((prev) => prev.filter((voter) => voter.id !== voterId));
    } catch (err) {
      console.error(`Failed to ${action} voter`, err);
      setError(`Failed to ${action} voter. Please try again.`);
    } finally {
      setProcessing(voterId, false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Loader message="Loading pending voters..." />;
    }

    if (voters.length === 0) {
      return (
        <p style={{ marginTop: '1rem', color: '#555', fontSize: '0.9rem' }}>
          There are currently no pending voter registrations.
        </p>
      );
    }

    return (
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            backgroundColor: '#fff',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                Voter ID
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                Identity Type
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                Submitted Date
              </th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                Status
              </th>
              <th style={{ textAlign: 'right', padding: '0.75rem', borderBottom: '1px solid #e0e0e0' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {voters.map((voter) => {
              const isProcessing = processingIds.has(voter.id);
              const createdAt = voter.createdAt ? new Date(voter.createdAt) : null;
              const formattedDate = createdAt ? createdAt.toLocaleString() : '—';

              return (
                <tr key={voter.id}>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0', fontFamily: 'monospace' }}>
                    {voter.id}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                    {voter.identityType}
                  </td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>{formattedDate}</td>
                  <td style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                    <StatusBadge status={voter.status} />
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                      borderBottom: '1px solid #f0f0f0',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleAction(voter.id, 'approve')}
                      disabled={isProcessing}
                      style={{
                        padding: '0.35rem 0.75rem',
                        marginRight: '0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid #2f7a4f',
                        backgroundColor: isProcessing ? '#e0e0e0' : '#2f7a4f',
                        color: '#fff',
                        cursor: isProcessing ? 'default' : 'pointer',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(voter.id, 'reject')}
                      disabled={isProcessing}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.8rem',
                        borderRadius: '4px',
                        border: '1px solid #a94442',
                        backgroundColor: isProcessing ? '#e0e0e0' : '#a94442',
                        color: '#fff',
                        cursor: isProcessing ? 'default' : 'pointer',
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 96px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <section
        style={{
          maxWidth: '640px',
          width: '100%',
          padding: '24px',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          border: '1px solid #dcdcdc',
        }}
      >
        <h1 style={{ fontSize: '18px', marginTop: 0, marginBottom: '8px', textAlign: 'left' }}>
          Admin Approval
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          Review and approve or reject pending voter registrations.
        </p>

        {error && (
          <div
            style={{
              marginTop: '16px',
              padding: '8px 12px',
              fontSize: '14px',
              borderRadius: '2px',
              border: '1px solid #feb2b2',
              backgroundColor: '#fff5f5',
              color: '#822727',
            }}
          >
            {error}
          </div>
        )}

        {renderContent()}
      </section>
    </div>
  );
};

export default AdminApproval;
