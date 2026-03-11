import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import classNames from 'classnames';

import classes from './surface.module.css';

export type SurfaceVariant = 'panel' | 'card' | 'popover' | 'modal' | 'message';
export type SurfaceTone =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse';
export type SurfaceDensity = 'default' | 'compact';

const variantClasses: Record<SurfaceVariant, string | undefined> = {
  panel: classes.panel,
  card: classes.card,
  popover: classes.popover,
  modal: classes.modal,
  message: classes.message,
};

const toneClasses: Record<SurfaceTone, string | undefined> = {
  default: classes.toneDefault,
  accent: classes.toneAccent,
  success: classes.toneSuccess,
  warning: classes.toneWarning,
  danger: classes.toneDanger,
  inverse: classes.toneInverse,
};

const densityClasses: Record<SurfaceDensity, string | undefined> = {
  default: classes.densityDefault,
  compact: classes.densityCompact,
};

export interface SurfaceProps extends ComponentPropsWithoutRef<'div'> {
  variant?: SurfaceVariant;
  tone?: SurfaceTone;
  density?: SurfaceDensity;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      variant = 'panel',
      tone = 'default',
      density = 'default',
      className,
      ...props
    },
    ref,
  ) => (
    <div
      {...props}
      className={classNames(
        classes.surface,
        variantClasses[variant],
        toneClasses[tone],
        densityClasses[density],
        className,
      )}
      data-density={density}
      data-tone={tone}
      data-variant={variant}
      ref={ref}
    />
  ),
);

Surface.displayName = 'Surface';

export const Panel = forwardRef<HTMLDivElement, Omit<SurfaceProps, 'variant'>>(
  (props, ref) => <Surface {...props} variant='panel' ref={ref} />,
);

Panel.displayName = 'Panel';

export const Card = forwardRef<HTMLDivElement, Omit<SurfaceProps, 'variant'>>(
  (props, ref) => <Surface {...props} variant='card' ref={ref} />,
);

Card.displayName = 'Card';

export const PopoverSurface = forwardRef<
  HTMLDivElement,
  Omit<SurfaceProps, 'variant'>
>((props, ref) => <Surface {...props} variant='popover' ref={ref} />);

PopoverSurface.displayName = 'PopoverSurface';

export const ModalSurface = forwardRef<
  HTMLDivElement,
  Omit<SurfaceProps, 'variant'>
>((props, ref) => <Surface {...props} variant='modal' ref={ref} />);

ModalSurface.displayName = 'ModalSurface';

export const MessageSurface = forwardRef<
  HTMLDivElement,
  Omit<SurfaceProps, 'variant'>
>((props, ref) => <Surface {...props} variant='message' ref={ref} />);

MessageSurface.displayName = 'MessageSurface';
