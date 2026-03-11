import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router';

import { configureStore } from '@reduxjs/toolkit';
import { Provider as ReduxProvider } from 'react-redux';

import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { IdentityContext } from '@/mastodon/identity_context';
import { reducerWithInitialState } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';

const makeStore = () =>
  configureStore({
    reducer: reducerWithInitialState(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(defaultMiddleware),
  });

type TestStore = ReturnType<typeof makeStore>;

beforeAll(() => {
  global.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
    // @ts-expect-error IdleRequestCallback expects an argument of type IdleDeadline,
    // but that doesn't exist in this environment.
    cb();
    return 0;
  });
});

function render(
  ui: React.ReactElement,
  {
    locale = 'en',
    signedIn = true,
    store = makeStore(),
    ...renderOptions
  }: RenderOptions & {
    locale?: string;
    signedIn?: boolean;
    store?: TestStore;
  } = {},
) {
  const fakeIdentity = {
    signedIn: signedIn,
    accountId: '123',
    disabledAccountId: undefined,
    permissions: 0,
  };

  const Wrapper = (props: { children: React.ReactNode }) => {
    return (
      <MemoryRouter>
        <IntlProvider locale={locale}>
          <ReduxProvider store={store}>
            <IdentityContext.Provider value={fakeIdentity}>
              {props.children}
            </IdentityContext.Provider>
          </ReduxProvider>
        </IntlProvider>
      </MemoryRouter>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
