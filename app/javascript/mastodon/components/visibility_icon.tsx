import { defineMessages, useIntl } from 'react-intl';

import { visibilityIcons } from 'mastodon/components/app_icons';
import type { StatusVisibility } from 'mastodon/models/status';

import { Icon } from './icon';

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: {
    id: 'privacy.unlisted.short',
    defaultMessage: 'Quiet public',
  },
  private_short: {
    id: 'privacy.private.short',
    defaultMessage: 'Followers',
  },
  direct_short: {
    id: 'privacy.direct.short',
    defaultMessage: 'Specific people',
  },
});

export const VisibilityIcon: React.FC<{ visibility: StatusVisibility }> = ({
  visibility,
}) => {
  const intl = useIntl();

  const visibilityIconInfo = {
    public: {
      icon: 'globe',
      iconComponent: visibilityIcons.public,
      text: intl.formatMessage(messages.public_short),
    },
    unlisted: {
      icon: 'unlock',
      iconComponent: visibilityIcons.unlisted,
      text: intl.formatMessage(messages.unlisted_short),
    },
    private: {
      icon: 'lock',
      iconComponent: visibilityIcons.private,
      text: intl.formatMessage(messages.private_short),
    },
    direct: {
      icon: 'at',
      iconComponent: visibilityIcons.direct,
      text: intl.formatMessage(messages.direct_short),
    },
  };

  const visibilityIcon = visibilityIconInfo[visibility];

  return (
    <Icon
      id={visibilityIcon.icon}
      icon={visibilityIcon.iconComponent}
      aria-label={visibilityIcon.text}
    />
  );
};
