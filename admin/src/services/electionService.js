import api from "./api";

const electionService = {

  // ✅ GET all elections
  getAdminElections: async () => {
    const response = await api.get("/admin/elections");
    return response.data;
  },

  // ✅ GET ballots of one election
  getElectionBallots: async (electionId) => {
    const response = await api.get(
      `/admin/elections/${electionId}/ballots`
    );
    return response.data;
  },

  // ✅ CREATE election
  createElection: async (payload) => {
    const response = await api.post("/admin/elections", payload);
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

  // ✅ CREATE candidate
  createCandidate: async (ballotId, payload) => {
    const response = await api.post(
      `/admin/ballots/${ballotId}/candidates`,
      payload
    );
    return response.data;
  },

  getBallotCandidates: async (ballotId) => {
    const response = await api.get(
      `/admin/ballots/${ballotId}/candidates`
    );
    return response.data;
  },


};

export default electionService;
