import classNames from 'classnames';

import AddIcon from '@/material-icons/400-24px/add.svg?react';
import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import ArrowBackIcon from '@/material-icons/400-24px/arrow_back.svg?react';
import BookmarkActiveIcon from '@/material-icons/400-24px/bookmark-fill.svg?react';
import BookmarkIcon from '@/material-icons/400-24px/bookmark.svg?react';
import BookmarksActiveIcon from '@/material-icons/400-24px/bookmarks-fill.svg?react';
import BookmarksIcon from '@/material-icons/400-24px/bookmarks.svg?react';
import CollectionsActiveIcon from '@/material-icons/400-24px/category-fill.svg?react';
import CollectionsIcon from '@/material-icons/400-24px/category.svg?react';
import CheckIcon from '@/material-icons/400-24px/check.svg?react';
import ChevronLeftIcon from '@/material-icons/400-24px/chevron_left.svg?react';
import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import DescriptionIcon from '@/material-icons/400-24px/description.svg?react';
import DoneIcon from '@/material-icons/400-24px/done.svg?react';
import EditIcon from '@/material-icons/400-24px/edit.svg?react';
import FormatQuoteIcon from '@/material-icons/400-24px/format_quote-fill.svg?react';
import FormatQuoteOffIcon from '@/material-icons/400-24px/format_quote_off-fill.svg?react';
import GroupIcon from '@/material-icons/400-24px/group.svg?react';
import HistoryIcon from '@/material-icons/400-24px/history.svg?react';
import HomeActiveIcon from '@/material-icons/400-24px/home-fill.svg?react';
import HomeIcon from '@/material-icons/400-24px/home.svg?react';
import InboxIcon from '@/material-icons/400-24px/inbox.svg?react';
import InfoIcon from '@/material-icons/400-24px/info.svg?react';
import InventoryIcon from '@/material-icons/400-24px/inventory_2.svg?react';
import KeyboardArrowDownIcon from '@/material-icons/400-24px/keyboard_arrow_down.svg?react';
import KeyboardArrowUpIcon from '@/material-icons/400-24px/keyboard_arrow_up.svg?react';
import ListAltActiveIcon from '@/material-icons/400-24px/list_alt-fill.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import MenuIcon from '@/material-icons/400-24px/menu.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import NotificationsActiveIcon from '@/material-icons/400-24px/notifications-fill.svg?react';
import NotificationsIcon from '@/material-icons/400-24px/notifications.svg?react';
import PersonIcon from '@/material-icons/400-24px/person.svg?react';
import PersonAddActiveIcon from '@/material-icons/400-24px/person_add-fill.svg?react';
import PersonAddIcon from '@/material-icons/400-24px/person_add.svg?react';
import PublicIcon from '@/material-icons/400-24px/public.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import ReplyIcon from '@/material-icons/400-24px/reply.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import SettingsIcon from '@/material-icons/400-24px/settings.svg?react';
import StarActiveIcon from '@/material-icons/400-24px/star-fill.svg?react';
import StarIcon from '@/material-icons/400-24px/star.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import UnfoldLessIcon from '@/material-icons/400-24px/unfold_less.svg?react';
import UnfoldMoreIcon from '@/material-icons/400-24px/unfold_more.svg?react';
import WarningIcon from '@/material-icons/400-24px/warning.svg?react';
import RepeatActiveIcon from '@/svg-icons/repeat_active.svg?react';
import RepeatDisabledIcon from '@/svg-icons/repeat_disabled.svg?react';
import RepeatPrivateIcon from '@/svg-icons/repeat_private.svg?react';
import RepeatPrivateActiveIcon from '@/svg-icons/repeat_private_active.svg?react';
import type { IconProp } from 'mastodon/components/icon';
import { Icon } from 'mastodon/components/icon';

export type PianyuIconGroup =
  | 'action'
  | 'empty'
  | 'navigation'
  | 'settings'
  | 'status';

export type PianyuIconState =
  | 'active'
  | 'default'
  | 'disabled'
  | 'private'
  | 'privateActive';

