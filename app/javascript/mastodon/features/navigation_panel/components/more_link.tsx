import { useMemo } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { openModal } from 'mastodon/actions/modal';
import { dropdownIcons, navigationIcons } from 'mastodon/components/app_icons';
import { Dropdown } from 'mastodon/components/dropdown_menu';
import { Icon } from 'mastodon/components/icon';
import { useIdentity } from 'mastodon/identity_context';
import type { MenuItem } from 'mastodon/models/dropdown_menu';
import { canManageReports, canViewAdminDashboard } from 'mastodon/permissions';
import { useAppDispatch } from 'mastodon/store';

const messages = defineMessages({
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domainBlocks: {
    id: 'navigation_bar.domain_blocks',
    defaultMessage: 'Blocked domains',
  },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  filters: { id: 'navigation_bar.filters', defaultMessage: 'Muted words' },
  administration: {
    id: 'navigation_bar.administration',
    defaultMessage: 'Administration',
  },
  moderation: { id: 'navigation_bar.moderation', defaultMessage: 'Moderation' },
  logout: { id: 'navigation_bar.logout', defaultMessage: 'Logout' },
  automatedDeletion: {
    id: 'navigation_bar.automated_deletion',
    defaultMessage: 'Automated post deletion',
  },
  accountSettings: {
    id: 'navigation_bar.account_settings',
    defaultMessage: 'Password and security',
  },
  importExport: {
    id: 'navigation_bar.import_export',
    defaultMessage: 'Import and export',
  },
  privacyAndReach: {
    id: 'navigation_bar.privacy_and_reach',
    defaultMessage: 'Privacy and reach',
  },
});

export const MoreLink: React.FC = () => {
  const intl = useIntl();
  const { permissions } = useIdentity();
  const dispatch = useAppDispatch();

  const menu = useMemo(() => {
    const arr: MenuItem[] = [
      {
        href: '/filters',
        text: intl.formatMessage(messages.filters),
        icon: dropdownIcons.filters,
        iconId: 'filters',
      },
      {
        to: '/mutes',
        text: intl.formatMessage(messages.mutes),
        icon: dropdownIcons.mutes,
        iconId: 'mutes',
      },
      {
        to: '/blocks',
        text: intl.formatMessage(messages.blocks),
        icon: dropdownIcons.blocks,
        iconId: 'blocks',
      },
      {
        to: '/domain_blocks',
        text: intl.formatMessage(messages.domainBlocks),
        icon: dropdownIcons.domainBlocks,
        iconId: 'domain-blocks',
      },
      null,
      {
        href: '/settings/privacy',
        text: intl.formatMessage(messages.privacyAndReach),
        icon: dropdownIcons.privacyAndReach,
        iconId: 'privacy',
      },
      {
        href: '/statuses_cleanup',
        text: intl.formatMessage(messages.automatedDeletion),
        icon: dropdownIcons.automatedDeletion,
        iconId: 'automated-deletion',
      },
      {
        href: '/auth/edit',
        text: intl.formatMessage(messages.accountSettings),
        icon: dropdownIcons.accountSettings,
        iconId: 'account-settings',
      },
      {
        href: '/settings/export',
        text: intl.formatMessage(messages.importExport),
        icon: dropdownIcons.importExport,
        iconId: 'import-export',
      },
    ];

    if (canManageReports(permissions)) {
      arr.push(null, {
        href: '/admin/reports',
        text: intl.formatMessage(messages.moderation),
        icon: dropdownIcons.moderation,
        iconId: 'moderation',
      });
    }

    if (canViewAdminDashboard(permissions)) {
      arr.push({
        href: '/admin/dashboard',
        text: intl.formatMessage(messages.administration),
        icon: dropdownIcons.administration,
        iconId: 'administration',
      });
    }

    const handleLogoutClick = () => {
      dispatch(openModal({ modalType: 'CONFIRM_LOG_OUT', modalProps: {} }));
    };

    arr.push(null, {
      text: intl.formatMessage(messages.logout),
      action: handleLogoutClick,
      icon: dropdownIcons.logout,
      iconId: 'logout',
    });

    return arr;
  }, [intl, dispatch, permissions]);

  return (
    <Dropdown items={menu} placement='bottom-start'>
      <button className='column-link column-link--transparent' type='button'>
        <Icon
          id='more'
          icon={navigationIcons.more}
          className='column-link__icon'
        />

        <FormattedMessage id='navigation_bar.more' defaultMessage='More' />
      </button>
    </Dropdown>
  );
};
