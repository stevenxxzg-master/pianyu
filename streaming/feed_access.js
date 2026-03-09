import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { load as loadYaml } from 'js-yaml';

const DEFAULT_SETTINGS_PATH = path.resolve(
  url.fileURLToPath(new URL('../config/settings.yml', import.meta.url))
);

const defaultSettingsCache = new Map();

export const FEED_ACCESS_SETTINGS = {
  hashtag: {
    local: 'local_topic_feed_access',
    remote: 'remote_topic_feed_access',
  },
  public: {
    local: 'local_live_feed_access',
    remote: 'remote_live_feed_access',
  },
};

/**
 * @param {keyof FEED_ACCESS_SETTINGS} kind
 * @returns {{ local: string, remote: string }}
 */
export const getFeedAccessSettingNames = (kind) => {
  const settings = FEED_ACCESS_SETTINGS[kind];

  if (!settings) {
    throw new Error(`Unknown feed access kind: ${kind}`);
  }

  return settings;
};

/**
 * @param {object} [options]
 * @param {Record<string, unknown>} [options.defaultSettings]
 * @param {string} [options.environment]
 * @param {string} [options.settingsPath]
 * @returns {Record<string, unknown>}
 */
export const getDefaultSettings = ({ defaultSettings, environment = process.env.NODE_ENV || 'development', settingsPath = DEFAULT_SETTINGS_PATH } = {}) => {
  if (defaultSettings) {
    return defaultSettings;
  }

  const cacheKey = `${settingsPath}:${environment}`;

  if (!defaultSettingsCache.has(cacheKey)) {
    const allSettings = loadYaml(fs.readFileSync(settingsPath, 'utf8'));
    defaultSettingsCache.set(cacheKey, allSettings?.[environment] ?? {});
  }

  return defaultSettingsCache.get(cacheKey);
};

/**
 * @param {unknown} value
 * @returns {unknown}
 */
const deserializeSetting = (value) => (typeof value === 'string' ? loadYaml(value) : value);

/**
 * @param {unknown} mode
 * @param {{ accountId?: string, permissions?: number }} req
 * @param {number} viewFeedsPermission
 * @returns {boolean}
 */
export const hasAccessToFeed = (mode, req, viewFeedsPermission) => {
  const permissions = req.permissions ?? 0;

  if ((permissions & viewFeedsPermission) !== 0) {
    return true;
  }

  switch (mode) {
  case 'public':
    return true;
  case 'authenticated':
    return Boolean(req.accountId);
  case 'disabled':
    return (permissions & viewFeedsPermission) !== 0;
  default:
    return false;
  }
};

/**
 * @param {keyof FEED_ACCESS_SETTINGS} kind
 * @param {{ accountId?: string, permissions?: number }} req
 * @param {{ var: string, value: unknown }[]} rows
 * @param {object} [options]
 * @param {Record<string, unknown>} [options.defaultSettings]
 * @param {string} [options.environment]
 * @param {string} [options.settingsPath]
 * @param {number} options.viewFeedsPermission
 * @returns {{ localAccess: boolean, remoteAccess: boolean }}
 */
export const getFeedAccessSettingsFromRows = (kind, req, rows, { defaultSettings, environment, settingsPath, viewFeedsPermission } = {}) => {
  const settings = getFeedAccessSettingNames(kind);
  const settingsByVar = new Map(rows.map(row => [row.var, deserializeSetting(row.value)]));
  const resolvedDefaults = getDefaultSettings({ defaultSettings, environment, settingsPath });

  const localMode = settingsByVar.get(settings.local) ?? resolvedDefaults[settings.local];
  const remoteMode = settingsByVar.get(settings.remote) ?? resolvedDefaults[settings.remote];

  return {
    localAccess: hasAccessToFeed(localMode, req, viewFeedsPermission ?? 0),
    remoteAccess: hasAccessToFeed(remoteMode, req, viewFeedsPermission ?? 0),
  };
};
