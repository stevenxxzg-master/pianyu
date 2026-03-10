import type { PianyuIconName, PianyuIconState } from 'mastodon/icons';
import {
  getPianyuIcon,
  getPianyuIconClassName,
  getPianyuIconId,
} from 'mastodon/icons';

import type { IconProp } from './icon';
import { Icon } from './icon';

const formatNumber = (num: number): number | string => (num > 40 ? '40+' : num);

interface Props {
  id: string;
  icon?: IconProp;
  iconName?: PianyuIconName;
  iconState?: PianyuIconState;
  count: number;
  issueBadge?: boolean;
  className?: string;
}
export const IconWithBadge: React.FC<Props> = ({
  id,
  icon,
  iconName,
  iconState = 'default',
  count,
  issueBadge,
  className,
}) => {
  const resolvedIcon =
    iconName === undefined ? icon : getPianyuIcon(iconName, iconState);
  const resolvedIconId =
    iconName === undefined ? id : getPianyuIconId(iconName);
  const resolvedClassName =
    iconName === undefined
      ? className
      : getPianyuIconClassName(iconName, iconState, className);

  if (resolvedIcon === undefined) {
    return null;
  }

  return (
    <i className='icon-with-badge'>
      <Icon
        id={resolvedIconId}
        icon={resolvedIcon}
        className={resolvedClassName}
      />
      {count > 0 && (
        <i className='icon-with-badge__badge'>{formatNumber(count)}</i>
      )}
      {issueBadge && <i className='icon-with-badge__issue-badge' />}
    </i>
  );
};
