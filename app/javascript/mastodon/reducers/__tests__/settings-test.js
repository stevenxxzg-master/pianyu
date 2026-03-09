import { fromJS } from 'immutable';

import { STORE_HYDRATE } from '../../actions/store';
import settings from '../settings';

describe('settings notification sound defaults', () => {
  test('keeps only high-signal sounds enabled for fresh clients', () => {
    expect(settings(undefined, { type: '@@INIT' }).getIn(['notifications', 'sounds']).toJS()).toEqual({
      follow: true,
      follow_request: true,
      favourite: false,
      reblog: false,
      quote: false,
      mention: true,
      poll: false,
      status: false,
      update: false,
      'admin.sign_up': true,
      'admin.report': true,
    });
  });

  test('preserves hydrated saved sound preferences over the new defaults', () => {
    const nextState = settings(undefined, {
      type: STORE_HYDRATE,
      state: fromJS({
        settings: {
          notifications: {
            sounds: {
              follow_request: false,
              favourite: true,
              mention: false,
            },
          },
        },
      }),
    });

    expect(nextState.getIn(['notifications', 'sounds', 'follow_request'])).toBe(false);
    expect(nextState.getIn(['notifications', 'sounds', 'favourite'])).toBe(true);
    expect(nextState.getIn(['notifications', 'sounds', 'mention'])).toBe(false);
    expect(nextState.getIn(['notifications', 'sounds', 'reblog'])).toBe(false);
  });
});
