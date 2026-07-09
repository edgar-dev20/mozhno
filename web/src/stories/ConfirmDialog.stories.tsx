import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ConfirmDialog } from "@/app/components/ConfirmDialog";
import { useState } from "react";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => {
      const [open, setOpen] = useState(true);
      return <Story args={{ open, onOpenChange: setOpen }} />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Destructive: Story = {
  args: {
    title: "Удалить фича-флаг?",
    description:
      "Флаг «checkout-v2» и все связанные правила будут удалены без возможности восстановления.",
    variant: "destructive",
    confirmLabel: "Удалить",
    confirmPhrase: "checkout-v2",
    onConfirm: fn(),
  },
};

export const DestructiveNoPhrase: Story = {
  args: {
    title: "Удалить элемент?",
    description: "Это действие затронет связанные данные.",
    variant: "destructive",
    confirmLabel: "Удалить",
    onConfirm: fn(),
  },
};

export const Default: Story = {
  args: {
    title: "Архивировать флаг?",
    description:
      "Флаг «checkout-v2» переместится в архив. Вы сможете восстановить его позже.",
    variant: "default",
    confirmLabel: "Архивировать",
    onConfirm: fn(),
  },
};

export const Warning: Story = {
  args: {
    title: "Сбросить пароль?",
    description:
      "Пользователю придёт письмо со ссылкой для сброса пароля. Текущая сессия завершится.",
    variant: "warning",
    confirmLabel: "Сбросить пароль",
    onConfirm: fn(),
  },
};

export const Loading: Story = {
  args: {
    title: "Удаление…",
    description: "Пожалуйста, подождите, идёт удаление флага.",
    variant: "destructive",
    confirmLabel: "Удалить",
    confirmPhrase: "checkout-v2",
    loading: true,
    onConfirm: fn(),
  },
};

export const WithRichContent: Story = {
  args: {
    title: "Подтвердите изменения",
    description: "Проверьте детали перед применением.",
    variant: "default",
    confirmLabel: "Применить",
    onConfirm: fn(),
    children: (
      <div className="rounded-lg border border-border bg-secondary/50 p-4 text-body-sm text-muted-foreground">
        Здесь может быть произвольный контент — сводка, диф или предпросмотр.
      </div>
    ),
  },
};
