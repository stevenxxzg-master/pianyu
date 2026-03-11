import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import {
  mountConversations,
  unmountConversations,
  expandConversations,
} from 'mastodon/actions/conversations';
import { connectDirectStream } from 'mastodon/actions/streaming';
import { Callout } from 'mastodon/components/callout';
import Column from 'mastodon/components/column';
import ColumnHeader from 'mastodon/components/column_header';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
  SecondaryPageSection,
} from 'mastodon/components/secondary_page';

import { ConversationsList } from './components/conversations_list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Private mentions' },
  eyebrow: { id: 'direct_timeline.eyebrow', defaultMessage: 'Private inbox' },
  description: {
    id: 'direct_timeline.description',
    defaultMessage:
      'Follow quieter conversations in a dedicated queue with the same elevated containers used by the refreshed list and bookmark pages.',
  },
  count: {
    id: 'direct_timeline.count',
    defaultMessage: '{count, plural, =0 {No conversations yet} one {1 open thread} other {# open threads}}',
  },
  helper: {
    id: 'direct_timeline.helper',
    defaultMessage: 'Open notifications',
  },
  emptyTitle: {
    id: 'direct_timeline.empty_title',
    defaultMessage: 'No private mentions yet',
  },
  warningTitle: {
    id: 'direct_timeline.warning_title',
    defaultMessage: 'Private mentions are still server-side messages',
  },
});

const DirectTimeline = ({ columnId, multiColumn }) => {
  const columnRef = useRef();
  const intl = useIntl();
  const dispatch = useDispatch();
  const conversationsCount = useSelector(
    (state) => state.getIn(['conversations', 'items'])?.size ?? 0,
  );
  const pinned = !!columnId;

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('DIRECT', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback(
    (dir) => {
      dispatch(moveColumn(columnId, dir));
    },
    [dispatch, columnId],
  );

  const handleHeaderClick = useCallback(() => {
    columnRef.current.scrollTop();
  }, [columnRef]);

  useEffect(() => {
    dispatch(mountConversations());
    dispatch(expandConversations());

    const disconnect = dispatch(connectDirectStream());

    return () => {
      dispatch(unmountConversations());
      disconnect();
    };
  }, [dispatch]);

  const prepend = (
    <>
      <SecondaryPageHero
        eyebrow={intl.formatMessage(messages.eyebrow)}
        title={intl.formatMessage(messages.title)}
        description={intl.formatMessage(messages.description)}
        actions={
          <Link to='/notifications' className='button button-secondary'>
            {intl.formatMessage(messages.helper)}
          </Link>
        }
        meta={
          <SecondaryPageChip>
            {intl.formatMessage(messages.count, { count: conversationsCount })}
          </SecondaryPageChip>
        }
      />

      <SecondaryPageSection>
        <Callout variant='warning' title={intl.formatMessage(messages.warningTitle)}>
          <FormattedMessage
            id='compose_form.encryption_warning'
            defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.'
          />{' '}
          <a href='/terms' target='_blank' rel='noreferrer'>
            <FormattedMessage
              id='compose_form.direct_message_warning_learn_more'
              defaultMessage='Learn more'
            />
          </a>
        </Callout>
      </SecondaryPageSection>
    </>
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      ref={columnRef}
      label={intl.formatMessage(messages.title)}
    >
      <ColumnHeader
        icon='at'
        iconComponent={AlternateEmailIcon}
        title={intl.formatMessage(messages.title)}
        onPin={handlePin}
        onMove={handleMove}
        onClick={handleHeaderClick}
        pinned={pinned}
        multiColumn={multiColumn}
      />

      <ConversationsList
        trackScroll={!pinned}
        scrollKey={`direct_timeline-${columnId}`}
        emptyMessage={
          <SecondaryPageEmptyState
            iconId='at'
            icon={AlternateEmailIcon}
            title={intl.formatMessage(messages.emptyTitle)}
            message={
              <FormattedMessage
                id='empty_column.direct'
                defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here."
              />
            }
            actions={
              <Link to='/notifications' className='button button-secondary'>
                {intl.formatMessage(messages.helper)}
              </Link>
            }
          />
        }
        bindToDocument={!multiColumn}
        prepend={prepend}
        alwaysPrepend
      />

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

DirectTimeline.propTypes = {
  columnId: PropTypes.string,
  multiColumn: PropTypes.bool,
};

export default DirectTimeline;
