import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Loader from '../components/Loader';

describe('Loader', () => {
  test('renders default loading message and spinner structure', () => {
    const { container } = render(<Loader />);

    // Default message should be rendered
    const messageElement = screen.getByText('Loading...');
    expect(messageElement).toBeInTheDocument();

    // The loader container should have two children: spinner and message
    const loaderContainer = messageElement.parentElement;
    expect(loaderContainer).toBeInTheDocument();
    expect(loaderContainer.children.length).toBe(2);
  });

  test('renders custom message when message prop is provided', () => {
    render(<Loader message="Fetching data..." />);

    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('handles empty message without crashing (edge case)', () => {
    const { container } = render(<Loader message="" />);

    const loaderContainer = container.firstChild;
    expect(loaderContainer).toBeInTheDocument();

    // The text span should still be rendered but with empty content
    const textSpan = loaderContainer.querySelector('span');
    expect(textSpan).toBeInTheDocument();
    expect(textSpan).toHaveTextContent('');
  });

  test('does not change message on user interaction (no side effects)', () => {
    const { container } = render(<Loader message="Click test" />);

    const loaderContainer = container.firstChild;
    // Simulate a user clicking on the loader area
    fireEvent.click(loaderContainer);

    // The message should remain unchanged, since Loader has no click behavior
    expect(screen.getByText('Click test')).toBeInTheDocument();
  });
});

