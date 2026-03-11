import type { ComponentType, ReactNode } from 'react';

import { List, fromJS } from 'immutable';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';

import logoWordmark from '@/images/logo-symbol-wordmark.svg';
import type { ApiMentionJSON } from '@/mastodon/api_types/statuses';
import { Column } from '@/mastodon/components/column';
import StatusList from '@/mastodon/components/status_list';
import About from '@/mastodon/features/about';
import { AccountHeader } from '@/mastodon/features/account_timeline/components/account_header';
import Compose from '@/mastodon/features/compose';
import HomeTimeline from '@/mastodon/features/home_timeline';
import NotificationsView from '@/mastodon/features/notifications_v2';
import { createNotificationGroupFromJSON } from '@/mastodon/models/notification_group';
import {
  accountFactory,
  accountFactoryState,
  relationshipsFactory,
  statusFactoryState,
} from '@/testing/factories';

const PageCanvas = ({
  children,
  auth = false,
}: {
  children: ReactNode;
  auth?: boolean;
}) => (
  <div className={`sb-page-canvas${auth ? ' sb-page-canvas--auth' : ''}`}>
    <div className='sb-page-canvas__column'>{children}</div>
  </div>
);

type StoryStatusOptions = Parameters<typeof statusFactoryState>[0] & {
  contentHtml: string;
  search_index: string;
  mentions?: ApiMentionJSON[];
};

const storyStatus = (options: StoryStatusOptions) => {
  const status = statusFactoryState({
    spoiler_text: '',
    ...options,
  } as Parameters<typeof statusFactoryState>[0]);

  return status.withMutations((draft) => {
    draft.set('mentions', fromJS(options.mentions ?? []));
    draft.set('media_attachments', fromJS(options.media_attachments ?? []));
    draft.set('emojis', fromJS(options.emojis ?? []));
  });
};

const HomeTimelinePage = HomeTimeline as ComponentType<{
  multiColumn: boolean;
}>;
const ComposePage = Compose as ComponentType<{ multiColumn: boolean }>;
const AboutPage = About as ComponentType<{ multiColumn: boolean }>;

const meAccount = accountFactoryState({
  id: '1',
  acct: 'freddie',
  username: 'freddie',
  display_name: 'Freddie Fruitbat',
  note: 'Design-system steward sharing product notes, launch rituals, and longer-form writing prompts.',
  header: '/headers/original/missing.png',
  header_static: '/headers/original/missing.png',
  followers_count: 1284,
  following_count: 412,
  statuses_count: 248,
});

const willowAccount = accountFactoryState({
  id: '2',
  acct: 'willow',
  username: 'willow',
  display_name: 'Willow Notes',
  note: 'Editor shaping narrative systems and quiet interaction details.',
  header: '/headers/original/missing.png',
  header_static: '/headers/original/missing.png',
  followers_count: 942,
  following_count: 188,
  statuses_count: 140,
});

const kaiAccount = accountFactoryState({
  id: '3',
  acct: 'kai',
  username: 'kai',
  display_name: 'Kai Studio',
  note: 'Visual designer collecting motion references and editorial layouts.',
  header: '/headers/original/missing.png',
  header_static: '/headers/original/missing.png',
  followers_count: 2150,
  following_count: 320,
  statuses_count: 365,
});

const adminAccount = accountFactoryState({
  id: '9',
  acct: 'admin',
  username: 'admin',
  display_name: 'PianYu Admin',
  note: 'Maintainer for the community playbook and release notes.',
  header: '/headers/original/missing.png',
  header_static: '/headers/original/missing.png',
});

