import PropTypes from 'prop-types';

import { createIntl, createIntlCache } from 'react-intl';

import { fromJS } from 'immutable';

import { render, screen } from '@/testing/rendering';

import { ServerBannerContent } from '../server_banner';

function MockAccount({ id }) {
  return (
    <a data-testid='admin-link' href={`/@${id}`}>
      {id}
    </a>
  );
}

MockAccount.propTypes = {
  id: PropTypes.string,
};

function MockShortNumber({ value }) {
  return <span data-testid='short-number'>{value}</span>;
}

MockShortNumber.propTypes = {
  value: PropTypes.number,
};

vi.mock('mastodon/components/account', () => ({
  Account: MockAccount,
}));

vi.mock('mastodon/components/server_hero_image', () => ({
  ServerHeroImage: (props) => <div data-testid='server-hero-image' {...props} />,
}));

vi.mock('mastodon/components/short_number', () => ({
  ShortNumber: MockShortNumber,
}));

vi.mock('mastodon/components/skeleton', () => ({
  Skeleton: () => <div data-testid='skeleton' />,
}));

const intl = createIntl(
  {
    locale: 'en',
    messages: {},
  },
  createIntlCache(),
);

const buildServer = (contact = {}) =>
  fromJS({
    isLoading: false,
    description: 'About this server',
    thumbnail: {
      blurhash: null,
      url: null,
    },
    usage: {
      users: {
        active_month: 42,
      },
    },
    contact,
  });

const renderServerBanner = (contact = {}, { contactAccountLoaded = !!contact.account?.id } = {}) =>
  render(
    <ServerBannerContent
      dispatch={vi.fn()}
      intl={intl}
      server={buildServer(contact)}
      contactAccountLoaded={contactAccountLoaded}
    />,
  );

describe('<ServerBanner />', () => {
  it('gives the about hero link an accessible name', () => {
    renderServerBanner({}, { contactAccountLoaded: false });

    expect(screen.getByRole('link', { name: 'About this server' }).getAttribute('href')).toBe('/about');
  });

  it('does not render a placeholder admin link when contact metadata is missing', () => {
    const { container } = renderServerBanner({}, { contactAccountLoaded: false });

    expect(container.querySelector('a[href="/@undefined"]')).toBeNull();
  });

  it('does not render a focusable admin link while the contact account entity is still loading', () => {
    renderServerBanner({ account: { id: '123' } }, { contactAccountLoaded: false });

    expect(screen.queryByTestId('admin-link')).toBeNull();
    expect(screen.getAllByTestId('skeleton')).not.toHaveLength(0);
  });
});
