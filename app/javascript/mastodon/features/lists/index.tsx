import { useEffect, useMemo, useCallback } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import SquigglyArrow from '@/svg-icons/squiggly_arrow.svg?react';
import { fetchLists } from 'mastodon/actions/lists';
import { openModal } from 'mastodon/actions/modal';
import { Dropdown } from 'mastodon/components/dropdown_menu';
import { Icon } from 'mastodon/components/icon';
import ScrollableList from 'mastodon/components/scrollable_list';
import { WorkspacePage } from 'mastodon/components/workspace_page';
import workspaceContent from 'mastodon/components/workspace_page/content.module.scss';
import discoveryStyles from 'mastodon/features/discovery/styles.module.scss';
import { getOrderedLists } from 'mastodon/selectors/lists';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  heading: { id: 'column.lists', defaultMessage: 'Lists' },
  eyebrow: {
    id: 'lists.workspace_eyebrow',
    defaultMessage: 'CURATED STREAMS',
  },
  description: {
    id: 'lists.workspace_description',
    defaultMessage:
      'Shape custom reading lanes for the people and topics that deserve a tighter frame than the main timeline.',
  },
  badge: {
    id: 'lists.workspace_badge',
    defaultMessage:
      '{count, plural, =0 {No lists yet} one {# active list} other {# active lists}}',
  },
  focusTitle: {
    id: 'lists.workspace_focus_title',
    defaultMessage: 'Relationship-led by design',
  },
  focusBody: {
    id: 'lists.workspace_focus_body',
    defaultMessage:
      'Lists are positioned as a focused navigation surface inside the modern shell, not a stray utility hidden behind the old layout.',
  },
  create: { id: 'lists.create_list', defaultMessage: 'Create list' },
  edit: { id: 'lists.edit', defaultMessage: 'Edit list' },
  delete: { id: 'lists.delete', defaultMessage: 'Delete list' },
  more: { id: 'status.more', defaultMessage: 'More' },
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
    <div className='lists__item'>
      <Link to={`/lists/${id}`} className='lists__item__title'>
        <Icon id='list-ul' icon={ListAltIcon} />
        <span>{title}</span>
      </Link>

      <Dropdown
        scrollKey='lists'
        items={menu}
        icon='ellipsis-h'
        iconComponent={MoreHorizIcon}
        title={intl.formatMessage(messages.more)}
      />
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

  const emptyMessage = (
    <>
      <span>
        <FormattedMessage
          id='lists.no_lists_yet'
          defaultMessage='No lists yet.'
        />
        <br />
        <FormattedMessage
          id='lists.create_a_list_to_organize'
          defaultMessage='Create a new list to organize your Home feed'
        />
      </span>

      <SquigglyArrow className='empty-column-indicator__arrow' />
    </>
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
                  {intl.formatMessage(messages.badge, { count: lists.length })}
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
      icon='list-ul'
      iconComponent={ListAltIcon}
      multiColumn={multiColumn}
      title={intl.formatMessage(messages.heading)}
    >
      <ScrollableList
        scrollKey='lists'
        emptyMessage={emptyMessage}
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
    </WorkspacePage>
  );
};

// eslint-disable-next-line import/no-default-export
export default Lists;
