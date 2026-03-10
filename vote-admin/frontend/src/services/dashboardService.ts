import api from './api';

export interface DashboardStats {
  totalElections: number;
  activeElections: number;
  pendingCandidates: number;
  approvedCandidates: number;
  recentActivity: string[];
}

const dashboardService = {
  // Get dashboard statistics from the backend admin metrics endpoint
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },
};

export default dashboardService;