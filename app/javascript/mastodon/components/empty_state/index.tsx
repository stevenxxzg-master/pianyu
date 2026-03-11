import { FormattedMessage } from 'react-intl';

import type { IconProp } from 'mastodon/components/icon';
import { Icon } from 'mastodon/components/icon';

import classes from './empty_state.module.scss';

export const EmptyState: React.FC<{
  title?: string | React.ReactElement;
  message?: string | React.ReactElement;
  icon?: IconProp;
  iconId?: string;
  children?: React.ReactNode;
}> = ({
  title = (
    <FormattedMessage id='empty_state.no_results' defaultMessage='No results' />
  ),
  message,
  icon,
  iconId = 'empty-state',
  children,
}) => {
  return (
    <div className={classes.wrapper}>
      {icon && <Icon id={iconId} icon={icon} className={classes.icon} />}

      <div className={classes.content}>
        <h3>{title}</h3>
        {!!message && <p>{message}</p>}
      </div>

      {children}
    </div>
  );
};
