// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Import route components
import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as tenantsRoute } from './routes/tenants'
import { Route as usersRoute } from './routes/users'
import { Route as contractsRoute } from './routes/contracts'
import { Route as settingsRoute } from './routes/settings'
import { Route as estatesRoute } from './routes/estates'
import { Route as developmentRoute } from './routes/development'

// Create the route tree manually
const routeTree = (rootRoute as any).addChildren([
  indexRoute as any,
  tenantsRoute as any,
  usersRoute as any,
  contractsRoute as any,
  settingsRoute as any,
  estatesRoute as any,
  developmentRoute as any,
])

// Create the router
const router = createRouter({ routeTree })

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

const Provider = QueryClientProvider as any;
const Router = RouterProvider as any;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider client={queryClient}>
      <Router router={router} />
    </Provider>
  </StrictMode>,
)
