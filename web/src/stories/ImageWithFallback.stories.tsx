import type { Meta, StoryObj } from "@storybook/react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

const meta: Meta<typeof ImageWithFallback> = {
  title: "App/ImageWithFallback",
  component: ImageWithFallback,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ImageWithFallback>;

export const WithImage: Story = { args: { src: "https://github.com/shadcn.png", alt: "Avatar", className: "size-16 rounded-full" } };
export const Fallback: Story = { args: { src: "/nonexistent.png", alt: "Missing", className: "size-16 rounded-full bg-muted" } };
