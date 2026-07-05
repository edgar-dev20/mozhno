import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { FlagCard } from "@/app/components/flags/FlagCard";
import type { FlagView } from "@/app/hooks/flagTypes";

const MOCK_FLAG: FlagView = {
  key: "new-checkout",
  name: "New Checkout Flow",
  description: "Enable the new checkout experience for selected users",
  flagType: "boolean",
  tags: [{ tagId: 1, tagName: "frontend", tagColor: "", value: "" }, { tagId: 2, tagName: "checkout", tagColor: "", value: "" }],
  flagId: 1,
  environments: {
    1: { enabled: true, percentage: 50, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null, lastUsedAt: null },
    2: { enabled: false, percentage: 0, segmentIds: [], strategyId: null, contextDefinitionId: null, contextValuesJson: null, lastUsedAt: null },
  },
  archived: false,
  createdAt: "2026-01-15T10:30:00Z",
  createdBy: "Anna Lee",
  archivedBy: null,
  archivedAt: null,
};

const MOCK_ENVIRONMENTS = [
  { id: 1, name: "Production" },
  { id: 2, name: "Staging" },
];

const MOCK_SPARKLINE = new Map<string, { trueCount: number; falseCount: number; timeBucket: string }[]>();

const meta: Meta<typeof FlagCard> = {
  title: "App/FlagCard",
  component: FlagCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagCard>;

export const ActiveFlag: Story = {
  args: {
    flag: MOCK_FLAG,
    expanded: false,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE,
  },
};

export const Expanded: Story = {
  args: {
    flag: MOCK_FLAG,
    expanded: true,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE,
  },
};

export const Archived: Story = {
  args: {
    flag: { ...MOCK_FLAG, archived: true },
    expanded: false,
    onToggleExpand: fn(),
    onOpenGeneral: fn(),
    onOpenEnvironment: fn(),
    onToggleFlag: fn(),
    onMetricsClick: fn(),
    environments: MOCK_ENVIRONMENTS,
    segments: [],
    tags: [],
    sparklineData: MOCK_SPARKLINE,
  },
};
