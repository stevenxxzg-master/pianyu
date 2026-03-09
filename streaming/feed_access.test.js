import assert from 'node:assert/strict';
import test from 'node:test';

import { getFeedAccessSettingsFromRows } from './feed_access.js';

const PERMISSION_VIEW_FEEDS = 0x0000000000100000;

test('falls back to configured topic defaults when settings rows are absent', () => {
  assert.deepEqual(getFeedAccessSettingsFromRows('hashtag', {}, [], {
    defaultSettings: {
      local_topic_feed_access: 'authenticated',
      remote_topic_feed_access: 'authenticated',
    },
    viewFeedsPermission: PERMISSION_VIEW_FEEDS,
  }), { localAccess: false, remoteAccess: false });
});

test('allows authenticated users when the effective mode is authenticated', () => {
  assert.deepEqual(getFeedAccessSettingsFromRows('hashtag', { accountId: '123' }, [], {
    defaultSettings: {
      local_topic_feed_access: 'authenticated',
      remote_topic_feed_access: 'authenticated',
    },
    viewFeedsPermission: PERMISSION_VIEW_FEEDS,
  }), { localAccess: true, remoteAccess: true });
});

test('parses persisted YAML values and lets rows override defaults', () => {
  assert.deepEqual(getFeedAccessSettingsFromRows('hashtag', {}, [
    { var: 'local_topic_feed_access', value: '--- public\n' },
    { var: 'remote_topic_feed_access', value: '--- disabled\n' },
  ], {
    defaultSettings: {
      local_topic_feed_access: 'authenticated',
      remote_topic_feed_access: 'authenticated',
    },
    viewFeedsPermission: PERMISSION_VIEW_FEEDS,
  }), { localAccess: true, remoteAccess: false });
});

test('allows feed viewers to bypass disabled modes', () => {
  assert.deepEqual(getFeedAccessSettingsFromRows('public', { permissions: PERMISSION_VIEW_FEEDS }, [], {
    defaultSettings: {
      local_live_feed_access: 'disabled',
      remote_live_feed_access: 'disabled',
    },
    viewFeedsPermission: PERMISSION_VIEW_FEEDS,
  }), { localAccess: true, remoteAccess: true });
});
