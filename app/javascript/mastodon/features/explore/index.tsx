import { useCallback, useRef } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, NavLink, Switch, Route } from 'react-router-dom';

import PeopleIcon from '@/material-icons/400-24px/group.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import { Column } from 'mastodon/components/column';
import type { ColumnRef } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { SymbolLogo } from 'mastodon/components/logo';
import { Search } from 'mastodon/features/compose/components/search';
import { useBreakpoint } from 'mastodon/features/ui/hooks/useBreakpoint';
import { useIdentity } from 'mastodon/identity_context';

import Links from './links';
import Statuses from './statuses';
import Suggestions from './suggestions';
import Tags from './tags';

const messages = defineMessages({
  title: { id: 'explore.title', defaultMessage: 'Explore' },
  heroEyebrow: {
    id: 'explore.hero.eyebrow',
    defaultMessage: 'Light discovery',
  },
  heroTitle: {
    id: 'explore.hero.title',
    defaultMessage: 'Find people and conversations without the noise',
  },
  heroDescription: {
    id: 'explore.hero.description',
    defaultMessage:
      'Search first, then jump into people or topics when you need a gentle starting point.',
  },
  peopleDescription: {
    id: 'explore.hero.people_description',
    defaultMessage: 'Suggested follows and fresh profiles to meet.',
  },
  topics: { id: 'explore.topics', defaultMessage: 'Topics' },
  topicsDescription: {
    id: 'explore.hero.topics_description',
    defaultMessage: 'Browse hashtags and active conversation starters.',
  },
  secondaryLabel: {
    id: 'explore.hero.secondary_label',
    defaultMessage: 'Browse more',
  },
  postsDescription: {
    id: 'explore.hero.posts_description',
    defaultMessage: 'Open trending posts only when you want the pulse.',
  },
  linksDescription: {
    id: 'explore.hero.links_description',
    defaultMessage: 'Catch up on shared links without making them the default.',
  },
  discoverTab: {
    id: 'explore.discover_tab',
    defaultMessage: 'Discover',
  },
  overviewEyebrow: {
    id: 'explore.overview.eyebrow',
    defaultMessage: 'Start here',
  },
  overviewTitle: {
    id: 'explore.overview.title',
    defaultMessage: 'Choose a gentle starting point',
  },
  overviewDescription: {
    id: 'explore.overview.description',
    defaultMessage:
      'People and topics stay front and center here, while broader trend feeds remain optional detours.',
  },
  overviewFindPeople: {
    id: 'explore.overview.find_people',
    defaultMessage: 'Find people',
  },
  overviewBrowseTopics: {
    id: 'explore.overview.browse_topics',
    defaultMessage: 'Browse topics',
  },
  overviewSearchTitle: {
    id: 'explore.overview.search_title',
    defaultMessage: 'Search when you know what you need',
  },
  overviewSearchDescription: {
    id: 'explore.overview.search_description',
    defaultMessage:
      'Jump straight to profiles, hashtags, or posts without losing your place in the discovery flow.',
  },
  overviewOpenSearch: {
    id: 'explore.overview.open_search',
    defaultMessage: 'Open search',
  },
  overviewPulseTitle: {
    id: 'explore.overview.pulse_title',
    defaultMessage: 'Check the broader pulse only when you want it',
  },
  overviewPulseDescription: {
    id: 'explore.overview.pulse_description',
    defaultMessage:
      'Trending posts and shared links remain available without taking over the default Explore experience.',
  },
  overviewViewPosts: {
    id: 'explore.overview.view_posts',
    defaultMessage: 'View posts',
  },
  overviewViewNews: {
    id: 'explore.overview.view_news',
    defaultMessage: 'View news',
  },
});

