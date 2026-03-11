import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';

import classNames from 'classnames';

import { Column } from 'mastodon/components/column';
import type { ColumnRef } from 'mastodon/components/column';
import { ColumnHeader } from 'mastodon/components/column_header';
import type { IconProp } from 'mastodon/components/icon';

import classes from './styles.module.scss';

interface WorkspacePageProps {
  title: string;
  label?: string;
  icon: string;
  iconComponent?: IconProp;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  headerContent?: React.ReactNode;
  extraButton?: React.ReactNode;
  multiColumn?: boolean;
  pinned?: boolean;
  showBackButton?: boolean;
  bindToDocument?: boolean;
  onClick?: () => void;
  onMove?: (direction: number) => void;
  onPin?: () => void;
}

export const WorkspacePage = forwardRef<ColumnRef, WorkspacePageProps>(
  (
    {
      title,
      label,
      icon,
      iconComponent,
      active,
      children,
      className,
      headerClassName,
      contentClassName,
      headerContent,
      extraButton,
      multiColumn = false,
      pinned,
      showBackButton,
      bindToDocument,
      onClick,
      onMove,
      onPin,
    },
    ref: Ref<ColumnRef>,
  ) => {
    const columnRef = useRef<ColumnRef>(null);

    useImperativeHandle(ref, () => columnRef.current as ColumnRef);

    const handleHeaderClick = useCallback(() => {
      if (onClick) {
        onClick();
      } else {
        columnRef.current?.scrollTop();
      }
    }, [onClick]);

    const shouldBindToDocument = bindToDocument ?? !multiColumn;

    return (
      <Column
        bindToDocument={shouldBindToDocument}
        className={classNames(classes.page, className)}
        label={label ?? title}
        ref={columnRef}
      >
        <ColumnHeader
          active={active}
          appendContent={
            headerContent ? (
              <div className={classes.headerContent}>{headerContent}</div>
            ) : undefined
          }
          className={classNames(classes.header, headerClassName)}
          extraButton={extraButton}
          icon={icon}
          iconComponent={iconComponent}
          multiColumn={multiColumn}
          onClick={handleHeaderClick}
          onMove={onMove}
          onPin={onPin}
          pinned={pinned}
          showBackButton={showBackButton}
          title={title}
        />

        <div className={classNames(classes.content, contentClassName)}>
          {children}
        </div>
      </Column>
    );
  },
);

WorkspacePage.displayName = 'WorkspacePage';
