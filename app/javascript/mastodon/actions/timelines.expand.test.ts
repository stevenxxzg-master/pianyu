import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { expandTimeline, TIMELINE_INSERT } from './timelines';

const {
  mockApiGet,
  mockGetLinks,
  mockImportFetchedStatuses,
  mockSubmitMarkers,
} = vi.hoisted(() => ({
  mockApiGet: vi.fn(),
  mockGetLinks: vi.fn(),
  mockImportFetchedStatuses: vi.fn(() => ({ type: 'STATUSES_IMPORT' })),
  mockSubmitMarkers: vi.fn(() => ({ type: 'MARKERS_SUBMIT' })),
}));

vi.mock('mastodon/api', () => ({
  __esModule: true,
  default: () => ({ get: mockApiGet }),
  getLinks: mockGetLinks,
}));

vi.mock('./importer', () => ({
  importFetchedStatus: vi.fn(),
  importFetchedStatuses: mockImportFetchedStatuses,
}));

vi.mock('./markers', () => ({
  submitMarkers: mockSubmitMarkers,
}));

describe('expandTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetLinks.mockReturnValue({ refs: [] });
  });

  test('does not insert inline follow suggestions into the home timeline', async () => {
    mockApiGet.mockResolvedValue({
      data: [
        { id: '101', created_at: '2026-03-08T00:00:00.000Z' },
        { id: '100', created_at: '2026-03-07T00:00:00.000Z' },
      ],
      headers: {},
      status: 200,
    });

    const state = ImmutableMap({
      timelines: ImmutableMap({
        home: ImmutableMap({
          isLoading: false,
          items: ImmutableList(),
          pendingItems: ImmutableList(),
        }),
      }),
    });

    const dispatchedActions: { type?: string }[] = [];
    const getState = () => state;
    interface DispatchAction {
      type?: string;
    }
    type DispatchArgument =
      | DispatchAction
      | ((dispatch: DispatchFn, getState: typeof getState) => unknown);
    type DispatchFn = (action: DispatchArgument) => unknown;

    const dispatch: DispatchFn = (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      dispatchedActions.push(action);
      return action;
    };

    await expandTimeline('home', '/api/v1/timelines/home')(dispatch, getState);

    expect(mockApiGet).toHaveBeenCalledWith('/api/v1/timelines/home', {
      params: {},
    });
    expect(dispatchedActions.some(({ type }) => type === TIMELINE_INSERT)).toBe(
      false,
    );
  });
});
