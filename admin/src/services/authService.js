import api from "./api";

/**
 * Login as admin.
 * Backend POST /api/admin/login returns a plain JWT string.
 */
export const loginAdmin = async (email, password) => {
  const response = await api.post("/admin/login", { email, password });
  // response.data is the raw JWT token string (not an object)
  return response.data;
};

