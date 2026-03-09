import type { ReactNode } from 'react';

import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { Map as ImmutableMap } from 'immutable';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeaturedTag } from './featured_tag';
import type { TagMap } from './featured_tag';
import classes from './styles.module.scss';

const renderWithProviders = (ui: ReactNode) =>
  render(
    <IntlProvider locale='en'>
      <MemoryRouter>{ui}</MemoryRouter>
    </IntlProvider>,
  );

describe('FeaturedTag', () => {
  it('renders featured hashtags with subdued styling hooks and metadata', () => {
    const tag = ImmutableMap<
      'id' | 'name' | 'url' | 'statuses_count' | 'last_status_at' | 'accountId',
      string | null
    >({
      id: '1',
      name: 'friends',
      statuses_count: '128',
      last_status_at: '2026-03-01T00:00:00.000Z',
      accountId: '1',
      url: '/tags/friends',
    }) as TagMap;

    const { container } = renderWithProviders(
      <FeaturedTag account='alice' tag={tag} />,
    );

    expect(container.firstElementChild?.className).toContain(
      classes.featuredTag,
    );
    expect(
      screen.getByRole('link', { name: /friends/i }).getAttribute('href'),
    ).toBe('/@alice/tagged/friends');
    expect(container.textContent).toContain('128');
    expect(container.textContent).toContain('Last post on');
  });
});
