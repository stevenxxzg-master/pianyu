import { useState, useCallback, useId } from 'react';

import type { IconProp } from 'mastodon/components/icon';
import { IconButton } from 'mastodon/components/icon_button';
import { LoadingIndicator } from 'mastodon/components/loading_indicator';
import { ColumnLink } from 'mastodon/features/ui/components/column_link';
import type { PianyuIconName } from 'mastodon/icons';

export const CollapsiblePanel: React.FC<{
  children: React.ReactNode[];
  to: string;
  title: string;
  collapseTitle: string;
  expandTitle: string;
  icon: string;
  iconComponent?: IconProp;
  iconName?: PianyuIconName;
  activeIconComponent?: IconProp;
  activeIconName?: PianyuIconName;
  loading?: boolean;
}> = ({
  children,
  to,
  icon,
  iconComponent,
  iconName,
  activeIconComponent,
  activeIconName,
  title,
  collapseTitle,
  expandTitle,
  loading,
}) => {
  const [expanded, setExpanded] = useState(false);
  const accessibilityId = useId();

  const handleClick = useCallback(() => {
    setExpanded((value) => !value);
  }, [setExpanded]);

  return (
    <div className='navigation-panel__list-panel'>
      <div className='navigation-panel__list-panel__header'>
        <ColumnLink
          transparent
          to={to}
          icon={icon}
          iconComponent={iconComponent}
          iconName={iconName}
          activeIconComponent={activeIconComponent}
          activeIconName={activeIconName}
          text={title}
          id={`${accessibilityId}-title`}
        />

        {(loading || children.length > 0) && (
          <>
            <div className='navigation-panel__list-panel__header__sep' />

            <IconButton
              className='icon-button--pianyu'
              icon='down'
              expanded={expanded}
              iconComponent={loading ? LoadingIndicator : undefined}
              iconName={loading ? undefined : 'action.disclose'}
              iconState={expanded ? 'active' : 'default'}
              title={expanded ? collapseTitle : expandTitle}
              onClick={handleClick}
              aria-controls={`${accessibilityId}-content`}
            />
          </>
        )}
      </div>

      {children.length > 0 && expanded && (
        <div
          className='navigation-panel__list-panel__items'
          role='region'
          id={`${accessibilityId}-content`}
          aria-labelledby={`${accessibilityId}-title`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
