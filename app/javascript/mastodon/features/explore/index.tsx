import { useCallback, useRef } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { NavLink, Redirect, Switch, Route } from 'react-router-dom';

import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import type { ColumnRef } from 'mastodon/components/column';
import { SymbolLogo } from 'mastodon/components/logo';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import { Search } from 'mastodon/features/compose/components/search';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';
import { useBreakpoint } from 'mastodon/features/ui/hooks/useBreakpoint';
import { useIdentity } from 'mastodon/identity_context';

import Links from './links';
import Statuses from './statuses';
import Suggestions from './suggestions';
import Tags from './tags';

const messages = defineMessages({
  title: { id: 'explore.title', defaultMessage: 'Explore' },
  eyebrow: {
    id: 'explore.workspace_eyebrow',
    defaultMessage: 'GUIDED DISCOVERY',
  },
  description: {
    id: 'explore.workspace_description',
    defaultMessage:
      'Discover through people, topics, and shared links before you fall back to the broadest public streams.',
  },
  focusTitle: {
    id: 'explore.workspace_focus_title',
    defaultMessage: 'Start with relationships, not raw heat',
  },
  focusBody: {
    id: 'explore.workspace_focus_body',
    defaultMessage:
      'Explore now leads with people and followed context so discovery feels like an extension of your workspace instead of a detached trends hub.',
  },
  peopleChip: {
    id: 'explore.workspace_people_chip',
    defaultMessage: 'People-led paths',
  },
  hashtagsChip: {
    id: 'explore.workspace_hashtags_chip',
    defaultMessage: 'Shared topics',
  },
  linksChip: {
    id: 'explore.workspace_links_chip',
    defaultMessage: 'Contextual links',
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
    <WorkspacePage
      bindToDocument={!multiColumn}
      className={discoveryStyles.discoveryPage}
      contentClassName={discoveryStyles.discoveryList}
      headerClassName={discoveryStyles.discoveryHeader}
      headerContent={
        <div className={workspaceContent.hero}>
          <div className={workspaceContent.split}>
            <div className={workspaceContent.hero}>
              <div className={workspaceContent.eyebrow}>
                {intl.formatMessage(messages.eyebrow)}
              </div>
              <p className={workspaceContent.description}>
                {intl.formatMessage(messages.description)}
              </p>
              <div className={workspaceContent.badges}>
                {signedIn && (
                  <span className={workspaceContent.badge}>
                    {intl.formatMessage(messages.peopleChip)}
                  </span>
                )}
                <span className={workspaceContent.badge}>
                  {intl.formatMessage(messages.hashtagsChip)}
                </span>
                <span className={workspaceContent.badge}>
                  {intl.formatMessage(messages.linksChip)}
                </span>
              </div>
              <div className={workspaceContent.searchSlot}>
                <Search singleColumn />
              </div>
            </div>

            <div className={workspaceContent.noteCard}>
              <p className={workspaceContent.noteTitle}>
                {intl.formatMessage(messages.focusTitle)}
              </p>
              <p className={workspaceContent.noteBody}>
                {intl.formatMessage(messages.focusBody)}
              </p>
            </div>
          </div>

          <div className={workspaceContent.tabs}>
            {signedIn && (
              <NavLink
                exact
                to='/explore/suggestions'
                className={workspaceContent.tabLink}
                activeClassName={workspaceContent.tabLinkActive}
              >
                <FormattedMessage
                  id='explore.suggested_follows'
                  defaultMessage='People'
                />
              </NavLink>
            )}
            <NavLink
              exact
              to='/explore/tags'
              className={workspaceContent.tabLink}
              activeClassName={workspaceContent.tabLinkActive}
            >
              <FormattedMessage
                id='explore.trending_tags'
                defaultMessage='Hashtags'
              />
            </NavLink>
            <NavLink
              exact
              to='/explore/posts'
              className={workspaceContent.tabLink}
              activeClassName={workspaceContent.tabLinkActive}
            >
              <FormattedMessage
                id='explore.trending_statuses'
                defaultMessage='Posts'
              />
            </NavLink>
            <NavLink
              exact
              to='/explore/links'
              className={workspaceContent.tabLink}
              activeClassName={workspaceContent.tabLinkActive}
            >
              <FormattedMessage
                id='explore.trending_links'
                defaultMessage='News'
              />
            </NavLink>
          </div>
        </div>
      }
      icon={'explore'}
      iconComponent={logoRequired ? SymbolLogo : TrendingUpIcon}
      multiColumn={multiColumn}
      onClick={handleHeaderClick}
      ref={columnRef}
      title={intl.formatMessage(messages.title)}
    >
      <Switch>
        <Route path='/explore/tags' component={Tags} />
        <Route path='/explore/links' component={Links} />
        <Route path='/explore/suggestions' component={Suggestions} />
        {signedIn && (
          <Route exact path='/explore'>
            <Redirect to='/explore/suggestions' />
          </Route>
        )}
        <Route
          exact
          path={signedIn ? '/explore/posts' : ['/explore', '/explore/posts']}
        >
          <Statuses multiColumn={multiColumn} />
        </Route>
      </Switch>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </WorkspacePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default Explore;
