import type { JSX } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import FindInPageIcon from '@/material-icons/400-24px/find_in_page.svg?react';
import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';

import { modes } from '../../../../../.storybook/modes';
import { Button } from '../button';
import { Surface } from '../surface';

import { WorkspacePage } from '.';
import workspaceContent from './content.module.scss';

const shellDecorator = (Story: () => JSX.Element) => (
  <div
    style={{
      minHeight: '100vh',
      padding: '32px 16px',
      background:
        'linear-gradient(180deg, rgb(243 247 255) 0%, rgb(231 238 251) 100%)',
    }}
  >
    <div style={{ margin: '0 auto', maxWidth: '960px' }}>
      <Story />
    </div>
  </div>
);

const meta = {
  title: 'Components/WorkspacePage',
  component: WorkspacePage,
  tags: ['regression'],
  decorators: [shellDecorator],
  args: {
    bindToDocument: false,
    multiColumn: true,
  },
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    chromatic: {
      modes: {
        desktop: modes.desktopLight,
        mobile: modes.mobileLight,
      },
    },
  },
} satisfies Meta<typeof WorkspacePage>;

export default meta;

type Story = StoryObj<typeof meta>;

const shellPlay: Story['play'] = async ({ args, canvas }) => {
  const title = typeof args.title === 'string' ? args.title : '';

  await expect(canvas.getByRole('region', { name: title })).toBeVisible();
  await expect(canvas.getAllByRole('button').length).toBeGreaterThan(0);
};

const renderHeaderContent = (
  eyebrow: string,
  description: string,
  noteTitle: string,
  noteBody: string,
  badges: string[],
  metrics: { label: string; value: string }[],
) => (
  <div className={workspaceContent.hero}>
    <div className={workspaceContent.split}>
      <div>
        <span className={workspaceContent.eyebrow}>{eyebrow}</span>
        <p className={workspaceContent.description}>{description}</p>
        <div className={workspaceContent.badges}>
          {badges.map((badge) => (
            <span className={workspaceContent.badge} key={badge}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className={workspaceContent.noteCard}>
        <p className={workspaceContent.noteTitle}>{noteTitle}</p>
        <p className={workspaceContent.noteBody}>{noteBody}</p>
      </div>
    </div>

    <div className={workspaceContent.metrics}>
      {metrics.map((metric) => (
        <div className={workspaceContent.metric} key={metric.label}>
          <span className={workspaceContent.metricLabel}>{metric.label}</span>
          <span className={workspaceContent.metricValue}>{metric.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const renderCardList = (
  cards: {
    title: string;
    body: string;
    cta: string;
  }[],
) => (
  <div className='scrollable'>
    <div className='item-list'>
      {cards.map((card) => (
        <Surface aria-label={card.title} key={card.title}>
          <div>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </div>
          <Button secondary>{card.cta}</Button>
        </Surface>
      ))}
    </div>
  </div>
);

export const ExploreShell: Story = {
  args: {
    title: 'Discover calmly',
    icon: 'explore',
    iconComponent: TrendingUpIcon,
    headerContent: renderHeaderContent(
      'RELATION-FIRST DISCOVERY',
      'Give search, people suggestions, and trending topics one intentional shell with enough context to scan without getting pulled into noise.',
      'Focused discovery',
      'Surface the strongest follow-up actions first, then leave plenty of breathing room for slower reading on desktop and mobile.',
      ['People first', 'Topic-led browsing', 'Quiet status lookup'],
      [
        { label: 'People', value: '48' },
        { label: 'Topics', value: '12' },
        { label: 'Saved trails', value: '09' },
      ],
    ),
  },
  render: (args) => (
    <WorkspacePage {...args}>
      {renderCardList([
        {
          title: 'Focused discovery',
          body: 'Preview the strongest relationship signals before dropping into a timeline or post detail.',
          cta: 'Review people',
        },
        {
          title: 'Curated topics',
          body: 'Keep trending tags lightweight with the same card language used across the redesigned workspace.',
          cta: 'Open topics',
        },
      ])}
    </WorkspacePage>
  ),
  play: shellPlay,
};

export const SearchResultsShell: Story = {
  args: {
    title: 'Search for calm publishing',
    icon: 'search',
    iconComponent: FindInPageIcon,
    headerContent: renderHeaderContent(
      'PRECISE SEARCH RESULTS',
      'Blend people, tags, and direct post matches into a reusable page shell that keeps search readable at both laptop and handset widths.',
      'Search cadence',
      'The redesign makes result groups feel editorial rather than utility-driven, while preserving direct access to exact matches.',
      ['Profiles first', 'Exact matches', 'Follow-up actions'],
      [
        { label: 'Profiles', value: '18' },
        { label: 'Hashtags', value: '06' },
        { label: 'Posts', value: '31' },
      ],
    ),
  },
  render: (args) => (
    <WorkspacePage {...args}>
      {renderCardList([
        {
          title: 'Result grouping',
          body: 'Organize related accounts, topics, and posts inside one scrollable surface instead of sending the user across disconnected panels.',
          cta: 'Inspect results',
        },
        {
          title: 'Mobile readability',
          body: 'Preserve the same hierarchy when the shell collapses to a phone-width viewport, with concise actions and stable spacing.',
          cta: 'Check mobile',
        },
      ])}
    </WorkspacePage>
  ),
  play: shellPlay,
};
