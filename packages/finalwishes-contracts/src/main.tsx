import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient();

const Provider = QueryClientProvider as any;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider client={queryClient}>
      <App />
    </Provider>
  </StrictMode> as any,
)