export type PianyuIconName =
  | 'action.back'
  | 'action.bookmark'
  | 'action.boost'
  | 'action.close'
  | 'action.collapse'
  | 'action.disclose'
  | 'action.expand'
  | 'action.favourite'
  | 'action.more'
  | 'action.moveLeft'
  | 'action.moveRight'
  | 'action.pin'
  | 'action.quote'
  | 'action.reply'
  | 'navigation.about'
  | 'navigation.bookmarks'
  | 'navigation.collections'
  | 'navigation.compose'
  | 'navigation.direct'
  | 'navigation.explore'
  | 'navigation.firehose'
  | 'navigation.followRequests'
  | 'navigation.home'
  | 'navigation.lists'
  | 'navigation.menu'
  | 'navigation.more'
  | 'navigation.notifications'
  | 'navigation.search'
  | 'navigation.settings'
  | 'navigation.tags'
  | 'settings.about'
  | 'settings.appearance'
  | 'settings.branding'
  | 'settings.contentRetention'
  | 'settings.discovery'
  | 'settings.editProfile'
  | 'settings.featuredTags'
  | 'settings.registrations'
  | 'settings.verification'
  | 'status.info'
  | 'status.success'
  | 'status.warning'
  | 'empty.collections'
  | 'empty.history'
  | 'empty.inbox'
  | 'empty.profile'
  | 'empty.search';

interface CatalogEntry {
  default: IconProp;
  active?: IconProp;
  disabled?: IconProp;
  private?: IconProp;
  privateActive?: IconProp;
  group: PianyuIconGroup;
  id: string;
}

const pianyuIconCatalog: Record<PianyuIconName, CatalogEntry> = {
  'action.back': {
    default: ArrowBackIcon,
    group: 'action',
    id: 'arrow-back',
  },
  'action.bookmark': {
    active: BookmarkActiveIcon,
    default: BookmarkIcon,
    group: 'action',
    id: 'bookmark',
  },
  'action.boost': {
    active: RepeatActiveIcon,
    default: RepeatIcon,
    disabled: RepeatDisabledIcon,
    group: 'action',
    id: 'repeat',
    private: RepeatPrivateIcon,
    privateActive: RepeatPrivateActiveIcon,
  },
  'action.close': {
    default: CloseIcon,
    group: 'action',
    id: 'close',
  },
  'action.collapse': {
    default: UnfoldLessIcon,
    group: 'action',
    id: 'collapse',
  },
  'action.disclose': {
    active: KeyboardArrowUpIcon,
    default: KeyboardArrowDownIcon,
    group: 'action',
    id: 'disclose',
  },
  'action.expand': {
    default: UnfoldMoreIcon,
    group: 'action',
    id: 'expand',
  },
  'action.favourite': {
    active: StarActiveIcon,
    default: StarIcon,
    group: 'action',
    id: 'star',
  },
  'action.more': {
    default: MoreHorizIcon,
    group: 'action',
    id: 'more-horiz',
  },
  'action.moveLeft': {
    default: ChevronLeftIcon,
    group: 'action',
    id: 'chevron-left',
  },
  'action.moveRight': {
    default: ChevronRightIcon,
    group: 'action',
    id: 'chevron-right',
  },
  'action.pin': {
    default: AddIcon,
    group: 'action',
    id: 'pin',
  },
  'action.quote': {
    default: FormatQuoteIcon,
    disabled: FormatQuoteOffIcon,
    group: 'action',
    id: 'quote',
  },
  'action.reply': {
    active: ReplyAllIcon,
    default: ReplyIcon,
    group: 'action',
    id: 'reply',
  },
  'navigation.about': {
    default: InfoIcon,
    group: 'navigation',
    id: 'about',
  },
  'navigation.bookmarks': {
    active: BookmarksActiveIcon,
    default: BookmarksIcon,
    group: 'navigation',
    id: 'bookmarks',
  },
  'navigation.collections': {
    active: CollectionsActiveIcon,
    default: CollectionsIcon,
    group: 'navigation',
    id: 'collections',
  },
  'navigation.compose': {
    default: AddIcon,
    group: 'navigation',
    id: 'compose',
  },
  'navigation.direct': {
    default: AlternateEmailIcon,
    group: 'navigation',
    id: 'direct',
  },
  'navigation.explore': {
    default: TrendingUpIcon,
    group: 'navigation',
    id: 'explore',
  },
  'navigation.firehose': {
    default: PublicIcon,
    group: 'navigation',
    id: 'firehose',
  },
  'navigation.followRequests': {
    active: PersonAddActiveIcon,
    default: PersonAddIcon,
    group: 'navigation',
    id: 'follow-requests',
  },
  'navigation.home': {
    active: HomeActiveIcon,
    default: HomeIcon,
    group: 'navigation',
    id: 'home',
  },
  'navigation.lists': {
    active: ListAltActiveIcon,
    default: ListAltIcon,
    group: 'navigation',
    id: 'lists',
  },
  'navigation.menu': {
    default: MenuIcon,
    group: 'navigation',
    id: 'menu',
  },
  'navigation.more': {
    default: MoreHorizIcon,
    group: 'navigation',
    id: 'more',
  },
  'navigation.notifications': {
    active: NotificationsActiveIcon,
    default: NotificationsIcon,
    group: 'navigation',
    id: 'notifications',
  },
  'navigation.search': {
    default: SearchIcon,
    group: 'navigation',
    id: 'search',
  },
  'navigation.settings': {
    default: SettingsIcon,
    group: 'navigation',
    id: 'settings',
  },
  'navigation.tags': {
    default: TagIcon,
    group: 'navigation',
    id: 'tags',
  },
  'settings.about': {
    default: DescriptionIcon,
    group: 'settings',
    id: 'settings-about',
  },
  'settings.appearance': {
    default: SettingsIcon,
    group: 'settings',
    id: 'settings-appearance',
  },
  'settings.branding': {
    default: EditIcon,
    group: 'settings',
    id: 'settings-branding',
  },
  'settings.contentRetention': {
    default: HistoryIcon,
    group: 'settings',
    id: 'settings-content-retention',
  },
  'settings.discovery': {
    default: SearchIcon,
    group: 'settings',
    id: 'settings-discovery',
  },
  'settings.editProfile': {
    default: PersonIcon,
    group: 'settings',
    id: 'settings-edit-profile',
  },
  'settings.featuredTags': {
    default: InventoryIcon,
    group: 'settings',
    id: 'settings-featured-tags',
  },
  'settings.registrations': {
    default: GroupIcon,
    group: 'settings',
    id: 'settings-registrations',
  },
  'settings.verification': {
    default: CheckIcon,
    group: 'settings',
    id: 'settings-verification',
  },
  'status.info': {
    default: InfoIcon,
    group: 'status',
    id: 'status-info',
  },
  'status.success': {
    default: DoneIcon,
    group: 'status',
    id: 'status-success',
  },
  'status.warning': {
    default: WarningIcon,
    group: 'status',
    id: 'status-warning',
  },
  'empty.collections': {
    default: CollectionsIcon,
    group: 'empty',
    id: 'empty-collections',
  },
  'empty.history': {
    default: HistoryIcon,
    group: 'empty',
    id: 'empty-history',
  },
  'empty.inbox': {
    default: InboxIcon,
    group: 'empty',
    id: 'empty-inbox',
  },
  'empty.profile': {
    default: PersonIcon,
    group: 'empty',
    id: 'empty-profile',
  },
  'empty.search': {
    default: SearchIcon,
    group: 'empty',
    id: 'empty-search',
  },
};

