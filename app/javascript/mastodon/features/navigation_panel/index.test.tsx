import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NavigationPanel } from './index';

const mockNavigation = vi.hoisted(() => ({
  identity: {
    signedIn: true,
    permissions: 0,
    disabledAccountId: undefined,
  },
  breakpoint: false,
  canViewLocal: true,
  canViewRemote: false,
  notificationsCount: 0,
  followRequestsCount: 0,
  dispatch: vi.fn(),
}));

vi.mock('mastodon/features/compose/components/search', () => {
  const MockSearch = () => <div>Search</div>;

  return { Search: MockSearch };
});

vi.mock('mastodon/features/ui/components/column_link', () => {
  const MockColumnLink = ({
    text,
    to,
    href,
    className,
  }: {
    text: string;
    to?: string;
    href?: string;
    className?: string;
  }) => (
    <a className={className} href={to ?? href}>
      {text}
    </a>
  );

  return { ColumnLink: MockColumnLink };
});

vi.mock('mastodon/features/ui/components/skip_links', () => ({
  getNavigationSkipLinkId: () => 'navigation-skip-link',
}));

vi.mock('mastodon/features/ui/hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockNavigation.breakpoint,
}));

vi.mock('mastodon/identity_context', () => ({
  useIdentity: () => mockNavigation.identity,
}));

vi.mock('mastodon/initial_state', async () => {
  const actual = await vi.importActual('mastodon/initial_state');

  return {
    ...actual,
    forceSingleColumn: false,
    localLiveFeedAccess: 'local-feed',
    remoteLiveFeedAccess: 'remote-feed',
    trendsEnabled: true,
    me: '123',
  };
});

vi.mock('mastodon/permissions', () => ({
  canViewFeed: (_signedIn: boolean, _permissions: number, feed: string) => {
    if (feed === 'local-feed') {
      return mockNavigation.canViewLocal;
    }

    if (feed === 'remote-feed') {
      return mockNavigation.canViewRemote;
    }

    return false;
  },
}));

vi.mock('mastodon/selectors/notifications', () => ({
  selectUnreadNotificationGroupsCount: (state: {
    notificationsCount: number;
  }) => state.notificationsCount,
}));

vi.mock('mastodon/store', () => ({
  useAppDispatch: () => mockNavigation.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      notificationsCount: mockNavigation.notificationsCount,
      user_lists: {
        getIn: () =>
          mockNavigation.followRequestsCount > 0
            ? { size: mockNavigation.followRequestsCount }
            : undefined,
      },
      navigation: {
        open: false,
      },
    }),
}));

vi.mock('mastodon/actions/accounts', () => ({
  fetchFollowRequests: () => ({ type: 'FETCH_FOLLOW_REQUESTS' }),
}));

vi.mock('mastodon/actions/navigation', () => ({
  openNavigation: () => ({ type: 'OPEN_NAVIGATION' }),
  closeNavigation: () => ({ type: 'CLOSE_NAVIGATION' }),
}));

vi.mock('mastodon/components/account', () => {
  const MockAccount = () => <div>Profile card</div>;

  return { Account: MockAccount };
});

vi.mock('mastodon/components/icon_with_badge', () => {
  const MockIconWithBadge = () => <span>badge</span>;

  return { IconWithBadge: MockIconWithBadge };
});

vi.mock('mastodon/components/logo', () => {
  const MockWordmarkLogo = () => <span>Wordmark</span>;

  return { WordmarkLogo: MockWordmarkLogo };
});

vi.mock('../annual_report/nav_item', () => ({
  AnnualReportNavItem: () => null,
}));

vi.mock('../collections/utils', () => ({
  areCollectionsEnabled: () => false,
}));

vi.mock('./components/disabled_account_banner', () => {
  const MockDisabledAccountBanner = () => <div>Disabled banner</div>;

  return { DisabledAccountBanner: MockDisabledAccountBanner };
});

vi.mock('./components/followed_tags_panel', () => ({
  FollowedTagsPanel: () => null,
}));

vi.mock('./components/list_panel', () => ({
  ListPanel: () => null,
}));

vi.mock('./components/more_link', () => {
  const MockMoreLink = () => <a href='/more'>More</a>;

  return { MoreLink: MockMoreLink };
});

vi.mock('./components/sign_in_banner', () => {
  const MockSignInBanner = () => <div>Sign in banner</div>;

  return { SignInBanner: MockSignInBanner };
});

vi.mock('./components/trends', () => {
  const MockTrends = () => <div>Trends footer</div>;

  return { Trends: MockTrends };
});

const renderNavigationPanel = (multiColumn = false) =>
  render(
    <IntlProvider locale='en'>
      <MemoryRouter>
        <NavigationPanel multiColumn={multiColumn} />
      </MemoryRouter>
    </IntlProvider>,
  );

describe('NavigationPanel', () => {
  beforeEach(() => {
    mockNavigation.identity = {
      signedIn: true,
      permissions: 0,
      disabledAccountId: undefined,
    };
    mockNavigation.breakpoint = false;
    mockNavigation.canViewLocal = true;
    mockNavigation.canViewRemote = false;
    mockNavigation.notificationsCount = 0;
    mockNavigation.followRequestsCount = 0;
    mockNavigation.dispatch.mockReset();
  });

  it('surfaces the core signed-in navigation links', () => {
    renderNavigationPanel();

    expect(
      screen.getByRole('link', { name: 'New Post' }).getAttribute('href'),
    ).toBe('/publish');
    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('href'),
    ).toBe('/home');
    expect(
      screen.getByRole('link', { name: 'Trending' }).getAttribute('href'),
    ).toBe('/explore');
    expect(
      screen.getByRole('link', { name: 'Live feed' }).getAttribute('href'),
    ).toBe('/public/local');
    expect(
      screen.getByRole('link', { name: 'About' }).getAttribute('href'),
    ).toBe('/about');
  });

  it('falls back to the remote firehose when the local feed is unavailable', () => {
    mockNavigation.canViewLocal = false;
    mockNavigation.canViewRemote = true;

    renderNavigationPanel();

    expect(
      screen.getByRole('link', { name: 'Live feed' }).getAttribute('href'),
    ).toBe('/public/remote');
  });

  it('omits the compose shortcut in multi-column mode', () => {
    renderNavigationPanel(true);

    expect(screen.queryByRole('link', { name: 'New Post' })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Home' }).getAttribute('href'),
    ).toBe('/home');
  });
});