const homeStatuses = {
  '101': storyStatus({
    id: '101',
    created_at: '2026-02-14T09:12:00.000Z',
    account: accountFactory({
      id: '2',
      acct: 'willow',
      username: 'willow',
      display_name: 'Willow Notes',
    }),
    contentHtml:
      '<p>Refined the notifications hierarchy so dense activity still reads in one quick scan.</p>',
    search_index:
      'Refined the notifications hierarchy so dense activity still reads in one quick scan.',
    reblogs_count: 8,
    favorites_count: 31,
    replies_count: 4,
  }),
  '102': storyStatus({
    id: '102',
    created_at: '2026-02-16T15:30:00.000Z',
    account: accountFactory({
      id: '3',
      acct: 'kai',
      username: 'kai',
      display_name: 'Kai Studio',
    }),
    contentHtml:
      '<p>New publish flow is feeling much calmer: tighter rhythm, clearer actions, and fewer accidental jumps.</p>',
    search_index:
      'New publish flow is feeling much calmer: tighter rhythm, clearer actions, and fewer accidental jumps.',
    reblogs_count: 14,
    favorites_count: 57,
    replies_count: 10,
  }),
  '301': storyStatus({
    id: '301',
    created_at: '2026-02-10T08:45:00.000Z',
    account: accountFactory({
      id: '1',
      acct: 'freddie',
      username: 'freddie',
      display_name: 'Freddie Fruitbat',
    }),
    contentHtml:
      '<p>Shipping the M5 visual baseline set today so future UI polish stays reviewable, not anecdotal.</p>',
    search_index:
      'Shipping the M5 visual baseline set today so future UI polish stays reviewable, not anecdotal.',
    reblogs_count: 22,
    favorites_count: 88,
    replies_count: 12,
  }),
  '302': storyStatus({
    id: '302',
    created_at: '2026-02-05T11:20:00.000Z',
    account: accountFactory({
      id: '1',
      acct: 'freddie',
      username: 'freddie',
      display_name: 'Freddie Fruitbat',
    }),
    contentHtml:
      '<p>Page-level stories are finally making the redesign discussions sharper than screenshot threads.</p>',
    search_index:
      'Page-level stories are finally making the redesign discussions sharper than screenshot threads.',
    reblogs_count: 16,
    favorites_count: 64,
    replies_count: 9,
  }),
  '401': storyStatus({
    id: '401',
    created_at: '2026-02-18T10:00:00.000Z',
    account: accountFactory({
      id: '2',
      acct: 'willow',
      username: 'willow',
      display_name: 'Willow Notes',
    }),
    contentHtml:
      '<p>@freddie the login shell now feels aligned with the landing page tone. Ready for baseline capture.</p>',
    search_index:
      'The login shell now feels aligned with the landing page tone. Ready for baseline capture.',
    mentions: [
      {
        id: '1',
        username: 'freddie',
        acct: 'freddie',
        url: '/@freddie',
      },
    ],
    reblogs_count: 2,
    favorites_count: 12,
    replies_count: 1,
  }),
};

const notificationGroups = [
  createNotificationGroupFromJSON({
    group_key: 'follow-601',
    notifications_count: 1,
    type: 'follow',
    sample_account_ids: ['2'],
    latest_page_notification_at: '2026-02-20T09:00:00.000Z',
    most_recent_notification_id: '601',
    page_min_id: '601',
    page_max_id: '601',
  }),
  createNotificationGroupFromJSON({
    group_key: 'favourite-602',
    notifications_count: 2,
    type: 'favourite',
    sample_account_ids: ['2', '3'],
    latest_page_notification_at: '2026-02-20T08:48:00.000Z',
    most_recent_notification_id: '602',
    page_min_id: '602',
    page_max_id: '603',
    status_id: '301',
  }),
  createNotificationGroupFromJSON({
    group_key: 'mention-604',
    notifications_count: 1,
    type: 'mention',
    sample_account_ids: ['2'],
    latest_page_notification_at: '2026-02-19T17:10:00.000Z',
    most_recent_notification_id: '604',
    page_min_id: '604',
    page_max_id: '604',
    status_id: '401',
  }),
];

const baseMetaState = fromJS({
  locale: 'en',
  me: '1',
  admin: '1',
  layout: 'single-column',
});

