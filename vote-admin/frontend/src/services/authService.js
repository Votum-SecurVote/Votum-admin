/**
 * UI-only mock auth service.
 *
 * This lets the admin UI work fully without any backend running.
 * Your backend teammate can later replace this with real API calls.
 */

// Called from the Login screen – pretends to authenticate any
// non-empty username/password and stores a fake ADMIN token.
export const loginAdmin = async (username, password) => {
  if (!username || !password) {
    throw new Error('Username and password are required');
  }

  // Simulated backend response
  const mockResponse = {
    token: 'mock-admin-token',
    role: 'ADMIN',
    username,
  };

  // Persist the mock auth so AdminRoute and the rest of the UI work as usual
  localStorage.setItem(
    'auth',
    JSON.stringify({
      token: mockResponse.token,
      role: mockResponse.role,
      username: mockResponse.username,
    })
  );

  return mockResponse;
};

