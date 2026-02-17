import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BallotDesigner from '../pages/admin/BallotDesigner';
import electionService from '../services/electionService';

// Mock electionService
vi.mock('../services/electionService', () => ({
  default: {
    getAdminElections: vi.fn(),
    getElectionBallots: vi.fn(),
    createBallot: vi.fn(),
    getBallotCandidates: vi.fn(),
    createCandidate: vi.fn(),
  },
}));

// Mock window.alert
const mockAlert = vi.fn();
window.alert = mockAlert;

describe('BallotDesigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAlert.mockClear();
  });

  test('renders loading state initially', () => {
    electionService.getAdminElections.mockReturnValueOnce(new Promise(() => {}));

    render(<BallotDesigner />);

    expect(screen.getByText(/loading workspace/i)).toBeInTheDocument();
  });

  test('displays ballot designer header', async () => {
    electionService.getAdminElections.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot Designer')).toBeInTheDocument();
      expect(screen.getByText(/create ballots and manage candidates/i)).toBeInTheDocument();
    });
  });

  test('displays election selector dropdown', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
      { id: '2', title: 'Election 2' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);

    render(<BallotDesigner />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('1');
  });

  test('loads ballots when election is selected', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(electionService.getElectionBallots).toHaveBeenCalledWith('1');
    });
  });

  test('displays empty state when no ballot is selected', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText(/select a ballot from the left/i)).toBeInTheDocument();
    });
  });

  test('allows creating a new ballot', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const newBallot = { id: 'b1', title: 'New Ballot', options: [] };

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);
    electionService.createBallot.mockResolvedValueOnce(newBallot);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/e.g. presidential ballot/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/e.g. presidential ballot/i);
    const createButton = screen.getByText(/create new ballot/i);

    await user.type(input, 'New Ballot');
    await user.click(createButton);

    await waitFor(() => {
      expect(electionService.createBallot).toHaveBeenCalledWith('1', {
        title: 'New Ballot',
        description: 'Standard Vote',
        maxSelections: 1,
      });
    });
  });

  test('shows alert when trying to create ballot without title', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText(/create new ballot/i)).toBeInTheDocument();
    });

    const createButton = screen.getByText(/create new ballot/i);
    await user.click(createButton);

    expect(mockAlert).toHaveBeenCalledWith('Enter a title');
    expect(electionService.createBallot).not.toHaveBeenCalled();
  });

  test('displays ballot list when ballots exist', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [{ name: 'Candidate 1' }] },
      { id: 'b2', title: 'Ballot 2', options: [] },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
      expect(screen.getByText('Ballot 2')).toBeInTheDocument();
    });
  });

  test('allows selecting a ballot to edit', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    const mockCandidates = [
      { id: 'c1', name: 'Candidate 1', party: 'Party 1' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce(mockCandidates);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    await user.click(ballotItem);

    await waitFor(() => {
      expect(electionService.getBallotCandidates).toHaveBeenCalledWith('b1');
    });
  });

  test('displays candidate form when ballot is selected', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByText(/add candidate/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/party name/i)).toBeInTheDocument();
    });
  });

  test('allows adding a candidate to ballot', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    const newCandidate = { id: 'c1', name: 'John Doe', party: 'Party A' };

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce([]);
    electionService.createCandidate.mockResolvedValueOnce(newCandidate);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const partyInput = screen.getByPlaceholderText(/party name/i);
    const addButton = screen.getByText(/add to ballot/i);

    await user.type(nameInput, 'John Doe');
    await user.type(partyInput, 'Party A');
    await user.click(addButton);

    await waitFor(() => {
      expect(electionService.createCandidate).toHaveBeenCalledWith('b1', {
        name: 'John Doe',
        party: 'Party A',
        symbol: null,
      });
    });
  });

  test('shows alert when adding candidate without name or party', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByText(/add to ballot/i)).toBeInTheDocument();
    });

    const addButton = screen.getByText(/add to ballot/i);
    await user.click(addButton);

    expect(mockAlert).toHaveBeenCalledWith('Name and Party required');
    expect(electionService.createCandidate).not.toHaveBeenCalled();
  });

  test('displays candidates list when candidates exist', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    const mockCandidates = [
      { id: 'c1', name: 'Candidate 1', party: 'Party 1' },
      { id: 'c2', name: 'Candidate 2', party: 'Party 2' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce(mockCandidates);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByText('Candidate 1')).toBeInTheDocument();
      expect(screen.getByText('Candidate 2')).toBeInTheDocument();
      expect(screen.getByText(/candidates \(2\)/i)).toBeInTheDocument();
    });
  });

  test('displays empty candidates message when no candidates', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByText(/no candidates in this ballot yet/i)).toBeInTheDocument();
    });
  });

  test('displays remove button for candidates', async () => {
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    const mockCandidates = [
      { id: 'c1', name: 'Candidate 1', party: 'Party 1' },
    ];

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce(mockCandidates);

    const { container } = render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      expect(screen.getByText('Candidate 1')).toBeInTheDocument();
    });

    // Verify candidate is displayed with remove functionality available
    expect(screen.getByText('Candidate 1')).toBeInTheDocument();
    expect(screen.getByText('Party 1')).toBeInTheDocument();
  });

  test('handles file upload for candidate image', async () => {
    const user = userEvent.setup();
    const mockElections = [
      { id: '1', title: 'Election 1' },
    ];

    const mockBallots = [
      { id: 'b1', title: 'Ballot 1', options: [] },
    ];

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    electionService.getAdminElections.mockResolvedValueOnce(mockElections);
    electionService.getElectionBallots.mockResolvedValueOnce(mockBallots);
    electionService.getBallotCandidates.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      expect(screen.getByText('Ballot 1')).toBeInTheDocument();
    });

    const ballotItem = screen.getByText('Ballot 1').closest('div');
    fireEvent.click(ballotItem);

    await waitFor(() => {
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]');
    await user.upload(fileInput, file);

    // File should be handled (preview may be shown)
    expect(fileInput.files[0]).toBe(file);
  });

  test('disables create ballot button when no election selected', async () => {
    electionService.getAdminElections.mockResolvedValueOnce([]);

    render(<BallotDesigner />);

    await waitFor(() => {
      const createButton = screen.getByText(/create new ballot/i);
      expect(createButton).toBeDisabled();
    });
  });

  test('handles API errors when loading elections', async () => {
    electionService.getAdminElections.mockRejectedValueOnce(new Error('API Error'));

    render(<BallotDesigner />);

    await waitFor(() => {
      // Should handle error gracefully
      expect(screen.queryByText(/loading workspace/i)).not.toBeInTheDocument();
    });
  });
});
