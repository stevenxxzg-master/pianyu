import { useEffect } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { Helmet } from 'react-helmet';

import EditIcon from '@/material-icons/400-24px/edit_square.svg?react';
import HomeIcon from '@/material-icons/400-24px/home-fill.svg?react';
import SafetyCheckIcon from '@/material-icons/400-24px/safety_check.svg?react';
import { mountCompose, unmountCompose } from 'mastodon/actions/compose';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Icon } from 'mastodon/components/icon';
import { useAppDispatch } from 'mastodon/store';

import { messages as navbarMessages } from '../ui/components/navigation_bar';

import ComposeFormContainer from './containers/compose_form_container';

const messages = defineMessages({
  eyebrow: {
    id: 'compose_page.eyebrow',
    defaultMessage: 'Quiet publish',
  },
  title: {
    id: 'compose_page.title',
    defaultMessage: 'Start with the sentence.',
  },
  body: {
    id: 'compose_page.body',
    defaultMessage:
      'Text stays front and center. Privacy, media, and polls wait at the edge until they are useful.',
  },
  asideLabel: {
    id: 'compose_page.aside_label',
    defaultMessage: 'Publish guidance',
  },
  focusTitle: {
    id: 'compose_page.focus.title',
    defaultMessage: 'Text leads',
  },
  focusBody: {
    id: 'compose_page.focus.body',
    defaultMessage:
      'The main canvas stays spacious so writing feels easier than configuring.',
  },
  draftTitle: {
    id: 'compose_page.draft.title',
    defaultMessage: 'Drafts travel with you',
  },
  draftBody: {
    id: 'compose_page.draft.body',
    defaultMessage:
      'Moving between the sidebar and this page keeps the same in-progress thought.',
  },
  successTitle: {
    id: 'compose_page.success.title',
    defaultMessage: 'Feedback stays calm',
  },
  successBody: {
    id: 'compose_page.success.body',
    defaultMessage:
      'Publishing ends with a clear confirmation and return path instead of a loud victory moment.',
  },
});

const notes = [
  {
    icon: EditIcon,
    title: messages.focusTitle,
    body: messages.focusBody,
  },
  {
    icon: HomeIcon,
    title: messages.draftTitle,
    body: messages.draftBody,
  },
  {
    icon: SafetyCheckIcon,
    title: messages.successTitle,
    body: messages.successBody,
  },
] as const;

const Compose: React.FC<{ multiColumn: boolean }> = ({ multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(mountCompose());

    return () => {
      dispatch(unmountCompose());
    };
  }, [dispatch]);

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(navbarMessages.publish)}
      className='publish-column'
    >
      <ColumnHeader
        icon='pencil'
        iconComponent={EditIcon}
        title={intl.formatMessage(navbarMessages.publish)}
        multiColumn={multiColumn}
        showBackButton
      />

      <div className='scrollable publish-page'>
        <div className='publish-page__content'>
          <section className='publish-page__hero'>
            <p className='publish-page__eyebrow'>
              {intl.formatMessage(messages.eyebrow)}
            </p>
            <h1 className='publish-page__title'>
              {intl.formatMessage(messages.title)}
            </h1>
            <p className='publish-page__body'>
              {intl.formatMessage(messages.body)}
            </p>
          </section>

          <div className='publish-page__grid'>
            <div className='publish-page__main'>
              <ComposeFormContainer singleColumn={!multiColumn} surface='page' />
            </div>

            <aside
              className='publish-page__aside'
              aria-label={intl.formatMessage(messages.asideLabel)}
            >
              {notes.map((note) => (
                <section key={note.title.id} className='publish-page__note'>
                  <div className='publish-page__note-icon'>
                    <Icon id={note.title.id} icon={note.icon} />
                  </div>
                  <div className='publish-page__note-copy'>
                    <h2>{intl.formatMessage(note.title)}</h2>
                    <p>{intl.formatMessage(note.body)}</p>
                  </div>
                </section>
              ))}
            </aside>
          </div>
        </div>
      </div>

      <Helmet>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Compose;
