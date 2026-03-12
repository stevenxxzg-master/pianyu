import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';

import { IdentityContext } from '@/mastodon/identity_context';
import { reducerWithInitialState } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';

beforeAll(() => {
  global.requestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
    // @ts-expect-error IdleRequestCallback expects an argument of type IdleDeadline,
    // but that doesn't exist in this environment.
    cb();
    return 0;
  });
});

type ExtendedRenderOptions = RenderOptions & {
  locale?: string;
  route?: string;
  signedIn?: boolean;
  state?: Record<string, unknown>;
};

function render(
  ui: React.ReactElement,
  {
    locale = 'en',
    route = '/',
    signedIn = true,
    state = {},
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const fakeIdentity = {
    signedIn,
    accountId: signedIn ? '123' : undefined,
    disabledAccountId: undefined,
    permissions: 0,
  };

  const store = configureStore({
    reducer: reducerWithInitialState(
      {
        meta: {
          locale,
        },
      },
      state,
    ),
    middleware(getDefaultMiddleware) {
      return getDefaultMiddleware(defaultMiddleware);
    },
  });

  const Wrapper = (props: { children: React.ReactNode }) => {
    return (
      <MemoryRouter initialEntries={[route]}>
        <IntlProvider locale={locale}>
          <Provider store={store}>
            <IdentityContext.Provider value={fakeIdentity}>
              {props.children}
            </IdentityContext.Provider>
          </Provider>
        </IntlProvider>
      </MemoryRouter>
    );
  };

  return { store, ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
