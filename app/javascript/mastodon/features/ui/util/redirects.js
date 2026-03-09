export const getDefaultRedirectPath = ({
  signedIn,
  forceOnboarding,
  singleColumn,
  singleUserMode,
  owner,
  accounts,
  trendsEnabled,
  landingPage,
  localLiveFeedAccess,
}) => {
  if (signedIn) {
    if (forceOnboarding) {
      return '/start';
    }

    return singleColumn ? '/home' : '/deck/getting-started';
  }

  if (singleUserMode && owner && accounts?.[owner]) {
    return `/@${accounts[owner].username}`;
  }

  if (trendsEnabled && landingPage === 'trends') {
    return '/explore';
  }

  if (localLiveFeedAccess === 'public' && landingPage === 'local_feed') {
    return '/public/local';
  }

  return '/about';
};

export const getGettingStartedRedirectPath = (singleColumn) =>
  singleColumn ? '/home' : '/deck/getting-started';
