import { defineMessages, useIntl } from 'react-intl';

import { AlertsController } from 'mastodon/components/alerts_controller';
import ComposeFormContainer from 'mastodon/features/compose/containers/compose_form_container';
import { messages as navbarMessages } from 'mastodon/features/ui/components/navigation_bar';
import LoadingBarContainer from 'mastodon/features/ui/containers/loading_bar_container';
import ModalContainer from 'mastodon/features/ui/containers/modal_container';

const messages = defineMessages({
  focus_title: {
    id: 'compose.focus_title',
    defaultMessage: 'Open and write a sentence',
  },
  focus_description: {
    id: 'compose.focus_description',
    defaultMessage:
      'Start with the thought first. Images, polls, and visibility can wait until after the first line lands.',
  },
});

const Compose = () => {
  const intl = useIntl();

  return (
    <>
      <div className='compose-page'>
        <section className='compose-entry compose-entry--page'>
          <div className='compose-entry__hero'>
            <p className='compose-entry__eyebrow'>
              {intl.formatMessage(navbarMessages.publish)}
            </p>
            <h2 className='compose-entry__title'>
              {intl.formatMessage(messages.focus_title)}
            </h2>
            <p className='compose-entry__description'>
              {intl.formatMessage(messages.focus_description)}
            </p>
          </div>

          <ComposeFormContainer autoFocus withoutNavigation redirectOnSuccess />
        </section>
      </div>

      <AlertsController />
      <ModalContainer />
      <LoadingBarContainer className='loading-bar' />
    </>
  );
};

export default Compose;
