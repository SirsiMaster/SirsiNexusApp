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
import { Route as developmentRoute } from './routes/development'
import { Route as telemetryRoute } from './routes/telemetry'
// Security group
import { Route as securityRoute } from './routes/security'
import { Route as systemLogsRoute } from './routes/system-logs'
import { Route as siteAdminRoute } from './routes/site-admin'
// Investor group
import { Route as portalRoute } from './routes/portal'
import { Route as dataRoomRoute } from './routes/data-room'
import { Route as kpiMetricsRoute } from './routes/kpi-metrics'
import { Route as committeeRoute } from './routes/committee'
import { Route as messagingRoute } from './routes/messaging'
// Intelligence group
import { Route as aiAgentsRoute } from './routes/ai-agents'
import { Route as hypervisorRoute } from './routes/hypervisor'
import { Route as consoleRoute } from './routes/console'
// Dashboard group
import { Route as analyticsRoute } from './routes/analytics'
// Security sub-pages
import { Route as monitoringRoute } from './routes/monitoring'
// System Status sub-pages
import { Route as cacheStatusRoute } from './routes/cache-status'
import { Route as apiServerRoute } from './routes/api-server'
import { Route as databaseHealthRoute } from './routes/database-health'
import { Route as backupStatusRoute } from './routes/backup-status'

// Create the route tree manually
const routeTree = (rootRoute as any).addChildren([
  indexRoute as any,
  tenantsRoute as any,
  usersRoute as any,
  contractsRoute as any,
  settingsRoute as any,
  developmentRoute as any,
  telemetryRoute as any,
  // Security
  securityRoute as any,
  systemLogsRoute as any,
  siteAdminRoute as any,
  monitoringRoute as any,
  // Investor
  portalRoute as any,
  dataRoomRoute as any,
  kpiMetricsRoute as any,
  committeeRoute as any,
  messagingRoute as any,
  // Intelligence
  aiAgentsRoute as any,
  hypervisorRoute as any,
  consoleRoute as any,
  // Dashboard
  analyticsRoute as any,
  // System Status
  cacheStatusRoute as any,
  apiServerRoute as any,
  databaseHealthRoute as any,
  backupStatusRoute as any,
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
