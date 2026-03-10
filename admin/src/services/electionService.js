import api from "./api";

const electionService = {

  /* ================================
        ELECTION
     ================================ */

  // GET all elections
  getAdminElections: async () => {
    const response = await api.get("/admin/elections");
    return response.data;
  },

  // CREATE election
  createElection: async (payload) => {
    const response = await api.post("/admin/elections", payload);
    return response.data;
  },

  // PUBLISH election
  publishElection: async (electionId) => {
    const response = await api.put(`/admin/elections/${electionId}/publish`);
    return response.data;
  },

  // UNPUBLISH election
  unpublishElection: async (electionId) => {
    const response = await api.put(`/admin/elections/${electionId}/unpublish`);
    return response.data;
  },

  // DELETE election
  deleteElection: async (electionId) => {
    const response = await api.delete(`/admin/elections/${electionId}`);
    return response.data;
  },

  /* ================================
        BALLOT
     ================================ */

  // GET ballots of one election
  getElectionBallots: async (electionId) => {
    const response = await api.get(`/admin/elections/${electionId}/ballots`);
    return response.data;
  },

  // CREATE ballot
  createBallot: async (electionId, payload) => {
    const response = await api.post(`/admin/elections/${electionId}/ballots`, payload);
    return response.data;
  },

  /* ================================
        CANDIDATE
     ================================ */

  // GET ballot candidates
  getBallotCandidates: async (ballotId) => {
    const response = await api.get(`/admin/ballots/${ballotId}/candidates`);
    return response.data;
  },

  /**
   * CREATE candidate — Backend requires multipart/form-data with:
   *   - "request": JSON string of { name, party }
   *   - "photo": optional image file
   *   - "symbol": optional image file
   */
  createCandidate: async (ballotId, payload, photoFile = null, symbolFile = null) => {
    const formData = new FormData();

    // Append the JSON part as a string blob
    formData.append(
      "request",
      new Blob([JSON.stringify({ name: payload.name, party: payload.party })], {
        type: "application/json",
      })
    );

    if (photoFile instanceof File) {
      formData.append("photo", photoFile);
    }
    if (symbolFile instanceof File) {
      formData.append("symbol", symbolFile);
    }

    const response = await api.post(
      `/admin/ballots/${ballotId}/candidates`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },
};

export default electionService;


