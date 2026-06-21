import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { FlagEnvironmentPanel } from "@/app/components/flags/FlagEnvironmentPanel";

const meta: Meta<typeof FlagEnvironmentPanel> = {
  title: "App/Flags/FlagEnvironmentPanel",
  component: FlagEnvironmentPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagEnvironmentPanel>;

function DefaultRender() {
  const [p, sp] = useState(50);
  const [sgs, ssgs] = useState<number[]>([]);
  const [cgs, scgs] = useState<any[]>([]);
  const [en, sen] = useState(true);
  const [ag, sag] = useState<string | null>(null);
  return (
    <FlagEnvironmentPanel
      envRulePercent={p} onEnvRulePercentChange={sp}
      envRuleSegments={sgs} onEnvRuleSegmentsChange={ssgs}
      envRuleConstraintGroups={cgs} onEnvRuleConstraintGroupsChange={scgs}
      envRuleEnabled={en} onEnvRuleEnabledChange={sen}
      segments={[]} contexts={[] as any[]}
      activeGroupId={ag} onActiveGroupIdChange={sag}
      envName="Production"
    />
  );
}

export const Default: Story = { render: DefaultRender };
