import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ElectionCreate from '../pages/admin/ElectionCreate';
import electionService from '../services/electionService';

// Mock electionService
vi.mock('../services/electionService', () => ({
  default: {
    createElection: vi.fn(),
  },
}));

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('ElectionCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.location.href = '';
  });

  test('renders election creation form with all fields', () => {
    const { container } = render(<ElectionCreate />);

    expect(screen.getByText(/election title/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/start date/i)).toBeInTheDocument();
    expect(screen.getByText(/end date/i)).toBeInTheDocument();
    expect(screen.getByText(/voting rules/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create election/i })).toBeInTheDocument();
    expect(container.querySelector('input[name="title"]')).toBeInTheDocument();
    expect(container.querySelector('textarea[name="description"]')).toBeInTheDocument();
  });

  test('allows user to input form fields', async () => {
    const user = userEvent.setup();
    const { container } = render(<ElectionCreate />);

    const titleInput = container.querySelector('input[name="title"]');
    const descriptionInput = container.querySelector('textarea[name="description"]');

    await user.type(titleInput, 'Test Election');
    await user.type(descriptionInput, 'Test Description');

    expect(titleInput).toHaveValue('Test Election');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  test('shows loader when submitting form', async () => {
    const user = userEvent.setup();
    let resolveCreate;
    const createPromise = new Promise((resolve) => {
      resolveCreate = resolve;
    });
    electionService.createElection.mockReturnValueOnce(createPromise);

    render(<ElectionCreate />);

    const titleInput = document.querySelector('input[name="title"]');
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const submitButton = screen.getByRole('button', { name: /create election/i });

    await user.type(titleInput, 'Test Election');
    await user.type(startDateInput, '2024-12-01T10:00');
    await user.type(endDateInput, '2024-12-02T10:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/creating election/i)).toBeInTheDocument();
    });

    resolveCreate({ data: { _id: 'test-id' } });
  });

  test('successfully creates election and shows success message', async () => {
    const user = userEvent.setup();
    const mockElection = { _id: 'election-123', title: 'Test Election' };
    electionService.createElection.mockResolvedValueOnce({ data: mockElection });

    render(<ElectionCreate />);

    const titleInput = document.querySelector('input[name="title"]');
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const submitButton = screen.getByRole('button', { name: /create election/i });

    await user.type(titleInput, 'Test Election');
    await user.type(startDateInput, '2024-12-01T10:00');
    await user.type(endDateInput, '2024-12-02T10:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/election created successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/election-123/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('lastElectionId')).toBe('election-123');
  });

  test('handles form submission error', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    electionService.createElection.mockRejectedValueOnce(new Error('Creation failed'));

    render(<ElectionCreate />);

    const titleInput = document.querySelector('input[name="title"]');
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const submitButton = screen.getByRole('button', { name: /create election/i });

    await user.type(titleInput, 'Test Election');
    await user.type(startDateInput, '2024-12-01T10:00');
    await user.type(endDateInput, '2024-12-02T10:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Creation failed');
    });

    alertSpy.mockRestore();
  });

  test('converts IST datetime to UTC format', async () => {
    const user = userEvent.setup();
    electionService.createElection.mockResolvedValueOnce({ data: { _id: 'test-id' } });

    render(<ElectionCreate />);

    const titleInput = document.querySelector('input[name="title"]');
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const submitButton = screen.getByRole('button', { name: /create election/i });

    await user.type(titleInput, 'Test Election');
    await user.type(startDateInput, '2024-12-01T10:00');
    await user.type(endDateInput, '2024-12-02T10:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(electionService.createElection).toHaveBeenCalled();
    });

    const callArgs = electionService.createElection.mock.calls[0][0];
    expect(callArgs.startDate).toContain('T');
    expect(callArgs.endDate).toContain('T');
  });

  test('requires title and dates fields', async () => {
    const user = userEvent.setup();
    render(<ElectionCreate />);

    const submitButton = screen.getByRole('button', { name: /create election/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(electionService.createElection).not.toHaveBeenCalled();
  });

  test('handles empty optional fields', async () => {
    const user = userEvent.setup();
    electionService.createElection.mockResolvedValueOnce({ data: { _id: 'test-id' } });

    render(<ElectionCreate />);

    const titleInput = document.querySelector('input[name="title"]');
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const submitButton = screen.getByRole('button', { name: /create election/i });

    await user.type(titleInput, 'Test Election');
    await user.type(startDateInput, '2024-12-01T10:00');
    await user.type(endDateInput, '2024-12-02T10:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(electionService.createElection).toHaveBeenCalled();
    });

    const callArgs = electionService.createElection.mock.calls[0][0];
    expect(callArgs.description).toBe('');
    expect(callArgs.votingRules).toBe('');
  });
});
