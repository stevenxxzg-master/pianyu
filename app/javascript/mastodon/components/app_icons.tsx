import IconPlanet from '@/images/icons/icon_planet.svg?react';
import AddIcon from '@/material-icons/400-24px/add.svg?react';
import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import ArrowBackIcon from '@/material-icons/400-24px/arrow_back.svg?react';
import BlockIcon from '@/material-icons/400-24px/block.svg?react';
import BookmarkActiveIcon from '@/material-icons/400-24px/bookmark-fill.svg?react';
import BookmarkIcon from '@/material-icons/400-24px/bookmark.svg?react';
import BookmarksActiveIcon from '@/material-icons/400-24px/bookmarks-fill.svg?react';
import BookmarksIcon from '@/material-icons/400-24px/bookmarks.svg?react';
import CampaignIcon from '@/material-icons/400-24px/campaign.svg?react';
import CancelIcon from '@/material-icons/400-24px/cancel.svg?react';
import CategoryActiveIcon from '@/material-icons/400-24px/category-fill.svg?react';
import CategoryIcon from '@/material-icons/400-24px/category.svg?react';
import CheckIcon from '@/material-icons/400-24px/check.svg?react';
import ChevronLeftIcon from '@/material-icons/400-24px/chevron_left.svg?react';
import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import CloseIcon from '@/material-icons/400-24px/close.svg?react';
import ContentCopyIcon from '@/material-icons/400-24px/content_copy.svg?react';
import DeleteForeverIcon from '@/material-icons/400-24px/delete_forever.svg?react';
import DomainDisabledIcon from '@/material-icons/400-24px/domain_disabled.svg?react';
import EditSquareIcon from '@/material-icons/400-24px/edit_square.svg?react';
import FilterAltIcon from '@/material-icons/400-24px/filter_alt.svg?react';
import GavelIcon from '@/material-icons/400-24px/gavel.svg?react';
import GroupIcon from '@/material-icons/400-24px/group.svg?react';
import HomeActiveIcon from '@/material-icons/400-24px/home-fill.svg?react';
import HomeIcon from '@/material-icons/400-24px/home.svg?react';
import InfoIcon from '@/material-icons/400-24px/info.svg?react';
import InsertChartIcon from '@/material-icons/400-24px/insert_chart.svg?react';
import KeyboardArrowDownIcon from '@/material-icons/400-24px/keyboard_arrow_down.svg?react';
import KeyboardArrowUpIcon from '@/material-icons/400-24px/keyboard_arrow_up.svg?react';
import ListAltActiveIcon from '@/material-icons/400-24px/list_alt-fill.svg?react';
import ListAltIcon from '@/material-icons/400-24px/list_alt.svg?react';
import LockIcon from '@/material-icons/400-24px/lock.svg?react';
import LogoutIcon from '@/material-icons/400-24px/logout.svg?react';
import MenuIcon from '@/material-icons/400-24px/menu.svg?react';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import NotificationsActiveIcon from '@/material-icons/400-24px/notifications-fill.svg?react';
import NotificationsIcon from '@/material-icons/400-24px/notifications.svg?react';
import PersonAddActiveIcon from '@/material-icons/400-24px/person_add-fill.svg?react';
import PersonAddIcon from '@/material-icons/400-24px/person_add.svg?react';
import PublicIcon from '@/material-icons/400-24px/public.svg?react';
import QuietTimeIcon from '@/material-icons/400-24px/quiet_time.svg?react';
import RepeatIcon from '@/material-icons/400-24px/repeat.svg?react';
import ReplyIcon from '@/material-icons/400-24px/reply.svg?react';
import ReplyAllIcon from '@/material-icons/400-24px/reply_all.svg?react';
import SearchIcon from '@/material-icons/400-24px/search.svg?react';
import SettingsIcon from '@/material-icons/400-24px/settings.svg?react';
import ShieldQuestionIcon from '@/material-icons/400-24px/shield_question.svg?react';
import StarActiveIcon from '@/material-icons/400-24px/star-fill.svg?react';
import StarIcon from '@/material-icons/400-24px/star.svg?react';
import TagIcon from '@/material-icons/400-24px/tag.svg?react';
import TrendingUpIcon from '@/material-icons/400-24px/trending_up.svg?react';
import UnfoldLessIcon from '@/material-icons/400-24px/unfold_less.svg?react';
import UnfoldMoreIcon from '@/material-icons/400-24px/unfold_more.svg?react';
import UploadFileIcon from '@/material-icons/400-24px/upload_file.svg?react';
import VolumeOffIcon from '@/material-icons/400-24px/volume_off.svg?react';
import WarningIcon from '@/material-icons/400-24px/warning.svg?react';

import { IconLogo, WordmarkLogo } from './logo';

export const brandIcons = {
  icon: IconLogo,
  wordmark: WordmarkLogo,
} as const;

export const navigationIcons = {
  about: InfoIcon,
  announcements: CampaignIcon,
  bookmarks: BookmarksIcon,
  bookmarksActive: BookmarksActiveIcon,
  collections: CategoryIcon,
  collectionsActive: CategoryActiveIcon,
  compose: AddIcon,
  direct: AlternateEmailIcon,
  explore: TrendingUpIcon,
  home: HomeIcon,
  homeActive: HomeActiveIcon,
  list: ListAltIcon,
  listActive: ListAltActiveIcon,
  localFeed: GroupIcon,
  menu: MenuIcon,
  more: MoreHorizIcon,
  notifications: NotificationsIcon,
  notificationsActive: NotificationsActiveIcon,
  preferences: SettingsIcon,
  publicFeed: PublicIcon,
  search: SearchIcon,
  tag: TagIcon,
  favourite: StarIcon,
  favouriteActive: StarActiveIcon,
  followRequests: PersonAddIcon,
  followRequestsActive: PersonAddActiveIcon,
} as const;

export const actionIcons = {
  back: ArrowBackIcon,
  cancel: CancelIcon,
  bookmark: BookmarkIcon,
  bookmarkActive: BookmarkActiveIcon,
  check: CheckIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  close: CloseIcon,
  collapse: UnfoldLessIcon,
  copy: ContentCopyIcon,
  edit: EditSquareIcon,
  expand: UnfoldMoreIcon,
  favourite: StarIcon,
  favouriteActive: StarActiveIcon,
  filterChart: InsertChartIcon,
  panelCollapse: KeyboardArrowUpIcon,
  panelExpand: KeyboardArrowDownIcon,
  more: MoreHorizIcon,
  reply: ReplyIcon,
  replyAll: ReplyAllIcon,
  repeat: RepeatIcon,
} as const;

export const dropdownIcons = {
  accountSettings: LockIcon,
  administration: SettingsIcon,
  automatedDeletion: DeleteForeverIcon,
  blocks: BlockIcon,
  domainBlocks: DomainDisabledIcon,
  filters: FilterAltIcon,
  importExport: UploadFileIcon,
  logout: LogoutIcon,
  moderation: GavelIcon,
  mutes: VolumeOffIcon,
  privacyAndReach: ShieldQuestionIcon,
  report: GavelIcon,
} as const;

export const stateIcons = {
  annualReport: IconPlanet,
  warning: WarningIcon,
  collectionsEmpty: ListAltIcon,
} as const;

export const visibilityIcons = {
  direct: AlternateEmailIcon,
  private: LockIcon,
  public: PublicIcon,
  unlisted: QuietTimeIcon,
} as const;
