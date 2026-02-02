import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'
const JWT_TOKEN_KEY = 'jwtToken'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use(async (config) => {
  let token = window.localStorage.getItem(JWT_TOKEN_KEY)

  // Auto-login as ADMIN for migration/dev simplicity
  // Ideally this would be a real login screen
  if (!token) {
    try {
      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        userId: 'admin-user', // Hardcoded admin user for dev flow
        role: 'ADMIN'
      });
      token = loginRes.data.token;
      window.localStorage.setItem(JWT_TOKEN_KEY, token);
    } catch (e) {
      console.error("Admin auto-login failed", e);
    }
  } else {
    // Check if token is Admin, if not, refresh
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'ADMIN') {
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          userId: 'admin-user',
          role: 'ADMIN'
        });
        token = loginRes.data.token;
        window.localStorage.setItem(JWT_TOKEN_KEY, token);
      }
    } catch (e) { }
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
})

export const getPendingVoters = async () => {
  const response = await apiClient.get('/admin/voters/pending')
  return response.data
}

export const approveVoter = async (voterId) => {
  const response = await apiClient.put(`/admin/voters/${voterId}/approve`)
  return response.data
}

export const rejectVoter = async (voterId) => {
  const response = await apiClient.put(`/admin/voters/${voterId}/reject`)
  return response.data
}
