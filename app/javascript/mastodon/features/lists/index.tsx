import { useEffect, useMemo, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import { fetchLists } from 'mastodon/actions/lists';
import { openModal } from 'mastodon/actions/modal';
import { Column } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import { Dropdown } from 'mastodon/components/dropdown_menu';
import { Icon } from 'mastodon/components/icon';
import ScrollableList from 'mastodon/components/scrollable_list';
import {
  SecondaryPageChip,
  SecondaryPageEmptyState,
  SecondaryPageHero,
  secondaryPageClasses,
} from 'mastodon/components/secondary_page';
import { getOrderedLists } from 'mastodon/selectors/lists';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  create: { id: 'lists.create_list', defaultMessage: 'Create list' },
  edit: { id: 'lists.edit', defaultMessage: 'Edit list' },
  delete: { id: 'lists.delete', defaultMessage: 'Delete list' },
  manageMembers: {
    id: 'column.list_members',
    defaultMessage: 'Manage list members',
  },
  more: { id: 'status.more', defaultMessage: 'More' },
  eyebrow: { id: 'lists.eyebrow', defaultMessage: 'Curated feeds' },
  description: {
    id: 'lists.description',
    defaultMessage:
      'Build focused reading lanes with consistent M5 actions, helper copy, and card structure across desktop and mobile.',
  },
  count: {
    id: 'lists.count',
    defaultMessage:
      '{count, plural, =0 {No lists yet} one {# active list} other {# active lists}}',
  },
  cardEyebrow: { id: 'lists.card_eyebrow', defaultMessage: 'Custom timeline' },
  cardDescription: {
    id: 'lists.card_description',
    defaultMessage:
      'Open the feed, edit its rules, or update members from one consistent secondary-page surface.',
  },
  emptyTitle: {
    id: 'lists.empty_title',
    defaultMessage: 'Create your first list',
  },
});

const ListItem: React.FC<{
  id: string;
  title: string;
}> = ({ id, title }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleDeleteClick = useCallback(() => {
    dispatch(
      openModal({
        modalType: 'CONFIRM_DELETE_LIST',
        modalProps: {
          listId: id,
        },
      }),
    );
  }, [dispatch, id]);

  const menu = useMemo(
    () => [
      { text: intl.formatMessage(messages.edit), to: `/lists/${id}/edit` },
      { text: intl.formatMessage(messages.delete), action: handleDeleteClick },
    ],
    [intl, id, handleDeleteClick],
  );

  return (
    <div className={secondaryPageClasses.listCard}>
      <Link to={`/lists/${id}`} className={secondaryPageClasses.listLink}>
        <span className={secondaryPageClasses.listEyebrow}>
          <Icon id='list-ul' icon={ListAltIcon} />
          {intl.formatMessage(messages.cardEyebrow)}
        </span>
        <span className={secondaryPageClasses.listTitle}>{title}</span>
        <span className={secondaryPageClasses.listDescription}>
          {intl.formatMessage(messages.cardDescription)}
        </span>
        <span className={secondaryPageClasses.listMeta}>
          <SecondaryPageChip>
            {intl.formatMessage(messages.manageMembers)}
          </SecondaryPageChip>
        </span>
      </Link>

      <div className={secondaryPageClasses.listActions}>
        <Link to={`/lists/${id}/members`} className='button button-secondary'>
          {intl.formatMessage(messages.manageMembers)}
        </Link>

        <Dropdown
          scrollKey='lists'
          items={menu}
          icon='ellipsis-h'
          iconComponent={MoreHorizIcon}
          title={intl.formatMessage(messages.more)}
        />
      </div>
    </div>
  );
};

const Lists: React.FC<{
  multiColumn?: boolean;
}> = ({ multiColumn }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const lists = useAppSelector((state) => getOrderedLists(state));

  useEffect(() => {
    void dispatch(fetchLists());
  }, [dispatch]);

  const headerCard = (
    <SecondaryPageHero
      eyebrow={intl.formatMessage(messages.eyebrow)}
      title={intl.formatMessage(messages.heading)}
      description={intl.formatMessage(messages.description)}
      actions={
        <Link to='/lists/new' className='button button-secondary'>
          {intl.formatMessage(messages.create)}
        </Link>
      }
      meta={
        <SecondaryPageChip>
          {intl.formatMessage(messages.count, { count: lists.length })}
        </SecondaryPageChip>
      }
    />
  );

  return (
    <Column
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.heading)}
    >
      <ColumnHeader
        title={intl.formatMessage(messages.heading)}
        icon='list-ul'
        iconComponent={ListAltIcon}
        multiColumn={multiColumn}
        extraButton={
          <Link
            to='/lists/new'
            className='column-header__button'
            title={intl.formatMessage(messages.create)}
            aria-label={intl.formatMessage(messages.create)}
          >
            <Icon id='plus' icon={AddIcon} />
          </Link>
        }
      />

      <ScrollableList
        scrollKey='lists'
        prepend={headerCard}
        alwaysPrepend
        emptyMessage={
          <SecondaryPageEmptyState
            iconId='list-ul'
            icon={ListAltIcon}
            title={intl.formatMessage(messages.emptyTitle)}
            message={
              <>
                <FormattedMessage
                  id='lists.no_lists_yet'
                  defaultMessage='No lists yet.'
                />{' '}
                <FormattedMessage
                  id='lists.create_a_list_to_organize'
                  defaultMessage='Create a new list to organize your Home feed'
                />
              </>
            }
            actions={
              <Link to='/lists/new' className='button button-secondary'>
                {intl.formatMessage(messages.create)}
              </Link>
            }
          />
        }
        bindToDocument={!multiColumn}
      >
        {lists.map((list) => (
          <ListItem key={list.id} id={list.id} title={list.title} />
        ))}
      </ScrollableList>

      <Helmet>
        <title>{intl.formatMessage(messages.heading)}</title>
        <meta name='robots' content='noindex' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default Lists;
