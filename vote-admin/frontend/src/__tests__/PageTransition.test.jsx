import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTransition from '../components/PageTransition';

describe('PageTransition', () => {
  test('renders children content correctly', () => {
    render(
      <PageTransition>
        <div>Page Content</div>
      </PageTransition>
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  test('renders multiple children elements', () => {
    render(
      <PageTransition>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </PageTransition>
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  test('applies correct inline styles', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>
    );

    const transitionDiv = container.firstChild;
    expect(transitionDiv).toHaveStyle({
      width: '100%',
      minHeight: 'calc(100vh - 64px)',
      paddingTop: '64px',
    });
  });

  test('handles empty children gracefully', () => {
    const { container } = render(<PageTransition />);

    const transitionDiv = container.firstChild;
    expect(transitionDiv).toBeInTheDocument();
    expect(transitionDiv).toBeEmptyDOMElement();
  });

  test('handles null children', () => {
    const { container } = render(
      <PageTransition>
        {null}
      </PageTransition>
    );

    const transitionDiv = container.firstChild;
    expect(transitionDiv).toBeInTheDocument();
  });

  test('handles string children', () => {
    render(
      <PageTransition>
        Simple Text
      </PageTransition>
    );

    expect(screen.getByText('Simple Text')).toBeInTheDocument();
  });

  test('handles complex nested children structure', () => {
    render(
      <PageTransition>
        <div>
          <h1>Title</h1>
          <section>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </section>
        </div>
      </PageTransition>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
  });

  test('renders form elements as children', () => {
    render(
      <PageTransition>
        <form>
          <input type="text" placeholder="Name" />
          <button type="submit">Submit</button>
        </form>
      </PageTransition>
    );

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('handles array of children', () => {
    render(
      <PageTransition>
        {[
          <div key="1">Item 1</div>,
          <div key="2">Item 2</div>,
          <div key="3">Item 3</div>,
        ]}
      </PageTransition>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  test('maintains component structure', () => {
    const { container } = render(
      <PageTransition>
        <div data-testid="child">Content</div>
      </PageTransition>
    );

    const transitionDiv = container.firstChild;
    const childDiv = screen.getByTestId('child');
    
    expect(transitionDiv).toContainElement(childDiv);
    expect(childDiv).toHaveTextContent('Content');
  });
});
