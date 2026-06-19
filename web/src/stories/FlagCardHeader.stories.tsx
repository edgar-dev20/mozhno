import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FlagCardHeader } from "@/app/components/flags/FlagCardHeader";
import type { FlagView } from "@/app/hooks/flagTypes";

const MOCK_FLAG: FlagView = {
  key: "new-checkout", name: "New Checkout Flow", description: "Enable the new checkout experience",
  flagType: "boolean", tags: [{ tagId: 1, tagName: "frontend", tagValue: "" }, { tagId: 2, tagName: "checkout", tagValue: "" }],
  flagId: 1, environments: { 1: { enabled: true, percentage: 50, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null, lastUsedAt: null } },
  archived: false, createdAt: "2026-01-15", createdBy: "Anna", archivedBy: null, archivedAt: null,
};

const MOCK_ENVS = [{ id: 1, name: "Production" }, { id: 2, name: "Staging" }];

const meta: Meta<typeof FlagCardHeader> = {
  title: "App/Flags/FlagCardHeader",
  component: FlagCardHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagCardHeader>;

export const Collapsed: Story = {
  args: { flag: MOCK_FLAG, expanded: false, environments: MOCK_ENVS, tags: [], onToggleFlag: fn() },
};

export const Expanded: Story = {
  args: { flag: MOCK_FLAG, expanded: true, environments: MOCK_ENVS, tags: [], onToggleFlag: fn() },
};

export const Archived: Story = {
  args: { flag: { ...MOCK_FLAG, archived: true }, expanded: false, environments: MOCK_ENVS, tags: [], onToggleFlag: fn() },
};