const iconStateOrder: PianyuIconState[] = [
  'active',
  'disabled',
  'private',
  'privateActive',
  'default',
];

export const getPianyuIconMeta = (name: PianyuIconName) =>
  pianyuIconCatalog[name];

export const getPianyuIconId = (name: PianyuIconName) =>
  pianyuIconCatalog[name].id;

export const getPianyuIcon = (
  name: PianyuIconName,
  state: PianyuIconState = 'default',
): IconProp => {
  const entry = pianyuIconCatalog[name];

  switch (state) {
    case 'active':
      return entry.active ?? entry.default;
    case 'disabled':
      return entry.disabled ?? entry.default;
    case 'private':
      return entry.private ?? entry.default;
    case 'privateActive':
      return entry.privateActive ?? entry.default;
    default:
      return entry.default;
  }
};

export const getPianyuIconClassName = (
  name: PianyuIconName,
  state: PianyuIconState = 'default',
  className?: string,
) => {
  const { group } = pianyuIconCatalog[name];

  return classNames(
    'icon--pianyu',
    `icon--pianyu-${group}`,
    state !== 'default' && `icon--pianyu-${state}`,
    className,
  );
};

interface PianyuIconProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  'children'
> {
  name: PianyuIconName;
  state?: PianyuIconState;
}

export const PianyuIcon: React.FC<PianyuIconProps> = ({
  name,
  state = 'default',
  className,
  ...props
}) => (
  <Icon
    id={getPianyuIconId(name)}
    icon={getPianyuIcon(name, state)}
    className={getPianyuIconClassName(name, state, className)}
    {...props}
  />
);

export const pianyuIconGuide = {
  cornerRadius: 10,
  groups: {
    action: { size: 20 },
    empty: { size: 24 },
    navigation: { size: 20 },
    settings: { size: 20 },
    status: { size: 18 },
  },
  migrationBoundary:
    'Use iconName/PianyuIcon/pianyu_icon for new or migrated navigation, action, status, empty-state, and settings work. Keep legacy raw imports only in untouched surfaces until they are intentionally migrated.',
  reference:
    'Codex-inspired rounded, compact, fill-first glyphs with explicit active/disabled state variants.',
  supportedStates: iconStateOrder,
} as const;
