import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import SearchIcon from '@/material-icons/400-24px/search.svg?react';

import { TextInputField, TextInput } from './text_input_field';

const meta = {
  title: 'Components/Form Fields/TextInputField',
  component: TextInputField,
  args: {
    label: 'Label',
    hint: 'This is a description of this form field',
  },
  tags: ['test'],
} satisfies Meta<typeof TextInputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole('textbox', { name: 'Label' });

    await expect(canvas.getByText('This is a description of this form field')).toBeVisible();
    await userEvent.type(input, 'Test value');
    await expect(input).toHaveValue('Test value');
  },
};

export const WithoutHint: Story = {
  args: {
    hint: undefined,
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Optional: Story = {
  args: {
    required: false,
  },
};

export const WithError: Story = {
  args: {
    required: false,
    hasError: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    hint: undefined,
    icon: SearchIcon,
  },
  play: async ({ canvas, userEvent }) => {
    const input = await canvas.findByRole('textbox', { name: 'Search' });

    await userEvent.type(input, 'alice');
    await expect(input).toHaveValue('alice');
    await expect(input.parentElement?.querySelector('svg')).not.toBeNull();
  },
};

export const Plain: Story = {
  render(args) {
    return <TextInput {...args} />;
  },
};

export const Disabled: Story = {
  ...Plain,
  args: {
    disabled: true,
    defaultValue: "This value can't be changed",
  },
  play: async ({ canvas }) => {
    const input = await canvas.findByRole('textbox');

    await expect(input).toBeDisabled();
    await expect(input).toHaveValue("This value can't be changed");
  },
};
