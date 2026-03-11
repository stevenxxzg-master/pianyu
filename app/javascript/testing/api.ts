import type { CompactEmoji } from 'emojibase';
import { http, HttpResponse } from 'msw';
import { action } from 'storybook/actions';

import { toSupportedLocale } from '@/mastodon/features/emoji/locale';

import { customEmojiFactory, relationshipsFactory } from './factories';

export const mockHandlers = {
  mute: http.post<{ id: string }>('/api/v1/accounts/:id/mute', ({ params }) => {
    action('muting account')(params);
    return HttpResponse.json(
      relationshipsFactory({ id: params.id, muting: true }),
    );
  }),
  unmute: http.post<{ id: string }>(
    '/api/v1/accounts/:id/unmute',
    ({ params }) => {
      action('unmuting account')(params);
      return HttpResponse.json(
        relationshipsFactory({ id: params.id, muting: false }),
      );
    },
  ),
  block: http.post<{ id: string }>(
    '/api/v1/accounts/:id/block',
    ({ params }) => {
      action('blocking account')(params);
      return HttpResponse.json(
        relationshipsFactory({ id: params.id, blocking: true }),
      );
    },
  ),
  unblock: http.post<{ id: string }>(
    '/api/v1/accounts/:id/unblock',
    ({ params }) => {
      action('unblocking account')(params);
      return HttpResponse.json(
        relationshipsFactory({
          id: params.id,
          blocking: false,
        }),
      );
    },
  ),
  emojiCustomData: http.get('/api/v1/custom_emojis', () => {
    action('fetching custom emoji data')();
    return HttpResponse.json([customEmojiFactory()]);
  }),
  relationships: http.get('/api/v1/accounts/relationships', ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.getAll('id[]');
    action('fetching relationships')(ids);
    return HttpResponse.json(ids.map((id) => relationshipsFactory({ id })));
  }),
  notificationPolicy: http.get('/api/v2/notifications/policy', () => {
    action('fetching notification policy')();
    return HttpResponse.json({
      for_not_following: 'accept',
      for_not_followers: 'accept',
      for_new_accounts: 'accept',
      for_private_mentions: 'accept',
      for_limited_accounts: 'filter',
      summary: {
        pending_requests_count: 0,
        pending_notifications_count: 0,
      },
    });
  }),
  emojiData: http.get<{ locale: string }>(
    '/packs-dev/emoji/:locale.json',
    async ({ params }) => {
      const locale = toSupportedLocale(params.locale);
      action('fetching emoji data')(locale);
      const { default: data } = (await import(
        /* @vite-ignore */
        `emojibase-data/${locale}/compact.json`
      )) as {
        default: CompactEmoji[];
      };

      return HttpResponse.json([data]);
    },
  ),
};

export const unhandledRequestHandler = ({ url }: Request) => {
  const { pathname } = new URL(url);
  if (pathname.startsWith('/api/v1/')) {
    action(`unhandled request to ${pathname}`)(url);
    console.warn(
      `Unhandled request to ${pathname}. Please add a handler for this request in your storybook configuration.`,
    );
  }
};
