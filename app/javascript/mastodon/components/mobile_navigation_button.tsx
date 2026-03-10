import { useCallback } from 'react';

import { useIntl } from 'react-intl';

import classNames from 'classnames';

import MenuIcon from '@/material-icons/400-24px/menu.svg?react';
import { toggleNavigation } from 'mastodon/actions/navigation';
import { messages as navigationBarMessages } from 'mastodon/features/ui/components/navigation_bar';
import { useBreakpoint } from 'mastodon/features/ui/hooks/useBreakpoint';
import { useIdentity } from 'mastodon/identity_context';
import { Icon } from 'mastodon/components/icon';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

export const MobileNavigationButton: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { signedIn } = useIdentity();
  const isOpenable = useBreakpoint('openable');
  const isOpen = useAppSelector((state) => state.navigation.open);
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const handleClick = useCallback(() => {
    dispatch(toggleNavigation());
  }, [dispatch]);

  if (!signedIn || !isOpenable) {
    return null;
  }

  return (
    <button
      type='button'
      className={classNames('column-header__button', className, {
        active: isOpen,
      })}
      onClick={handleClick}
      aria-label={intl.formatMessage(navigationBarMessages.menu)}
      title={intl.formatMessage(navigationBarMessages.menu)}
    >
      <Icon id='menu' icon={MenuIcon} />
    </button>
  );
};
