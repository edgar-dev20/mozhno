import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ArchivedFlagsList } from "@/app/components/flags/ArchivedFlagsList";
import type { FlagView } from "@/app/hooks/flagTypes";

const MOCK_FLAGS: FlagView[] = [{
  key: "old-banner", name: "Old Banner", description: "Legacy banner feature",
  flagType: "boolean", tags: [], flagId: 10,
  environments: {}, archived: true, createdAt: "2025-06-01", createdBy: "Bob", archivedBy: "Anna", archivedAt: "2026-03-01",
}];

const meta: Meta<typeof ArchivedFlagsList> = {
  title: "App/Flags/ArchivedFlagsList",
  component: ArchivedFlagsList,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ArchivedFlagsList>;

export const WithArchived: Story = { args: { flags: MOCK_FLAGS, onUnarchive: fn(), tags: [] } };
export const Empty: Story = { args: { flags: [], onUnarchive: fn(), tags: [] } };
