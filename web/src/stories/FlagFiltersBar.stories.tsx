import type { Meta, StoryObj } from "@storybook/react";
import { FlagFiltersBar } from "@/app/components/flags/FlagFiltersBar";
import { useState } from "react";

const meta: Meta<typeof FlagFiltersBar> = {
  title: "App/Flags/FlagFiltersBar",
  component: FlagFiltersBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FlagFiltersBar>;

function Demo() {
  const [q, sq] = useState("");
  const [ft, sft] = useState<string | null>(null);
  const [df, sdf] = useState("");
  const [dt, sdt] = useState("");
  const [sort, ssort] = useState<"name" | "createdAt">("name");
  const [tagType, stagType] = useState<number | null>(null);
  const [tagVal, stagVal] = useState<string | null>(null);
  return (
    <FlagFiltersBar
      searchQuery={q} onSearchChange={sq}
      flagTypeFilter={ft} onFlagTypeFilterChange={sft}
      dateFrom={df} dateTo={dt} onDateChange={(f, t) => { sdf(f); sdt(t); }}
      sortBy={sort} onSortByChange={ssort}
      tags={[]} selectedTagTypeFilter={tagType} onTagTypeFilterChange={stagType}
      selectedTagValueFilter={tagVal} onTagValueFilterChange={stagVal}
      uniqueTagValues={() => []}
    />
  );
}

export const Default: Story = { render: () => <Demo /> };
