import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';

import classNames from 'classnames';

import classes from './surface.module.scss';

export interface SurfaceProps extends ComponentPropsWithoutRef<'section'> {
  tone?: 'default' | 'muted';
  padding?: 'comfortable' | 'compact';
}

export const Surface: React.FC<PropsWithChildren<SurfaceProps>> = ({
  tone = 'default',
  padding = 'comfortable',
  className,
  children,
  ...props
}) => {
  return (
    <section
      className={classNames(
        className,
        classes.surface,
        tone === 'muted' && classes.surfaceMuted,
        padding === 'compact' && classes.surfaceCompact,
      )}
      {...props}
    >
      {children}
    </section>
  );
};
