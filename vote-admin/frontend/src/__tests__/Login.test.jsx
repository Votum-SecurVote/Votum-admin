import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Login from '../pages/admin/Login';
import { AuthProvider } from '../context/AuthContext';
import * as authService from '../services/authService';

// Mock authService
vi.mock('../services/authService', () => ({
  loginAdmin: vi.fn(),
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  test('renders login form with all required elements', () => {
    renderLogin();

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('allows user to type in username field', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    await user.type(usernameInput, 'admin');

    expect(usernameInput).toHaveValue('admin');
  });

  test('allows user to type in password field', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('Password');
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  test('shows error message when login fails', async () => {
    const user = userEvent.setup();
    authService.loginAdmin.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('successfully logs in and navigates on valid credentials', async () => {
    const user = userEvent.setup();
    const mockAuthData = { token: 'test-token', role: 'ADMIN' };
    authService.loginAdmin.mockResolvedValueOnce(mockAuthData);

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.loginAdmin).toHaveBeenCalledWith('admin', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/election/view');
    });

    // Check that auth is stored in localStorage
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    expect(storedAuth).toEqual({ token: 'test-token', role: 'ADMIN' });
  });

  test('shows loading state during login', async () => {
    const user = userEvent.setup();
    // Create a promise that we can control
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    authService.loginAdmin.mockReturnValueOnce(loginPromise);

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve the promise
    resolveLogin({ token: 'test-token', role: 'ADMIN' });
  });

  test('disables submit button when loading', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    authService.loginAdmin.mockReturnValueOnce(loginPromise);

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    resolveLogin({ token: 'test-token', role: 'ADMIN' });
  });

  test('clears error message on new submission attempt', async () => {
    const user = userEvent.setup();
    authService.loginAdmin
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce({ token: 'test-token', role: 'ADMIN' });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // First submission - error
    await user.type(usernameInput, 'wrong');
    await user.type(passwordInput, 'wrong');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first error/i)).toBeInTheDocument();
    });

    // Second submission - success
    await user.clear(usernameInput);
    await user.clear(passwordInput);
    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/first error/i)).not.toBeInTheDocument();
    });
  });

  test('handles generic error message when error has no message', async () => {
    const user = userEvent.setup();
    authService.loginAdmin.mockRejectedValueOnce(new Error());

    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(usernameInput, 'admin');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  test('prevents form submission with empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /login/i });
    
    // Try to submit without filling fields
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(authService.loginAdmin).not.toHaveBeenCalled();
  });

  test('handles edge case: empty username after typing', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByPlaceholderText('Username');
    await user.type(usernameInput, 'test');
    await user.clear(usernameInput);

    expect(usernameInput).toHaveValue('');
  });
});
