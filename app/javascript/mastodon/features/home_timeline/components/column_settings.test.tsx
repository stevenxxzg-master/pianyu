import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { describe, expect, test } from 'vitest';

import { rootReducer } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';
import { fireEvent, render, screen } from '@/testing/rendering';

import { ColumnSettings } from './column_settings';

const renderColumnSettings = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(defaultMiddleware),
  });

  render(
    <Provider store={store}>
      <ColumnSettings />
    </Provider>,
  );
};

describe('<ColumnSettings />', () => {
  test('renders quiet defaults with boosts, quotes, and replies disabled', () => {
    renderColumnSettings();

    expect(screen.getByLabelText<HTMLInputElement>('Show boosts').checked).toBe(
      false,
    );
    expect(screen.getByLabelText<HTMLInputElement>('Show quotes').checked).toBe(
      false,
    );
    expect(
      screen.getByLabelText<HTMLInputElement>('Show replies').checked,
    ).toBe(false);
  });

  test('updates the toggle when a user enables boosts', () => {
    renderColumnSettings();

    fireEvent.click(screen.getByLabelText('Show boosts'));

    expect(screen.getByLabelText<HTMLInputElement>('Show boosts').checked).toBe(
      true,
    );
  });
});
