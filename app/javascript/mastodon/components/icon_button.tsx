import { useCallback, forwardRef } from 'react';

import classNames from 'classnames';

import type { PianyuIconName, PianyuIconState } from 'mastodon/icons';
import {
  getPianyuIcon,
  getPianyuIconClassName,
  getPianyuIconId,
} from 'mastodon/icons';

import { usePrevious } from '../hooks/usePrevious';

import { AnimatedNumber } from './animated_number';
import type { IconProp } from './icon';
import { Icon } from './icon';

interface Props {
  className?: string;
  title: string;
  icon: string;
  iconComponent?: IconProp;
  iconName?: PianyuIconName;
  iconState?: PianyuIconState;
  iconClassName?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  active?: boolean;
  expanded?: boolean;
  style?: React.CSSProperties;
  activeStyle?: React.CSSProperties;
  disabled?: boolean;
  inverted?: boolean;
  animate?: boolean;
  overlay?: boolean;
  tabIndex?: number;
  counter?: number;
  href?: string;
  ariaHidden?: boolean;
  ariaControls?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      className,
      expanded,
      icon,
      iconComponent,
      iconName,
      iconState = 'default',
      iconClassName,
      inverted,
      title,
      counter,
      href,
      style,
      activeStyle,
      onClick,
      onKeyDown,
      onMouseDown,
      active = false,
      disabled = false,
      animate = false,
      overlay = false,
      tabIndex = 0,
      ariaHidden = false,
      ariaControls,
    },
    buttonRef,
  ) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
      (e) => {
        e.preventDefault();

        if (!disabled) {
          onClick?.(e);
        }
      },
      [disabled, onClick],
    );

    const handleMouseDown: React.MouseEventHandler<HTMLButtonElement> =
      useCallback(
        (e) => {
          if (!disabled) {
            onMouseDown?.(e);
          }
        },
        [disabled, onMouseDown],
      );

    const handleKeyDown: React.KeyboardEventHandler<HTMLButtonElement> =
      useCallback(
        (e) => {
          if (!disabled) {
            onKeyDown?.(e);
          }
        },
        [disabled, onKeyDown],
      );

    const buttonStyle = {
      ...style,
      ...(active ? activeStyle : {}),
    };

    const previousActive = usePrevious(active) ?? active;
    const shouldAnimate = animate && active !== previousActive;

    const classes = classNames(className, 'icon-button', {
      active,
      disabled,
      inverted,
      activate: shouldAnimate && active,
      deactivate: shouldAnimate && !active,
      overlayed: overlay,
      'icon-button--with-counter': typeof counter !== 'undefined',
    });

    const resolvedIcon =
      iconName === undefined
        ? iconComponent
        : getPianyuIcon(iconName, iconState);
    const resolvedIconClassName =
      iconName === undefined
        ? iconClassName
        : getPianyuIconClassName(iconName, iconState, iconClassName);
    const resolvedIconId =
      iconName === undefined ? icon : getPianyuIconId(iconName);

    if (resolvedIcon === undefined) {
      return null;
    }

    let contents = (
      <>
        <Icon
          id={resolvedIconId}
          icon={resolvedIcon}
          className={resolvedIconClassName}
          aria-hidden='true'
        />{' '}
        {typeof counter !== 'undefined' && (
          <span className='icon-button__counter'>
            <AnimatedNumber value={counter} />
          </span>
        )}
      </>
    );

    if (href != null) {
      contents = (
        <a href={href} target='_blank' rel='noopener noreferrer'>
          {contents}
        </a>
      );
    }

    return (
      <button
        type='button'
        aria-label={title}
        aria-expanded={expanded}
        aria-hidden={ariaHidden}
        aria-controls={ariaControls}
        title={title}
        className={classes}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        style={buttonStyle}
        tabIndex={tabIndex}
        disabled={disabled}
        ref={buttonRef}
      >
        {contents}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
