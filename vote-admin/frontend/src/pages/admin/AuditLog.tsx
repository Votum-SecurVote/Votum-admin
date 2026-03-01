import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiChevronDown, FiChevronUp, FiFileText } from 'react-icons/fi';
import auditService, { AuditLog, AuditLogFilters } from '../../services/auditService';
import Loader from '../../components/Loader';
import AnimatedCard from '../../components/AnimatedCard';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    font-size: 2rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--text-muted);
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

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  &:hover {
    background: var(--bg-hover);
  }
`;

const ActionBadge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    const colors: Record<string, string> = {
      CREATE: 'var(--success)15',
      UPDATE: 'var(--info)15',
      DELETE: 'var(--danger)15',
      APPROVE: 'var(--success)15',
      REJECT: 'var(--danger)15',
      PUBLISH: 'var(--success)15',
      UNPUBLISH: 'var(--warning)15',
    };
    return colors[props.type] || 'var(--text-muted)15';
  }};
  color: ${props => {
    const colors: Record<string, string> = {
      CREATE: 'var(--success)',
      UPDATE: 'var(--info)',
      DELETE: 'var(--danger)',
      APPROVE: 'var(--success)',
      REJECT: 'var(--danger)',
      PUBLISH: 'var(--success)',
      UNPUBLISH: 'var(--warning)',
    };
    return colors[props.type] || 'var(--text-muted)';
  }};
`;

const ExpandedRow = styled.tr`
  background: var(--bg-secondary);
  td {
    padding: 1rem 1rem 1rem 4rem !important;
  }
`;

const DetailsContainer = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1rem;
  pre {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-primary);
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
`;

const PaginationInfo = styled.span`
  color: var(--text-muted);
  font-size: 0.875rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: ${props => (props.active ? 'var(--primary)' : 'white')};
  color: ${props => (props.active ? 'white' : 'var(--text-primary)')};
  cursor: pointer;
  font-weight: ${props => (props.active ? '600' : '400')};
  transition: all var(--transition-fast);
  &:hover:not(:disabled) {
    background: ${props => (props.active ? 'var(--primary-hover)' : 'var(--bg-hover)')};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getAuditLogs(filters);
      setLogs(response.logs);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      });
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      alert('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  if (loading) {
    return <Loader message="Loading audit logs..." />;
  }

  return (
    <PageContainer>
      <Header>
        <h1>Audit Log</h1>
        <p>Track all system actions and changes</p>
      </Header>

      <FiltersBar>
        <FilterGroup>
          <label>Action Type</label>
          <select
            value={filters.actionType || ''}
            onChange={e => setFilters({ ...filters, actionType: e.target.value || undefined, page: 1 })}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="PUBLISH">Publish</option>
            <option value="UNPUBLISH">Unpublish</option>
          </select>
        </FilterGroup>

        <FilterGroup>
          <label>Entity Type</label>
          <select
            value={filters.entityType || ''}
            onChange={e => setFilters({ ...filters, entityType: e.target.value || undefined, page: 1 })}
          >
            <option value="">All Entities</option>
            <option value="ELECTION">Election</option>
            <option value="BALLOT">Ballot</option>
            <option value="CANDIDATE">Candidate</option>
          </select>
        </FilterGroup>

        <FilterGroup>
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
          />
        </FilterGroup>

        <FilterGroup>
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
          />
        </FilterGroup>
      </FiltersBar>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <td>{log.username || log.userId}</td>
                    <td>
                      <ActionBadge type={log.actionType}>{log.actionType}</ActionBadge>
                    </td>
                    <td>{log.entityType}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {log.entityId.slice(-8)}
                    </td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>
                      <ExpandButton onClick={() => toggleExpand(log.id)}>
                        {expandedRows.has(log.id) ? <FiChevronUp /> : <FiChevronDown />}
                        {expandedRows.has(log.id) ? 'Hide' : 'Show'} Details
                      </ExpandButton>
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && (
                    <ExpandedRow>
                      <td colSpan={6}>
                        <DetailsContainer>
                          <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                            Full Details:
                          </div>
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          {log.ipAddress && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                              IP: {log.ipAddress}
                            </div>
                          )}
                        </DetailsContainer>
                      </td>
                    </ExpandedRow>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </Table>

        {pagination.totalPages > 1 && (
          <Pagination>
            <PaginationInfo>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </PaginationInfo>
            <PaginationButtons>
              <PageButton
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </PageButton>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PageButton
                    key={page}
                    active={pagination.page === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PageButton>
                );
              })}
              <PageButton
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </PageButton>
            </PaginationButtons>
          </Pagination>
        )}
      </TableContainer>
    </PageContainer>
  );
};

export default AuditLogPage;
