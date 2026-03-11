import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link, useHistory, useParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import DeleteIcon from '@/material-icons/400-24px/delete.svg?react';
import EditIcon from '@/material-icons/400-24px/edit.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import { fetchList } from 'mastodon/actions/lists';
import { openModal } from 'mastodon/actions/modal';
import { connectListStream } from 'mastodon/actions/streaming';
import { expandListTimeline } from 'mastodon/actions/timelines';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
} from 'mastodon/components/secondary_page';
import BundleColumnError from 'mastodon/features/ui/components/bundle_column_error';
import StatusListContainer from 'mastodon/features/ui/containers/status_list_container';

const messages = defineMessages({
  edit: { id: 'lists.edit', defaultMessage: 'Edit list' },
  delete: { id: 'lists.delete', defaultMessage: 'Delete list' },
  manageMembers: {
    id: 'column.list_members',
    defaultMessage: 'Manage list members',
  },
  eyebrow: { id: 'list_timeline.eyebrow', defaultMessage: 'Custom timeline' },
  description: {
    id: 'list_timeline.description',
    defaultMessage:
      'Stay focused on one curated group without losing the modern M5 title, action, and empty-state language.',
  },
  unread: { id: 'list_timeline.unread', defaultMessage: 'Unread updates' },
  live: { id: 'list_timeline.live', defaultMessage: 'Live list feed' },
  emptyTitle: {
    id: 'list_timeline.empty_title',
    defaultMessage: 'This list is ready for members',
  },
});

const ListTimeline = ({ columnId, multiColumn }) => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const columnRef = useRef(null);
  const { id } = useParams();
  const list = useSelector((state) => state.getIn(['lists', id]));
  const hasUnread = useSelector(
    (state) => state.getIn(['timelines', `list:${id}`, 'unread']) > 0,
  );
  const pinned = !!columnId;

  useEffect(() => {
    dispatch(fetchList(id));
    dispatch(expandListTimeline(id));

    const disconnect = dispatch(connectListStream(id));

    return () => {
      if (disconnect) {
        disconnect();
      }
    };
  }, [dispatch, id]);

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('LIST', { id }));
      history.push('/');
    }
  }, [columnId, dispatch, history, id]);

  const handleMove = useCallback(
    (dir) => {
      dispatch(moveColumn(columnId, dir));
    },
    [columnId, dispatch],
  );

  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const handleLoadMore = useCallback(
    (maxId) => {
      dispatch(expandListTimeline(id, { maxId }));
    },
    [dispatch, id],
  );

  const handleDeleteClick = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_LIST',
        modalProps: { listId: id, columnId },
      }),
    );
  }, [dispatch, id, columnId]);

  if (typeof list === 'undefined') {
    return (
      <Column>
        <div className='scrollable'>
          <LoadingIndicator />
        </div>
      </Column>
    );
  }

  if (list === false) {
    return <BundleColumnError multiColumn={multiColumn} errorType='routing' />;
  }

  const title = list ? list.get('title') : id;

  const headerCard = (
    <SecondaryPageHero
      eyebrow={intl.formatMessage(messages.eyebrow)}
      title={title}
      description={intl.formatMessage(messages.description)}
      actions={
        <>
          <Link to={`/lists/${id}/edit`} className='button button-secondary'>
            <Icon id='pencil' icon={EditIcon} />
            {intl.formatMessage(messages.edit)}
          </Link>
          <Link to={`/lists/${id}/members`} className='button button-secondary'>
            {intl.formatMessage(messages.manageMembers)}
          </Link>
          <button
            type='button'
            className='button button-secondary button--destructive'
            onClick={handleDeleteClick}
          >
            <Icon id='trash' icon={DeleteIcon} />
            {intl.formatMessage(messages.delete)}
          </button>
        </>
      }
      meta={
        <SecondaryPageChip>
          {intl.formatMessage(hasUnread ? messages.unread : messages.live)}
        </SecondaryPageChip>
      }
    />
  );

  return (
    <Column bindToDocument={!multiColumn} ref={columnRef} label={title}>
      <ColumnHeader
        icon='list-ul'
        iconComponent={ListAltIcon}
        active={hasUnread}
        title={title}
        onPin={handlePin}
        onMove={handleMove}
        onClick={handleHeaderClick}
        pinned={pinned}
        multiColumn={multiColumn}
      />

      <StatusListContainer
        trackScroll={!pinned}
        scrollKey={`list_timeline-${columnId}`}
        timelineId={`list:${id}`}
        onLoadMore={handleLoadMore}
        prepend={headerCard}
        alwaysPrepend
        emptyMessage={
          <SecondaryPageEmptyState
            iconId='list-ul'
            icon={ListAltIcon}
            title={intl.formatMessage(messages.emptyTitle)}
            message={
              <FormattedMessage
                id='empty_column.list'
                defaultMessage='There is nothing in this list yet. When members of this list post new statuses, they will appear here.'
              />
            }
            actions={
              <Link to={`/lists/${id}/members`} className='button button-secondary'>
                {intl.formatMessage(messages.manageMembers)}
              </Link>
            }
          />
        }
        bindToDocument={!multiColumn}
      />

      <Helmet>
        <title>{title}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

ListTimeline.propTypes = {
  columnId: PropTypes.string,
  multiColumn: PropTypes.bool,
};

export default ListTimeline;
