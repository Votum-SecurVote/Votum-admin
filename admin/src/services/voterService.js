import api from "./api";

const getPendingVoters = () => {
  return api.get("/admin/pending-users");
};

const approveVoter = (userId) => {
  return api.put(`/admin/approve/${userId}`);
};

const rejectVoter = (userId) => {
  return api.put(`/admin/reject/${userId}`);
};

const getAllVoters = () => {
  return api.get("/admin/users");
};

export default {
  getPendingVoters,
  approveVoter,
  rejectVoter,
  getAllVoters,
};
