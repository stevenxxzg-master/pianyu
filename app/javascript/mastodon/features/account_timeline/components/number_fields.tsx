import type { FC } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import classNames from 'classnames';
import { NavLink } from 'react-router-dom';

import { FormattedDateWrapper } from '@/mastodon/components/formatted_date';
import { ShortNumber } from '@/mastodon/components/short_number';
import { useAccount } from '@/mastodon/hooks/useAccount';

import { isRedesignEnabled } from '../common';

import classes from './redesign.module.scss';

export const AccountNumberFields: FC<{ accountId: string }> = ({
  accountId,
}) => {
  const intl = useIntl();
  const account = useAccount(accountId);
  const isRedesign = isRedesignEnabled();

  if (!account) {
    return null;
  }

  return (
    <div
      className={classNames(
        'account__header__extra__links',
        isRedesign && classes.fieldNumbersWrapper,
      )}
    >
      {!isRedesign && (
        <NavLink
          to={`/@${account.acct}`}
          title={intl.formatNumber(account.statuses_count)}
        >
          <FormattedMessage
            id='account.statuses_counter'
            defaultMessage='{count, plural, one {{counter} Post} other {{counter} Posts}}'
            values={{
              count: account.statuses_count,
              counter: (
                <strong>
                  <ShortNumber value={account.statuses_count} />
                </strong>
              ),
            }}
          />
        </NavLink>
      )}

      <NavLink
        className={isRedesign ? classes.fieldNumberLink : undefined}
        exact
        to={`/@${account.acct}/following`}
        title={intl.formatNumber(account.following_count)}
      >
        {isRedesign ? (
          <>
            <span className={classes.fieldNumberLabel}>
              <FormattedMessage
                id='account.following'
                defaultMessage='Following'
              />
            </span>
            <span className={classes.fieldNumberValue}>
              <ShortNumber value={account.following_count} />
            </span>
          </>
        ) : (
          <FormattedMessage
            id='account.following_counter'
            defaultMessage='{count, plural, one {{counter} Following} other {{counter} Following}}'
            values={{
              count: account.following_count,
              counter: (
                <strong>
                  <ShortNumber value={account.following_count} />
                </strong>
              ),
            }}
          />
        )}
      </NavLink>

      <NavLink
        className={isRedesign ? classes.fieldNumberLink : undefined}
        exact
        to={`/@${account.acct}/followers`}
        title={intl.formatNumber(account.followers_count)}
      >
        {isRedesign ? (
          <>
            <span className={classes.fieldNumberLabel}>
              <FormattedMessage
                id='account.followers'
                defaultMessage='Followers'
              />
            </span>
            <span className={classes.fieldNumberValue}>
              <ShortNumber value={account.followers_count} />
            </span>
          </>
        ) : (
          <FormattedMessage
            id='account.followers_counter'
            defaultMessage='{count, plural, one {{counter} Follower} other {{counter} Followers}}'
            values={{
              count: account.followers_count,
              counter: (
                <strong>
                  <ShortNumber value={account.followers_count} />
                </strong>
              ),
            }}
          />
        )}
      </NavLink>

      {isRedesign && (
        <span className={classes.fieldJoinedDate}>
          <FormattedMessage
            id='account.joined_long'
            defaultMessage='Joined on {date}'
            values={{
              date: (
                <span className={classes.fieldJoinedDateValue}>
                  <FormattedDateWrapper
                    value={account.created_at}
                    year='numeric'
                    month='short'
                    day='2-digit'
                  />
                </span>
              ),
            }}
          />
        </span>
      )}
    </div>
  );
};
