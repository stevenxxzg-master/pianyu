import { useCallback, useState } from 'react';

import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import type { IconProp } from 'mastodon/components/icon';
import { Icon } from 'mastodon/components/icon';
import { ButtonInTabsBar } from 'mastodon/features/ui/util/columns_context';
import type { PianyuIconName, PianyuIconState } from 'mastodon/icons';
import { PianyuIcon } from 'mastodon/icons';
import { useIdentity } from 'mastodon/identity_context';

import { useColumnIndexContext } from '../features/ui/components/columns_area';
import { getColumnSkipLinkId } from '../features/ui/components/skip_links';

import { useAppHistory } from './router';

export const messages = defineMessages({
  show: { id: 'column_header.show_settings', defaultMessage: 'Show settings' },
  hide: { id: 'column_header.hide_settings', defaultMessage: 'Hide settings' },
  moveLeft: {
    id: 'column_header.moveLeft_settings',
    defaultMessage: 'Move column to the left',
  },
  moveRight: {
    id: 'column_header.moveRight_settings',
    defaultMessage: 'Move column to the right',
  },
  back: { id: 'column_back_button.label', defaultMessage: 'Back' },
});

const BackButton: React.FC<{
  hasTitle: boolean;
}> = ({ hasTitle }) => {
  const history = useAppHistory();
  const intl = useIntl();
  const columnIndex = useColumnIndexContext();

  const handleBackClick = useCallback(() => {
    if (history.location.state?.fromMastodon) {
      history.goBack();
    } else {
      history.push('/');
    }
  }, [history]);

  return (
    <button
      onClick={handleBackClick}
      className={classNames(
        'column-header__back-button',
        'column-header__button--pianyu',
        {
          compact: hasTitle,
        },
      )}
      id={!hasTitle ? getColumnSkipLinkId(columnIndex) : undefined}
      aria-label={intl.formatMessage(messages.back)}
      type='button'
    >
      <PianyuIcon name='action.back' className='column-back-button__icon' />
      {!hasTitle && (
        <FormattedMessage id='column_back_button.label' defaultMessage='Back' />
      )}
    </button>
  );
};

export interface Props {
  title?: string;
  icon?: string;
  iconComponent?: IconProp;
  iconName?: PianyuIconName;
  iconState?: PianyuIconState;
  iconClassName?: string;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  pinned?: boolean;
  multiColumn?: boolean;
  extraButton?: React.ReactNode;
  showBackButton?: boolean;
  placeholder?: boolean;
  appendContent?: React.ReactNode;
  collapseIssues?: boolean;
  onClick?: () => void;
  onMove?: (arg0: number) => void;
  onPin?: () => void;
}

