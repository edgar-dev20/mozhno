import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect, screen } from "storybook/test";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

const OPTIONS = ["Option A", "Option B", "Option C", "Option D"];

function SelectDemo({ placeholder = "Select...", disabled = false }: { placeholder?: string; disabled?: boolean }) {
  return (
    <Select disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export const Default: Story = { render: () => <SelectDemo /> };
export const Disabled: Story = { render: () => <SelectDemo disabled /> };

export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="Option B">
      <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
      <SelectContent>{OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  ),
};

export const OpenSelect: Story = {
  render: () => <SelectDemo placeholder="Open me" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await expect(screen.getByText("Option A")).toBeVisible();
  },
};
