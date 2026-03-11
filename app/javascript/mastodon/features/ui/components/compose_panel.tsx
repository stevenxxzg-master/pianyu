import { useCallback, useEffect, useLayoutEffect } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import type { List } from 'immutable';

import { useLayout } from '@/mastodon/hooks/useLayout';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';
import {
  changeComposing,
  mountCompose,
  unmountCompose,
} from 'mastodon/actions/compose';
import { useAppHistory } from 'mastodon/components/router';
import ServerBanner from 'mastodon/components/server_banner';
import { Search } from 'mastodon/features/compose/components/search';
import ComposeFormContainer from 'mastodon/features/compose/containers/compose_form_container';
import { LinkFooter } from 'mastodon/features/ui/components/link_footer';
import { useIdentity } from 'mastodon/identity_context';

const messages = defineMessages({
  eyebrow: {
    id: 'compose_panel.eyebrow',
    defaultMessage: 'Quick draft',
  },
  title: {
    id: 'compose_panel.title',
    defaultMessage: 'Write a line, then get back to reading.',
  },
  body: {
    id: 'compose_panel.body',
    defaultMessage:
      'The sidebar keeps the same draft as the full publish page, with the text area doing most of the visual work.',
  },
  handoffTitle: {
    id: 'compose_panel.handoff.title',
    defaultMessage: 'Draft moved to the full page',
  },
  handoffBody: {
    id: 'compose_panel.handoff.body',
    defaultMessage:
      'Keep writing there while the sidebar steps back and stays uncluttered.',
  },
  pageOpenTitle: {
    id: 'compose_panel.page_open.title',
    defaultMessage: 'Full publish page is open',
  },
  pageOpenBody: {
    id: 'compose_panel.page_open.body',
    defaultMessage:
      'Finish there, and this quick draft card will return once you close it.',
  },
});

export const ComposePanel: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const handleFocus = useCallback(() => {
    dispatch(changeComposing(true));
  }, [dispatch]);
  const { signedIn } = useIdentity();
  const hideComposer = useAppSelector((state) => {
    const mounted = state.compose.get('mounted');
    if (typeof mounted === 'number') {
      return mounted > 1;
    }
    return false;
  });
  const hasMeaningfulDraft = useAppSelector((state) => {
    const text = state.compose.get('text', '') as string;
    const mediaAttachments = state.compose.get('media_attachments') as
      | List<unknown>
      | undefined;
    const spoiler = Boolean(state.compose.get('spoiler'));
    const spoilerText = state.compose.get('spoiler_text', '') as string;

    return (
      text.trim().length > 0 ||
      (mediaAttachments?.size ?? 0) > 0 ||
      state.compose.get('poll') !== null ||
      !!state.compose.get('quoted_status_id') ||
      (spoiler && spoilerText.trim().length > 0)
    );
  });

  useEffect(() => {
    dispatch(mountCompose());
    return () => {
      dispatch(unmountCompose());
    };
  }, [dispatch]);

  const { singleColumn } = useLayout();
  const handoffCopy = hasMeaningfulDraft
    ? { title: messages.handoffTitle, body: messages.handoffBody }
    : { title: messages.pageOpenTitle, body: messages.pageOpenBody };

  return (
    <div className='compose-panel' onFocus={handleFocus}>
      <Search singleColumn={singleColumn} />

      {!signedIn && (
        <>
          <ServerBanner />
          <div className='flex-spacer' />
        </>
      )}

      {signedIn && (
        <div className='compose-panel__card'>
          <div className='compose-panel__lead'>
            <p className='compose-panel__eyebrow'>
              {intl.formatMessage(messages.eyebrow)}
            </p>
            <h2>{intl.formatMessage(messages.title)}</h2>
            <p className='compose-panel__lede'>
              {intl.formatMessage(messages.body)}
            </p>
          </div>

          {!hideComposer && (
            <ComposeFormContainer singleColumn surface='sidebar' />
          )}
          {hideComposer && (
            <div className='compose-panel__handoff'>
              <h3>{intl.formatMessage(handoffCopy.title)}</h3>
              <p>{intl.formatMessage(handoffCopy.body)}</p>
            </div>
          )}
        </div>
      )}

      <LinkFooter multiColumn={!singleColumn} />
    </div>
  );
};

/**
 * Redirect the user to the standalone compose page when the
 * sidebar composer is hidden due to a change in viewport size
 * while a post is being written.
 */

export const RedirectToMobileComposeIfNeeded: React.FC = () => {
  const history = useAppHistory();

  const shouldRedirect = useAppSelector((state) =>
    state.compose.get('should_redirect_to_compose_page'),
  );

  useLayoutEffect(() => {
    if (shouldRedirect) {
      history.push('/publish');
    }
  }, [history, shouldRedirect]);

  return null;
};
