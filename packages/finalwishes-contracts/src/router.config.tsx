import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { AgreementWorkflow } from './components/workflow/AgreementWorkflow';
import { VaultDashboard } from './components/vault/VaultDashboard';
import { AdminPortal } from './components/admin/AdminPortal';
import { InvestorPortal } from './components/investor/InvestorPortal';
import { Login } from './components/auth/Login';
import { Pricing } from './components/public/Pricing';
import { LandingPage } from './components/public/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// 1. Root Route
const rootRoute = createRootRoute({
    component: () => {
        const O = Outlet as any;
        return (
            <AppLayout>
                <O />
            </AppLayout>
        );
    },
});

import { Outlet } from '@tanstack/react-router';

// 2. Individual Routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
});

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login as any,
});

const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pricing',
    component: Pricing as any,
});

const investorRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/investor',
    component: () => (
        <ProtectedRoute>
            <InvestorPortal />
        </ProtectedRoute>
    ),
});

const vaultRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/vault',
    component: () => (
        <ProtectedRoute>
            <VaultDashboard />
        </ProtectedRoute>
    ),
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: () => (
        <ProtectedRoute>
            <AdminPortal />
        </ProtectedRoute>
    ),
});

const contractsProjectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/contracts/$projectId',
    component: () => (
        <ProtectedRoute>
            <AgreementWorkflow />
        </ProtectedRoute>
    ),
});

const contractsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/contracts',
    component: () => (
        <ProtectedRoute>
            <AgreementWorkflow />
        </ProtectedRoute>
    ),
});

const adminContractsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin/contracts/$projectId',
    component: () => (
        <ProtectedRoute>
            <AgreementWorkflow />
        </ProtectedRoute>
    ),
});

const vaultUserRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/vault/$userId',
    component: () => (
        <ProtectedRoute>
            <VaultDashboard />
        </ProtectedRoute>
    ),
});

const vaultDeepRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/vault/$userId/$category/$entityId/$docId',
    component: () => (
        <ProtectedRoute>
            <AgreementWorkflow />
        </ProtectedRoute>
    ),
});

// 3. Route Tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    pricingRoute,
    investorRoute,
    vaultRoute,
    vaultUserRoute,
    vaultDeepRoute,
    adminRoute,
    adminContractsRoute,
    contractsRoute,
    contractsProjectRoute,
]);

// 4. Create Router
export const router = createRouter({ routeTree });

// 5. Register for Type Safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
