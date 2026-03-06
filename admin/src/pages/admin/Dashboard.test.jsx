import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import api from '../../services/api';

vi.mock('../../services/api');
vi.mock('../../components/Loader', () => ({
    default: ({ message }) => <div data-testid="loader">{message}</div>,
}));

describe('Dashboard Component', () => {
    const mockMetrics = {
        totalElections: 5,
        activeElections: 2,
        pendingCandidates: 10,
        approvedCandidates: 45,
        recentActivity: [
            { id: 1, action: 'Election Created', user: 'Admin 1', time: '2023-10-27T10:00:00Z' },
            { id: 2, action: 'Candidate Approved', user: 'Admin 2', time: '2023-10-27T11:30:00Z' },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loader initially', () => {
        // Keep it pending to show loader
        api.get.mockImplementation(() => new Promise(() => { }));

        render(<Dashboard />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.getByText('Loading dashboard metrics...')).toBeInTheDocument();
    });

    it('renders dashboard metrics after loading', async () => {
        api.get.mockResolvedValue({ data: mockMetrics });
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Elections')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Active Elections')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Pending Candidates')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('Approved Candidates')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('renders recent activity correctly', async () => {
        api.get.mockResolvedValue({ data: mockMetrics });
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Recent Activity (Audit Log)')).toBeInTheDocument();
        expect(screen.getByText('Election Created')).toBeInTheDocument();
        expect(screen.getByText('Action by: Admin 1')).toBeInTheDocument();
        expect(screen.getByText('Candidate Approved')).toBeInTheDocument();
        expect(screen.getByText('Action by: Admin 2')).toBeInTheDocument();
    });

    it('handles empty recent activity', async () => {
        const emptyMetrics = { ...mockMetrics, recentActivity: [] };
        api.get.mockResolvedValue({ data: emptyMetrics });
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        expect(screen.getByText('No recent activity to display.')).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        api.get.mockRejectedValue(new Error('API Error'));
        render(<Dashboard />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });

        // Should still render empty states for metrics
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

        expect(consoleSpy).toHaveBeenCalledWith("Failed to load metrics", expect.any(Error));
        consoleSpy.mockRestore();
    });
});
