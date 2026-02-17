import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from '../routes/AdminRoute';

// Mock child component
const TestChild = () => <div>Protected Content</div>;

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderAdminRoute = (initialEntries = ['/admin']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<TestChild />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('allows access when user is authenticated admin', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'ADMIN' }));

    renderAdminRoute();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when no auth is stored', () => {
    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Navigate component redirects to /login (tested by absence of protected content)
  });

  test('redirects to login when token is missing', () => {
    localStorage.setItem('auth', JSON.stringify({ role: 'ADMIN' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when role is not ADMIN', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'USER' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('redirects to login when role is missing', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'test-token' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('auth', 'invalid-json');

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('handles empty auth object', () => {
    localStorage.setItem('auth', JSON.stringify({}));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('handles null token value', () => {
    localStorage.setItem('auth', JSON.stringify({ token: null, role: 'ADMIN' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('handles empty string token', () => {
    localStorage.setItem('auth', JSON.stringify({ token: '', role: 'ADMIN' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('case-sensitive role check (admin vs ADMIN)', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'admin' }));

    renderAdminRoute();

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
