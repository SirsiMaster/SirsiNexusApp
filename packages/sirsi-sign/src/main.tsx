import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router.config'
import './index.css'

const queryClient = new QueryClient();

const Provider = QueryClientProvider as any;
const Router = RouterProvider as any;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider client={queryClient}>
      <Router router={router} />
    </Provider>
  </StrictMode> as any,
)
