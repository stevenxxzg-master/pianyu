import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Button } from '../button';

import { Surface } from '.';

const meta = {
  title: 'Components/Surface',
  component: Surface,
  tags: ['regression'],
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<typeof meta>;

const assertSurface: Story['play'] = async ({ canvas }) => {
  await expect(
    canvas.getByRole('heading', { name: 'Workspace surface' }),
  ).toBeVisible();
};

export const Default: Story = {
  render(args) {
    return (
      <Surface {...args} aria-label='Workspace surface'>
        <div>
          <h2>Workspace surface</h2>
          <p>Use surfaces to group related controls and status details.</p>
        </div>
        <Button>Review changes</Button>
      </Surface>
    );
  },
  play: assertSurface,
};

export const MutedCompact: Story = {
  args: {
    tone: 'muted',
    padding: 'compact',
  },
  render(args) {
    return (
      <Surface {...args} aria-label='Workspace surface'>
        <div>
          <h2>Workspace surface</h2>
          <p>
            Compact surfaces keep secondary information visually lightweight.
          </p>
        </div>
        <Button secondary>View details</Button>
      </Surface>
    );
  },
  play: assertSurface,
};
