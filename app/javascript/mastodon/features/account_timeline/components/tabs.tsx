import type { FC } from 'react';

import { FormattedMessage } from 'react-intl';

import { useLocation } from 'react-router';
import type { NavLinkProps } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import { buildAccountActivityLocation, isRedesignEnabled } from '../common';

import classes from './redesign.module.scss';

export const AccountTabs: FC<{ acct: string }> = ({ acct }) => {
  const location = useLocation();

  if (isRedesignEnabled()) {
    const searchParams = new URLSearchParams(location.search);
    const boosts = parseBooleanParam(searchParams.get('boosts')) ?? true;
    const replies =
      location.pathname.endsWith('/with_replies') ||
      parseBooleanParam(searchParams.get('replies')) === true;

    const activityDestination = buildAccountActivityLocation({
      acct,
      boosts,
      replies,
    });

    return (
      <div className={classes.tabs}>
        <NavLink isActive={isActivityTabActive(acct)} to={activityDestination}>
          <FormattedMessage id='account.activity' defaultMessage='Activity' />
        </NavLink>
        <NavLink exact isActive={isMediaTabActive(acct)} to={`/@${acct}/media`}>
          <FormattedMessage id='account.media' defaultMessage='Media' />
        </NavLink>
        <NavLink
          exact
          isActive={isFeaturedTabActive(acct)}
          to={`/@${acct}/featured`}
        >
          <FormattedMessage id='account.featured' defaultMessage='Featured' />
        </NavLink>
      </div>
    );
  }
  return (
    <div className='account__section-headline'>
      <NavLink exact to={`/@${acct}/featured`}>
        <FormattedMessage id='account.featured' defaultMessage='Featured' />
      </NavLink>
      <NavLink exact to={`/@${acct}`}>
        <FormattedMessage id='account.posts' defaultMessage='Posts' />
      </NavLink>
      <NavLink exact to={`/@${acct}/with_replies`}>
        <FormattedMessage
          id='account.posts_with_replies'
          defaultMessage='Posts and replies'
        />
      </NavLink>
      <NavLink exact to={`/@${acct}/media`}>
        <FormattedMessage id='account.media' defaultMessage='Media' />
      </NavLink>
    </div>
  );
};

const parseBooleanParam = (value: string | null) => {
  if (value === null) {
    return null;
  }

  return value === '1' || value === 'true';
};

const isActivityTabActive =
  (acct: string): Required<NavLinkProps>['isActive'] =>
  (_match, location) =>
    location.pathname === `/@${acct}` ||
    location.pathname === `/@${acct}/with_replies` ||
    location.pathname.startsWith(`/@${acct}/tagged/`) ||
    /^\/accounts\/[^/]+(?:\/with_replies|\/tagged\/[^/]+)?$/.test(
      location.pathname,
    );

const isMediaTabActive =
  (acct: string): Required<NavLinkProps>['isActive'] =>
  (_match, location) =>
    location.pathname === `/@${acct}/media` ||
    /^\/accounts\/[^/]+\/media$/.test(location.pathname);

const isFeaturedTabActive =
  (acct: string): Required<NavLinkProps>['isActive'] =>
  (_match, location) =>
    location.pathname === `/@${acct}/featured` ||
    /^\/accounts\/[^/]+\/featured$/.test(location.pathname);
