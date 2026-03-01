import api from './api';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PUBLISH' | 'UNPUBLISH';
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  actionType?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const auditService = {
  // Get audit logs with filters and pagination
  getAuditLogs: async (filters?: AuditLogFilters): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.actionType) params.append('actionType', filters.actionType);
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/audit-logs?${params.toString()}`);
    return response.data;
  },

  // Get single audit log
  getAuditLog: async (logId: string): Promise<AuditLog> => {
    const response = await api.get(`/audit-logs/${logId}`);
    return response.data;
  },
};

export default auditService;
