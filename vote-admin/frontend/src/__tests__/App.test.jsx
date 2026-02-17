import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock CSS import
vi.mock('../styles/adminTheme.css', () => ({}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
  Navigate: () => <div data-testid="navigate">Navigate</div>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children, mode }) => (
    <div data-testid="animate-presence" data-mode={mode}>{children}</div>
  ),
}));

// Mock components
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../components/PageTransition', () => ({
  default: ({ children }) => <div data-testid="page-transition">{children}</div>,
}));

vi.mock('../pages/admin/Login', () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));

vi.mock('../pages/admin/ElectionView', () => ({
  default: () => <div data-testid="election-view">ElectionView</div>,
}));

vi.mock('../pages/admin/ElectionCreate', () => ({
  default: () => <div data-testid="election-create">ElectionCreate</div>,
}));

vi.mock('../pages/admin/BallotDesigner', () => ({
  default: () => <div data-testid="ballot-designer">BallotDesigner</div>,
}));

vi.mock('../routes/AdminRoute.jsx', () => ({
  default: () => <div data-testid="admin-route">AdminRoute</div>,
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('App renders without crashing', async () => {
    const App = (await import('../App')).default;
    const { container } = render(<App />);

    expect(container).toBeInTheDocument();
  });

  test('Navbar is rendered', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('BrowserRouter wraps the application', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  });

  test('Routes component is present', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  test('AnimatePresence is configured with mode="wait"', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    const animatePresence = screen.getByTestId('animate-presence');
    expect(animatePresence).toBeInTheDocument();
    expect(animatePresence).toHaveAttribute('data-mode', 'wait');
  });

  test('app has proper structure with app div', async () => {
    const App = (await import('../App')).default;
    const { container } = render(<App />);

    const appDiv = container.querySelector('.app');
    expect(appDiv).toBeInTheDocument();
  });

  test('all main components are imported and used', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    // Verify key components are present
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
  });

  test('Routes are defined in the app', async () => {
    const App = (await import('../App')).default;
    render(<App />);

    // Should have Routes component
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    
    // Should have multiple Route components
    const routes = screen.getAllByTestId('route');
    expect(routes.length).toBeGreaterThan(0);
  });

  test('app structure follows expected hierarchy', async () => {
    const App = (await import('../App')).default;
    const { container } = render(<App />);

    // Router > div.app > Navbar + AnimatePresence > Routes
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(container.querySelector('.app')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('animate-presence')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});
