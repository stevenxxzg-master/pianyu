import { useEffect, useCallback, useRef } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';

import { isFulfilled } from '@reduxjs/toolkit';

import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import {
  fetchFollowedHashtags,
  unfollowHashtag,
} from 'mastodon/actions/tags_typed';
import type { ApiHashtagJSON } from 'mastodon/api_types/tags';
import { Button } from 'mastodon/components/button';
import type { ColumnRef } from 'mastodon/components/column';
import { Hashtag } from 'mastodon/components/hashtag';
import ScrollableList from 'mastodon/components/scrollable_list';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'followed_tags', defaultMessage: 'Followed hashtags' },
  eyebrow: {
    id: 'followed_tags.workspace_eyebrow',
    defaultMessage: 'TOPIC THREADS',
  },
  description: {
    id: 'followed_tags.workspace_description',
    defaultMessage:
      'Bring the subjects you actively track into the same polished workspace flow as search, lists, and direct browsing.',
  },
  badge: {
    id: 'followed_tags.workspace_badge',
    defaultMessage:
      '{count, plural, =0 {No followed topics yet} one {# followed topic} other {# followed topics}}',
  },
  focusTitle: {
    id: 'followed_tags.workspace_focus_title',
    defaultMessage: 'A lightweight bridge back into discovery',
  },
  focusBody: {
    id: 'followed_tags.workspace_focus_body',
    defaultMessage:
      'This panel now reads like part of the exploration system instead of a legacy side utility bolted onto the shell.',
  },
});

const FollowedTag: React.FC<{
  tag: ApiHashtagJSON;
  onUnfollow: (arg0: string) => void;
}> = ({ tag, onUnfollow }) => {
  const dispatch = useAppDispatch();
  const tagId = tag.name;

  const handleClick = useCallback(() => {
    void dispatch(unfollowHashtag({ tagId })).then((result) => {
      if (isFulfilled(result)) {
        onUnfollow(tagId);
      }

      return '';
    });
  }, [dispatch, onUnfollow, tagId]);

  const people =
    parseInt(tag.history[0].accounts) +
    parseInt(tag.history[1]?.accounts ?? '');

  return (
    <Hashtag
      name={tag.name}
      to={`/tags/${tag.name}`}
      withGraph={false}
      people={people}
    >
      <Button onClick={handleClick}>
        <FormattedMessage id='account.unfollow' defaultMessage='Unfollow' />
      </Button>
    </Hashtag>
  );
};

const FollowedTags: React.FC<{ multiColumn: boolean }> = ({ multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { tags, loading, next, stale } = useAppSelector(
    (state) => state.followedTags,
  );
  const hasMore = !!next;

  useEffect(() => {
    if (stale) {
      void dispatch(fetchFollowedHashtags());
    }
  }, [dispatch, stale]);

  const handleLoadMore = useCallback(() => {
    if (next) {
      void dispatch(fetchFollowedHashtags({ next }));
    }
  }, [dispatch, next]);

  const handleUnfollow = useCallback(
    (tagId: string) => {
      void dispatch(unfollowHashtag({ tagId }));
    },
    [dispatch],
  );

  const columnRef = useRef<ColumnRef>(null);
  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.followed_tags'
      defaultMessage='You have not followed any hashtags yet. When you do, they will show up here.'
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
                  {intl.formatMessage(messages.badge, { count: tags.length })}
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
      icon='hashtag'
      iconComponent={TagIcon}
      multiColumn={multiColumn}
      onClick={handleHeaderClick}
      ref={columnRef}
      showBackButton
      title={intl.formatMessage(messages.heading)}
    >
      <ScrollableList
        scrollKey='followed_tags'
        emptyMessage={emptyMessage}
        hasMore={hasMore}
        isLoading={loading}
        showLoading={loading && tags.length === 0}
        onLoadMore={handleLoadMore}
        trackScroll={!multiColumn}
        bindToDocument={!multiColumn}
      >
        {tags.map((tag) => (
          <FollowedTag key={tag.name} tag={tag} onUnfollow={handleUnfollow} />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </WorkspacePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default FollowedTags;
