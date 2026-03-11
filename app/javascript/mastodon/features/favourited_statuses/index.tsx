import { useEffect, useRef, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import StarIcon from '@/material-icons/400-24px/star-fill.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import {
  fetchFavouritedStatuses,
  expandFavouritedStatuses,
} from 'mastodon/actions/favourites';
import type { ColumnRef } from 'mastodon/components/column';
import StatusList from 'mastodon/components/status_list';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';
import { getStatusList } from 'mastodon/selectors';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.favourites', defaultMessage: 'Favorites' },
  eyebrow: {
    id: 'favourites.workspace_eyebrow',
    defaultMessage: 'SIGNALS THAT STUCK',
  },
  description: {
    id: 'favourites.workspace_description',
    defaultMessage:
      'A softer archive for the posts, people, and references that earned a second glance.',
  },
  badge: {
    id: 'favourites.workspace_badge',
    defaultMessage:
      '{count, plural, =0 {No favorites yet} one {# saved reaction} other {# saved reactions}}',
  },
  focusTitle: {
    id: 'favourites.workspace_focus_title',
    defaultMessage: 'Keep emotional context nearby',
  },
  focusBody: {
    id: 'favourites.workspace_focus_body',
    defaultMessage:
      'Favorites now read as part of the same modern workspace language as search and discovery instead of a leftover utility column.',
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

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.favourited_statuses'
      defaultMessage="You don't have any favorite posts yet. When you favorite one, it will show up here."
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
      icon='star'
      iconComponent={StarIcon}
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
        scrollKey={`favourited_statuses-${columnId}`}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        timelineId='favourites'
      />

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </WorkspacePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default Favourites;
