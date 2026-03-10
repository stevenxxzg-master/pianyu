import classNames from 'classnames';
import { useLocation, useRouteMatch, NavLink } from 'react-router-dom';

import type { IconProp } from 'mastodon/components/icon';
import { Icon } from 'mastodon/components/icon';
import type { PianyuIconName, PianyuIconState } from 'mastodon/icons';
import {
  getPianyuIcon,
  getPianyuIconClassName,
  getPianyuIconId,
} from 'mastodon/icons';

export const ColumnLink: React.FC<{
  icon: React.ReactNode;
  iconComponent?: IconProp;
  iconName?: PianyuIconName;
  iconState?: PianyuIconState;
  iconClassName?: string;
  activeIcon?: React.ReactNode;
  activeIconComponent?: IconProp;
  activeIconName?: PianyuIconName;
  activeIconState?: PianyuIconState;
  activeIconClassName?: string;
  isActive?: (match: unknown, location: { pathname: string }) => boolean;
  text: string;
  to?: string;
  href?: string;
  method?: string;
  badge?: React.ReactNode;
  transparent?: boolean;
  className?: string;
  id?: string;
}> = ({
  icon,
  iconComponent,
  iconName,
  iconState = 'default',
  iconClassName,
  activeIcon,
  activeIconComponent,
  activeIconName,
  activeIconState,
  activeIconClassName,
  isActive,
  text,
  to,
  href,
  method,
  badge,
  transparent,
  className: customClassName,
  ...other
}) => {
  const match = useRouteMatch(to ?? '');
  const location = useLocation();
  const className = classNames(
    'column-link',
    customClassName,
    Boolean(iconName ?? activeIconName) && 'column-link--pianyu',
    {
      'column-link--transparent': transparent,
    },
  );
  const badgeElement =
    typeof badge !== 'undefined' ? (
      <span className='column-link__badge'>{badge}</span>
    ) : null;
  const iconElement =
    iconName === undefined ? (
      iconComponent ? (
        <Icon
          id={typeof icon === 'string' ? icon : ''}
          icon={iconComponent}
          className={classNames('column-link__icon', iconClassName)}
        />
      ) : (
        icon
      )
    ) : (
      <Icon
        id={getPianyuIconId(iconName)}
        icon={getPianyuIcon(iconName, iconState)}
        className={getPianyuIconClassName(
          iconName,
          iconState,
          classNames('column-link__icon', iconClassName),
        )}
      />
    );
  const resolvedActiveIconName = activeIconName ?? iconName;
  const resolvedActiveIconState =
    activeIconState ??
    (resolvedActiveIconName === undefined ? iconState : 'active');
  const activeIconElement =
    activeIcon ??
    (resolvedActiveIconName === undefined ? (
      activeIconComponent ? (
        <Icon
          id={typeof icon === 'string' ? icon : ''}
          icon={activeIconComponent}
          className={classNames(
            'column-link__icon',
            activeIconClassName ?? iconClassName,
          )}
        />
      ) : (
        iconElement
      )
    ) : (
      <Icon
        id={getPianyuIconId(resolvedActiveIconName)}
        icon={getPianyuIcon(resolvedActiveIconName, resolvedActiveIconState)}
        className={getPianyuIconClassName(
          resolvedActiveIconName,
          resolvedActiveIconState,
          classNames('column-link__icon', activeIconClassName ?? iconClassName),
        )}
      />
    ));
  const active = isActive ? isActive(match, location) : !!match;

  if (href) {
    return (
      <a href={href} className={className} data-method={method} {...other}>
        {active ? activeIconElement : iconElement}
        <span>{text}</span>
        {badgeElement}
      </a>
    );
  } else if (to) {
    return (
      <NavLink to={to} className={className} isActive={isActive} {...other}>
        {active ? activeIconElement : iconElement}
        <span>{text}</span>
        {badgeElement}
      </NavLink>
    );
  } else {
    return null;
  }
};
