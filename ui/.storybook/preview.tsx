import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      dark: {
        ...themes.dark,
        appBg: '#1a1a1a',
        appContentBg: '#1a1a1a',
        barBg: '#1a1a1a',
      },
      light: {
        ...themes.normal,
        appBg: '#ffffff',
        appContentBg: '#ffffff',
        barBg: '#ffffff',
      },
      current: 'light',
    },
  },
};

export default preview;
