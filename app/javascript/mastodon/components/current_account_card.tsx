import type { FC, ReactNode } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { Avatar } from '@/mastodon/components/avatar';
import { DisplayName } from '@/mastodon/components/display_name';
import { Icon } from '@/mastodon/components/icon';
import { buildAccountActivityLocation } from '@/mastodon/features/account_timeline/common';
import { useAccount } from '@/mastodon/hooks/useAccount';
import { me } from '@/mastodon/initial_state';
import { isClientFeatureEnabled } from '@/mastodon/utils/environment';
import EditSquareIcon from '@/material-icons/400-24px/edit_square.svg?react';
import PersonIcon from '@/material-icons/400-24px/person.svg?react';

import styles from './current_account_card.module.scss';

const messages = defineMessages({
  kicker: {
    id: 'navigation.account_card.kicker',
    defaultMessage: 'My account',
  },
  posts: {
    id: 'account.posts',
    defaultMessage: 'Posts',
  },
  following: {
    id: 'account.following',
    defaultMessage: 'Following',
  },
  followers: {
    id: 'account.followers',
    defaultMessage: 'Followers',
  },
  profile: {
    id: 'navigation.account_card.profile',
    defaultMessage: 'View profile',
  },
  edit: {
    id: 'account.edit_profile',
    defaultMessage: 'Edit profile',
  },
});

export const CurrentAccountCard: FC<{
  className?: string;
  extraAction?: ReactNode;
}> = ({ className, extraAction }) => {
  const intl = useIntl();
  const account = useAccount(me);

  if (!me || !account) {
    return null;
  }

  const bio = account.note_plain?.trim();
  const supportsProfileEditing = isClientFeatureEnabled('profile_editing');
  const postsLocation = buildAccountActivityLocation({
    acct: account.acct,
    boosts: false,
    replies: false,
  });
  const stats = [
    {
      to: postsLocation,
      label: intl.formatMessage(messages.posts),
      value: account.statuses_count,
    },
    {
      to: `/@${account.acct}/following`,
      label: intl.formatMessage(messages.following),
      value: account.following_count,
    },
    {
      to: `/@${account.acct}/followers`,
      label: intl.formatMessage(messages.followers),
      value: account.followers_count,
    },
  ];

  return (
    <section className={classNames(styles.card, className)}>
      <div className={styles.header}>
        <Link
          className={styles.identity}
          to={`/@${account.acct}`}
          title={`@${account.acct}`}
          data-hover-card-account={account.id}
        >
          <Avatar account={account} size={56} className={styles.avatar} />

          <div className={styles.identityText}>
            <span className={styles.kicker}>
              {intl.formatMessage(messages.kicker)}
            </span>
            <strong className={styles.name}>
              <DisplayName account={account} variant='simple' />
            </strong>
            <span className={styles.handle}>@{account.acct}</span>
          </div>
        </Link>

        {extraAction && <div className={styles.extraAction}>{extraAction}</div>}
      </div>

      {bio && <p className={styles.bio}>{bio}</p>}

      <dl className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <dt>{stat.label}</dt>
            <dd>
              <Link to={stat.to}>{intl.formatNumber(stat.value)}</Link>
            </dd>
          </div>
        ))}
      </dl>

      <div className={styles.actions}>
        <Link to={`/@${account.acct}`} className={styles.actionLink}>
          <Icon id='' icon={PersonIcon} />
          <span>{intl.formatMessage(messages.profile)}</span>
        </Link>
        {supportsProfileEditing ? (
          <Link to='/profile/edit' className={styles.actionLink}>
            <Icon id='' icon={EditSquareIcon} />
            <span>{intl.formatMessage(messages.edit)}</span>
          </Link>
        ) : (
          <a
            href='/settings/profile'
            target='_blank'
            rel='noopener'
            className={styles.actionLink}
          >
            <Icon id='' icon={EditSquareIcon} />
            <span>{intl.formatMessage(messages.edit)}</span>
          </a>
        )}
      </div>
    </section>
  );
};
