import type { FC, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useLocation, useParams } from 'react-router';

import { useAppHistory } from '@/mastodon/components/router';
import { useSearchParams } from '@/mastodon/hooks/useSearchParam';
import { useStorageState } from '@/mastodon/hooks/useStorage';
import { useAppSelector } from '@/mastodon/store';

import { buildAccountActivityLocation } from '../common';

interface AccountTimelineContextValue {
  accountId: string;
  acct?: string;
  tagged?: string;
  boosts: boolean;
  replies: boolean;
  showAllPinned: boolean;
  setBoosts: (value: boolean) => void;
  setReplies: (value: boolean) => void;
  onShowAllPinned: () => void;
}

const AccountTimelineContext =
  createContext<AccountTimelineContextValue | null>(null);

const parseBooleanParam = (value: string | null) => {
  if (value === null) {
    return null;
  }

  return value === '1' || value === 'true';
};

export const AccountTimelineProvider: FC<{
  accountId: string;
  children: ReactNode;
}> = ({ accountId, children }) => {
  const { acct: acctParam, tagged } = useParams<{
    acct?: string;
    tagged?: string;
  }>();
  const location = useLocation();
  const history = useAppHistory();
  const searchParams = useSearchParams();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const acct = acctParam ?? account?.acct;

  const storageOptions = {
    type: 'session',
    prefix: `filters-${accountId}:`,
  } as const;

  const [storedBoosts, setStoredBoosts] = useStorageState<boolean>(
    'boosts',
    true,
    storageOptions,
  );

  const boostsFromQuery = parseBooleanParam(searchParams.get('boosts'));
  const boosts = boostsFromQuery ?? storedBoosts;

  const routeIncludesReplies = location.pathname.endsWith('/with_replies');
  const repliesFromQuery = tagged
    ? parseBooleanParam(searchParams.get('replies'))
    : null;
  const replies = repliesFromQuery ?? routeIncludesReplies;

  const pushLocation = useCallback(
    (nextBoosts: boolean, nextReplies: boolean) => {
      if (!acct) {
        return;
      }

      history.push(
        buildAccountActivityLocation({
          acct,
          tagged,
          boosts: nextBoosts,
          replies: nextReplies,
        }),
      );
    },
    [acct, history, tagged],
  );

  const handleSetBoosts = useCallback(
    (value: boolean) => {
      setStoredBoosts(value);
      pushLocation(value, replies);
    },
    [pushLocation, replies, setStoredBoosts],
  );

  const handleSetReplies = useCallback(
    (value: boolean) => {
      pushLocation(boosts, value);
    },
    [boosts, pushLocation],
  );

  const [showAllPinned, setShowAllPinned] = useState(false);
  const handleShowAllPinned = useCallback(() => {
    setShowAllPinned(true);
  }, []);

  // Memoize the context value to avoid unnecessary re-renders.
  const value = useMemo(
    () => ({
      accountId,
      acct,
      tagged,
      boosts,
      replies,
      showAllPinned,
      setBoosts: handleSetBoosts,
      setReplies: handleSetReplies,
      onShowAllPinned: handleShowAllPinned,
    }),
    [
      acct,
      accountId,
      boosts,
      handleSetBoosts,
      handleSetReplies,
      handleShowAllPinned,
      replies,
      showAllPinned,
      tagged,
    ],
  );

  return (
    <AccountTimelineContext.Provider value={value}>
      {children}
    </AccountTimelineContext.Provider>
  );
};

export function useAccountContext() {
  const values = useContext(AccountTimelineContext);
  if (!values) {
    throw new Error(
      'useAccountFilters must be used within an AccountTimelineProvider',
    );
  }
  return values;
}
