import { useCallback, useState, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { useParams, useHistory, Link } from 'react-router-dom';

import { isFulfilled } from '@reduxjs/toolkit';

import Toggle from 'react-toggle';

import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import { fetchList } from 'mastodon/actions/lists';
import { createList, updateList } from 'mastodon/actions/lists_typed';
import { apiGetAccounts } from 'mastodon/api/lists';
import type { ApiAccountJSON } from 'mastodon/api_types/accounts';
import type { RepliesPolicyType } from 'mastodon/api_types/lists';
import { Avatar } from 'mastodon/components/avatar';
import { AvatarGroup } from 'mastodon/components/avatar_group';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { SelectField, TextInputField } from 'mastodon/components/form_fields';
import { Icon } from 'mastodon/components/icon';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import {
  SecondaryPageChip,
  SecondaryPageHero,
  SecondaryPageSection,
  secondaryPageClasses,
} from 'mastodon/components/secondary_page';
import BundleColumnError from 'mastodon/features/ui/components/bundle_column_error';
import type { List } from 'mastodon/models/list';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

import { messages as membersMessages } from './members';

const messages = defineMessages({
  edit: { id: 'column.edit_list', defaultMessage: 'Edit list' },
  create: { id: 'column.create_list', defaultMessage: 'Create list' },
  eyebrow: { id: 'lists.new.eyebrow', defaultMessage: 'List setup' },
  createDescription: {
    id: 'lists.new.create_description',
    defaultMessage:
      'Name the feed, decide which replies belong in it, and launch the next step in the same M5 secondary-page shell.',
  },
  editDescription: {
    id: 'lists.new.edit_description',
    defaultMessage:
      'Fine-tune this list without bouncing between older form styles and newer page containers.',
  },
  repliesPolicyChip: {
    id: 'lists.new.replies_policy_chip',
    defaultMessage: 'Replies policy',
  },
});

const MembersLink: React.FC<{
  id: string;
}> = ({ id }) => {
  const intl = useIntl();
  const [avatarCount, setAvatarCount] = useState(0);
  const [avatarAccounts, setAvatarAccounts] = useState<ApiAccountJSON[]>([]);

  useEffect(() => {
    void apiGetAccounts(id)
      .then((data) => {
        setAvatarCount(data.length);
        setAvatarAccounts(data.slice(0, 3));
      })
      .catch(() => {
        // Nothing
      });
  }, [id]);

  return (
    <Link to={`/lists/${id}/members`} className='app-form__link'>
      <div className='app-form__link__text'>
        <strong>
          {intl.formatMessage(membersMessages.manageMembers)}
          <Icon id='chevron_right' icon={ChevronRightIcon} />
        </strong>
        <FormattedMessage
          id='lists.list_members_count'
          defaultMessage='{count, plural, one {# member} other {# members}}'
          values={{ count: avatarCount }}
        />
      </div>

      <AvatarGroup compact>
        {avatarAccounts.map((a) => (
          <Avatar key={a.id} account={a} size={30} />
        ))}
      </AvatarGroup>
    </Link>
  );
};

const NewList: React.FC<{ list?: List | null }> = ({ list }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const {
    id,
    title: initialTitle = '',
    exclusive: initialExclusive = false,
    replies_policy: initialRepliesPolicy = 'list',
  } = list ?? {};

  const [title, setTitle] = useState(initialTitle);
  const [exclusive, setExclusive] = useState(initialExclusive);
  const [repliesPolicy, setRepliesPolicy] =
    useState<RepliesPolicyType>(initialRepliesPolicy);
  const [submitting, setSubmitting] = useState(false);

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(value);
    },
    [],
  );

  const handleExclusiveChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      setExclusive(checked);
    },
    [],
  );

  const handleRepliesPolicyChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
      setRepliesPolicy(value as RepliesPolicyType);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);

      if (id) {
        void dispatch(
          updateList({
            id,
            title,
            exclusive,
            replies_policy: repliesPolicy,
          }),
        ).then(() => {
          setSubmitting(false);
          return '';
        });
      } else {
        void dispatch(
          createList({
            title,
            exclusive,
            replies_policy: repliesPolicy,
          }),
        ).then((result) => {
          setSubmitting(false);

          if (isFulfilled(result)) {
            history.replace(`/lists/${result.payload.id}/edit`);
            history.push(`/lists/${result.payload.id}/members`);
          }

          return '';
        });
      }
    },
    [history, dispatch, id, title, exclusive, repliesPolicy],
  );

  return (
    <form
      className={classNames(
        'simple_form app-form',
        secondaryPageClasses.formStack,
      )}
      onSubmit={handleSubmit}
    >
      <SecondaryPageSection>
        <TextInputField
          required
          maxLength={30}
          label={
            <FormattedMessage id='lists.list_name' defaultMessage='List name' />
          }
          value={title}
          onChange={handleTitleChange}
          id='list_title'
        />
      </SecondaryPageSection>

      <SecondaryPageSection>
        <SelectField
          label={
            <FormattedMessage
              id='lists.show_replies_to'
              defaultMessage='Include replies from list members to'
            />
          }
          value={repliesPolicy}
          onChange={handleRepliesPolicyChange}
          id='list_replies_policy'
        >
          <FormattedMessage
            id='lists.replies_policy.none'
            defaultMessage='No one'
          >
            {(msg) => <option value='none'>{msg}</option>}
          </FormattedMessage>
          <FormattedMessage
            id='lists.replies_policy.list'
            defaultMessage='Members of the list'
          >
            {(msg) => <option value='list'>{msg}</option>}
          </FormattedMessage>
          <FormattedMessage
            id='lists.replies_policy.followed'
            defaultMessage='Any followed user'
          >
            {(msg) => <option value='followed'>{msg}</option>}
          </FormattedMessage>
        </SelectField>
      </SecondaryPageSection>

      {id && (
        <SecondaryPageSection>
          <MembersLink id={id} />
        </SecondaryPageSection>
      )}

      <div className={secondaryPageClasses.toggleCard}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className='app-form__toggle'>
          <div className='app-form__toggle__label'>
            <strong>
              <FormattedMessage
                id='lists.exclusive'
                defaultMessage='Hide members in Home'
              />
            </strong>
            <span className='hint'>
              <FormattedMessage
                id='lists.exclusive_hint'
                defaultMessage='If someone is on this list, hide them in your Home feed to avoid seeing their posts twice.'
              />
            </span>
          </div>

          <div className='app-form__toggle__toggle'>
            <div>
              <Toggle checked={exclusive} onChange={handleExclusiveChange} />
            </div>
          </div>
        </label>
      </div>

      <div className={secondaryPageClasses.formActions}>
        <button className='button' type='submit'>
          {submitting ? (
            <LoadingIndicator />
          ) : id ? (
            <FormattedMessage id='lists.save' defaultMessage='Save' />
          ) : (
            <FormattedMessage id='lists.create' defaultMessage='Create' />
          )}
        </button>
      </div>
    </form>
  );
};

