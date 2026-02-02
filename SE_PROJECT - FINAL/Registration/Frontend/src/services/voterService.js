import axios from 'axios';
import { encryptData } from '../utils/encryption';

const API_BASE_URL = 'http://localhost:8080/api';
const MOCK_USER_ID_KEY = 'mockUserId';
const JWT_TOKEN_KEY = 'jwtToken';

function generateMockObjectId() {
  const bytes = new Uint8Array(12);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getMockUserId() {
  let id = window.localStorage.getItem(MOCK_USER_ID_KEY);
  if (!id) {
    id = generateMockObjectId();
    window.localStorage.setItem(MOCK_USER_ID_KEY, id);
  }
  return id;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Interceptor
api.interceptors.request.use(async (config) => {
  let token = window.localStorage.getItem(JWT_TOKEN_KEY);
  const userId = getMockUserId();

  // If no token, login to get one (Mock login for migration)
  // ONLY if not already trying to login/register/public-key
  if (!token && !config.url.includes('/auth') && !config.url.includes('/voters/register')) {
    try {
      const role = config.url.includes('/admin/') ? 'ADMIN' : 'VOTER';

      const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
        userId: userId,
        role: role
      });
      token = loginRes.data.token;
      window.localStorage.setItem(JWT_TOKEN_KEY, token);
    } catch (err) {
      console.error("Auto-login failed", err);
      // Don't block the request, let it fail with 401/403 if token is missing
    }
  }

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Keep legacy header just in case, but Backend ignores it now for Auth
  config.headers['x-user-id'] = userId;

  return config;
});

export const fetchPublicKey = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/public-key`);
    return response.data.publicKey; // Expecting Base64 string
  } catch (error) {
    console.error("Failed to fetch public key", error);
    throw new Error("Unable to retrieve security headers from server.");
  }
};

export const registerVoter = async (payload) => {
  // Payload should ALREADY have identityProof encrypted if required,
  // OR we can do it here.
  // Requirement 4 says "In Register.jsx -> handleSubmit... Fetch public key... Encrypt... Send"
  // So encryption happens in Component? Or can I keep it here?
  // "In Register.jsx ... REPLACE WITH: - Fetch ... Encrypt ... Send"
  // Okay, I will expose fetchPublicKey here and let Component handle encryption to match requirements strictly.
  // BUT the previous implementation had it here.
  // The user requirement says: "In Register.jsx -> handleSubmit(): ... Fetch public key, Encrypt identityProof, Send encrypted Base64 string"
  // So Register.jsx should do the orchestration.
  // But wait, `registerVoter` here just takes `data`.
  // I will make `registerVoter` dumb - just POST the data it gets.
  return api.post('/voters/register', payload);
};

export const getMyVoterStatus = () => {
  const token = window.localStorage.getItem(JWT_TOKEN_KEY);
  if (!token) {
    // Return a resolved promise with null to indicate "not logged in" naturally?
    // Or a rejected promise? 
    // If App.jsx waits for this to decide where to route, rejection might be treated as error.
    // But the requirement says "Do NOT auto-call...". 
    // I will return a rejected promise that allows the caller to know "no session".
    return Promise.reject({
      isNoSession: true,
      message: "No active session"
    });
  }
  return api.get('/voters/me');
};

// Admin endpoints
export const getPendingVoters = async () => {
  return api.get('/admin/voters/pending');
};

export const approveVoter = (voterId) => {
  return api.put(`/admin/voters/${voterId}/approve`);
};

export const rejectVoter = (voterId) => {
  return api.put(`/admin/voters/${voterId}/reject`);
};
