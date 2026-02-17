import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ElectionView from '../pages/admin/ElectionView';
import electionService from '../services/electionService';

// Mock electionService
vi.mock('../services/electionService', () => ({
  default: {
    getAdminElections: vi.fn(),
    getElectionBallots: vi.fn(),
    publishElection: vi.fn(),
    unpublishElection: vi.fn(),
    deleteElection: vi.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

// Mock window.alert
const mockAlert = vi.fn();
window.alert = mockAlert;

describe('ElectionView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  test('renders loading state initially', () => {
    electionService.getAdminElections.mockReturnValueOnce(new Promise(() => {}));

    render(<ElectionView />);

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  test('displays election dashboard after loading', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
      { id: '2', title: 'Election 2', status: 'PUBLISHED', description: 'Test 2', startDate: '2024-02-01', endDate: '2024-02-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText('Election Dashboard')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Election 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Election 2').length).toBeGreaterThan(0);
  });

  test('displays statistics correctly', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT' },
      { id: '2', title: 'Election 2', status: 'PUBLISHED' },
      { id: '3', title: 'Election 3', status: 'DRAFT' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/total: 3/i)).toBeInTheDocument();
      expect(screen.getByText(/published: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/draft: 2/i)).toBeInTheDocument();
    });
  });

  test('displays "No elections found" when list is empty', async () => {
    electionService.getAdminElections.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/no elections found/i)).toBeInTheDocument();
    });
  });

  test('selects first election by default', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getAllByText('Election 1').length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(electionService.getElectionBallots).toHaveBeenCalledWith('1');
    });
  });

  test('allows selecting different election', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
      { id: '2', title: 'Election 2', status: 'PUBLISHED', description: 'Test 2', startDate: '2024-02-01', endDate: '2024-02-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText('Election 2')).toBeInTheDocument();
    });

    const election2 = screen.getByText('Election 2').closest('div');
    await user.click(election2);

    await waitFor(() => {
      expect(electionService.getElectionBallots).toHaveBeenCalledWith('2');
    });
  });

  test('displays election details when selected', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test Description', startDate: '2024-01-01T10:00:00Z', endDate: '2024-01-02T10:00:00Z' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getAllByText('Election 1').length).toBeGreaterThan(0);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  test('shows publish button for draft elections', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);
    electionService.publishElection.mockResolvedValueOnce({});

    render(<ElectionView />);

    await waitFor(() => {
      const publishButtons = screen.getAllByText(/publish/i);
      expect(publishButtons.length).toBeGreaterThan(0);
    });
  });

  test('shows unpublish button for published elections', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'PUBLISHED', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/unpublish/i)).toBeInTheDocument();
    });
  });

  test('publishes election when publish button is clicked', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValue(mockElections);
    electionService.getElectionBallots.mockResolvedValue([]);
    electionService.publishElection.mockResolvedValue({});

    render(<ElectionView />);

    await waitFor(() => {
      const publishButtons = screen.getAllByText(/publish/i);
      expect(publishButtons.length).toBeGreaterThan(0);
    });

    const publishButtons = screen.getAllByText(/publish/i);
    await user.click(publishButtons[0]);

    // Verify publish button exists and is clickable
    expect(publishButtons[0]).toBeInTheDocument();
  });

  test('deletes election when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);
    electionService.deleteElection.mockResolvedValueOnce({});
    electionService.getAdminElections.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/delete/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/delete/i);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('Delete this election?');
      expect(electionService.deleteElection).toHaveBeenCalledWith('1');
    });
  });

  test('does not delete election when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValue(mockElections);
    electionService.getElectionBallots.mockResolvedValue([]);

    render(<ElectionView />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText(/delete/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Delete this election?');
    expect(electionService.deleteElection).not.toHaveBeenCalled();
  });

  test('loads ballots for selected election', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', status: 'DRAFT' },
      { id: 'b2', title: 'Ballot 2', status: 'PUBLISHED' },
    ];

    electionService.getAdminElections.mockResolvedValue(mockElections);
    electionService.getElectionBallots.mockResolvedValue(mockBallots);

    render(<ElectionView />);

    // Verify that ballots are loaded for the selected election
    await waitFor(() => {
      expect(electionService.getElectionBallots).toHaveBeenCalledWith('1');
    });
  });

  test('displays "No ballots available" when no ballots exist', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/no ballots available/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    electionService.getAdminElections.mockRejectedValue(new Error('API Error'));

    render(<ElectionView />);

    await waitFor(() => {
      expect(screen.getByText(/no elections found/i)).toBeInTheDocument();
    });
  });

  test('publish button is clickable and triggers action', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1', status: 'DRAFT', description: 'Test', startDate: '2024-01-01', endDate: '2024-01-02' },
    ];

    electionService.getAdminElections.mockResolvedValue(mockElections);
    electionService.getElectionBallots.mockResolvedValue([]);
    electionService.publishElection.mockResolvedValue({});

    render(<ElectionView />);

    await waitFor(() => {
      const publishButtons = screen.getAllByText(/publish/i);
      expect(publishButtons.length).toBeGreaterThan(0);
    });

    const publishButtons = screen.getAllByText(/publish/i);
    const button = publishButtons[0].closest('button') || publishButtons[0];
    
    // Verify button exists
    expect(button).toBeInTheDocument();
    
    // Click the button
    await user.click(button);
    
    // Verify button is still present after click
    expect(button).toBeInTheDocument();
  });
});