const ExploreOverview: React.FC<{ signedIn: boolean }> = ({ signedIn }) => {
  const intl = useIntl();

  return (
    <div className='explore-page__overview'>
      <section className='explore-page__overview-card'>
        <span className='explore-page__overview-card__eyebrow'>
          {intl.formatMessage(messages.overviewEyebrow)}
        </span>
        <h3>{intl.formatMessage(messages.overviewTitle)}</h3>
        <p>{intl.formatMessage(messages.overviewDescription)}</p>
        <div className='explore-page__overview-card__actions'>
          {signedIn && (
            <Link
              className='explore-page__overview-card__action'
              to='/explore/suggestions'
            >
              {intl.formatMessage(messages.overviewFindPeople)}
            </Link>
          )}
          <Link
            className='explore-page__overview-card__action'
            to='/explore/tags'
          >
            {intl.formatMessage(messages.overviewBrowseTopics)}
          </Link>
        </div>
      </section>

      <div className='explore-page__overview-grid'>
        <section className='explore-page__overview-panel'>
          <h4>{intl.formatMessage(messages.overviewSearchTitle)}</h4>
          <p>{intl.formatMessage(messages.overviewSearchDescription)}</p>
          <Link className='explore-page__overview-panel__action' to='/search'>
            {intl.formatMessage(messages.overviewOpenSearch)}
          </Link>
        </section>

        <section className='explore-page__overview-panel'>
          <h4>{intl.formatMessage(messages.overviewPulseTitle)}</h4>
          <p>{intl.formatMessage(messages.overviewPulseDescription)}</p>
          <div className='explore-page__overview-panel__actions'>
            <Link
              className='explore-page__overview-panel__action'
              to='/explore/posts'
            >
              {intl.formatMessage(messages.overviewViewPosts)}
            </Link>
            <Link
              className='explore-page__overview-panel__action'
              to='/explore/links'
            >
              {intl.formatMessage(messages.overviewViewNews)}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const Explore: React.FC<{ multiColumn: boolean }> = ({ multiColumn }) => {
  const intl = useIntl();
  const { signedIn } = useIdentity();
  const title = intl.formatMessage(messages.title);
  const columnRef = useRef<ColumnRef>(null);
  const logoRequired = useBreakpoint('full');

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  return (
    <Column bindToDocument={!multiColumn} ref={columnRef} label={title}>
      <ColumnHeader
        icon={'explore'}
        iconComponent={logoRequired ? SymbolLogo : TrendingUpIcon}
        title={title}
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <div className='explore__search-header explore-page__hero'>
        <div className='explore-page__hero__content'>
          <div className='explore-page__hero__copy'>
            <span className='explore-page__eyebrow'>
              {intl.formatMessage(messages.heroEyebrow)}
            </span>
            <h2>{intl.formatMessage(messages.heroTitle)}</h2>
            <p>{intl.formatMessage(messages.heroDescription)}</p>
          </div>

          <div className='explore-page__hero__search'>
            <Search singleColumn modernized />
          </div>

          <div className='explore-page__quick-links'>
            {signedIn && (
              <NavLink
                exact
                to='/explore/suggestions'
                className='explore-page__spotlight-card'
                activeClassName='active'
              >
                <span className='explore-page__spotlight-card__icon'>
                  <Icon id='users' icon={PeopleIcon} />
                </span>
                <span className='explore-page__spotlight-card__body'>
                  <strong>
                    <FormattedMessage
                      id='explore.suggested_follows'
                      defaultMessage='People'
                    />
                  </strong>
                  <span>{intl.formatMessage(messages.peopleDescription)}</span>
                </span>
              </NavLink>
            )}

            <NavLink
              exact
              to='/explore/tags'
              className='explore-page__spotlight-card'
              activeClassName='active'
            >
              <span className='explore-page__spotlight-card__icon'>
                <Icon id='hashtag' icon={TagIcon} />
              </span>
              <span className='explore-page__spotlight-card__body'>
                <strong>{intl.formatMessage(messages.topics)}</strong>
                <span>{intl.formatMessage(messages.topicsDescription)}</span>
              </span>
            </NavLink>
          </div>

          <div className='explore-page__secondary-links'>
            <span className='explore-page__secondary-links__label'>
              {intl.formatMessage(messages.secondaryLabel)}
            </span>
            <NavLink
              exact
              to='/explore/posts'
              className='explore-page__secondary-link'
              activeClassName='active'
            >
              <span>
                <FormattedMessage
                  id='explore.trending_statuses'
                  defaultMessage='Posts'
                />
              </span>
              <small>{intl.formatMessage(messages.postsDescription)}</small>
            </NavLink>
            <NavLink
              exact
              to='/explore/links'
              className='explore-page__secondary-link'
              activeClassName='active'
            >
              <span>
                <FormattedMessage
                  id='explore.trending_links'
                  defaultMessage='News'
                />
              </span>
              <small>{intl.formatMessage(messages.linksDescription)}</small>
            </NavLink>
          </div>
        </div>
      </div>

      <div className='account__section-headline explore-page__tabs'>
        <NavLink exact to='/explore'>
          {intl.formatMessage(messages.discoverTab)}
        </NavLink>

        {signedIn && (
          <NavLink exact to='/explore/suggestions'>
            <FormattedMessage
              id='explore.suggested_follows'
              defaultMessage='People'
            />
          </NavLink>
        )}

        <NavLink exact to='/explore/tags'>
          {intl.formatMessage(messages.topics)}
        </NavLink>
      </div>

      <div className='explore-page__content'>
        <Switch>
          <Route exact path='/explore'>
            <ExploreOverview signedIn={signedIn} />
          </Route>
          <Route path='/explore/tags' component={Tags} />
          <Route path='/explore/links' component={Links} />
          <Route path='/explore/suggestions' component={Suggestions} />
          <Route exact path='/explore/posts'>
            <Statuses multiColumn={multiColumn} />
          </Route>
        </Switch>
      </div>

      <Helmet>
        <title>{title}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Explore;
