import { axe } from 'vitest-axe';
import type { RunOptions } from 'vitest-axe';
import { expect } from 'vitest';

const WCAG_AA: RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2aa', 'wcag21aa'],
  },
};

export async function checkA11y(container: HTMLElement | Element) {
  const results = await axe(container, WCAG_AA);
  expect(results).toHaveNoViolations();
}
