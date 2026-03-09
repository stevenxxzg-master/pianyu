import { render, screen } from '@/testing/rendering';

import { ExploreSuggestions } from '../suggestions';

const fetchSuggestions = vi.fn(() => ({ type: 'FETCH_SUGGESTIONS' }));

vi.mock('mastodon/actions/suggestions', () => ({
  fetchSuggestions: () => fetchSuggestions(),
}));

vi.mock('../components/card', () => ({
  Card: () => <div>mock suggestion card</div>,
}));

describe('<ExploreSuggestions />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows neutral empty-state copy when no profile suggestions are available', () => {
    const dispatch = vi.fn();

    render(
      <ExploreSuggestions
        dispatch={dispatch}
        history={{ action: 'PUSH' }}
        isLoading={false}
        suggestions={[]}
      />,
    );

    expect(
      screen.getByText(
        'No profile suggestions right now. Try searching or browse profiles instead.',
      ),
    ).toBeTruthy();
    expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_SUGGESTIONS' });
  });

  it('does not refetch suggestions on POP navigation when suggestions are already loaded', () => {
    const dispatch = vi.fn();

    render(
      <ExploreSuggestions
        dispatch={dispatch}
        history={{ action: 'POP' }}
        isLoading={false}
        suggestions={[{ account_id: '123', sources: ['featured'] }]}
      />,
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(screen.getByText('mock suggestion card')).toBeTruthy();
  });
});
