import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import {
  fetchFavouritedStatuses,
  expandFavouritedStatuses,
} from 'mastodon/actions/favourites';
import { Column } from 'mastodon/components/column';
import type { ColumnRef } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
} from 'mastodon/components/secondary_page';
import StatusList from 'mastodon/components/status_list';
import { getStatusList } from 'mastodon/selectors';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.favourites', defaultMessage: 'Favorites' },
  eyebrow: { id: 'favourited_statuses.eyebrow', defaultMessage: 'Liked posts' },
  description: {
    id: 'favourited_statuses.description',
    defaultMessage:
      'Review the posts you have liked, now framed with the same M5 containers and empty states as the rest of the product.',
  },
  count: {
    id: 'favourited_statuses.count',
    defaultMessage:
      '{count, plural, =0 {Nothing liked yet} one {# favorite post} other {# favorite posts}}',
  },
  helper: { id: 'favourited_statuses.helper', defaultMessage: 'Go to home' },
  emptyTitle: {
    id: 'favourited_statuses.empty_title',
    defaultMessage: 'No favorite posts yet',
  },
});

const Favourites: React.FC<{ columnId: string; multiColumn: boolean }> = ({
  columnId,
  multiColumn,
}) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const columnRef = useRef<ColumnRef>(null);
  const statusIds = useAppSelector((state) =>
    getStatusList(state, 'favourites'),
  );
  const isLoading = useAppSelector(
    (state) =>
      state.status_lists.getIn(['favourites', 'isLoading'], true) as boolean,
  );
  const hasMore = useAppSelector(
    (state) => !!state.status_lists.getIn(['favourites', 'next']),
  );

  useEffect(() => {
    dispatch(fetchFavouritedStatuses());
  }, [dispatch]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('FAVOURITES', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback(
    (dir: number) => {
      dispatch(moveColumn(columnId, dir));
    },
    [dispatch, columnId],
  );

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const handleLoadMore = useCallback(() => {
    dispatch(expandFavouritedStatuses());
  }, [dispatch]);

  const pinned = !!columnId;

  const headerCard = (
    <SecondaryPageHero
      eyebrow={intl.formatMessage(messages.eyebrow)}
      title={intl.formatMessage(messages.heading)}
      description={intl.formatMessage(messages.description)}
      actions={
        <Link to='/' className='button button-secondary'>
          {intl.formatMessage(messages.helper)}
        </Link>
      }
      meta={
        <SecondaryPageChip>
          {intl.formatMessage(messages.count, { count: statusIds.size })}
        </SecondaryPageChip>
      }
    />
  );

  const emptyMessage = (
    <SecondaryPageEmptyState
      iconId='star'
      icon={StarIcon}
      title={intl.formatMessage(messages.emptyTitle)}
      message={
        <FormattedMessage
          id='empty_column.favourited_statuses'
          defaultMessage="You don't have any favorite posts yet. When you favorite one, it will show up here."
        />
      }
      actions={
        <Link to='/' className='button button-secondary'>
          {intl.formatMessage(messages.helper)}
        </Link>
      }
    />
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        icon='star'
        iconComponent={StarIcon}
        title={intl.formatMessage(messages.heading)}
        onPin={handlePin}
        onMove={handleMove}
        onClick={handleHeaderClick}
        pinned={pinned}
        multiColumn={multiColumn}
      />

      <StatusList
        trackScroll={!pinned}
        statusIds={statusIds}
        scrollKey={`favourited_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        prepend={headerCard}
        alwaysPrepend
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='favourites'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Favourites;
