import api from './api';

export const electionService = {
  // Election APIs
  createElection: (data) => api.post('/admin/elections', data),
  getElection: (id)    => api.get(`/admin/elections/${id}`),
  getActiveElections: () => api.get('/kiosk/elections/active'),
  getAdminElections:  () => api.get('/admin/elections'),
  publishElection:    (id) => api.put(`/admin/elections/${id}/publish`),
  unpublishElection:  (id) => api.put(`/admin/elections/${id}/unpublish`),
  deleteElection:     (id) => api.delete(`/admin/elections/${id}`),

  // Ballot APIs
  createBallot:       (electionId, data) => api.post(`/admin/elections/${electionId}/ballots`, data),
  getElectionBallots: (electionId)       => api.get(`/admin/elections/${electionId}/ballots`),
  publishBallot:      (ballotId)         => api.put(`/admin/ballots/${ballotId}/publish`),
  unpublishBallot:    (ballotId)         => api.put(`/admin/ballots/${ballotId}/unpublish`),
  rollbackBallot: (ballotId, targetVersion) =>
    api.put(`/admin/ballots/${ballotId}/rollback/${targetVersion}`),

  // Candidate APIs
  getCandidates:      (ballotId)         => api.get(`/admin/ballots/${ballotId}/candidates`),
};

export default electionService;

