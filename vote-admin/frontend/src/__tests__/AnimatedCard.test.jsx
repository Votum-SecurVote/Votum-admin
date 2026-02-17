import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimatedCard from '../components/AnimatedCard';

describe('AnimatedCard', () => {
  test('renders children content correctly', () => {
    render(
      <AnimatedCard>
        <div>Test Content</div>
      </AnimatedCard>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders multiple children elements', () => {
    render(
      <AnimatedCard>
        <h1>Title</h1>
        <p>Description</p>
        <button>Click Me</button>
      </AnimatedCard>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('renders with default delay prop', () => {
    const { container } = render(
      <AnimatedCard>
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });

  test('applies custom delay prop', () => {
    const { container } = render(
      <AnimatedCard delay={0.5}>
        <div>Delayed Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Delayed Content')).toBeInTheDocument();
  });

  test('passes through additional props', () => {
    const { container } = render(
      <AnimatedCard data-testid="custom-card" className="custom-class">
        <div>Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toHaveAttribute('data-testid', 'custom-card');
    expect(card).toHaveClass('custom-class');
  });

  test('handles empty children gracefully', () => {
    const { container } = render(<AnimatedCard />);

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    expect(card).toBeEmptyDOMElement();
  });

  test('handles null children', () => {
    const { container } = render(
      <AnimatedCard>
        {null}
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });

  test('handles string children', () => {
    render(
      <AnimatedCard>
        Simple Text Content
      </AnimatedCard>
    );

    expect(screen.getByText('Simple Text Content')).toBeInTheDocument();
  });

  test('handles zero delay value', () => {
    const { container } = render(
      <AnimatedCard delay={0}>
        <div>Zero Delay Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Zero Delay Content')).toBeInTheDocument();
  });

  test('handles negative delay value (edge case)', () => {
    const { container } = render(
      <AnimatedCard delay={-1}>
        <div>Negative Delay Content</div>
      </AnimatedCard>
    );

    const card = container.firstChild;
    expect(card).toBeInTheDocument();
    expect(screen.getByText('Negative Delay Content')).toBeInTheDocument();
  });
});
