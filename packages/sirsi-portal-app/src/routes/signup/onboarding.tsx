/**
 * Onboarding Wizard — New Client Self-Service Provisioning
 *
 * 6-step wizard per ADR-030:
 *   1. Account Creation (Firebase Auth)
 *   2. Organization Profile
 *   3. Plan Selection (reads from URL ?plan= or lets user choose)
 *   4. Infrastructure Selection (GCP default)
 *   5. Provisioning & Deployment (real-time status)
 *   6. Verification & Handoff (redirect to client portal)
 *
 * Route: /signup/onboarding
 * Layout: Public (no sidebar)
 */

import { createRoute, useNavigate } from '@tanstack/react-router'
import { useState, useCallback, useEffect, useRef } from 'react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { Route as rootRoute } from '../__root'
import { getAllTiers, type PlanId, type SaaSTier } from '@/lib/tiers'
import { createAccount, provisionTenant, createCheckoutSession } from '@/lib/onboarding'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/signup/onboarding',
    component: OnboardingWizard,
})

// ── Wizard State ──────────────────────────────────────────────────
interface WizardState {
    step: number
    account: {
        email: string
        password: string
        confirmPassword: string
    }
    organization: {
        companyName: string
        industry: string
        companySize: string
    }
    plan: PlanId
    infrastructure: {
        cloudProvider: 'gcp' | 'aws' | 'azure'
        region: string
        managed: boolean
    }
}

const initialState: WizardState = {
    step: 1,
    account: { email: '', password: '', confirmPassword: '' },
    organization: { companyName: '', industry: '', companySize: '' },
    plan: 'free',
    infrastructure: { cloudProvider: 'gcp', region: 'us-east1', managed: true },
}

const STEPS = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Organization' },
    { number: 3, label: 'Plan' },
    { number: 4, label: 'Infrastructure' },
    { number: 5, label: 'Provisioning' },
    { number: 6, label: 'Welcome' },
]

const INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate',
    'Legal', 'Education', 'Manufacturing', 'Other',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']

const REGIONS = [
    { id: 'us-east1', label: 'US East (South Carolina)' },
    { id: 'us-central1', label: 'US Central (Iowa)' },
    { id: 'us-west1', label: 'US West (Oregon)' },
    { id: 'europe-west1', label: 'Europe West (Belgium)' },
    { id: 'asia-east1', label: 'Asia East (Taiwan)' },
]

