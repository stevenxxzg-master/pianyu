import type { InitialState } from '@/mastodon/initial_state';

const storybookInitialState: InitialState = {
  accounts: {},
  languages: [['en', 'English', 'English']],
  meta: {
    access_token: 'storybook-token',
    activity_api_enabled: true,
    admin: '1',
    advanced_layout: false,
    auto_play_gif: false,
    display_media: 'default',
    domain: 'pianyu.social',
    limited_federation_mode: false,
    locale: 'en',
    mascot: null,
    me: '1',
    owner: '1',
    profile_directory: true,
    registrations_open: true,
    reduce_motion: true,
    repository: 'https://github.com/mastodon/mastodon',
    search_enabled: true,
    show_trends: true,
    single_user_mode: false,
    source_url: 'https://github.com/mastodon/mastodon',
    sso_redirect: '',
    status_page_url: 'https://status.pianyu.social',
    streaming_api_base_url: 'wss://storybook.pianyu.social',
    local_live_feed_access: 'public',
    remote_live_feed_access: 'public',
    local_topic_feed_access: 'public',
    remote_topic_feed_access: 'public',
    terms_of_service_enabled: true,
    title: 'PianYu Storybook',
    landing_page: 'about',
    trends_enabled: true,
    use_blurhash: true,
    version: 'storybook',
  },
  role: {
    id: 'story-role',
    name: 'Storybook Reviewer',
    permissions: '0',
    color: '',
    highlighted: false,
  },
  features: ['profile_redesign', 'collections'],
};

const ensureMetaTag = (name: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );

  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }

  tag.content = content;
};

if (typeof document !== 'undefined') {
  ensureMetaTag('initialPath', '/home');

  let element = document.getElementById(
    'initial-state',
  ) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement('script');
    element.id = 'initial-state';
    element.type = 'application/json';
    document.body.appendChild(element);
  }

  element.textContent = JSON.stringify(storybookInitialState);
}
