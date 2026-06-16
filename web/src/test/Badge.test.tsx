import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/shared/components/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    render(<Badge variant="success">OK</Badge>);
    const el = screen.getByText('OK');
    expect(el.className).toContain('bg-success');
  });

  it('applies destructive variant', () => {
    render(<Badge variant="destructive">Error</Badge>);
    const el = screen.getByText('Error');
    expect(el.className).toContain('bg-destructive');
  });

  it('applies shape pill', () => {
    render(<Badge shape="pill">Pill</Badge>);
    const el = screen.getByText('Pill');
    expect(el.className).toContain('rounded-full');
  });

  it('applies size sm', () => {
    render(<Badge size="sm">Small</Badge>);
    const el = screen.getByText('Small');
    expect(el.className).toContain('px-1.5');
  });

  it('applies uppercase', () => {
    render(<Badge uppercase>UP</Badge>);
    const el = screen.getByText('UP');
    expect(el.className).toContain('uppercase');
    expect(el.className).toContain('tracking-');
  });

  it('renders icon', () => {
    render(<Badge icon={<span data-testid="ico" />}>With Icon</Badge>);
    expect(screen.getByTestId('ico')).toBeInTheDocument();
  });

  it('applies solid style', () => {
    render(<Badge variant="primary" style="solid">Solid</Badge>);
    const el = screen.getByText('Solid');
    expect(el.className).toContain('text-primary-foreground');
    expect(el.className).toContain('bg-primary');
  });

  it('applies outline style', () => {
    render(<Badge variant="success" style="outline">Outline</Badge>);
    const el = screen.getByText('Outline');
    expect(el.className).toContain('border-success/30');
  });

  it('defaults to rounded shape', () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText('Default');
    expect(el.className).toContain('rounded');
    expect(el.className).not.toContain('rounded-full');
  });

  it('passes additional className', () => {
    render(<Badge className="extra">Extra</Badge>);
    const el = screen.getByText('Extra');
    expect(el.className).toContain('extra');
  });

  it('passes HTML attributes', () => {
    render(<Badge title="tooltip" data-testid="badge">Tooltip</Badge>);
    const el = screen.getByTestId('badge');
    expect(el.getAttribute('title')).toBe('tooltip');
  });
});
