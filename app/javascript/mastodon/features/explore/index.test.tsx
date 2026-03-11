import { forwardRef } from 'react';
import type { ReactNode } from 'react';

import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Explore } from './index';

const mockExplore = vi.hoisted(() => ({
  signedIn: true,
  breakpoint: false,
}));

vi.mock('mastodon/components/column', () => {
  const MockColumn = forwardRef<HTMLDivElement, { children: ReactNode }>(
    ({ children }, ref) => <div ref={ref}>{children}</div>,
  );
  MockColumn.displayName = 'MockColumn';

  return { Column: MockColumn };
});

vi.mock('mastodon/components/column_header', () => {
  const MockColumnHeader = ({ title }: { title: string }) => (
    <button type='button'>{title}</button>
  );

  return { ColumnHeader: MockColumnHeader };
});

vi.mock('mastodon/components/logo', () => {
  const MockSymbolLogo = () => <span>Symbol logo</span>;

  return { SymbolLogo: MockSymbolLogo };
});

vi.mock('mastodon/features/compose/components/search', () => {
  const MockSearch = () => <div>Explore search</div>;

  return { Search: MockSearch };
});

vi.mock('mastodon/features/ui/hooks/useBreakpoint', () => ({
  useBreakpoint: () => mockExplore.breakpoint,
}));

vi.mock('mastodon/identity_context', () => ({
  useIdentity: () => ({ signedIn: mockExplore.signedIn }),
}));

vi.mock('./links', () => {
  const MockLinks = () => <div>Links panel</div>;

  return { default: MockLinks };
});

vi.mock('./statuses', () => {
  const MockStatuses = () => <div>Statuses panel</div>;

  return { default: MockStatuses };
});

vi.mock('./suggestions', () => {
  const MockSuggestions = () => <div>Suggestions panel</div>;

  return { default: MockSuggestions };
});

vi.mock('./tags', () => {
  const MockTags = () => <div>Tags panel</div>;

  return { default: MockTags };
});

const renderExplore = (path: string) =>
  render(
    <IntlProvider locale='en'>
      <MemoryRouter initialEntries={[path]}>
        <Explore multiColumn={false} />
      </MemoryRouter>
    </IntlProvider>,
  );

describe('Explore', () => {
  beforeEach(() => {
    mockExplore.signedIn = true;
    mockExplore.breakpoint = false;
  });

  it('renders the signed-in tabs and default statuses route', () => {
    renderExplore('/explore');

    expect(screen.getByText('Explore search')).toBeTruthy();
    expect(screen.getByText('Posts')).toBeTruthy();
    expect(screen.getByText('Hashtags')).toBeTruthy();
    expect(screen.getByText('People')).toBeTruthy();
    expect(screen.getByText('News')).toBeTruthy();
    expect(screen.getByText('Statuses panel')).toBeTruthy();
  });

  it('hides the people tab for signed-out users', () => {
    mockExplore.signedIn = false;

    renderExplore('/explore');

    expect(screen.queryByText('People')).toBeNull();
    expect(screen.getByText('Statuses panel')).toBeTruthy();
  });

  it('switches to the tags route content', () => {
    renderExplore('/explore/tags');

    expect(screen.getByText('Tags panel')).toBeTruthy();
    expect(screen.queryByText('Statuses panel')).toBeNull();
  });
});
