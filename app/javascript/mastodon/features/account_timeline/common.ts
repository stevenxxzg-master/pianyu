import type { LocationDescriptorObject } from 'history';

import type { LocationState } from '@/mastodon/components/router';
import type { AccountFieldShape } from '@/mastodon/models/account';

export function isRedesignEnabled() {
  return true;
}

export function buildAccountActivityLocation({
  acct,
  tagged,
  boosts,
  replies,
}: {
  acct: string;
  tagged?: string;
  boosts: boolean;
  replies: boolean;
}): LocationDescriptorObject<LocationState> {
  const pathname = tagged
    ? `/@${acct}/tagged/${encodeURIComponent(tagged)}`
    : replies
      ? `/@${acct}/with_replies`
      : `/@${acct}`;

  const searchParams = new URLSearchParams();

  if (tagged) {
    searchParams.set('boosts', boosts ? '1' : '0');
    searchParams.set('replies', replies ? '1' : '0');
  } else if (!boosts) {
    searchParams.set('boosts', '0');
  }

  return {
    pathname,
    search: searchParams.toString(),
  };
}

export interface AccountField extends AccountFieldShape {
  nameHasEmojis: boolean;
  value_plain: string;
  valueHasEmojis: boolean;
}
