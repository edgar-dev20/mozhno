import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FlagCardDetail } from "@/app/components/flags/FlagCardDetail";
import type { FlagView } from "@/app/hooks/flagTypes";

const MOCK_FLAG: FlagView = {
  key: "new-checkout", name: "New Checkout Flow", description: "Enable the new checkout experience",
  flagType: "boolean", tags: [{ tagId: 1, tagName: "frontend", tagColor: "", value: "" }],
  flagId: 1, environments: { 1: { enabled: true, percentage: 75, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null, lastUsedAt: null } },
  archived: false, createdAt: "2026-01-15T10:30:00Z", createdBy: "Anna Lee", archivedBy: null, archivedAt: null,
};

const MOCK_ENVS = [{ id: 1, name: "Production" }, { id: 2, name: "Staging" }];

const meta: Meta<typeof FlagCardDetail> = {
  title: "App/Flags/FlagCardDetail",
  component: FlagCardDetail,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagCardDetail>;

export const Default: Story = {
  args: {
    flag: MOCK_FLAG, environments: MOCK_ENVS, segments: [], tags: [],
    sparklineData: new Map(), onOpenGeneral: fn(), onOpenEnvironment: fn(), onToggleFlag: fn(), onMetricsClick: fn(),
  },
};
