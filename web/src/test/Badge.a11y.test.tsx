import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from '@/test/a11y-helpers';
import { Badge } from '@/shared/components/Badge';

describe('Badge a11y', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<Badge>Active</Badge>);
    await checkA11y(container);
  });

  it('has no violations with icon', async () => {
    const { container } = render(
      <Badge variant="success" icon={<span aria-hidden="true">+</span>}>
        OK
      </Badge>,
    );
    await checkA11y(container);
  });

  it('has no violations in solid variant', async () => {
    const { container } = render(
      <Badge variant="primary" style="solid">
        Solid
      </Badge>,
    );
    await checkA11y(container);
  });

  it('has no violations in destructive variant', async () => {
    const { container } = render(
      <Badge variant="destructive" style="outline">
        Error
      </Badge>,
    );
    await checkA11y(container);
  });

  it('has no violations with uppercase and pill shape', async () => {
    const { container } = render(
      <Badge uppercase shape="pill">
        New
      </Badge>,
    );
    await checkA11y(container);
  });
});
