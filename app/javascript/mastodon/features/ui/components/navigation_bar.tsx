import { useCallback, useEffect } from 'react';

import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { NavLink, useRouteMatch } from 'react-router-dom';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import HomeActiveIcon from '@/material-icons/400-24px/home-fill.svg?react';
import HomeIcon from '@/material-icons/400-24px/home.svg?react';
import MenuIcon from '@/material-icons/400-24px/menu.svg?react';
import NotificationsActiveIcon from '@/material-icons/400-24px/notifications-fill.svg?react';
import NotificationsIcon from '@/material-icons/400-24px/notifications.svg?react';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import { openModal } from 'mastodon/actions/modal';
import { toggleNavigation } from 'mastodon/actions/navigation';
import { fetchServer } from 'mastodon/actions/server';
import { Icon } from 'mastodon/components/icon';
import { IconWithBadge } from 'mastodon/components/icon_with_badge';
import { useIdentity } from 'mastodon/identity_context';
import { registrationsOpen, sso_redirect } from 'mastodon/initial_state';
import { selectUnreadNotificationGroupsCount } from 'mastodon/selectors/notifications';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

export const messages = defineMessages({
  home: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  search: { id: 'tabs_bar.search', defaultMessage: 'Search' },
  publish: { id: 'tabs_bar.publish', defaultMessage: 'New Post' },
  notifications: {
    id: 'tabs_bar.notifications',
    defaultMessage: 'Notifications',
  },
  menu: { id: 'tabs_bar.menu', defaultMessage: 'Menu' },
});

const NavigationBarItemContent: React.FC<{
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  title: string;
  active: boolean;
}> = ({ icon, activeIcon, title, active }) => (
  <>
    <span className='ui__navigation-bar__item-icon'>
      {active && activeIcon ? activeIcon : icon}
    </span>
    <span className='ui__navigation-bar__item-label'>{title}</span>
  </>
);

const IconLabelButton: React.FC<{
  to?: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
  title: string;
  accent?: boolean;
  active?: boolean;
  onClick?: () => void;
}> = ({
  to,
  icon,
  activeIcon,
  title,
  accent = false,
  active = false,
  onClick,
}) => {
  const match = useRouteMatch(to ?? '');
  const itemClassName = classNames('ui__navigation-bar__item', {
    active,
    'ui__navigation-bar__item--accent': accent,
  });

  if (to) {
    return (
      <NavLink
        className={itemClassName}
        activeClassName='active'
        to={to}
        aria-label={title}
      >
        <NavigationBarItemContent
          active={!!match}
          activeIcon={activeIcon}
          icon={icon}
          title={title}
        />
      </NavLink>
    );
  }

  return (
    <button
      className={itemClassName}
      onClick={onClick}
      aria-label={title}
      type='button'
    >
      <NavigationBarItemContent
        active={active}
        activeIcon={activeIcon}
        icon={icon}
        title={title}
      />
    </button>
  );
};

const NotificationsButton = () => {
  const count = useAppSelector(selectUnreadNotificationGroupsCount);
  const intl = useIntl();

  return (
    <IconLabelButton
      to='/notifications'
      icon={
        <IconWithBadge
          id='bell'
          icon={NotificationsIcon}
          count={count}
          className='ui__navigation-bar__icon'
        />
      }
      activeIcon={
        <IconWithBadge
          id='bell'
          icon={NotificationsActiveIcon}
          count={count}
          className='ui__navigation-bar__icon'
        />
      }
      title={intl.formatMessage(messages.notifications)}
    />
  );
};

const LoginOrSignUp: React.FC = () => {
  const dispatch = useAppDispatch();
  const signupUrl = useAppSelector(
    (state) =>
      (state.server.getIn(['server', 'registrations', 'url'], null) as
        | string
        | null) ?? '/auth/sign_up',
  );

  const openClosedRegistrationsModal = useCallback(() => {
    dispatch(openModal({ modalType: 'CLOSED_REGISTRATIONS', modalProps: {} }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchServer());
  }, [dispatch]);

  if (sso_redirect) {
    return (
      <div className='ui__navigation-bar__sign-up'>
        <a
          href={sso_redirect}
          data-method='post'
          className='button button--block button-secondary'
        >
          <FormattedMessage
            id='sign_in_banner.sso_redirect'
            defaultMessage='Login or Register'
          />
        </a>
      </div>
    );
  } else {
    let signupButton;

    if (registrationsOpen) {
      signupButton = (
        <a href={signupUrl} className='button'>
          <FormattedMessage
            id='sign_in_banner.create_account'
            defaultMessage='Create account'
          />
        </a>
      );
    } else {
      signupButton = (
        <button
          className='button'
          onClick={openClosedRegistrationsModal}
          type='button'
        >
          <FormattedMessage
            id='sign_in_banner.create_account'
            defaultMessage='Create account'
          />
        </button>
      );
    }

    return (
      <div className='ui__navigation-bar__sign-up'>
        {signupButton}
        <a href='/auth/sign_in' className='button button-secondary'>
          <FormattedMessage
            id='sign_in_banner.sign_in'
            defaultMessage='Login'
          />
        </a>
      </div>
    );
  }
};

export const NavigationBar: React.FC = () => {
  const { signedIn } = useIdentity();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.navigation.open);
  const intl = useIntl();

  const handleClick = useCallback(() => {
    dispatch(toggleNavigation());
  }, [dispatch]);

  return (
    <div className='ui__navigation-bar'>
      {!signedIn && <LoginOrSignUp />}

      <div
        className={classNames('ui__navigation-bar__items', {
          active: signedIn,
        })}
      >
        {signedIn && (
          <>
            <IconLabelButton
              title={intl.formatMessage(messages.home)}
              to='/home'
              icon={
                <Icon
                  id='home'
                  icon={HomeIcon}
                  className='ui__navigation-bar__icon'
                />
              }
              activeIcon={
                <Icon
                  id='home-fill'
                  icon={HomeActiveIcon}
                  className='ui__navigation-bar__icon'
                />
              }
            />
            <IconLabelButton
              title={intl.formatMessage(messages.search)}
              to='/explore'
              icon={
                <Icon
                  id='search'
                  icon={SearchIcon}
                  className='ui__navigation-bar__icon'
                />
              }
            />
            <IconLabelButton
              title={intl.formatMessage(messages.publish)}
              to='/publish'
              icon={
                <Icon
                  id='plus'
                  icon={AddIcon}
                  className='ui__navigation-bar__icon'
                />
              }
              activeIcon={
                <Icon
                  id='plus'
                  icon={AddIcon}
                  className='ui__navigation-bar__icon'
                />
              }
              accent
            />
            <NotificationsButton />
          </>
        )}

        <IconLabelButton
          active={open}
          icon={
            <Icon
              id='menu'
              icon={MenuIcon}
              className='ui__navigation-bar__icon'
            />
          }
          onClick={handleClick}
          title={intl.formatMessage(messages.menu)}
        />
      </div>
    </div>
  );
};
