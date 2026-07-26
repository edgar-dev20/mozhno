import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
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
    await checkA11y(container);
  });

  it('has no accessibility violations without description', async () => {
    const { container } = render(
      <SidePanel open={true} onOpenChange={() => {}} title="Test Panel">
        <p>Content</p>
      </SidePanel>,
    );
    await checkA11y(container);
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
