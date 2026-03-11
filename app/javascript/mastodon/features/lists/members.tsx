import { useCallback, useState, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';

import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import { fetchRelationships } from 'mastodon/actions/accounts';
import { showAlertForError } from 'mastodon/actions/alerts';
import { importFetchedAccounts } from 'mastodon/actions/importer';
import { fetchList } from 'mastodon/actions/lists';
import { openModal } from 'mastodon/actions/modal';
import { apiFollowAccount } from 'mastodon/api/accounts';
import {
  apiGetAccounts,
  apiAddAccountToList,
  apiRemoveAccountFromList,
} from 'mastodon/api/lists';
import { Avatar } from 'mastodon/components/avatar';
import { Button } from 'mastodon/components/button';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { ColumnSearchHeader } from 'mastodon/components/column_search_header';
import { FollowersCounter } from 'mastodon/components/counters';
import { DisplayName } from 'mastodon/components/display_name';
import ScrollableList from 'mastodon/components/scrollable_list';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
  secondaryPageClasses,
} from 'mastodon/components/secondary_page';
import { ShortNumber } from 'mastodon/components/short_number';
import { VerifiedBadge } from 'mastodon/components/verified_badge';
import { me } from 'mastodon/initial_state';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

import { useSearchAccounts } from './use_search_accounts';

export const messages = defineMessages({
  manageMembers: {
    id: 'column.list_members',
    defaultMessage: 'Manage list members',
  },
  placeholder: {
    id: 'lists.search',
    defaultMessage: 'Search',
  },
  findPeople: { id: 'lists.find_people', defaultMessage: 'Find people' },
  showMembers: { id: 'lists.show_members', defaultMessage: 'Show members' },
  add: { id: 'lists.add_member', defaultMessage: 'Add' },
  remove: { id: 'lists.remove_member', defaultMessage: 'Remove' },
  done: { id: 'lists.done', defaultMessage: 'Done' },
  eyebrow: { id: 'lists.members.eyebrow', defaultMessage: 'Audience curation' },
  description: {
    id: 'lists.members.description',
    defaultMessage:
      'Add or remove people from this list with the same elevated title, search, and card treatment used across the M5 secondary flows.',
  },
  count: {
    id: 'lists.members.count',
    defaultMessage:
      '{count, plural, =0 {No members yet} one {# member} other {# members}}',
  },
  emptyTitle: {
    id: 'lists.members.empty_title',
    defaultMessage: 'This list has no members yet',
  },
  noResultsTitle: {
    id: 'lists.members.no_results_title',
    defaultMessage: 'No matching accounts',
  },
  viewList: { id: 'lists.members.view_list', defaultMessage: 'Open list feed' },
});

type Mode = 'remove' | 'add';

const AccountItem: React.FC<{
  accountId: string;
  listId: string;
  partOfList: boolean;
  onToggle: (accountId: string) => void;
}> = ({ accountId, listId, partOfList, onToggle }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    accountId ? state.relationships.get(accountId) : undefined,
  );
  const following =
    accountId === me || relationship?.following || relationship?.requested;

  useEffect(() => {
    if (accountId) {
      dispatch(fetchRelationships([accountId]));
    }
  }, [dispatch, accountId]);

  const handleClick = useCallback(() => {
    if (partOfList) {
      void apiRemoveAccountFromList(listId, accountId);
      onToggle(accountId);
    } else if (following) {
      void apiAddAccountToList(listId, accountId);
      onToggle(accountId);
    } else {
      dispatch(
        openModal({
          modalType: 'CONFIRM_FOLLOW_TO_LIST',
          modalProps: {
            accountId,
            onConfirm: () => {
              apiFollowAccount(accountId)
                .then(() => apiAddAccountToList(listId, accountId))
                .then(() => {
                  onToggle(accountId);
                  return '';
                })
                .catch((err: unknown) => {
                  dispatch(showAlertForError(err));
                });
            },
          },
        }),
      );
    }
  }, [dispatch, accountId, following, listId, partOfList, onToggle]);

  if (!account) {
    return null;
  }

  const firstVerifiedField = account.fields.find((item) => !!item.verified_at);

  return (
    <div className={classNames('account', secondaryPageClasses.accountCard)}>
      <div className='account__wrapper'>
        <Link
          key={account.id}
          className='account__display-name'
          title={account.acct}
          to={`/@${account.acct}`}
          data-hover-card-account={account.id}
        >
          <div className='account__avatar-wrapper'>
            <Avatar account={account} size={40} />
          </div>

          <div className='account__contents'>
            <DisplayName account={account} />

            <div className='account__details'>
              <ShortNumber
                value={account.followers_count}
                renderer={FollowersCounter}
              />{' '}
              {firstVerifiedField && (
                <VerifiedBadge link={firstVerifiedField.value} />
              )}
            </div>
          </div>
        </Link>

        <div className='account__relationship'>
          <Button
            text={intl.formatMessage(
              partOfList ? messages.remove : messages.add,
            )}
            secondary={partOfList}
            onClick={handleClick}
          />
        </div>
      </div>
    </div>
  );
};

