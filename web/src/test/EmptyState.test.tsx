import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from "@/shared/components/EmptyState";

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={<span data-testid="icn" />} title="No items" description="Nothing here" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByTestId('icn')).toBeInTheDocument();
  });

  it('renders action button when buttonLabel and onAction provided', () => {
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        description="desc"
        buttonLabel="Create"
        onAction={() => {}}
      />,
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('does not render button without onAction', () => {
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        description="desc"
        buttonLabel="Create"
      />,
    );
    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  it('does not render button without buttonLabel', () => {
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        description="desc"
        onAction={() => {}}
      />,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onAction when button clicked', async () => {
    let called = false;
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        description="desc"
        buttonLabel="Go"
        onAction={() => { called = true; }}
      />,
    );
    await userEvent.click(screen.getByText('Go'));
    expect(called).toBe(true);
  });
});
