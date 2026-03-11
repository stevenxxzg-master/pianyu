import type { FC } from 'react';

import { useIntl } from 'react-intl';

import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import {
  FollowersCounter,
  FollowingCounter,
  StatusesCounter,
} from '@/mastodon/components/counters';
import { FormattedDateWrapper } from '@/mastodon/components/formatted_date';
import { ShortNumber } from '@/mastodon/components/short_number';
import { useAccount } from '@/mastodon/hooks/useAccount';

import { buildAccountActivityLocation, isRedesignEnabled } from '../common';

import classes from './redesign.module.scss';

export const AccountNumberFields: FC<{ accountId: string }> = ({
  accountId,
}) => {
  const intl = useIntl();
  const account = useAccount(accountId);

  if (!account) {
    return null;
  }

  if (!isRedesignEnabled()) {
    return (
      <div className='account__header__extra__links'>
        <NavLink
          to={`/@${account.acct}`}
          title={intl.formatNumber(account.statuses_count)}
        >
          <ShortNumber
            value={account.statuses_count}
            renderer={StatusesCounter}
          />
        </NavLink>

        <NavLink
          exact
          to={`/@${account.acct}/following`}
          title={intl.formatNumber(account.following_count)}
        >
          <ShortNumber
            value={account.following_count}
            renderer={FollowingCounter}
          />
        </NavLink>

        <NavLink
          exact
          to={`/@${account.acct}/followers`}
          title={intl.formatNumber(account.followers_count)}
        >
          <ShortNumber
            value={account.followers_count}
            renderer={FollowersCounter}
          />
        </NavLink>
      </div>
    );
  }

  const postsLocation = buildAccountActivityLocation({
    acct: account.acct,
    boosts: false,
    replies: false,
  });

  const stats = [
    {
      to: postsLocation,
      label: intl.formatMessage({
        id: 'account.posts',
        defaultMessage: 'Posts',
      }),
      value: account.statuses_count,
    },
    {
      to: `/@${account.acct}/following`,
      label: intl.formatMessage({
        id: 'account.following',
        defaultMessage: 'Following',
      }),
      value: account.following_count,
    },
    {
      to: `/@${account.acct}/followers`,
      label: intl.formatMessage({
        id: 'account.followers',
        defaultMessage: 'Followers',
      }),
      value: account.followers_count,
    },
  ];

  return (
    <div
      className={classNames(
        'account__header__extra__links',
        classes.fieldNumbersWrapper,
      )}
    >
      {stats.map((stat) => (
        <NavLink key={stat.label} to={stat.to} className={classes.statCard}>
          <span className={classes.statLabel}>{stat.label}</span>
          <strong className={classes.statValue}>
            {intl.formatNumber(stat.value)}
          </strong>
        </NavLink>
      ))}

      <div className={classNames(classes.statCard, classes.metaCard)}>
        <span className={classes.statLabel}>
          {intl.formatMessage({
            id: 'account.joined_short',
            defaultMessage: 'Joined',
          })}
        </span>
        <strong className={classNames(classes.statValue, classes.metaValue)}>
          <FormattedDateWrapper
            value={account.created_at}
            year='numeric'
            month='short'
            day='2-digit'
          />
        </strong>
      </div>
    </div>
  );
};
