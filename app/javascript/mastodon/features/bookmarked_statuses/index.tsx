import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import BookmarksIcon from '@/material-icons/400-24px/bookmarks-fill.svg?react';
import {
  fetchBookmarkedStatuses,
  expandBookmarkedStatuses,
} from 'mastodon/actions/bookmarks';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import type { ColumnRef } from 'mastodon/components/column';
import StatusList from 'mastodon/components/status_list';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';
import { getStatusList } from 'mastodon/selectors';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.bookmarks', defaultMessage: 'Bookmarks' },
  eyebrow: {
    id: 'bookmarks.workspace_eyebrow',
    defaultMessage: 'PERSONAL READING ROOM',
  },
  description: {
    id: 'bookmarks.workspace_description',
    defaultMessage:
      'Keep long-tail finds, references, and posts worth returning to in a quieter, more durable shelf.',
  },
  badge: {
    id: 'bookmarks.workspace_badge',
    defaultMessage:
      '{count, plural, =0 {No bookmarks yet} one {# saved bookmark} other {# saved bookmarks}}',
  },
  focusTitle: {
    id: 'bookmarks.workspace_focus_title',
    defaultMessage: 'Built for revisit, not recency',
  },
  focusBody: {
    id: 'bookmarks.workspace_focus_body',
    defaultMessage:
      'Bookmarks stay close to the main workspace so saved context feels like part of the relationship flow instead of a detached utility list.',
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

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.bookmarked_statuses'
      defaultMessage="You don't have any bookmarked posts yet. When you bookmark one, it will show up here."
    />
  );

  return (
    <WorkspacePage
      bindToDocument={!multiColumn}
      className={discoveryStyles.utilityPage}
      contentClassName={discoveryStyles.utilityList}
      headerClassName={discoveryStyles.utilityHeader}
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
                <span className={workspaceContent.badge}>
                  {intl.formatMessage(messages.badge, {
                    count: statusIds.size,
                  })}
                </span>
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
        </div>
      }
      icon='bookmarks'
      iconComponent={BookmarksIcon}
      multiColumn={multiColumn}
      onClick={handleHeaderClick}
      onMove={handleMove}
      onPin={handlePin}
      pinned={pinned}
      ref={columnRef}
      title={intl.formatMessage(messages.heading)}
    >
      <StatusList
        trackScroll={!pinned}
        statusIds={statusIds}
        scrollKey={`bookmarked_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='bookmarks'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </WorkspacePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default Bookmarks;
