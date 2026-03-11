import { useSyncExternalStore } from 'react';

const breakpoints = {
  narrow: 479, // Device width under which horizontal space is constrained
  openable: 759, // Device width at which the sidebar becomes an openable hamburger menu
  full: 1174, // Device width at which all 3 columns can be displayed
};

type Breakpoint = keyof typeof breakpoints;

const noop = () => undefined;

export const useBreakpoint = (breakpoint: Breakpoint) => {
  const query = `(max-width: ${breakpoints[breakpoint]}px)`;

  const getMatches = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const isMatching = useSyncExternalStore(
    (callback) => {
      if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
      ) {
        return noop;
      }

      const mediaWatcher = window.matchMedia(query);

      mediaWatcher.addEventListener('change', callback);

      return () => {
        mediaWatcher.removeEventListener('change', callback);
      };
    },
    getMatches,
    () => false,
  );

  return isMatching;
};

interface WithBreakpointType {
  matchesBreakpoint: boolean;
}

export function withBreakpoint<P>(
  Component: React.ComponentType<P & WithBreakpointType>,
  breakpoint: Breakpoint = 'full',
) {
  const displayName = `withMobileLayout(${Component.displayName ?? Component.name})`;

  const ComponentWithBreakpoint = (props: P) => {
    const matchesBreakpoint = useBreakpoint(breakpoint);

    return <Component matchesBreakpoint={matchesBreakpoint} {...props} />;
  };

  ComponentWithBreakpoint.displayName = displayName;

  return ComponentWithBreakpoint;
}
