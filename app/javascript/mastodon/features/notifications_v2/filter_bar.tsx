import type { ReactNode } from 'react';
import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import HomeIcon from '@/material-icons/400-24px/home-fill.svg?react';
import InsertChartIcon from '@/material-icons/400-24px/insert_chart.svg?react';
import NotificationsIcon from '@/material-icons/400-24px/notifications-fill.svg?react';
import PersonAddIcon from '@/material-icons/400-24px/person_add.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import StarIcon from '@/material-icons/400-24px/star.svg?react';
import { setNotificationsFilter } from 'mastodon/actions/notification_groups';
import { Icon } from 'mastodon/components/icon';
import {
  selectSettingsNotificationsQuickFilterActive,
  selectSettingsNotificationsQuickFilterAdvanced,
} from 'mastodon/selectors/settings';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const tooltips = defineMessages({
  all: { id: 'notifications.filter.all', defaultMessage: 'All' },
  mentions: { id: 'notifications.filter.mentions', defaultMessage: 'Mentions' },
  favourites: {
    id: 'notifications.filter.favourites',
    defaultMessage: 'Favorites',
  },
  boosts: { id: 'notifications.filter.boosts', defaultMessage: 'Boosts' },
  polls: { id: 'notifications.filter.polls', defaultMessage: 'Poll results' },
  follows: { id: 'notifications.filter.follows', defaultMessage: 'Follows' },
  statuses: {
    id: 'notifications.filter.statuses',
    defaultMessage: 'Updates from people you follow',
  },
});

const BarButton: React.FC<{
  selectedFilter: string;
  type: string;
  icon?: ReactNode;
  label: string;
  title?: string;
}> = ({ selectedFilter, type, icon, label, title }) => {
  const dispatch = useAppDispatch();

  const onClick = useCallback(() => {
    void dispatch(setNotificationsFilter({ filterType: type }));
  }, [dispatch, type]);

  return (
    <button
      className={selectedFilter === type ? 'active' : ''}
      onClick={onClick}
      title={title}
      type='button'
      aria-pressed={selectedFilter === type}
    >
      <span className='notification__filter-bar__button'>
        {icon && (
          <span className='notification__filter-bar__button__icon'>{icon}</span>
        )}

        <span className='notification__filter-bar__button__label'>{label}</span>
      </span>
    </button>
  );
};

export const FilterBar: React.FC = () => {
  const intl = useIntl();

  const selectedFilter = useAppSelector(
    selectSettingsNotificationsQuickFilterActive,
  );
  const advancedMode = useAppSelector(
    selectSettingsNotificationsQuickFilterAdvanced,
  );

  const filters = advancedMode
    ? [
        {
          type: 'all',
          label: intl.formatMessage(tooltips.all),
          icon: <Icon id='notifications' icon={NotificationsIcon} />,
        },
        {
          type: 'mention',
          label: intl.formatMessage(tooltips.mentions),
          icon: <Icon id='reply-all' icon={ReplyAllIcon} />,
        },
        {
          type: 'favourite',
          label: intl.formatMessage(tooltips.favourites),
          icon: <Icon id='star' icon={StarIcon} />,
        },
        {
          type: 'reblog',
          label: intl.formatMessage(tooltips.boosts),
          icon: <Icon id='retweet' icon={RepeatIcon} />,
        },
        {
          type: 'poll',
          label: intl.formatMessage(tooltips.polls),
          icon: <Icon id='tasks' icon={InsertChartIcon} />,
        },
        {
          type: 'status',
          label: intl.formatMessage(tooltips.statuses),
          icon: <Icon id='home' icon={HomeIcon} />,
        },
        {
          type: 'follow',
          label: intl.formatMessage(tooltips.follows),
          icon: <Icon id='user-plus' icon={PersonAddIcon} />,
        },
      ]
    : [
        {
          type: 'all',
          label: intl.formatMessage(tooltips.all),
          icon: <Icon id='notifications' icon={NotificationsIcon} />,
        },
        {
          type: 'mention',
          label: intl.formatMessage(tooltips.mentions),
          icon: <Icon id='reply-all' icon={ReplyAllIcon} />,
        },
      ];

  return (
    <div className='notification__filter-bar'>
      {filters.map((filter) => (
        <BarButton
          key={filter.type}
          selectedFilter={selectedFilter}
          type={filter.type}
          title={filter.label}
          icon={filter.icon}
          label={filter.label}
        />
      ))}
    </div>
  );
};
