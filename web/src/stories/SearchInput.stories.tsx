import type { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SearchInput } from '@/shared/components/SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Shared/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  args: { value: '', placeholder: 'Search...', onChange: fn() },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await expect(input).toHaveValue('');
  },
};

export const WithValue: Story = {
  args: { value: 'test query' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await expect(input).toHaveValue('test query');
  },
};

export const Typing: Story = {
  args: { value: '' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Search...');
    await userEvent.type(input, 'hello');
    await expect(args.onChange).toHaveBeenCalled();
  },
};
