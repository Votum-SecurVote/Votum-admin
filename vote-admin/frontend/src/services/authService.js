import api from './api';

/**
 * Login as admin.
 * Backend: POST /api/admin/login
 * Returns: plain JWT string
 */
export const loginAdmin = async (email, password) => {
  const res = await api.post('/admin/login', { email, password });

  // Backend returns a plain JWT string, not an object
  const token = res.data;

  localStorage.setItem(
    'auth',
    JSON.stringify({ token, role: 'ADMIN' })
  );

  return { token, role: 'ADMIN' };
};

