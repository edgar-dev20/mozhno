import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FlagMetricsDialog } from "@/app/components/FlagMetricsDialog";
import type { Environment } from "@/api";

const MOCK_ENVS: Environment[] = [
  { id: 1, name: "Production", projectId: 1, color: "#22c55e", createdAt: "" },
  { id: 2, name: "Staging", projectId: 1, color: "#eab308", createdAt: "" },
];

function Demo() {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground" onClick={() => setOpen(true)}>
        Open Metrics
      </button>
      <FlagMetricsDialog
        open={open}
        onOpenChange={setOpen}
        flagId={1}
        flagName="new-checkout"
        environments={MOCK_ENVS}
        defaultEnvId={1}
      />
    </div>
  );
}

const meta: Meta<typeof FlagMetricsDialog> = {
  title: "App/FlagMetricsDialog",
  component: FlagMetricsDialog,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof FlagMetricsDialog>;

export const Default: Story = { render: () => <Demo /> };