const serverFixture = {
  domain: 'pianyu.social',
  title: 'PianYu',
  version: '4.4.0',
  thumbnail: {
    url: '/headers/original/missing.png',
    blurhash: null,
    versions: {},
  },
  contact: {
    email: 'hello@pianyu.social',
    account: accountFactory({
      id: '9',
      acct: 'admin',
      username: 'admin',
      display_name: 'PianYu Admin',
    }),
  },
  rules: [
    { id: '1', text: 'Bring context, not just conclusions.' },
    {
      id: '2',
      text: 'Share work-in-progress with enough detail to invite feedback.',
    },
    {
      id: '3',
      text: 'Credit collaborators and sources when a thread builds on them.',
    },
  ],
  configuration: {
    statuses: {
      max_characters: 500,
      max_media_attachments: 4,
    },
  },
};

const extendedDescriptionFixture = {
  content:
    '<p>PianYu is a quiet social writing space for product teams, designers, and builders who want longer conversations without losing visual polish.</p><p>The M5 redesign leans into calmer density, stronger typographic hierarchy, and reviewer-friendly page rhythms.</p>',
};

const domainBlocksFixture = [
  {
    domain: 'noise.example',
    digest: 'sha256-noise',
    severity: 'silence',
    comment: 'Repeated scraping and repost spam.',
  },
];

const baseServerState = fromJS({
  server: serverFixture,
  extendedDescription: extendedDescriptionFixture,
  domainBlocks: {
    isAvailable: true,
    items: domainBlocksFixture,
  },
});

const homeTimelineState = fromJS({
  home: {
    unread: 4,
    isPartial: false,
    isLoading: false,
    hasMore: false,
    top: true,
    online: false,
    items: ['101', '102', '301'],
    pendingItems: [],
  },
});

const profileTimelineIds = List(['302', '301']);

const sharedState = {
  meta: baseMetaState,
  server: baseServerState,
  accounts: {
    '1': meAccount,
    '2': willowAccount,
    '3': kaiAccount,
    '9': adminAccount,
  },
  statuses: homeStatuses,
  relationships: fromJS({
    '1': relationshipsFactory({
      id: '1',
      following: false,
      followed_by: false,
    }),
  }),
};

const LoginPageBaseline = () => (
  <PageCanvas auth>
    <div className='container-alt'>
      <div className='logo-container'>
        <h1>
          <a href='/' aria-label='PianYu home'>
            <img
              alt='PianYu'
              className='logo logo--wordmark'
              src={logoWordmark}
            />
          </a>
        </h1>
      </div>

      <div className='form-container'>
        <form className='simple_form new_user'>
          <h1 className='title'>Sign in to PianYu</h1>
          <p className='lead'>
            Keep the redesign review loop moving with your saved drafts,
            notifications, and profile activity.
          </p>

          <div className='fields-group'>
            <div className='input with_label string optional'>
              <label
                className='string optional'
                htmlFor='storybook-login-email'
              >
                Email
              </label>
              <input
                id='storybook-login-email'
                type='email'
                defaultValue='reviewer@pianyu.social'
              />
            </div>
          </div>

          <div className='fields-group'>
            <div className='input with_label password optional'>
              <label
                className='password optional'
                htmlFor='storybook-login-password'
              >
                Password
              </label>
              <input
                id='storybook-login-password'
                type='password'
                defaultValue='storybook-password'
              />
            </div>
          </div>

          <div className='actions'>
            <button className='button' type='submit'>
              Log in
            </button>
          </div>
        </form>

        <div className='simple_form alternative-login'>
          <h4>Or continue with</h4>
          <div className='actions'>
            <button className='button button-secondary' type='button'>
              GitHub
            </button>
          </div>
        </div>

        <div className='form-footer'>
          <ul className='no-list'>
            <li>
              <a href='/auth/sign_up'>Create account</a>
            </li>
            <li>
              <a href='/auth/password/new'>Forgot password?</a>
            </li>
            <li>
              <a href='/auth/confirmation/new'>Resend confirmation</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </PageCanvas>
);

