import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { FlagEnvironmentPanel } from '@/app/components/flags/FlagEnvironmentPanel';
import type { ConstraintGroup } from '@/app/components/flags/types';

const meta: Meta<typeof FlagEnvironmentPanel> = {
  title: 'App/Flags/FlagEnvironmentPanel',
  component: FlagEnvironmentPanel,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FlagEnvironmentPanel>;

function DefaultRender() {
  const [p, sp] = useState(50);
  const [sgs, ssgs] = useState<number[]>([]);
  const [cgs, scgs] = useState<ConstraintGroup[]>([]);
  const [en, sen] = useState(true);
  const [ag, sag] = useState<string | null>(null);
  return (
    <FlagEnvironmentPanel
      envRulePercent={p}
      onEnvRulePercentChange={sp}
      envRuleSegments={sgs}
      onEnvRuleSegmentsChange={ssgs}
      envRuleConstraintGroups={cgs}
      onEnvRuleConstraintGroupsChange={scgs}
      envRuleEnabled={en}
      onEnvRuleEnabledChange={sen}
      segments={[]}
      contexts={[]}
      activeGroupId={ag}
      onActiveGroupIdChange={sag}
      envName="Production"
    />
  );
}

export const Default: Story = {
  render: DefaultRender,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region');
    await expect(region).toBeInTheDocument();
    const toggle = within(region).getByRole('switch');
    await expect(toggle).toBeInTheDocument();
    await expect(toggle).toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};