const NewListWrapper: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id?: string }>();
  const list = useAppSelector(
    (state) =>
      (id ? state.lists.get(id) : undefined) as List | false | undefined,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchList(id));
    }
  }, [dispatch, id]);

  if (list === false) {
    return <BundleColumnError multiColumn={multiColumn} errorType='routing' />;
  }

  const isLoading = id && !list;

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(id ? messages.edit : messages.create)}
    >
      <ColumnHeader
        title={intl.formatMessage(id ? messages.edit : messages.create)}
        icon='list-ul'
        iconComponent={ListAltIcon}
        multiColumn={multiColumn}
        showBackButton
      />

      <div className='scrollable'>
        <SecondaryPageHero
          eyebrow={intl.formatMessage(messages.eyebrow)}
          title={intl.formatMessage(id ? messages.edit : messages.create)}
          description={intl.formatMessage(
            id ? messages.editDescription : messages.createDescription,
          )}
          actions={
            id ? (
              <Link
                to={`/lists/${id}/members`}
                className='button button-secondary'
              >
                {intl.formatMessage(membersMessages.manageMembers)}
              </Link>
            ) : undefined
          }
          meta={
            <SecondaryPageChip>
              {intl.formatMessage(messages.repliesPolicyChip)}
            </SecondaryPageChip>
          }
        />

        {isLoading ? (
          <SecondaryPageSection>
            <LoadingIndicator />
          </SecondaryPageSection>
        ) : (
          <NewList list={list} />
        )}
      </div>

      <Helmet>
        <title>
          {intl.formatMessage(id ? messages.edit : messages.create)}
        </title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default NewListWrapper;
