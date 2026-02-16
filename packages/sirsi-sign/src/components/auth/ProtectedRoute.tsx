import { type ReactNode, useEffect, useState } from 'react';
import { Navigate, useRouter } from '@tanstack/react-router';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { isMFASessionVerified } from './MFAGate';

interface ProtectedRouteProps {
    children: ReactNode;
}

/**
 * ProtectedRoute - The "Front Vault Gate"
 * Forces authentication and MFA before allowing access to any document or vault segment.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { latestLocation: location } = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#050816',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.1em'
            }}>
                VERIFYING IDENTITY...
            </div>
        );
    }

    if (!user) {
        // Force through the front vault gate (Login)
        // Store the intended destination in redirect state
        return <Navigate to="/login" search={{ from: location.pathname }} replace /> as any;
    }

    // ── MFA Gate Check ──
    // If user is authenticated but not MFA verified for this session,
    // redirect to the canonical MFA route.
    if (!isMFASessionVerified()) {
        console.log('🛡 MFA: Redirecting to verification hub');
        return <Navigate to="/mfa" search={{ from: location.pathname }} replace /> as any;
    }

    return <>{children}</>;
}