const ListMembers: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const list = useAppSelector((state) => state.lists.get(id));

  const [searching, setSearching] = useState(false);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [mode, setMode] = useState<Mode>('remove');

  const {
    accountIds: searchAccountIds,
    isLoading: loadingSearchResults,
    searchAccounts: handleSearch,
  } = useSearchAccounts({
    resetOnInputClear: false,
    onSettled: (value) => {
      if (value.trim().length === 0) {
        setSearching(false);
      } else {
        setSearching(true);
      }
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchList(id));

      void apiGetAccounts(id)
        .then((data) => {
          dispatch(importFetchedAccounts(data));
          setAccountIds(data.map((a) => a.id));
          setLoading(false);
          return '';
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [dispatch, id]);

  const handleSearchClick = useCallback(() => {
    setMode('add');
  }, []);

  const handleDismissSearchClick = useCallback(() => {
    setMode('remove');
    setSearching(false);
  }, []);

  const handleAccountToggle = useCallback(
    (accountId: string) => {
      const partOfList = accountIds.includes(accountId);

      if (partOfList) {
        setAccountIds(
          accountIds.filter((existingId) => existingId !== accountId),
        );
      } else {
        setAccountIds([accountId, ...accountIds]);
      }
    },
    [accountIds],
  );

  const displayedAccountIds =
    mode === 'add' && searching ? searchAccountIds : accountIds;

  const headerCard = (
    <>
      <SecondaryPageHero
        eyebrow={intl.formatMessage(messages.eyebrow)}
        title={list?.get('title') ?? intl.formatMessage(messages.manageMembers)}
        description={intl.formatMessage(messages.description)}
        actions={
          <>
            <button
              type='button'
              className='button button-secondary'
              onClick={
                mode === 'add' ? handleDismissSearchClick : handleSearchClick
              }
            >
              {intl.formatMessage(
                mode === 'add' ? messages.showMembers : messages.findPeople,
              )}
            </button>
            <Link to={`/lists/${id}`} className='button button-secondary'>
              {intl.formatMessage(messages.viewList)}
            </Link>
          </>
        }
        meta={
          <SecondaryPageChip>
            {intl.formatMessage(messages.count, { count: accountIds.length })}
          </SecondaryPageChip>
        }
      />

      <ColumnSearchHeader
        placeholder={intl.formatMessage(messages.placeholder)}
        onBack={handleDismissSearchClick}
        onSubmit={handleSearch}
        onActivate={handleSearchClick}
        active={mode === 'add'}
        className={secondaryPageClasses.searchCard}
        inputClassName={secondaryPageClasses.searchInput}
      />
    </>
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.manageMembers)}
    >
      <ColumnHeader
        title={intl.formatMessage(messages.manageMembers)}
        icon='list-ul'
        iconComponent={ListAltIcon}
        multiColumn={multiColumn}
        showBackButton
      />

      <ScrollableList
        scrollKey='list_members'
        trackScroll={!multiColumn}
        bindToDocument={!multiColumn}
        isLoading={loading || loadingSearchResults}
        showLoading={loading && displayedAccountIds.length === 0}
        hasMore={false}
        prepend={headerCard}
        alwaysPrepend
        footer={
          <div className={secondaryPageClasses.footer}>
            <Link to={`/lists/${id}`} className='button button--block'>
              <FormattedMessage id='lists.done' defaultMessage='Done' />
            </Link>
          </div>
        }
        emptyMessage={
          mode === 'remove' || !searching ? (
            <SecondaryPageEmptyState
              iconId='list-ul'
              icon={ListAltIcon}
              title={intl.formatMessage(messages.emptyTitle)}
              message={
                <>
                  <FormattedMessage
                    id='lists.no_members_yet'
                    defaultMessage='No members yet.'
                  />{' '}
                  <FormattedMessage
                    id='lists.find_users_to_add'
                    defaultMessage='Find users to add'
                  />
                </>
              }
              actions={
                <button
                  type='button'
                  className='button button-secondary'
                  onClick={handleSearchClick}
                >
                  {intl.formatMessage(messages.findPeople)}
                </button>
              }
            />
          ) : (
            <SecondaryPageEmptyState
              iconId='list-ul'
              icon={ListAltIcon}
              title={intl.formatMessage(messages.noResultsTitle)}
              message={
                <FormattedMessage
                  id='lists.no_results_found'
                  defaultMessage='No results found.'
                />
              }
              actions={
                <button
                  type='button'
                  className='button button-secondary'
                  onClick={handleDismissSearchClick}
                >
                  {intl.formatMessage(messages.showMembers)}
                </button>
              }
            />
          )
        }
      >
        {displayedAccountIds.map((accountId) => (
          <AccountItem
            key={accountId}
            accountId={accountId}
            listId={id}
            partOfList={
              displayedAccountIds === accountIds ||
              accountIds.includes(accountId)
            }
            onToggle={handleAccountToggle}
          />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.manageMembers)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default ListMembers;
