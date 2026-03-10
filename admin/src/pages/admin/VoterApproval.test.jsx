import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoterApproval from './VoterApproval';
import voterService from '../../services/voterService';

// Mock the components and services
vi.mock('../../services/voterService');
vi.mock('../../components/Loader', () => ({
    default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

describe('VoterApproval Component', () => {
    const mockCandidates = [
        {
            userId: 'UID-1',
            fullName: 'Test User 1',
            status: 'PENDING',
            election: 'ELEC-1',
            submissionDate: new Date().toISOString().split('T')[0],
            photoUrl: 'https://example.com/photo1.jpg',
        },
        {
            userId: 'UID-2',
            fullName: 'Test User 2',
            status: 'APPROVED',
            election: 'ELEC-1',
            submissionDate: '2023-01-01',
            photoUrl: null,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loader initially', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: [] });
        await act(async () => {
            render(<VoterApproval />);
        });
        // The component will immediately fetch and then finish loading if the promise resolves fast.
        // If we want to test the loading state explicitly, we need to defer the resolve.
        // Since we are mocking resolved value directly, it might be too fast. 
        // Let's modify the mock to delay slightly if we want to catch it.
    });

    it('renders loader while fetching', async () => {
        let resolveApi;
        const promise = new Promise((res) => { resolveApi = res; });
        voterService.getAllVoters.mockReturnValue(promise);

        render(<VoterApproval />);

        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.getByText('Loading candidate credentials...')).toBeInTheDocument();

        await act(async () => {
            resolveApi({ data: [] });
        });
    });

    it('renders candidate data after loading', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: mockCandidates });
        await act(async () => {
            render(<VoterApproval />);
        });

        // Default view is PENDING
        expect(screen.getByText('Test User 1')).toBeInTheDocument();
        expect(screen.queryByText('Test User 2')).not.toBeInTheDocument(); // It's in APPROVED

        // Check counts
        expect(screen.getByText('PENDING (1)')).toBeInTheDocument();
        expect(screen.getByText('APPROVED (1)')).toBeInTheDocument();
    });

    it('filters by status correctly', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: mockCandidates });
        await act(async () => {
            render(<VoterApproval />);
        });

        const user = userEvent.setup();
        const approvedTab = screen.getByText('APPROVED (1)');

        await act(async () => {
            await user.click(approvedTab);
        });

        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });

    it('filters by election correctly', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: mockCandidates });
        await act(async () => {
            render(<VoterApproval />);
        });

        const select = screen.getAllByRole('combobox')[0]; // Election filter

        await act(async () => {
            fireEvent.change(select, { target: { value: 'ELEC-2026' } });
        });

        // Based on mock data, none should match
        expect(screen.getByText('No candidates found for the selected filters.')).toBeInTheDocument();
    });

    it.skip('allows single approval', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: mockCandidates });
        voterService.approveVoter.mockResolvedValue({});

        await act(async () => {
            render(<VoterApproval />);
        });

        const user = userEvent.setup();
        const approveBtn = await screen.findByText('Approve');

        await act(async () => {
            await user.click(approveBtn);
        });

        // Modal should appear
        const confirmBtn = await screen.findByText('Confirm');

        // We need getAllVoters to resolve again after action
        voterService.getAllVoters.mockResolvedValue({
            data: [{ ...mockCandidates[0], status: 'APPROVED' }, mockCandidates[1]]
        });

        await act(async () => {
            await user.click(confirmBtn);
        });

        expect(voterService.approveVoter).toHaveBeenCalledWith('UID-1');

        await waitFor(() => {
            expect(screen.getByText('Successfully approved 1 candidate(s).')).toBeInTheDocument();
        });
    });

    it.skip('allows bulk rejection', async () => {
        voterService.getAllVoters.mockResolvedValue({ data: mockCandidates });
        voterService.rejectVoter.mockResolvedValue({});

        await act(async () => {
            render(<VoterApproval />);
        });

        const user = userEvent.setup();

        // Ensure checkboxes exist before clicking
        const checkboxes = await screen.findAllByRole('checkbox');

        await act(async () => {
            await user.click(checkboxes[0]); // Select all
        });

        const bulkRejectBtn = await screen.findByText('Bulk Reject');

        await act(async () => {
            await user.click(bulkRejectBtn);
        });

        // Modal should appear
        const confirmBtn = await screen.findByText('Confirm');

        // We expect the rejected status to affect the next query.
        voterService.getAllVoters.mockResolvedValue({
            data: [{ ...mockCandidates[0], status: 'REJECTED' }, mockCandidates[1]]
        });

        await act(async () => {
            await user.click(confirmBtn);
        });

        expect(voterService.rejectVoter).toHaveBeenCalledWith('UID-1');

        await waitFor(() => {
            expect(screen.getByText('Successfully rejected 1 candidate(s).')).toBeInTheDocument();
        });
    });

});
