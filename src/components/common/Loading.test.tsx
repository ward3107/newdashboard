import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, Skeleton, CardSkeleton, TableSkeleton } from './Loading';

describe('Loading', () => {
  it('renders loading spinner with default message', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getAllByText('טוען...')[0]).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with custom message', () => {
    render(<Loading message="טוען נתונים..." />);

    expect(screen.getAllByText('טוען נתונים...')[0]).toBeInTheDocument();
  });

  it('renders as fullScreen by default', () => {
    const { container } = render(<Loading />);

    const loadingDiv = container.firstChild as HTMLElement;
    expect(loadingDiv).toHaveClass('min-h-screen');
  });

  it('renders inline when fullScreen is false', () => {
    const { container } = render(<Loading fullScreen={false} />);

    const loadingDiv = container.firstChild as HTMLElement;
    expect(loadingDiv).not.toHaveClass('min-h-screen');
  });

  it('has proper accessibility attributes', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Skeleton', () => {
  it('renders single skeleton by default', () => {
    const { container } = render(<Skeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(1);
  });

  it('renders multiple skeletons when count is specified', () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons).toHaveLength(3);
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('h-10', 'w-full');
  });
});

describe('CardSkeleton', () => {
  it('renders card skeleton with status role', () => {
    render(<CardSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('includes screen reader text', () => {
    render(<CardSkeleton />);

    expect(screen.getByText('טוען תוכן...')).toHaveClass('sr-only');
  });
});

describe('TableSkeleton', () => {
  it('renders table skeleton with default rows and columns', () => {
    const { container } = render(<TableSkeleton />);

    // Default is 5 rows + 1 header = 6 rows total
    const rows = container.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(6); // 1 header + 5 data rows
  });

  it('renders custom number of rows and columns', () => {
    const { container } = render(<TableSkeleton rows={3} columns={2} />);

    const rows = container.querySelectorAll('.flex.gap-4');
    expect(rows).toHaveLength(4); // 1 header + 3 data rows
  });

  it('has proper accessibility attributes', () => {
    render(<TableSkeleton />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('includes screen reader text', () => {
    render(<TableSkeleton />);

    expect(screen.getByText('טוען טבלה...')).toHaveClass('sr-only');
  });
});
