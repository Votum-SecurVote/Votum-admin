import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BallotDesigner from './BallotDesigner';
import electionService from '../../services/electionService';

// Mock the framer-motion components that cause issues with Testing Library
vi.mock('framer-motion', () => {
    const React = require('react');
    return {
        motion: {
            div: React.forwardRef((props, ref) => <div ref={ref} {...props} />),
        },
        AnimatePresence: ({ children }) => <>{children}</>,
        Reorder: {
            Group: ({ children }) => <ul>{children}</ul>,
            Item: React.forwardRef((props, ref) => <li ref={ref} {...props} />),
        }
    };
});

vi.mock('../../services/electionService');
vi.mock('../../components/Loader', () => ({
    default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

describe('BallotDesigner Component', () => {
    const mockElections = [
        { id: 'ELEC-1', title: 'Election 1' },
        { id: 'ELEC-2', title: 'Election 2' },
    ];

    const mockBallots = [
        { id: 'BALLOT-1', title: 'Presidential Ballot', options: [] },
    ];

    const mockCandidates = [
        { id: 'CAND-1', name: 'John Doe', party: 'Independent', symbol: null },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loader initially', () => {
        electionService.getAdminElections.mockImplementation(() => new Promise(() => { }));

        render(<BallotDesigner />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.getByText('Accessing secure workspace...')).toBeInTheDocument();
    });

    it('loads and displays elections', async () => {
        electionService.getAdminElections.mockResolvedValue(mockElections);
        electionService.getElectionBallots.mockResolvedValue(mockBallots);

        render(<BallotDesigner />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(screen.getByText('Election 1')).toBeInTheDocument();
        expect(screen.getByText('Election 2')).toBeInTheDocument();

        // Check if initial ballot load triggered
        expect(electionService.getElectionBallots).toHaveBeenCalledWith('ELEC-1');
    });

    it('handles election selection change', async () => {
        electionService.getAdminElections.mockResolvedValue(mockElections);
        electionService.getElectionBallots.mockResolvedValue(mockBallots);

        render(<BallotDesigner />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'ELEC-2' } });

        await waitFor(() => {
            expect(electionService.getElectionBallots).toHaveBeenCalledWith('ELEC-2');
        });
    });

    it('creates a new ballot', async () => {
        electionService.getAdminElections.mockResolvedValue(mockElections);
        electionService.getElectionBallots.mockResolvedValue([]);

        const newBallotMock = { id: 'NEW-BALLOT', title: 'New Test Ballot', options: [] };
        electionService.createBallot.mockResolvedValue(newBallotMock);

        render(<BallotDesigner />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const user = userEvent.setup();
        const input = screen.getByPlaceholderText('Enter Ballot Designation');
        await user.type(input, 'New Test Ballot');

        const createBtn = screen.getByRole('button', { name: /Initialize New Ballot/i });
        await user.click(createBtn);

        await waitFor(() => {
            expect(electionService.createBallot).toHaveBeenCalledWith('ELEC-1', {
                title: 'New Test Ballot',
                description: 'Official Ballot',
                maxSelections: 1
            });
            // Selecting it automatically sets it active
            expect(screen.getByRole('heading', { level: 2 }).textContent).toContain('New Test Ballot');
        });
    });

    it('adds a candidate to an active ballot', async () => {
        electionService.getAdminElections.mockResolvedValue(mockElections);
        electionService.getElectionBallots.mockResolvedValue(mockBallots);
        electionService.getBallotCandidates.mockResolvedValue([]);

        const newCandMock = { id: 'NEW-CAND', name: 'Jane Smith', party: 'Green Party', symbol: null };
        electionService.createCandidate.mockResolvedValue(newCandMock);

        render(<BallotDesigner />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        const user = userEvent.setup();

        // Select the existing ballot
        const ballotItem = await screen.findByText('Presidential Ballot');
        await user.click(ballotItem);

        await waitFor(() => {
            expect(electionService.getBallotCandidates).toHaveBeenCalledWith('BALLOT-1');
            expect(screen.getByText('Candidate Registration')).toBeInTheDocument();
        });

        // Fill new candidate form
        const nameInput = await screen.findByPlaceholderText('John Doe');
        await user.type(nameInput, 'Jane Smith');

        const partyInput = await screen.findByPlaceholderText('Party or Independent');
        await user.type(partyInput, 'Green Party');

        const addBtn = await screen.findByRole('button', { name: /Register to Ballot/i });
        await user.click(addBtn);

        await waitFor(() => {
            expect(electionService.createCandidate).toHaveBeenCalledWith(
                'BALLOT-1',
                { name: 'Jane Smith', party: 'Green Party' },
                null   // no photo file uploaded in this test
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('Green Party')).toBeInTheDocument();
        });
    });

});
