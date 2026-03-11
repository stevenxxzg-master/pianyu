import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEventHandler, FC, KeyboardEventHandler } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Textarea from 'react-textarea-autosize';

import { submitAccountNote } from '@/mastodon/actions/account_notes';
import { fetchRelationships } from '@/mastodon/actions/accounts';
import { Callout } from '@/mastodon/components/callout';
import { LoadingIndicator } from '@/mastodon/components/loading_indicator';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';

import classes from './redesign.module.scss';

const messages = defineMessages({
  title: {
    id: 'account.note.title',
    defaultMessage: 'Personal note (visible only to you)',
  },
  placeholder: {
    id: 'account_note.placeholder',
    defaultMessage: 'Click to add a note',
  },
});

const AccountNoteUI: FC<{
  initialValue: string | undefined;
  onSubmit: (newNote: string) => void;
  wasSaved: boolean;
}> = ({ initialValue, onSubmit, wasSaved }) => {
  const intl = useIntl();
  const uniqueId = useId();
  const [value, setValue] = useState(initialValue ?? '');
  const isLoading = initialValue === undefined;
  const canSubmitOnBlurRef = useRef(true);

  const handleChange = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(
    (event) => {
      setValue(event.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(
    (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();

        setValue(initialValue ?? '');

        canSubmitOnBlurRef.current = false;
        event.currentTarget.blur();
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        onSubmit(value);

        canSubmitOnBlurRef.current = false;
        event.currentTarget.blur();
      }
    },
    [initialValue, onSubmit, value],
  );

  const handleBlur = useCallback(() => {
    if (initialValue !== value && canSubmitOnBlurRef.current) {
      onSubmit(value);
    }
    canSubmitOnBlurRef.current = true;
  }, [initialValue, onSubmit, value]);

  return (
    <Callout
      icon={false}
      title={
        <>
          {intl.formatMessage(messages.title)}{' '}
          <span
            aria-live='polite'
            role='status'
            className='inline-alert'
            style={{ opacity: wasSaved ? 1 : 0 }}
          >
            {wasSaved && (
              <FormattedMessage id='generic.saved' defaultMessage='Saved' />
            )}
          </span>
        </>
      }
      className={classes.note}
    >
      <div className='account__header__account-note'>
        {isLoading ? (
          <div className='account__header__account-note__loading-indicator-wrapper'>
            <LoadingIndicator />
          </div>
        ) : (
          <>
            <label htmlFor={`account-note-${uniqueId}`} className='sr-only'>
              {intl.formatMessage(messages.title)}
            </label>
            <Textarea
              id={`account-note-${uniqueId}`}
              className='account__header__account-note__content'
              placeholder={intl.formatMessage(messages.placeholder)}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </>
        )}
      </div>
    </Callout>
  );
};

export const AccountNote: FC<{ accountId: string }> = ({ accountId }) => {
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!relationship) {
      dispatch(fetchRelationships([accountId]));
    }
  }, [accountId, dispatch, relationship]);

  const initialValue = relationship?.note;
  const [wasSaved, setWasSaved] = useState(false);

  const handleSubmit = useCallback(
    (note: string) => {
      setWasSaved(true);
      void dispatch(submitAccountNote({ accountId, note }));

      setTimeout(() => {
        setWasSaved(false);
      }, 2000);
    },
    [accountId, dispatch],
  );

  return (
    <AccountNoteUI
      key={`${accountId}-${initialValue ?? ''}`}
      initialValue={initialValue}
      onSubmit={handleSubmit}
      wasSaved={wasSaved}
    />
  );
};
