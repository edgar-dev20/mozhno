import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { WebhookHeadersEditor } from "@/app/components/integrations/WebhookHeadersEditor";

const meta: Meta<typeof WebhookHeadersEditor> = {
  title: "App/Integrations/WebhookHeadersEditor",
  component: WebhookHeadersEditor,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WebhookHeadersEditor>;

export const Empty: Story = {
  args: { headers: [], onAdd: fn(), onRemove: fn(), onUpdate: fn() },
};

export const WithHeaders: Story = {
  args: {
    headers: [
      { id: 1, key: "Content-Type", value: "application/json" },
      { id: 2, key: "Authorization", value: "Bearer token" },
    ],
    onAdd: fn(),
    onRemove: fn(),
    onUpdate: fn(),
  },
};
