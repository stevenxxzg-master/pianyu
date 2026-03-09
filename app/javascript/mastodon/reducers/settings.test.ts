import type { Map as ImmutableMap } from 'immutable';
import { fromJS } from 'immutable';

import { describe, expect, test } from 'vitest';

import { STORE_HYDRATE } from '../actions/store';

import settings from './settings';

const getHomeSetting = (
  state: ImmutableMap<unknown, unknown>,
  key: 'reblog' | 'quote' | 'reply',
) => state.getIn(['home', 'shows', key]);

describe('settings reducer', () => {
  test('uses quiet home timeline defaults for boosts, quotes, and replies', () => {
    const state = settings(undefined, {
      type: '@@INIT',
    }) as ImmutableMap<unknown, unknown>;

    expect(getHomeSetting(state, 'reblog')).toBe(false);
    expect(getHomeSetting(state, 'quote')).toBe(false);
    expect(getHomeSetting(state, 'reply')).toBe(false);
  });

  test('preserves persisted home visibility preferences during hydration', () => {
    const state = settings(undefined, {
      type: STORE_HYDRATE,
      state: fromJS({
        settings: {
          home: {
            shows: {
              reblog: true,
              quote: true,
            },
          },
        },
      }),
    }) as ImmutableMap<unknown, unknown>;

    expect(getHomeSetting(state, 'reblog')).toBe(true);
    expect(getHomeSetting(state, 'quote')).toBe(true);
    expect(getHomeSetting(state, 'reply')).toBe(false);
  });
});
