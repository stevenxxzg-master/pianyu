import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { defineMessages, useIntl } from 'react-intl';

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

import { messages as navbarMessages } from './navigation_bar';

const messages = defineMessages({
  focus_title: {
    id: 'compose.focus_title_compact',
    defaultMessage: 'Start with one sentence',
  },
  focus_description: {
    id: 'compose.focus_description_compact',
    defaultMessage:
      'Keep the cursor front and center. Search and extra controls sit lower until you need them.',
  },
  search_hint: {
    id: 'compose.search_hint_compact',
    defaultMessage: 'Need to look something up? Search after the draft starts.',
  },
});

export const ComposePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const composeEntryRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    dispatch(mountCompose());
    return () => {
      dispatch(unmountCompose());
    };
  }, [dispatch]);

  useEffect(() => {
    if (
      !signedIn ||
      hideComposer ||
      (document.activeElement instanceof HTMLElement &&
        ![document.body, document.documentElement].includes(
          document.activeElement,
        ))
    ) {
      return;
    }

    composeEntryRef.current
      ?.querySelector<HTMLTextAreaElement>('.autosuggest-textarea__textarea')
      ?.focus();
  }, [hideComposer, signedIn]);

  const { singleColumn } = useLayout();
  const publishLabel = intl.formatMessage(navbarMessages.publish);

  if (!signedIn) {
    return (
      <div className='compose-panel' onFocus={handleFocus}>
        <Search singleColumn={singleColumn} />

        <ServerBanner />
        <div className='flex-spacer' />

        <LinkFooter multiColumn={!singleColumn} />
      </div>
    );
  }

  return (
    <div className='compose-panel' onFocus={handleFocus}>
      <section className='compose-entry compose-entry--panel' ref={composeEntryRef}>
        <div className='compose-entry__hero compose-entry__hero--compact'>
          <p className='compose-entry__eyebrow'>{publishLabel}</p>
          <h2 className='compose-entry__title'>
            {intl.formatMessage(messages.focus_title)}
          </h2>
          <p className='compose-entry__description'>
            {intl.formatMessage(messages.focus_description)}
          </p>
        </div>

        {!hideComposer && <ComposeFormContainer singleColumn />}
        {hideComposer && <div className='compose-form' />}

        <div className='compose-entry__secondary'>
          <p className='compose-entry__secondary-copy'>
            {intl.formatMessage(messages.search_hint)}
          </p>
          <Search singleColumn={singleColumn} />
          <LinkFooter multiColumn={!singleColumn} />
        </div>
      </section>
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
