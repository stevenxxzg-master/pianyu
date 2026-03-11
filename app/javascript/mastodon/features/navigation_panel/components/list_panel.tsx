import { useEffect, useState } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import { fetchLists } from 'mastodon/actions/lists';
import { navigationIcons } from 'mastodon/components/app_icons';
import { ColumnLink } from 'mastodon/features/ui/components/column_link';
import { getOrderedLists } from 'mastodon/selectors/lists';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

import { CollapsiblePanel } from './collapsible_panel';

const messages = defineMessages({
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  expand: {
    id: 'navigation_panel.expand_lists',
    defaultMessage: 'Expand list menu',
  },
  collapse: {
    id: 'navigation_panel.collapse_lists',
    defaultMessage: 'Collapse list menu',
  },
});

export const ListPanel: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const lists = useAppSelector((state) => getOrderedLists(state));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void dispatch(fetchLists()).then(() => {
      setLoading(false);

      return '';
    });
  }, [dispatch]);

  return (
    <CollapsiblePanel
      to='/lists'
      icon='list-ul'
      iconComponent={navigationIcons.list}
      activeIconComponent={navigationIcons.listActive}
      title={intl.formatMessage(messages.lists)}
      collapseTitle={intl.formatMessage(messages.collapse)}
      expandTitle={intl.formatMessage(messages.expand)}
      loading={loading}
    >
      {lists.map((list) => (
        <ColumnLink
          icon='list-ul'
          key={list.id}
          iconComponent={navigationIcons.list}
          activeIconComponent={navigationIcons.listActive}
          text={list.title}
          to={`/lists/${list.id}`}
          transparent
        />
      ))}
    </CollapsiblePanel>
  );
};
