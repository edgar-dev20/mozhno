import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { WebhookBodyEditor } from "@/app/components/integrations/WebhookBodyEditor";

const meta: Meta<typeof WebhookBodyEditor> = {
  title: "App/Integrations/WebhookBodyEditor",
  component: WebhookBodyEditor,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WebhookBodyEditor>;

export const Empty: Story = { render: () => { const [b, sb] = useState("{}"); return <WebhookBodyEditor body={b} headers={[]} showTemplateHelp={false} copiedVar={null} onBodyChange={sb} onToggleTemplateHelp={fn()} onCopyTemplateVar={fn()} />; } };

export const WithBody: Story = { render: () => { const [b, sb] = useState('{"flagKey":"{{flagKey}}","enabled":true}'); return <WebhookBodyEditor body={b} headers={[]} showTemplateHelp={false} copiedVar={null} onBodyChange={sb} onToggleTemplateHelp={fn()} onCopyTemplateVar={fn()} />; } };
