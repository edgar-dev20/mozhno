import type { Meta, StoryObj } from "@storybook/react";
import { FlagCardSkeleton } from "@/app/components/skeletons/FlagCardSkeleton";
import { TableRowSkeleton, TableSkeleton } from "@/app/components/skeletons/TableRowSkeleton";
import { IntegrationCardSkeleton, IntegrationCardSkeletonList } from "@/app/components/skeletons/IntegrationCardSkeleton";
import { ApiKeyRowSkeleton, ApiKeyTableSkeleton } from "@/app/components/skeletons/ApiKeyRowSkeleton";
import { UserRowSkeleton, UserTableSkeleton } from "@/app/components/skeletons/UserTableSkeleton";
import { TagCardSkeleton, TagCardSkeletonList } from "@/app/components/skeletons/TagCardSkeleton";
import { SegmentCardSkeleton, SegmentCardSkeletonList } from "@/app/components/skeletons/SegmentCardSkeleton";
import { SidePanelSkeleton } from "@/app/components/skeletons/SidePanelSkeleton";

const meta: Meta = {
  title: "App/Skeletons",
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj;

export const FlagCard: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">FlagCardSkeleton</span>
      <FlagCardSkeleton />
      <FlagCardSkeleton />
    </div>
  ),
};

export const TableRow: Story = {
  render: () => (
    <div className="max-w-xl space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">TableSkeleton</span>
      <TableSkeleton rows={3} cols={4} />
    </div>
  ),
};

export const IntegrationCards: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">IntegrationCardSkeletonList</span>
      <IntegrationCardSkeletonList count={3} />
    </div>
  ),
};

export const ApiKeyRows: Story = {
  render: () => (
    <div className="max-w-xl space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">ApiKeyTableSkeleton</span>
      <ApiKeyTableSkeleton count={3} />
    </div>
  ),
};

export const UserRows: Story = {
  render: () => (
    <div className="max-w-xl space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">UserTableSkeleton</span>
      <UserTableSkeleton count={4} />
    </div>
  ),
};

export const TagCards: Story = {
  render: () => (
    <div className="max-w-2xl space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">TagCardSkeletonList</span>
      <TagCardSkeletonList count={6} />
    </div>
  ),
};

export const SegmentCards: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">SegmentCardSkeletonList</span>
      <SegmentCardSkeletonList count={3} />
    </div>
  ),
};

export const SidePanel: Story = {
  render: () => (
    <div className="max-w-md space-y-3">
      <span className="text-xs text-muted-foreground/40 uppercase tracking-wider">SidePanelSkeleton</span>
      <SidePanelSkeleton />
    </div>
  ),
};

export const AllSkeletons: Story = {
  render: () => (
    <div className="space-y-12 p-4">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Flag Card</h2>
        <div className="max-w-md"><FlagCardSkeleton /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Table</h2>
        <div className="max-w-xl"><TableSkeleton rows={2} cols={4} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Integration Cards</h2>
        <div className="max-w-md"><IntegrationCardSkeletonList count={2} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">API Keys</h2>
        <div className="max-w-xl"><ApiKeyTableSkeleton count={2} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Users</h2>
        <div className="max-w-xl"><UserTableSkeleton count={2} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Tags</h2>
        <div className="max-w-2xl"><TagCardSkeletonList count={3} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Segments</h2>
        <div className="max-w-md"><SegmentCardSkeletonList count={2} /></div>
      </section>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/40 mb-4">Side Panel</h2>
        <div className="max-w-md"><SidePanelSkeleton /></div>
      </section>
    </div>
  ),
};
