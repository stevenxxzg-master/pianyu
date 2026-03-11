import { describe, expect, it } from 'vitest';

import {
  getDefaultRedirectPath,
  getGettingStartedRedirectPath,
} from './redirects';

describe('redirect helpers', () => {
  describe('getDefaultRedirectPath', () => {
    it('sends signed-in single-column users to home', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: true,
          forceOnboarding: false,
          singleColumn: true,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: true,
          landingPage: 'trends',
          localLiveFeedAccess: 'public',
        }),
      ).toBe('/home');
    });

    it('sends onboarding users to start before home', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: true,
          forceOnboarding: true,
          singleColumn: true,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: true,
          landingPage: 'trends',
          localLiveFeedAccess: 'public',
        }),
      ).toBe('/start');
    });

    it('sends signed-in multi-column users to deck getting started', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: true,
          forceOnboarding: false,
          singleColumn: false,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: true,
          landingPage: 'trends',
          localLiveFeedAccess: 'public',
        }),
      ).toBe('/deck/getting-started');
    });

    it('keeps single-user guests on the owner profile', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: false,
          forceOnboarding: false,
          singleColumn: true,
          singleUserMode: true,
          owner: '1',
          accounts: {
            '1': {
              username: 'owner-name',
            },
          },
          trendsEnabled: true,
          landingPage: 'trends',
          localLiveFeedAccess: 'public',
        }),
      ).toBe('/@owner-name');
    });

    it('routes signed-out users to explore for trend landing pages', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: false,
          forceOnboarding: false,
          singleColumn: true,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: true,
          landingPage: 'trends',
          localLiveFeedAccess: 'none',
        }),
      ).toBe('/explore');
    });

    it('routes signed-out users to the local live feed when configured', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: false,
          forceOnboarding: false,
          singleColumn: true,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: false,
          landingPage: 'local_feed',
          localLiveFeedAccess: 'public',
        }),
      ).toBe('/public/local');
    });

    it('falls back to about when no other landing applies', () => {
      expect(
        getDefaultRedirectPath({
          signedIn: false,
          forceOnboarding: false,
          singleColumn: true,
          singleUserMode: false,
          owner: undefined,
          accounts: undefined,
          trendsEnabled: false,
          landingPage: 'anything-else',
          localLiveFeedAccess: 'private',
        }),
      ).toBe('/about');
    });
  });

  describe('getGettingStartedRedirectPath', () => {
    it('keeps single-column users on home', () => {
      expect(getGettingStartedRedirectPath(true)).toBe('/home');
    });

    it('sends multi-column users to deck getting started', () => {
      expect(getGettingStartedRedirectPath(false)).toBe(
        '/deck/getting-started',
      );
    });
  });
});
