import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import api from 'mastodon/api';

import { importFetchedStatuses } from './importer';
import { submitMarkers } from './markers';
import {
  expandTimeline,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_INSERT,
} from './timelines';
import { parseTimelineKey, timelineKey } from './timelines_typed';

vi.mock('mastodon/api', () => ({
  default: vi.fn(),
  getLinks: vi.fn(() => ({ refs: [] })),
}));

vi.mock('./importer', () => ({
  importFetchedStatus: vi.fn(),
  importFetchedStatuses: vi.fn(() => ({ type: 'IMPORT_FETCHED_STATUSES' })),
}));

vi.mock('./markers', () => ({
  submitMarkers: vi.fn(() => ({ type: 'SUBMIT_MARKERS' })),
}));

describe('timelineKey', () => {
  test('returns expected key for account timeline with filters', () => {
    const key = timelineKey({
      type: 'account',
      userId: '123',
      replies: true,
      boosts: false,
      media: true,
    });
    expect(key).toBe('account:123:0110');
  });

  test('returns expected key for account timeline with tag', () => {
    const key = timelineKey({
      type: 'account',
      userId: '456',
      tagged: 'nature',
      replies: true,
    });
    expect(key).toBe('account:456:0100:nature');
  });

  test('returns expected key for account timeline with pins', () => {
    const key = timelineKey({
      type: 'account',
      userId: '789',
      pinned: true,
    });
    expect(key).toBe('account:789:0001');
  });
});

describe('parseTimelineKey', () => {
  test('parses account timeline key with filters correctly', () => {
    const params = parseTimelineKey('account:123:1010');
    expect(params).toEqual({
      type: 'account',
      userId: '123',
      boosts: true,
      replies: false,
      media: true,
      pinned: false,
    });
  });

  test('parses account timeline key with tag correctly', () => {
    const params = parseTimelineKey('account:456:0100:nature');
    expect(params).toEqual({
      type: 'account',
      userId: '456',
      replies: true,
      boosts: false,
      media: false,
      pinned: false,
      tagged: 'nature',
    });
  });

  test('parses legacy account timeline key with pinned correctly', () => {
    const params = parseTimelineKey('account:789:pinned:nature');
    expect(params).toEqual({
      type: 'account',
      userId: '789',
      replies: false,
      boosts: false,
      media: false,
      pinned: true,
      tagged: 'nature',
    });
  });

  test('parses legacy account timeline key with media correctly', () => {
    const params = parseTimelineKey('account:789:media');
    expect(params).toEqual({
      type: 'account',
      userId: '789',
      replies: false,
      boosts: false,
      media: true,
      pinned: false,
    });
  });
});

describe('expandTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not inject follow suggestions into the default home timeline load', async () => {
    const get = vi.fn().mockResolvedValue({
      data: [
        {
          id: '101',
          created_at: '2026-03-09T00:00:00.000Z',
        },
      ],
      headers: {},
      status: 200,
    });

    vi.mocked(api).mockReturnValue({ get } as never);

    const dispatch = vi.fn();
    dispatch.mockImplementation((action: unknown) => action);
    const getState = () =>
      ImmutableMap({
        timelines: ImmutableMap({
          home: ImmutableMap({
            isLoading: false,
            items: ImmutableList(),
            pendingItems: ImmutableList(),
          }),
        }),
      });

    await expandTimeline('home', '/api/v1/timelines/home')(dispatch, getState);

    expect(get).toHaveBeenCalledWith('/api/v1/timelines/home', { params: {} });
    expect(importFetchedStatuses).toHaveBeenCalledWith([
      {
        id: '101',
        created_at: '2026-03-09T00:00:00.000Z',
      },
    ]);
    expect(submitMarkers).toHaveBeenCalled();

    const dispatchedActions: unknown[] = dispatch.mock.calls.map(
      (call) => call[0] as unknown,
    );

    expect(dispatchedActions).toContainEqual(
      expect.objectContaining({
        type: TIMELINE_EXPAND_REQUEST,
        timeline: 'home',
      }),
    );
    expect(dispatchedActions).toContainEqual(
      expect.objectContaining({
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
      }),
    );
    expect(dispatchedActions).not.toContainEqual(
      expect.objectContaining({ type: TIMELINE_INSERT }),
    );
  });
});
