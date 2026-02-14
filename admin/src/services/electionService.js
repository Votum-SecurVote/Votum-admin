import api from "./api";

const electionService = {
  createElection: async (payload) => {
    const response = await api.post("/admin/elections", payload);
    return response.data;   // return election object
  }
};

export default electionService;
