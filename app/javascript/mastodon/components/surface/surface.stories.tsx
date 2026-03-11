import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';

import {
  Surface,
  Panel,
  Card,
  PopoverSurface,
  ModalSurface,
  MessageSurface,
} from '.';

const meta = {
  title: 'Components/Surface',
  component: Surface,
  tags: ['test'],
} satisfies Meta<typeof Surface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '20px',
        maxWidth: 'min(720px, calc(100vw - 2rem))',
      }}
    >
      <Panel>
        <strong>Panel</strong>
        <span>
          Shared, padded surface for settings blocks and empty states.
        </span>
      </Panel>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        <Card>
          <strong>Card</strong>
          <span>Compact metric or profile metadata shell.</span>
        </Card>
        <Card tone='accent'>
          <strong>Accent card</strong>
          <span>Raised highlight built on the same primitive.</span>
        </Card>
      </div>

      <PopoverSurface style={{ maxWidth: '320px' }}>
        <strong>Popover</strong>
        <span>
          Menu, combobox, and quick-action overlays share this chrome.
        </span>
      </PopoverSurface>

      <ModalSurface style={{ maxWidth: '420px' }}>
        <div style={{ padding: '20px 20px 0', display: 'grid', gap: '12px' }}>
          <strong>Modal</strong>
          <span>
            Floating modal shell with the same border and shadow language.
          </span>
        </div>
        <div
          style={{
            padding: '0 20px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <Button secondary>Cancel</Button>
          <Button>Continue</Button>
        </div>
      </ModalSurface>

      <MessageSurface tone='success'>
        <strong>Inline message</strong>
        <span>
          Success, warning, error, and feature callouts align to the same shell.
        </span>
      </MessageSurface>
    </div>
  ),
};
