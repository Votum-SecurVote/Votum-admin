import api from './api';

export interface DashboardStats {
  totalElections: number;
  activeElections: number;
  pendingCandidates: number;
  approvedCandidates: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'ELECTION' | 'CANDIDATE' | 'BALLOT';
  action: string;
  description: string;
  timestamp: string;
  user?: string;
}

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
