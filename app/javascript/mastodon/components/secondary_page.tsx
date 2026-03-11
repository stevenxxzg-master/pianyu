import type { ReactNode } from 'react';

import classNames from 'classnames';

import { Icon } from './icon';
import type { IconProp } from './icon';
import classes from './secondary_page.module.scss';

interface SecondaryPageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  compact?: boolean;
}

export const SecondaryPageHero: React.FC<SecondaryPageHeroProps> = ({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
  compact = false,
}) => (
  <section
    className={classNames(
      classes.hero,
      compact && classes.heroCompact,
      className,
    )}
  >
    <div className={classes.heroInner}>
      {eyebrow && <div className={classes.eyebrow}>{eyebrow}</div>}

      <div className={classes.heroTopRow}>
        <div className={classes.copy}>
          <h3 className={classes.title}>{title}</h3>
          {description && <p className={classes.description}>{description}</p>}
        </div>

        {actions && <div className={classes.actions}>{actions}</div>}
      </div>

      {meta && <div className={classes.meta}>{meta}</div>}
    </div>
  </section>
);

export const SecondaryPageChip: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <span className={classNames(classes.chip, className)}>{children}</span>
);

export const SecondaryPageSection: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <section className={classNames(classes.section, className)}>
    {children}
  </section>
);

interface SecondaryPageEmptyStateProps {
  title: ReactNode;
  message?: ReactNode;
  actions?: ReactNode;
  iconId?: string;
  icon?: IconProp;
  className?: string;
}

export const SecondaryPageEmptyState: React.FC<
  SecondaryPageEmptyStateProps
> = ({ title, message, actions, iconId, icon, className }) => (
  <div className={classNames(classes.emptyState, className)}>
    {icon && (
      <div className={classes.emptyIcon}>
        <Icon icon={icon} id={iconId ?? 'secondary-page'} />
      </div>
    )}

    <div className={classes.emptyCopy}>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>

    {actions && <div className={classes.emptyActions}>{actions}</div>}
  </div>
);

export { classes as secondaryPageClasses };
