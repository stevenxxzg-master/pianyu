export const modes = {
  darkTheme: {
    theme: 'dark',
  },
  lightTheme: {
    theme: 'light',
  },
  desktopLight: {
    theme: 'light',
    viewport: {
      width: 1280,
      height: 960,
    },
  },
  mobileLight: {
    theme: 'light',
    viewport: {
      width: 390,
      height: 844,
    },
  },
} as const;
