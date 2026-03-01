import api from './api';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description?: string;
  imageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  electionId: string;
  ballotId: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateApprovalRequest {
  candidateId: string;
  action: 'APPROVE' | 'REJECT';
  remarks?: string;
}

export interface BulkApprovalRequest {
  candidateIds: string[];
  action: 'APPROVE' | 'REJECT';
  remarks?: string;
}

const candidateService = {
  // Get all candidates with filters
  getCandidates: async (filters?: {
    electionId?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    ballotId?: string;
  }): Promise<Candidate[]> => {
    const params = new URLSearchParams();
    if (filters?.electionId) params.append('electionId', filters.electionId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ballotId) params.append('ballotId', filters.ballotId);

    const response = await api.get(`/candidates?${params.toString()}`);
    return response.data;
  },

  // Get single candidate
  getCandidate: async (candidateId: string): Promise<Candidate> => {
    const response = await api.get(`/candidates/${candidateId}`);
    return response.data;
  },

  // Approve/Reject single candidate
  approveCandidate: async (request: CandidateApprovalRequest): Promise<Candidate> => {
    const response = await api.post(`/candidates/${request.candidateId}/approve`, {
      action: request.action,
      remarks: request.remarks,
    });
    return response.data;
  },

  // Bulk approve/reject candidates
  bulkApproveCandidates: async (request: BulkApprovalRequest): Promise<{ success: boolean; count: number }> => {
    const response = await api.post('/candidates/bulk-approve', request);
    return response.data;
  },
};

export default candidateService;
