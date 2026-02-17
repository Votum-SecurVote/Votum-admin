import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token (JWT-based RBAC)
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { token } = JSON.parse(stored);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export const electionService = {
  // Election APIs
  createElection: (data) => api.post('/elections', data),
  getElection: (id) => api.get(`/elections/${id}`),
  getActiveElections: () => api.get('/elections/active'),
  getAdminElections: () => api.get('/elections/admin'),
  publishElection: (id) => api.post(`/elections/${id}/publish`),
  unpublishElection: (id) => api.post(`/elections/${id}/unpublish`),
  deleteElection: (id) => api.delete(`/elections/${id}`),
  
  // Ballot APIs (versioned by election)
  createBallot: (electionId, data) => api.post(`/elections/${electionId}/ballots`, data),
  getElectionBallots: (electionId) => api.get(`/elections/${electionId}/ballots`),
  publishBallot: (ballotId) => api.post(`/ballots/${ballotId}/publish`),
  unpublishBallot: (ballotId) => api.post(`/ballots/${ballotId}/unpublish`),
  rollbackBallot: (ballotId, targetVersion) =>
    api.post(`/ballots/${ballotId}/rollback`, { targetVersion }),
};

export default electionService;