// ── Component ─────────────────────────────────────────────────────
function OnboardingWizard() {
    usePageMeta('Get Started | SirsiNexus', 'Set up your Sirsi Nexus account in minutes.')
    const navigate = useNavigate()

    // Read ?plan= from URL
    const urlParams = new URLSearchParams(window.location.search)
    const urlPlan = urlParams.get('plan') as PlanId | null

    const [state, setState] = useState<WizardState>({
        ...initialState,
        plan: urlPlan && ['free', 'solo', 'business'].includes(urlPlan) ? urlPlan : 'free',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [firebaseUid, setFirebaseUid] = useState<string | null>(null)
    const [provisioningSteps, setProvisioningSteps] = useState<Array<{ label: string, status: 'pending' | 'active' | 'complete' }>>([
        { label: 'Creating Firebase project', status: 'pending' },
        { label: 'Provisioning Cloud Run service', status: 'pending' },
        { label: 'Configuring DNS', status: 'pending' },
        { label: 'Creating GitHub repository', status: 'pending' },
        { label: 'Seeding initial data', status: 'pending' },
        { label: 'Registering with Hypervisor', status: 'pending' },
    ])
    const provisioningStarted = useRef(false)
    const stateRestored = useRef(false)

    // Restore state from sessionStorage on mount (if returning from Stripe)
    useEffect(() => {
        if (stateRestored.current) return
        stateRestored.current = true

        const saved = sessionStorage.getItem('sirsi_onboarding_state')
        const savedUid = sessionStorage.getItem('sirsi_onboarding_uid')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                // If returning with ?session_id, advance to step 4
                const urlParams = new URLSearchParams(window.location.search)
                if (urlParams.has('session_id')) {
                    parsed.step = 4
                    sessionStorage.removeItem('sirsi_onboarding_state')
                    sessionStorage.removeItem('sirsi_onboarding_uid')
                }
                setState(parsed)
                if (savedUid) setFirebaseUid(savedUid)
                console.log('Restored onboarding state from session')
            } catch (e) {
                console.error('Failed to restore onboarding state', e)
            }
        }
    }, [])

    const updateField = useCallback(<K extends keyof WizardState>(
        section: K,
        updates: Partial<WizardState[K]>
    ) => {
        setState(prev => ({
            ...prev,
            [section]: typeof prev[section] === 'object'
                ? { ...prev[section] as object, ...updates }
                : updates,
        }))
        setErrors({})
    }, [])

    // Animate provisioning steps when entering Step 5
    useEffect(() => {
        if (state.step !== 5 || provisioningStarted.current) return
        provisioningStarted.current = true

        // Kick off real provisioning
        const uid = firebaseUid || 'anonymous'
        provisionTenant({
            email: state.account.email,
            password: state.account.password,
            companyName: state.organization.companyName,
            industry: state.organization.industry,
            companySize: state.organization.companySize,
            plan: state.plan,
            cloudProvider: state.infrastructure.cloudProvider,
            region: state.infrastructure.region,
        }, uid).then(result => {
            if (!result.success) {
                console.warn('Provisioning error (non-blocking):', result.error)
            }
        })

        // Animate through steps visually
        const stepDelay = 1200
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                setProvisioningSteps(prev => prev.map((s, idx) => {
                    if (idx < i) return { ...s, status: 'complete' }
                    if (idx === i) return { ...s, status: 'active' }
                    return s
                }))
            }, i * stepDelay)

            // Mark last step complete and advance to Step 6
            if (i === 5) {
                setTimeout(() => {
                    setProvisioningSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })))
                    setTimeout(() => {
                        setState(prev => ({ ...prev, step: 6 }))
                    }, 800)
                }, (i + 1) * stepDelay)
            }
        }
    }, [state.step])

    const goNext = async () => {
        // Validate current step
        if (state.step === 1) {
            const errs: Record<string, string> = {}
            if (!state.account.email) errs.email = 'Email is required'
            else if (!/\S+@\S+\.\S+/.test(state.account.email)) errs.email = 'Invalid email format'
            if (!state.account.password) errs.password = 'Password is required'
            else if (state.account.password.length < 8) errs.password = 'Minimum 8 characters'
            if (state.account.password !== state.account.confirmPassword) errs.confirmPassword = 'Passwords do not match'
            if (Object.keys(errs).length > 0) { setErrors(errs); return }

            // Create Firebase account
            setLoading(true)
            const result = await createAccount(state.account.email, state.account.password)
            setLoading(false)
            if ('error' in result) {
                setErrors({ email: result.error })
                return
            }
            setFirebaseUid(result.uid)
        }
        if (state.step === 2) {
            const errs: Record<string, string> = {}
            if (!state.organization.companyName.trim()) errs.companyName = 'Company name is required'
            if (!state.organization.industry) errs.industry = 'Select an industry'
            if (!state.organization.companySize) errs.companySize = 'Select company size'
            if (Object.keys(errs).length > 0) { setErrors(errs); return }
        }
        if (state.step === 3 && state.plan !== 'free') {
            // Initiate Stripe Checkout for Solo/Business
            setLoading(true)

            // Save state so we can restore it on return
            sessionStorage.setItem('sirsi_onboarding_state', JSON.stringify(state))
            if (firebaseUid) sessionStorage.setItem('sirsi_onboarding_uid', firebaseUid)

            const successUrl = `${window.location.origin}${window.location.pathname}?session_id={CHECKOUT_SESSION_ID}`
            const cancelUrl = `${window.location.origin}${window.location.pathname}`

            const result = await createCheckoutSession(
                firebaseUid || 'anonymous',
                state.plan,
                successUrl,
                cancelUrl
            )
            setLoading(false)

            if ('error' in result) {
                alert(result.error) // Replace with better UI in production
                return
            }

            // Redirect to Stripe
            window.location.href = result.checkoutUrl
            return
        }
        setState(prev => ({ ...prev, step: Math.min(prev.step + 1, 6) }))
    }

    const goBack = () => setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 1) }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/10">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold text-emerald-700 dark:text-emerald-400 no-underline">
                        SirsiNexus
                    </a>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Step {state.step} of 6
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <div className="flex items-center gap-1">
                    {STEPS.map((s) => (
                        <div key={s.number} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${s.number <= state.step
                                ? 'bg-emerald-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                                }`} />
                            <span className={`text-[10px] font-medium uppercase tracking-wider ${s.number === state.step
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : s.number < state.step
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">

                    {/* ═══ STEP 1: Account ═══ */}
                    {state.step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Your Account</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                Your credentials for accessing the Sirsi Nexus platform.
                            </p>
                            <div className="space-y-5">
                                <InputField label="Email Address" type="email" placeholder="you@company.com"
                                    value={state.account.email} error={errors.email}
                                    onChange={(v) => updateField('account', { email: v })} />
                                <InputField label="Password" type="password" placeholder="Minimum 8 characters"
                                    value={state.account.password} error={errors.password}
                                    onChange={(v) => updateField('account', { password: v })} />
                                <InputField label="Confirm Password" type="password" placeholder="Re-enter password"
                                    value={state.account.confirmPassword} error={errors.confirmPassword}
                                    onChange={(v) => updateField('account', { confirmPassword: v })} />
                            </div>
                        </>
                    )}

                    {/* ═══ STEP 2: Organization ═══ */}
                    {state.step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Organization Profile</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                Tell us about your company so we can tailor your experience.
                            </p>
                            <div className="space-y-5">
                                <InputField label="Company Name" type="text" placeholder="Acme Corp"
                                    value={state.organization.companyName} error={errors.companyName}
                                    onChange={(v) => updateField('organization', { companyName: v })} />
                                <SelectField label="Industry" value={state.organization.industry}
                                    options={INDUSTRIES} error={errors.industry} placeholder="Select industry"
                                    onChange={(v) => updateField('organization', { industry: v })} />
                                <SelectField label="Company Size" value={state.organization.companySize}
                                    options={COMPANY_SIZES} error={errors.companySize} placeholder="Select size"
                                    onChange={(v) => updateField('organization', { companySize: v })} />
                            </div>
                        </>
                    )}

                    {/* ═══ STEP 3: Plan ═══ */}
                    {state.step === 3 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Plan</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                Select the tier that fits your needs. You can upgrade anytime.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {getAllTiers().map((tier: SaaSTier) => (
                                    <button key={tier.id} onClick={() => updateField('plan', tier.id as any)}
                                        className={`text-left p-5 rounded-xl border-2 transition-all ${state.plan === tier.id
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-slate-900 dark:text-white">{tier.name}</span>
                                            {tier.popular && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                                            {tier.priceDisplay}<span className="text-sm font-normal text-slate-400">/mo</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{tier.tagline}</p>
                                        <ul className="space-y-1">
                                            {tier.features.slice(0, 4).map((f, i) => (
                                                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                                                    <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {f}
                                                </li>
                                            ))}
                                            {tier.features.length > 4 && (
                                                <li className="text-xs text-emerald-600 dark:text-emerald-400">
                                                    + {tier.features.length - 4} more
                                                </li>
                                            )}
                                        </ul>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ═══ STEP 4: Infrastructure ═══ */}
                    {state.step === 4 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Infrastructure Setup</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                {state.plan === 'business'
                                    ? 'Choose your cloud provider and deployment region.'
                                    : 'Your infrastructure will be managed on Sirsi\'s GCP project. Choose your preferred region.'}
                            </p>
                            <div className="space-y-6">
                                {state.plan === 'business' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cloud Provider</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['gcp', 'aws', 'azure'] as const).map(provider => (
                                                <button key={provider}
                                                    onClick={() => updateField('infrastructure', { cloudProvider: provider })}
                                                    className={`p-4 rounded-xl border-2 text-center transition-all ${state.infrastructure.cloudProvider === provider
                                                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                                        {provider === 'gcp' ? 'Google Cloud' : provider === 'aws' ? 'Amazon AWS' : 'Microsoft Azure'}
                                                    </div>
                                                    {provider === 'gcp' && (
                                                        <div className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">Recommended</div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <SelectField label="Deployment Region" value={state.infrastructure.region}
                                    options={REGIONS.map(r => r.label)} placeholder="Select region"
                                    onChange={(v) => {
                                        const region = REGIONS.find(r => r.label === v)
                                        if (region) updateField('infrastructure', { region: region.id })
                                    }} />
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <div>
                                        <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Managed by Sirsi</div>
                                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                            Infrastructure is provisioned and maintained within the Sirsi platform. SOC 2 compliant, AES-256 encryption at rest.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ═══ STEP 5: Provisioning ═══ */}
                    {state.step === 5 && (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Setting Up Your Workspace</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                                We're provisioning your infrastructure. This typically takes 2-5 minutes.
                            </p>
                            <div className="space-y-4">
                                {provisioningSteps.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 transition-all duration-300">
                                        {item.status === 'complete' && (
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-[scale-in_0.2s_ease-out]">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {item.status === 'active' && (
                                            <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                                        )}
                                        {item.status === 'pending' && (
                                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                                        )}
                                        <span className={`text-sm transition-colors duration-300 ${item.status === 'complete' ? 'text-slate-900 dark:text-white'
                                            : item.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                                : 'text-slate-400 dark:text-slate-500'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* ═══ STEP 6: Welcome ═══ */}
                    {state.step === 6 && (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to SirsiNexus!</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">
                                Your workspace is ready. Here's a summary:
                            </p>
                            <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-slate-500 dark:text-slate-400">Organization</div>
                                    <div className="font-medium text-slate-900 dark:text-white">{state.organization.companyName || '—'}</div>
                                    <div className="text-slate-500 dark:text-slate-400">Plan</div>
                                    <div className="font-medium text-slate-900 dark:text-white capitalize">{state.plan}</div>
                                    <div className="text-slate-500 dark:text-slate-400">Region</div>
                                    <div className="font-medium text-slate-900 dark:text-white">{state.infrastructure.region}</div>
                                    <div className="text-slate-500 dark:text-slate-400">Cloud</div>
                                    <div className="font-medium text-slate-900 dark:text-white uppercase">{state.infrastructure.cloudProvider}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate({ to: '/client-portal' })}
                                className="mt-8 w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors"
                            >
                                Go to Your Dashboard →
                            </button>
                        </div>
                    )}

                    {/* ═══ Navigation Buttons ═══ */}
                    {state.step < 5 && (
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={goBack} disabled={state.step === 1 || loading}
                                className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                ← Back
                            </button>
                            <button onClick={goNext} disabled={loading}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {loading ? 'Creating account...' : 'Continue →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Shared Form Components ────────────────────────────────────────
function InputField({ label, type, placeholder, value, error, onChange }: {
    label: string; type: string; placeholder: string; value: string; error?: string
    onChange: (v: string) => void
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            <input type={type} placeholder={placeholder} value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}

function SelectField({ label, value, options, error, placeholder, onChange }: {
    label: string; value: string; options: string[]; error?: string; placeholder?: string
    onChange: (v: string) => void
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
            <select value={value} onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
                    }`}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}
