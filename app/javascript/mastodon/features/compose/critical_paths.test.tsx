import type { ReactElement, ReactNode } from 'react';

import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ComposePanel,
  RedirectToMobileComposeIfNeeded,
} from '../ui/components/compose_panel';

import { Compose } from './index';

const mockCompose = vi.hoisted(() => ({
  columnIds: [] as string[],
  mounted: 1,
  shouldRedirect: false,
  signedIn: true,
  dispatch: vi.fn(),
  history: {
    push: vi.fn(),
  },
}));

vi.mock('mastodon/store', () => ({
  useAppDispatch: () => mockCompose.dispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      settings: {
        get: (key: string) => {
          if (key === 'columns') {
            return mockCompose.columnIds.map((id) => ({
              get: (property: string) => (property === 'id' ? id : undefined),
            }));
          }

          return undefined;
        },
      },
      compose: {
        get: (key: string) => {
          if (key === 'mounted') {
            return mockCompose.mounted;
          }

          if (key === 'should_redirect_to_compose_page') {
            return mockCompose.shouldRedirect;
          }

          return undefined;
        },
      },
    }),
}));

vi.mock('mastodon/identity_context', () => ({
  useIdentity: () => ({ signedIn: mockCompose.signedIn }),
}));

vi.mock('@/mastodon/hooks/useLayout', () => ({
  useLayout: () => ({
    singleColumn: false,
    multiColumn: true,
    layout: 'multi-column',
  }),
}));

vi.mock('mastodon/components/router', () => ({
  useAppHistory: () => mockCompose.history,
}));

vi.mock('mastodon/actions/compose', () => ({
  changeComposing: (value: boolean) => ({ type: 'CHANGE_COMPOSING', value }),
  mountCompose: () => ({ type: 'MOUNT_COMPOSE' }),
  unmountCompose: () => ({ type: 'UNMOUNT_COMPOSE' }),
}));

vi.mock('mastodon/actions/modal', () => ({
  openModal: ({ modalType }: { modalType: string }) => ({
    type: 'OPEN_MODAL',
    modalType,
  }),
}));

vi.mock('mastodon/components/column', () => {
  const MockColumn = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  return { Column: MockColumn };
});

vi.mock('mastodon/components/column_header', () => {
  const MockColumnHeader = ({ title }: { title: string }) => <div>{title}</div>;

  return { ColumnHeader: MockColumnHeader };
});

vi.mock('mastodon/components/icon', () => {
  const MockIcon = () => <span>icon</span>;

  return { Icon: MockIcon };
});

vi.mock('mastodon/components/server_banner', () => {
  const MockServerBanner = () => <div>Server banner</div>;

  return { default: MockServerBanner };
});

vi.mock('mastodon/features/ui/components/link_footer', () => {
  const MockLinkFooter = () => <div>Link footer</div>;

  return { LinkFooter: MockLinkFooter };
});

vi.mock('./components/search', () => {
  const MockComposeSearch = () => <div>Compose search</div>;

  return { Search: MockComposeSearch };
});

vi.mock('mastodon/features/compose/components/search', () => {
  const MockComposeSearch = () => <div>Compose search</div>;

  return { Search: MockComposeSearch };
});

vi.mock('./containers/compose_form_container', () => {
  const MockComposeFormContainer = () => <div>Compose form</div>;

  return { default: MockComposeFormContainer };
});

vi.mock('mastodon/features/compose/containers/compose_form_container', () => {
  const MockComposeFormContainer = () => <div>Compose form</div>;

  return { default: MockComposeFormContainer };
});

vi.mock('../ui/components/navigation_bar', () => ({
  messages: {
    publish: { id: 'tabs_bar.publish', defaultMessage: 'New Post' },
    menu: { id: 'navigation_bar.menu', defaultMessage: 'Menu' },
    home: { id: 'tabs_bar.home', defaultMessage: 'Home' },
    notifications: {
      id: 'tabs_bar.notifications',
      defaultMessage: 'Notifications',
    },
  },
}));

vi.mock('mastodon/initial_state', () => ({
  mascot: null,
  reduceMotion: true,
}));

const renderWithIntl = (ui: ReactElement) =>
  render(
    <IntlProvider locale='en'>
      <MemoryRouter>{ui}</MemoryRouter>
    </IntlProvider>,
  );

describe('compose critical paths', () => {
  beforeEach(() => {
    mockCompose.columnIds = [];
    mockCompose.mounted = 1;
    mockCompose.shouldRedirect = false;
    mockCompose.signedIn = true;
    mockCompose.dispatch.mockReset();
    mockCompose.history.push.mockReset();
  });

  it('hides duplicate drawer shortcuts when their columns already exist', () => {
    mockCompose.columnIds = ['HOME', 'NOTIFICATIONS'];

    renderWithIntl(<Compose multiColumn />);

    expect(screen.getByLabelText('Menu').getAttribute('href')).toBe(
      '/getting-started',
    );
    expect(screen.queryByLabelText('Home')).toBeNull();
    expect(screen.queryByLabelText('Notifications')).toBeNull();
    expect(
      screen.getByLabelText('Live feed (local)').getAttribute('href'),
    ).toBe('/public/local');
    expect(screen.getAllByText('Compose form')).toHaveLength(1);
  });

  it('renders the standalone compose column in single-column mode', () => {
    renderWithIntl(<Compose multiColumn={false} />);

    expect(screen.getByText('New Post')).toBeTruthy();
    expect(screen.getByText('Compose form')).toBeTruthy();
  });

  it('renders the sidebar composer until another composer is mounted', () => {
    const { unmount } = renderWithIntl(<ComposePanel />);

    expect(screen.getByText('Compose search')).toBeTruthy();
    expect(screen.getByText('Compose form')).toBeTruthy();
    expect(mockCompose.dispatch).toHaveBeenCalledWith({
      type: 'MOUNT_COMPOSE',
    });

    unmount();

    expect(mockCompose.dispatch).toHaveBeenCalledWith({
      type: 'UNMOUNT_COMPOSE',
    });
  });

  it('keeps the sidebar shell visible while suppressing duplicate compose forms', () => {
    mockCompose.mounted = 2;

    renderWithIntl(<ComposePanel />);

    expect(screen.getByText('Compose search')).toBeTruthy();
    expect(screen.queryByText('Compose form')).toBeNull();
    expect(screen.getByText('Link footer')).toBeTruthy();
  });

  it('shows the signed-out server banner instead of the composer', () => {
    mockCompose.signedIn = false;

    renderWithIntl(<ComposePanel />);

    expect(screen.getByText('Server banner')).toBeTruthy();
    expect(screen.queryByText('Compose form')).toBeNull();
  });

  it('redirects mobile compose sessions to the publish page when requested', () => {
    mockCompose.shouldRedirect = true;

    renderWithIntl(<RedirectToMobileComposeIfNeeded />);

    expect(mockCompose.history.push).toHaveBeenCalledWith('/publish');
  });
});
