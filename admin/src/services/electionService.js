import api from "./api";

const electionService = {

  /* ================================
        ELECTION
     ================================ */

  // ✅ GET all elections
  getAdminElections: async () => {
    const response = await api.get("/admin/elections");
    return response.data;
  },

  // ✅ CREATE election
  createElection: async (payload) => {
    const response = await api.post("/admin/elections", payload);
    return response.data;
  },

  // ✅ PUBLISH election
  publishElection: async (electionId) => {
    const response = await api.put(
      `/admin/elections/${electionId}/publish`
    );
    return response.data;
  },

  // ✅ UNPUBLISH election
  unpublishElection: async (electionId) => {
    const response = await api.put(
      `/admin/elections/${electionId}/unpublish`
    );
    return response.data;
  },

  // ✅ DELETE election
  deleteElection: async (electionId) => {
    const response = await api.delete(
      `/admin/elections/${electionId}`
    );
    return response.data;
  },

  /* ================================
        BALLOT
     ================================ */

  // ✅ GET ballots of one election
  getElectionBallots: async (electionId) => {
    const response = await api.get(
      `/admin/elections/${electionId}/ballots`
    );
    return response.data;
  },

  // ✅ CREATE ballot
  createBallot: async (electionId, payload) => {
    const response = await api.post(
      `/admin/elections/${electionId}/ballots`,
      payload
    );
    return response.data;
  },

  // ✅ PUBLISH ballot
  publishBallot: async (ballotId) => {
    const response = await api.put(
      `/admin/ballots/${ballotId}/publish`
    );
    return response.data;
  },

  // ✅ UNPUBLISH ballot
  unpublishBallot: async (ballotId) => {
    const response = await api.put(
      `/admin/ballots/${ballotId}/unpublish`
    );
    return response.data;
  },

  // ✅ ROLLBACK ballot
  rollbackBallot: async (ballotId, version) => {
    const response = await api.put(
      `/admin/ballots/${ballotId}/rollback/${version}`
    );
    return response.data;
  },

  /* ================================
        CANDIDATE
     ================================ */

  // ✅ CREATE candidate
  createCandidate: async (ballotId, payload) => {
    const response = await api.post(
      `/admin/ballots/${ballotId}/candidates`,
      payload
    );
    return response.data;
  },

  // ✅ GET ballot candidates
  getBallotCandidates: async (ballotId) => {
    const response = await api.get(
      `/admin/ballots/${ballotId}/candidates`
    );
    return response.data;
  },
};

export default electionService;
