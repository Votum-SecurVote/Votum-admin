import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

// Mock react-router-dom useNavigate hook
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderNavbar = (initialPath = '/admin/election/create') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  test('renders navbar with logo and navigation links', () => {
    renderNavbar();

    // Check logo is rendered
    expect(screen.getByText('SecureVote Admin')).toBeInTheDocument();

    // Check navigation links are rendered
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Ballot')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  test('shows Sign In button when user is not authenticated', () => {
    renderNavbar();

    const signInButton = screen.getByText('Sign In');
    expect(signInButton).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  test('shows Logout button when admin user is authenticated', async () => {
    localStorage.setItem('auth', JSON.stringify({ id: '1', role: 'ADMIN', token: 'test-token' }));
    
    renderNavbar();

    // Wait for AuthContext to load from localStorage
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  test('disables admin-only links when user is not admin', async () => {
    localStorage.setItem('auth', JSON.stringify({ id: '1', role: 'USER', token: 'test-token' }));
    
    renderNavbar();

    await waitFor(() => {
      // Admin links should be disabled for non-admin users
      const createLink = screen.getByText('Create').closest('a');
      expect(createLink).toHaveAttribute('title', 'You do not have permission to perform this action');
    });
  });

  test('enables admin links when user is admin', async () => {
    localStorage.setItem('auth', JSON.stringify({ id: '1', role: 'ADMIN', token: 'test-token' }));
    
    renderNavbar();

    await waitFor(() => {
      const createLink = screen.getByText('Create').closest('a');
      expect(createLink).not.toHaveAttribute('title', 'You do not have permission to perform this action');
    });
  });

  test('navigates to login page when Sign In button is clicked', () => {
    renderNavbar();

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('calls logout and navigates when Logout button is clicked', async () => {
    localStorage.setItem('auth', JSON.stringify({ id: '1', role: 'ADMIN', token: 'test-token' }));
    
    renderNavbar();

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/elections/public');
      // Check that auth is cleared from localStorage
      expect(localStorage.getItem('auth')).toBeNull();
    });
  });

  test('navigates to public elections when logo is clicked', () => {
    renderNavbar();

    const logo = screen.getByText('SecureVote Admin');
    fireEvent.click(logo);

    expect(mockNavigate).toHaveBeenCalledWith('/elections/public');
  });

  test('highlights active navigation link based on current pathname', () => {
    renderNavbar('/admin/election/create');

    const createLink = screen.getByText('Create').closest('a');
    expect(createLink).toHaveClass('active');
  });

  test('handles edge case: empty user object', async () => {
    localStorage.setItem('auth', JSON.stringify({}));
    
    renderNavbar();

    await waitFor(() => {
      // Should show Sign In since role is not ADMIN
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  test('handles edge case: invalid localStorage auth data', async () => {
    localStorage.setItem('auth', 'invalid-json');
    
    renderNavbar();

    await waitFor(() => {
      // Should handle gracefully and show Sign In
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
});
