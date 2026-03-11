import { useCallback, useRef } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, NavLink, Route, Switch } from 'react-router-dom';

import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import { Column } from 'mastodon/components/column';
import type { ColumnRef } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { SymbolLogo } from 'mastodon/components/logo';
import { PublicAuthButtons } from 'mastodon/components/public_auth_buttons';
import { Search } from 'mastodon/features/compose/components/search';
import { useBreakpoint } from 'mastodon/features/ui/hooks/useBreakpoint';
import { useIdentity } from 'mastodon/identity_context';

import Links from './links';
import Statuses from './statuses';
import Suggestions from './suggestions';
import Tags from './tags';

const messages = defineMessages({
  title: { id: 'explore.title', defaultMessage: 'Trending' },
  previewTitle: {
    id: 'explore.preview.title',
    defaultMessage: 'A calmer way to sample this community in public.',
  },
  previewDescription: {
    id: 'explore.preview.description',
    defaultMessage:
      'Use discovery to scan posts, topics, and news before deciding whether this community is your pace.',
  },
});

const Explore: React.FC<{ multiColumn: boolean }> = ({ multiColumn }) => {
  const { signedIn } = useIdentity();
  const intl = useIntl();
  const columnRef = useRef<ColumnRef>(null);
  const logoRequired = useBreakpoint('full');

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.title)}
    >
      <ColumnHeader
        icon={'explore'}
        iconComponent={logoRequired ? SymbolLogo : TrendingUpIcon}
        title={intl.formatMessage(messages.title)}
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      {!signedIn && (
        <div className='public-preview-card public-preview-card--explore'>
          <div className='public-preview-card__eyebrow'>
            <FormattedMessage
              id='explore.preview.eyebrow'
              defaultMessage='Public discovery'
            />
          </div>
          <h2>{intl.formatMessage(messages.previewTitle)}</h2>
          <p>{intl.formatMessage(messages.previewDescription)}</p>
          <div className='public-preview-card__actions'>
            <PublicAuthButtons />
            <Link className='button button-secondary' to='/about'>
              <FormattedMessage
                id='explore.preview.about'
                defaultMessage='About this server'
              />
            </Link>
          </div>
        </div>
      )}

      <div className='explore__search-header'>
        <Search singleColumn />
      </div>

      <div className='account__section-headline'>
        <NavLink exact to='/explore'>
          <FormattedMessage
            tagName='div'
            id='explore.trending_statuses'
            defaultMessage='Posts'
          />
        </NavLink>

        <NavLink exact to='/explore/tags'>
          <FormattedMessage
            tagName='div'
            id='explore.trending_tags'
            defaultMessage='Hashtags'
          />
        </NavLink>

        {signedIn && (
          <NavLink exact to='/explore/suggestions'>
            <FormattedMessage
              tagName='div'
              id='explore.suggested_follows'
              defaultMessage='People'
            />
          </NavLink>
        )}

        <NavLink exact to='/explore/links'>
          <FormattedMessage
            tagName='div'
            id='explore.trending_links'
            defaultMessage='News'
          />
        </NavLink>
      </div>

      <Switch>
        <Route path='/explore/tags' component={Tags} />
        <Route path='/explore/links' component={Links} />
        <Route path='/explore/suggestions' component={Suggestions} />
        <Route exact path={['/explore', '/explore/posts']}>
          <Statuses multiColumn={multiColumn} />
        </Route>
      </Switch>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Explore;
