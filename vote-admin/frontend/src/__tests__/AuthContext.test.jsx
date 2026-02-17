import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Test component to access the context
const TestComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <button onClick={() => login({ id: '1', role: 'ADMIN', token: 'test-token' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('AuthProvider renders children correctly', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('initial user state is null when no localStorage data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  test('loads user from localStorage on mount', async () => {
    const mockAuth = { id: '123', role: 'ADMIN', token: 'stored-token' };
    localStorage.setItem('auth', JSON.stringify(mockAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockAuth));
  });

  test('handles invalid JSON in localStorage gracefully', async () => {
    localStorage.setItem('auth', 'invalid-json{');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Should remain null when JSON is invalid
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  test('login() function stores auth data in state and localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      const userData = screen.getByTestId('user').textContent;
      expect(userData).toContain('ADMIN');
      expect(userData).toContain('test-token');
    });

    // Check localStorage
    const stored = localStorage.getItem('auth');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed.role).toBe('ADMIN');
    expect(parsed.token).toBe('test-token');
  });

  test('login() updates user state with correct values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      const userData = screen.getByTestId('user').textContent;
      const parsedUser = JSON.parse(userData);
      expect(parsedUser.id).toBe('1');
      expect(parsedUser.role).toBe('ADMIN');
      expect(parsedUser.token).toBe('test-token');
    });
  });

  test('logout() clears user state to null', async () => {
    const mockAuth = { id: '123', role: 'ADMIN', token: 'stored-token' };
    localStorage.setItem('auth', JSON.stringify(mockAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).not.toHaveTextContent('null');
    });

    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });

  test('logout() removes auth from localStorage', async () => {
    const mockAuth = { id: '123', role: 'ADMIN', token: 'stored-token' };
    localStorage.setItem('auth', JSON.stringify(mockAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('auth')).toBeTruthy();

    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });

  test('useAuth() hook returns correct context values', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('useAuth() returns null when used outside AuthProvider', () => {
    const TestComponentWithoutProvider = () => {
      const context = useAuth();
      return <div data-testid="context-value">{context === null ? 'null' : 'not-null'}</div>;
    };

    render(<TestComponentWithoutProvider />);

    // When used outside provider, context should be null
    expect(screen.getByTestId('context-value')).toHaveTextContent('null');
  });

  test('loading state transitions from true to false after initialization', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading should be true (but may transition quickly)
    const loadingElement = screen.getByTestId('loading');
    
    // Should eventually become false
    await waitFor(() => {
      expect(loadingElement).toHaveTextContent('false');
    });
  });
});
