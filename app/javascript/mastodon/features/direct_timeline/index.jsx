import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { useDispatch } from 'react-redux';

import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import { addColumn, removeColumn, moveColumn } from 'mastodon/actions/columns';
import { mountConversations, unmountConversations, expandConversations } from 'mastodon/actions/conversations';
import { connectDirectStream } from 'mastodon/actions/streaming';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';

import { ConversationsList } from './components/conversations_list';

const messages = defineMessages({
  title: { id: 'column.direct', defaultMessage: 'Private mentions' },
  eyebrow: {
    id: 'direct_timeline.workspace_eyebrow',
    defaultMessage: 'PRIVATE CONTEXT',
  },
  description: {
    id: 'direct_timeline.workspace_description',
    defaultMessage:
      'Keep sensitive side conversations and quiet mentions inside the same calm workspace shell as the rest of your browsing flow.',
  },
  badge: {
    id: 'direct_timeline.workspace_badge',
    defaultMessage: 'Private mentions only',
  },
  focusTitle: {
    id: 'direct_timeline.workspace_focus_title',
    defaultMessage: 'Keep expectations explicit',
  },
  focusBody: {
    id: 'direct_timeline.workspace_focus_body',
    defaultMessage:
      'This view remains intentionally low-noise and relationship-led, with space for security guidance and follow-up context.',
  },
});

const DirectTimeline = ({ columnId, multiColumn }) => {
  const columnRef = useRef();
  const intl = useIntl();
  const dispatch = useDispatch();
  const pinned = !!columnId;

  const handlePin = useCallback(() => {
    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn('DIRECT', {}));
    }
  }, [dispatch, columnId]);

  const handleMove = useCallback((dir) => {
    dispatch(moveColumn(columnId, dir));
  }, [dispatch, columnId]);

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
                  {intl.formatMessage(messages.badge)}
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
      icon='at'
      iconComponent={AlternateEmailIcon}
      multiColumn={multiColumn}
      onClick={handleHeaderClick}
      onMove={handleMove}
      onPin={handlePin}
      pinned={pinned}
      ref={columnRef}
      title={intl.formatMessage(messages.title)}
    >

      <ConversationsList
        trackScroll={!pinned}
        scrollKey={`direct_timeline-${columnId}`}
        emptyMessage={<FormattedMessage id='empty_column.direct' defaultMessage="You don't have any private mentions yet. When you send or receive one, it will show up here." />}
        bindToDocument={!multiColumn}
        prepend={<div className={discoveryStyles.warningBanner}><span><FormattedMessage id='compose_form.encryption_warning' defaultMessage='Posts on Mastodon are not end-to-end encrypted. Do not share any dangerous information over Mastodon.' /> <a href='/terms' target='_blank'><FormattedMessage id='compose_form.direct_message_warning_learn_more' defaultMessage='Learn more' /></a></span></div>}
        alwaysPrepend
      />

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </WorkspacePage>
  );
};

DirectTimeline.propTypes = {
  columnId: PropTypes.string,
  multiColumn: PropTypes.bool,
};

export default DirectTimeline;
