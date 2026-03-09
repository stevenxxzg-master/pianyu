import type { ReactNode } from 'react';

import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountNumberFields } from './number_fields';
import { AccountTabs } from './tabs';

const { mockUseAccount, mockIsRedesignEnabled } = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockIsRedesignEnabled: vi.fn(),
}));

vi.mock('@/mastodon/hooks/useAccount', () => ({
  useAccount: mockUseAccount,
}));

vi.mock('../common', () => ({
  isRedesignEnabled: mockIsRedesignEnabled,
}));

const renderWithProviders = (ui: ReactNode, route = '/@alice') =>
  render(
    <IntlProvider locale='en'>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </IntlProvider>,
  );

describe('profile redesign account header pieces', () => {
  beforeEach(() => {
    mockIsRedesignEnabled.mockReturnValue(true);
    mockUseAccount.mockReturnValue({
      acct: 'alice',
      statuses_count: 4200,
      following_count: 1200,
      followers_count: 3400,
      created_at: '2023-03-10T00:00:00.000Z',
    });
  });

  it('renders softened relationship metrics without the posts count', () => {
    const { container } = renderWithProviders(
      <AccountNumberFields accountId='1' />,
    );

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/@alice/following',
      '/@alice/followers',
    ]);
    expect(links[0]?.textContent).toContain('Following');
    expect(links[0]?.textContent).toContain('1.2K');
    expect(links[1]?.textContent).toContain('Followers');
    expect(container.textContent).toContain('Joined on');
    expect(container.textContent).toContain('2023');
    expect(screen.queryByText(/Posts?/i)).toBeNull();
  });

  it('orders redesign tabs around activity first and media last', () => {
    renderWithProviders(<AccountTabs acct='alice' />);

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(
      ['Activity', 'Featured', 'Media'],
    );
  });
});
