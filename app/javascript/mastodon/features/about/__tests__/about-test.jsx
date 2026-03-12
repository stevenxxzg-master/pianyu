import PropTypes from 'prop-types';

import { createIntl, createIntlCache } from 'react-intl';

import { fromJS } from 'immutable';

import { render, screen } from '@/testing/rendering';
import { getColumnSkipLinkId } from 'mastodon/features/ui/components/skip_links';

import { About } from '../index';

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

vi.mock('mastodon/components/account', () => ({
  Account: MockAccount,
}));

vi.mock('mastodon/components/server_hero_image', () => ({
  ServerHeroImage: (props) => <div data-testid='server-hero-image' {...props} />,
}));

vi.mock('mastodon/components/skeleton', () => ({
  Skeleton: () => <div data-testid='skeleton' />,
}));

vi.mock('mastodon/features/ui/components/link_footer', () => ({
  LinkFooter: () => <div data-testid='link-footer' />,
}));

function MockSection({ children, title }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

MockSection.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
};

vi.mock('../components/section', () => ({
  Section: MockSection,
}));

vi.mock('../components/rules', () => ({
  RulesSection: () => <section data-testid='rules-section' />,
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
    domain: 'example.com',
    thumbnail: {
      blurhash: null,
      url: null,
      versions: {},
    },
    contact,
  });

const renderAbout = (contact = {}, { contactAccountLoaded = !!contact.account?.id } = {}) =>
  render(
    <About
      dispatch={vi.fn()}
      intl={intl}
      server={buildServer(contact)}
      extendedDescription={fromJS({
        isLoading: false,
        content: '',
      })}
      domainBlocks={fromJS({
        isLoading: false,
        isAvailable: false,
        items: [],
      })}
      contactAccountLoaded={contactAccountLoaded}
      locale='en'
    />,
  );

describe('<About />', () => {
  it('renders a focusable main landmark that matches the primary skip-link target', () => {
    const { container } = renderAbout({
      account: { id: '123' },
      email: 'admin@example.com',
    });

    const main = container.querySelector('main');

    expect(main).not.toBeNull();
    expect(main?.getAttribute('id')).toBe(getColumnSkipLinkId(1));
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('does not render an empty mailto link when the contact email is missing', () => {
    const { container } = renderAbout({ account: { id: '123' }, email: '' });

    expect(container.querySelector('a[href="mailto:"]')).toBeNull();
  });

  it('does not render a placeholder admin link when the contact account metadata is missing', () => {
    const { container } = renderAbout({ email: 'admin@example.com' }, { contactAccountLoaded: false });

    expect(container.querySelector('a[href="/@undefined"]')).toBeNull();
  });

  it('does not render a focusable admin link while the contact account entity is still loading', () => {
    renderAbout(
      { account: { id: '123' }, email: 'admin@example.com' },
      { contactAccountLoaded: false },
    );

    expect(screen.queryByTestId('admin-link')).toBeNull();
    expect(screen.getAllByTestId('skeleton')).not.toHaveLength(0);
  });

});