export const ColumnHeader: React.FC<Props> = ({
  title,
  icon,
  iconComponent,
  iconName,
  iconState = 'default',
  iconClassName,
  active,
  children,
  className,
  pinned,
  multiColumn,
  extraButton,
  showBackButton,
  placeholder,
  appendContent,
  collapseIssues,
  onClick,
  onMove,
  onPin,
}) => {
  const intl = useIntl();
  const { signedIn } = useIdentity();
  const history = useAppHistory();
  const [collapsed, setCollapsed] = useState(true);
  const [animating, setAnimating] = useState(false);

  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCollapsed((value) => !value);
      setAnimating(true);
    },
    [setCollapsed, setAnimating],
  );

  const handleTitleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleMoveLeft = useCallback(() => {
    onMove?.(-1);
  }, [onMove]);

  const handleMoveRight = useCallback(() => {
    onMove?.(1);
  }, [onMove]);

  const handleTransitionEnd = useCallback(() => {
    setAnimating(false);
  }, [setAnimating]);

  const handlePin = useCallback(() => {
    if (!pinned) {
      history.replace('/');
    }

    onPin?.();
  }, [history, pinned, onPin]);

  const wrapperClassName = classNames('column-header__wrapper', className, {
    active,
  });

  const buttonClassName = classNames('column-header', {
    active,
  });

  const collapsibleClassName = classNames('column-header__collapsible', {
    collapsed,
    animating,
  });

  const collapsibleButtonClassName = classNames(
    'column-header__button',
    'column-header__button--pianyu',
    {
      active: !collapsed,
    },
  );

  let extraContent, pinButton, moveButtons, backButton, collapseButton;

  if (children) {
    extraContent = (
      <div key='extra-content' className='column-header__collapsible__extra'>
        {children}
      </div>
    );
  }

  if (multiColumn && pinned) {
    pinButton = (
      <button
        className='text-btn column-header__setting-btn column-header__button--pianyu'
        onClick={handlePin}
        type='button'
      >
        <PianyuIcon name='action.close' />{' '}
        <FormattedMessage id='column_header.unpin' defaultMessage='Unpin' />
      </button>
    );

    moveButtons = (
      <div className='column-header__setting-arrows'>
        <button
          title={intl.formatMessage(messages.moveLeft)}
          aria-label={intl.formatMessage(messages.moveLeft)}
          className='icon-button icon-button--pianyu column-header__setting-btn'
          onClick={handleMoveLeft}
          type='button'
        >
          <PianyuIcon name='action.moveLeft' />
        </button>
        <button
          title={intl.formatMessage(messages.moveRight)}
          aria-label={intl.formatMessage(messages.moveRight)}
          className='icon-button icon-button--pianyu column-header__setting-btn'
          onClick={handleMoveRight}
          type='button'
        >
          <PianyuIcon name='action.moveRight' />
        </button>
      </div>
    );
  } else if (multiColumn && onPin) {
    pinButton = (
      <button
        className='text-btn column-header__setting-btn column-header__button--pianyu'
        onClick={handlePin}
        type='button'
      >
        <PianyuIcon name='action.pin' />{' '}
        <FormattedMessage id='column_header.pin' defaultMessage='Pin' />
      </button>
    );
  }

  if (
    !pinned &&
    ((multiColumn && history.location.state?.fromMastodon) || showBackButton)
  ) {
    backButton = <BackButton hasTitle={!!title} />;
  }

  const collapsedContent = [extraContent];

  if (multiColumn) {
    collapsedContent.push(
      <div key='buttons' className='column-header__advanced-buttons'>
        {pinButton}
        {moveButtons}
      </div>,
    );
  }

  if (signedIn && (children || (multiColumn && onPin))) {
    collapseButton = (
      <button
        className={collapsibleButtonClassName}
        title={intl.formatMessage(collapsed ? messages.show : messages.hide)}
        aria-label={intl.formatMessage(
          collapsed ? messages.show : messages.hide,
        )}
        onClick={handleToggleClick}
        type='button'
      >
        <i className='icon-with-badge'>
          <PianyuIcon name={collapsed ? 'action.expand' : 'action.collapse'} />
          {collapseIssues && <i className='icon-with-badge__issue-badge' />}
        </i>
      </button>
    );
  }

  const hasNamedIcon = iconName !== undefined;
  const hasIcon = hasNamedIcon || (icon && iconComponent);
  const hasTitle = hasIcon && title ? true : Boolean(backButton && title);
  const columnIndex = useColumnIndexContext();

  const component = (
    <div className={wrapperClassName}>
      <h1 className={buttonClassName}>
        {hasTitle && (
          <>
            {backButton}

            <button
              onClick={handleTitleClick}
              className='column-header__title'
              type='button'
              id={getColumnSkipLinkId(columnIndex)}
            >
              {!backButton && iconName && (
                <PianyuIcon
                  name={iconName}
                  state={iconState}
                  className={classNames('column-header__icon', iconClassName)}
                />
              )}
              {!backButton && !hasNamedIcon && icon && iconComponent && (
                <Icon
                  id={icon}
                  icon={iconComponent}
                  className={classNames('column-header__icon', iconClassName)}
                />
              )}
              {title}
            </button>
          </>
        )}

        {!hasTitle && backButton}

        <div className='column-header__buttons'>
          {extraButton}
          {collapseButton}
        </div>
      </h1>

      <div
        className={collapsibleClassName}
        tabIndex={collapsed ? -1 : undefined}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className='column-header__collapsible-inner'>
          {(!collapsed || animating) && collapsedContent}
        </div>
      </div>

      {appendContent}
    </div>
  );

  if (placeholder) {
    return component;
  } else {
    return <ButtonInTabsBar>{component}</ButtonInTabsBar>;
  }
};

// eslint-disable-next-line import/no-default-export
export default ColumnHeader;
