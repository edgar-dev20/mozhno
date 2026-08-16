import { axe } from 'vitest-axe';
import type { AxeCore } from 'vitest-axe';
import { expect } from 'vitest';

export const WCAG_AA: AxeCore.RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2aa', 'wcag21aa'],
  },
};

export async function checkA11y(container: HTMLElement | Element) {
  const results = await axe(container, WCAG_AA);
  expect(results).toHaveNoViolations();
}
