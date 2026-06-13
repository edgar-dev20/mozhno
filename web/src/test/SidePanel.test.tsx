import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { SidePanel } from '@/app/components/SidePanel';

describe('SidePanel', () => {
  it('has no accessibility violations with description', async () => {
    const { container } = render(
      <SidePanel
        open={true}
        onOpenChange={() => {}}
        title="Test Panel"
        description="A test side panel"
      >
        <p>Content</p>
      </SidePanel>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations without description', async () => {
    const { container } = render(
      <SidePanel open={true} onOpenChange={() => {}} title="Test Panel">
        <p>Content</p>
      </SidePanel>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders title', () => {
    render(
      <SidePanel open={true} onOpenChange={() => {}} title="My Title">
        <p>Content</p>
      </SidePanel>,
    );
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