const ProfilePageBaseline = () => (
  <PageCanvas>
    <Column bindToDocument label='Profile'>
      <StatusList
        alwaysPrepend
        prepend={<AccountHeader accountId='1' />}
        scrollKey='storybook-profile'
        statusIds={profileTimelineIds}
        featuredStatusIds={List(['301'])}
        isLoading={false}
        hasMore={false}
        timelineId='account'
        withCounters
        bindToDocument
      />
    </Column>
  </PageCanvas>
);

const meta = {
  title: 'Pages/Key Visual Baselines',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Critical M5 route baselines for the home timeline, publish flow, notifications, profile, landing surface, and login shell. Existing design-system component baselines remain available under `Components/*`.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Home: Story = {
  render: () => (
    <PageCanvas>
      <HomeTimelinePage multiColumn={false} />
    </PageCanvas>
  ),
  parameters: {
    router: {
      initialEntries: ['/home'],
    },
    state: {
      ...sharedState,
      timelines: homeTimelineState,
      announcements: fromJS({
        items: [],
        isLoading: false,
        show: false,
      }),
    },
    msw: {
      handlers: [
        http.get('/api/v1/announcements', () => HttpResponse.json([])),
      ],
    },
  },
};

export const Publish: Story = {
  render: () => (
    <PageCanvas>
      <ComposePage multiColumn={false} />
    </PageCanvas>
  ),
  parameters: {
    router: {
      initialEntries: ['/publish'],
    },
    state: {
      ...sharedState,
      media_attachments: fromJS({
        accept_content_types: [],
      }),
      compose: fromJS({
        privacy: 'public',
        default_privacy: 'public',
        default_quote_policy: 'public',
        language: 'en',
        spoiler: false,
        text: 'Baseline review checkpoint:\n\n- key pages are visible in Storybook\n- Chromatic can diff the route shells\n- component stories remain the source for atom-level checks',
        media_attachments: [],
        suggestions: [],
        is_submitting: false,
        is_uploading: false,
        is_changing_upload: false,
        quoted_status_id: null,
      }),
    },
  },
};

export const NotificationsPage: Story = {
  render: () => (
    <PageCanvas>
      <NotificationsView multiColumn={false} />
    </PageCanvas>
  ),
  parameters: {
    router: {
      initialEntries: ['/notifications'],
    },
    state: {
      ...sharedState,
      notificationGroups: {
        groups: notificationGroups,
        pendingGroups: [],
        scrolledToTop: true,
        isLoading: false,
        lastReadId: '500',
        readMarkerId: '500',
        mounted: 0,
        isTabVisible: true,
        mergedNotifications: 'ok',
      },
    },
  },
  name: 'Notifications',
};

export const Profile: Story = {
  render: () => <ProfilePageBaseline />,
  parameters: {
    router: {
      initialEntries: ['/@freddie'],
    },
    state: {
      ...sharedState,
    },
  },
};

export const Landing: Story = {
  render: () => (
    <PageCanvas>
      <AboutPage multiColumn={false} />
    </PageCanvas>
  ),
  parameters: {
    router: {
      initialEntries: ['/about'],
    },
    state: {
      ...sharedState,
    },
    msw: {
      handlers: [
        http.get('/api/v2/instance', () => HttpResponse.json(serverFixture)),
        http.get('/api/v1/instance/extended_description', () =>
          HttpResponse.json(extendedDescriptionFixture),
        ),
        http.get('/api/v1/instance/domain_blocks', () =>
          HttpResponse.json(domainBlocksFixture),
        ),
      ],
    },
  },
  name: 'Landing (About)',
};

export const Login: Story = {
  render: () => <LoginPageBaseline />,
  parameters: {
    identity: {
      signedIn: false,
      accountId: undefined,
    },
  },
};
