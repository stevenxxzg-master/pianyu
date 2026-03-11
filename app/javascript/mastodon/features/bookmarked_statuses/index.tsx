import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import BookmarksIcon from '@/material-icons/400-24px/bookmarks-fill.svg?react';
import {
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
} from 'mastodon/actions/bookmarks';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
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
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  eyebrow: { id: 'bookmarks.eyebrow', defaultMessage: 'Saved collection' },
  description: {
    id: 'bookmarks.description',
    defaultMessage:
      'Keep the posts you want to revisit in one tidy stream, with the same shell and rhythm as the rest of the app.',
  },
  count: {
    id: 'bookmarks.count',
    defaultMessage:
      '{count, plural, =0 {Ready for your first save} one {# saved post} other {# saved posts}}',
  },
  helper: { id: 'bookmarks.helper', defaultMessage: 'Browse home' },
  emptyTitle: {
    id: 'bookmarks.empty_title',
    defaultMessage: 'No bookmarks yet',
  },
});

const Bookmarks: React.FC<{
  columnId: string;
  multiColumn: boolean;
}> = ({ columnId, multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const columnRef = useRef<ColumnRef>(null);
  const statusIds = useAppSelector((state) =>
    getStatusList(state, 'bookmarks'),
  );
  const isLoading = useAppSelector(
    (state) =>
      state.status_lists.getIn(['bookmarks', 'isLoading'], true) as boolean,
  );
  const hasMore = useAppSelector(
    (state) => !!state.status_lists.getIn(['bookmarks', 'next']),
  );

  useEffect(() => {
    dispatch(fetchBookmarkedStatuses());
  }, [dispatch]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('BOOKMARKS', {}));
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
    dispatch(expandBookmarkedStatuses());
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
      iconId='bookmarks'
      icon={BookmarksIcon}
      title={intl.formatMessage(messages.emptyTitle)}
      message={
        <FormattedMessage
          id='empty_column.bookmarked_statuses'
          defaultMessage="You don't have any bookmarked posts yet. When you bookmark one, it will show up here."
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
        icon='bookmarks'
        iconComponent={BookmarksIcon}
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
        scrollKey={`bookmarked_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        prepend={headerCard}
        alwaysPrepend
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='bookmarks'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Bookmarks;
