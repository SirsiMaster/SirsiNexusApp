'use client';

import { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { store } from '@/store';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0}>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true} disableTransitionOnChange={true}>
          {children}
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}
