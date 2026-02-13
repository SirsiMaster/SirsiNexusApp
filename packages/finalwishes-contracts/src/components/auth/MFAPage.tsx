import { useState, useEffect } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';
import { MFAGate } from './MFAGate';
import { MFAEnrollment } from './MFAEnrollment';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * MFAPage — Canonical route for MFA verification and enrollment
 * Matches both verification challenge and setup flow.
 */
export function MFAPage() {
    const { navigate } = useRouter();
    const search = useSearch({ strict: false }) as any;
    const mode = search.mode || 'verify'; // 'verify' or 'enroll'
    const from = search.from || '/vault';

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                // If not authenticated, we can't do MFA
                navigate({ to: '/login', search: { from: window.location.pathname + window.location.search } });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050816] flex items-center justify-center">
                <div className="cinzel text-gold text-sm tracking-[0.2em] animate-pulse">
                    SECURE HUB INITIALIZING...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {mode === 'enroll' ? (
                    <MFAEnrollment
                        onComplete={() => navigate({ to: from })}
                        onCancel={() => navigate({ to: '/vault' })}
                    />
                ) : (
                    <MFAGate
                        onVerified={() => navigate({ to: from })}
                        onCancel={() => navigate({ to: '/' })}
                    />
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="inter text-[10px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        ← Back to Landing
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MFAPage;
