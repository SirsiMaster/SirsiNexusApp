// src/main.tsx
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter, createRoute } from '@tanstack/react-router'
import './index.css'

// ── Root layout (always loaded) ──
import { Route as rootRoute } from './routes/__root'

// ── Eagerly loaded: Dashboard (landing page — must be instant) ──
import { Route as indexRoute } from './routes/index'

import { PageSkeleton } from './components/LoadingSkeleton'

// ── Lazy-loaded route factory ──
function lazyRoute(path: string, importFn: () => Promise<{ Route: any }>) {
  const LazyComponent = lazy(() =>
    importFn().then(mod => ({
      default: (mod.Route as any).options.component
    }))
  )
  return createRoute({
    getParentRoute: () => rootRoute as any,
    path,
    component: () => (
      <Suspense fallback={<PageSkeleton />}>
        <LazyComponent />
      </Suspense>
    ),
  })
}

// ── Route definitions (code-split per route) ──
const tenantsRoute = lazyRoute('/tenants', () => import('./routes/tenants'))
const usersRoute = lazyRoute('/users', () => import('./routes/users'))
const contractsRoute = lazyRoute('/contracts', () => import('./routes/contracts'))
const settingsRoute = lazyRoute('/settings', () => import('./routes/settings'))
const developmentRoute = lazyRoute('/development', () => import('./routes/development'))
const telemetryRoute = lazyRoute('/telemetry', () => import('./routes/telemetry'))

// Security
const securityRoute = lazyRoute('/security', () => import('./routes/security'))
const systemLogsRoute = lazyRoute('/system-logs', () => import('./routes/system-logs'))
const siteAdminRoute = lazyRoute('/site-admin', () => import('./routes/site-admin'))
const monitoringRoute = lazyRoute('/monitoring', () => import('./routes/monitoring'))

// Investor
const portalRoute = lazyRoute('/portal', () => import('./routes/portal'))
const dataRoomRoute = lazyRoute('/data-room', () => import('./routes/data-room'))
const kpiMetricsRoute = lazyRoute('/kpi-metrics', () => import('./routes/kpi-metrics'))
const committeeRoute = lazyRoute('/committee', () => import('./routes/committee'))
const messagingRoute = lazyRoute('/messaging', () => import('./routes/messaging'))

// Intelligence
const aiAgentsRoute = lazyRoute('/ai-agents', () => import('./routes/ai-agents'))
const hypervisorRoute = lazyRoute('/hypervisor', () => import('./routes/hypervisor'))
const consoleRoute = lazyRoute('/console', () => import('./routes/console'))

// Dashboard
const analyticsRoute = lazyRoute('/analytics', () => import('./routes/analytics'))

// System Status
const cacheStatusRoute = lazyRoute('/cache-status', () => import('./routes/cache-status'))
const apiServerRoute = lazyRoute('/api-server', () => import('./routes/api-server'))
const databaseHealthRoute = lazyRoute('/database-health', () => import('./routes/database-health'))
const backupStatusRoute = lazyRoute('/backup-status', () => import('./routes/backup-status'))

// Role Portals
const loginRoute = lazyRoute('/login', () => import('./routes/login'))
const investorPortalRoute = lazyRoute('/investor-portal', () => import('./routes/investor-portal'))
const clientPortalRoute = lazyRoute('/client-portal', () => import('./routes/client-portal'))

// Public Pages (sirsi.ai)
const landingRoute = lazyRoute('/home', () => import('./routes/landing'))
const signupRoute = lazyRoute('/signup', () => import('./routes/signup'))
const documentationRoute = lazyRoute('/documentation', () => import('./routes/documentation'))

// ── Route tree ──
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
  // Role Portals
  loginRoute as any,
  investorPortalRoute as any,
  clientPortalRoute as any,
  // Public Pages
  landingRoute as any,
  signupRoute as any,
  documentationRoute as any,
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
