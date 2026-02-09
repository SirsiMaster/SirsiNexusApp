/**
 * Sirsi Vault Tab
 * Document signing and contract execution
 * 
 * BIPARTITE EXECUTION PROTOCOL (ADR-014):
 * - Provider (countersigner) designates client signer and countersigns after client signs
 * - Client reviews, signs, and pays
 * - Role detected from Firebase Auth email vs contract countersignerEmail/clientEmail
 * 
 * MFA ENFORCEMENT: Per AUTHORIZATION_POLICY.md Section 4.3, MFA is required
 * before accessing financial services (Plaid, Stripe bank transfers)
 */
import { useState, useEffect, useMemo } from 'react'
import { useConfigStore } from '../../store/useConfigStore'
import { BUNDLES, calculateTotal, calculateTimeline, calculateTotalHours } from '../../data/catalog'
import { contractsClient } from '../../lib/grpc'
import { getStripe } from '../../lib/stripe'
import { createGuestEnvelope, createPaymentSession, requestWireInstructions } from '../../lib/opensign'
import { SignatureCapture } from '../vault/SignatureCapture'
import { MFAGate } from '../auth/MFAGate'
import { usePlaidLink } from 'react-plaid-link'
import { auth } from '../../lib/firebase'
import { getProjectTemplate } from '../../data/projectTemplates'

// ── Role Architecture (ADR-014) ──
type UserRole = 'provider' | 'client' | 'viewer' | 'detecting'

export function SirsiVault() {
    const [step, setStep] = useState(1)
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const storeProjectId = useConfigStore(state => state.projectId)
    const tpl = getProjectTemplate(storeProjectId)
    const projectName = useConfigStore(state => state.projectName)
    const setClientInfo = useConfigStore(state => state.setClientInfo)
    const entityLegalName = useConfigStore(state => state.entityLegalName)
    const counterpartyName = useConfigStore(state => state.counterpartyName)

    // ── ADR-014: Role Detection ──
    const [userRole, setUserRole] = useState<UserRole>('detecting')
    const [authUser, setAuthUser] = useState<{ displayName: string; email: string } | null>(null)

    // Client designation (Provider fills this for the client signer)
    const [clientDesignation, setClientDesignation] = useState({
        clientName: '',
        clientEmail: '',
        clientTitle: ''
    })

    const [signatureData, setSignatureData] = useState({
        name: '',
        email: '',
        title: '',
        agreed: false,
        selectedPaymentMethod: 'card' // 'card', 'bank' (ACH), or 'wire' (Stripe Virtual Bank)
    })


    const [hasSignature, setHasSignature] = useState(false)
    const [signatureImageData, setSignatureImageData] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Digital Signature Evidence (Provable Audit Trail)
    const [signatureEvidence, setSignatureEvidence] = useState<{
        hash: string
        timestamp: string
        envelopeId: string
        signerIp: string
    } | null>(null)

    // ═══ ADR-014 Phase 2: Countersigner Signature State ═══
    const [countersignerSignatureImageData, setCountersignerSignatureImageData] = useState<string | null>(null)
    const [hasCountersignerSignature, setHasCountersignerSignature] = useState(false)
    const [countersignerEvidence, setCountersignerEvidence] = useState<{
        hash: string
        timestamp: string
        envelopeId: string
    } | null>(null)
    // Track contract execution status for provider's countersign readiness
    const [contractStatus, setContractStatus] = useState<string>('DRAFT')
    const [clientSignatureData, setClientSignatureData] = useState<{
        signatureImageData?: string
        signatureHash?: string
        clientName?: string
        clientEmail?: string
        clientTitle?: string
        signedAt?: string
    } | null>(null)

    const contractId = useConfigStore(state => state.contractId)
    const setStoreContractId = useConfigStore(state => state.setContractId)
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<2 | 3 | 4>(2)

    // Plaid State
    const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null)
    const [achLinked, setAchLinked] = useState(false)

    // MFA State - Per AUTHORIZATION_POLICY.md Section 4.3
    const [showMFAGate, setShowMFAGate] = useState(false)
    const [mfaVerifiedForFinancial, setMfaVerifiedForFinancial] = useState(false)

    // Legal Acknowledgment State (F-03, F-04)
    const [clientLegalAck, setClientLegalAck] = useState(false)
    const [countersignerLegalAck, setCountersignerLegalAck] = useState(false)

    // OpenSign Envelope State (ADR-015)
    const [openSignEnvelopeId, setOpenSignEnvelopeId] = useState<string | null>(null)

    const { open: openPlaid, ready: plaidReady } = usePlaidLink({
        token: plaidLinkToken,
        onSuccess: async (public_token, metadata) => {
            console.log('✅ Plaid Link Success:', public_token)
            setLoading(true)
            try {
                // Exchange the public token for a Stripe btok on the backend
                await contractsClient.exchangePlaidToken({
                    publicToken: public_token,
                    contractId: contractId || '',
                    accountId: metadata.accounts[0]?.id || ''
                })
                setAchLinked(true)
                setLoading(false)
                // We don't redirect yet; we show a "confirmed" state in Step 4
            } catch (err: any) {
                console.error('Exchange failed:', err)
                setError('Failed to link bank account. Please check your credentials and try again.')
                setLoading(false)
            }
        },
        onExit: () => {
            setLoading(false)
            setPlaidLinkToken(null)
        }
    })


    // Automatically open Plaid once the token is fetched and hook is ready
    useEffect(() => {
        if (plaidLinkToken && plaidReady) {
            openPlaid()
        }
    }, [plaidLinkToken, plaidReady, openPlaid])

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const ceoConsultingWeeks = useConfigStore(state => state.ceoConsultingWeeks)
    const probateStates = useConfigStore(state => state.probateStates)

    // ── ADR-014: Detect user role + pre-fill from Firebase Auth ──
    useEffect(() => {
        const firebaseUser = auth.currentUser
        if (!firebaseUser) {
            // Not authenticated — treat as client (public access via shared link)
            setUserRole('client')
            return
        }

        const userEmail = (firebaseUser.email || '').toLowerCase()
        const displayName = firebaseUser.displayName || userEmail.split('@')[0]
        setAuthUser({ displayName, email: userEmail })

        // Determine role from contract's countersigner/client email
        const storeState = useConfigStore.getState()
        const countersignerEmail = (storeState.counterpartyName === counterpartyName)
            ? 'cylton@sirsi.ai' // Default studio countersigner
            : ''

        const clientEmail = (storeState.clientEmail || '').toLowerCase()

        if (userEmail === 'cylton@sirsi.ai' || userEmail === countersignerEmail.toLowerCase()) {
            // Provider / Countersigner
            setUserRole('provider')
            // Pre-fill client designation from store if contract already has a client
            // BUT only if the client email is different from the provider's own email
            // (prevents stale data from old single-signer flow from pre-filling)
            if (clientEmail && storeState.clientName && clientEmail !== userEmail) {
                setClientDesignation({
                    clientName: storeState.clientName,
                    clientEmail: storeState.clientEmail,
                    clientTitle: ''
                })
            }
        } else if (userEmail === clientEmail) {
            // Client signer — pre-fill from auth
            setUserRole('client')
            setSignatureData(prev => ({
                ...prev,
                name: prev.name || displayName,
                email: prev.email || userEmail
            }))
        } else if (clientEmail === '') {
            // No client designated yet — check if this user IS the countersigner
            // If not, they're likely the client accessing for the first time
            if (userEmail === 'cylton@sirsi.ai') {
                setUserRole('provider')
            } else {
                setUserRole('client')
                setSignatureData(prev => ({
                    ...prev,
                    name: prev.name || displayName,
                    email: prev.email || userEmail
                }))
            }
        } else {
            // Viewer — read-only (email doesn't match either party)
            setUserRole('viewer')
        }
    }, [counterpartyName])

    // Role-aware step labels
    const stepLabels = useMemo(() => {
        if (userRole === 'provider') {
            return [
                { num: 1, label: 'Designate Client' },
                { num: 2, label: 'Review Documents' },
                { num: 3, label: 'Countersign' },
                { num: 4, label: 'Finalize' }
            ]
        }
        return [
            { num: 1, label: 'Verify Identity' },
            { num: 2, label: 'Review Documents' },
            { num: 3, label: 'Sign Agreement' },
            { num: 4, label: 'Execute Agreement' }
        ]
    }, [userRole])

    // ═══ ADR-014 Phase 2: Fetch contract status for provider countersign readiness ═══
    const fetchContractStatus = async () => {
        if (!contractId) return
        try {
            const contract = await contractsClient.getContract({ id: contractId })
            const rawStatus = (contract as any).status
            // Normalize status from backend (could be string or number)
            const statusMap: Record<string, string> = {
                '1': 'DRAFT', 'DRAFT': 'DRAFT',
                '2': 'ACTIVE', 'ACTIVE': 'ACTIVE',
                '3': 'SIGNED', 'SIGNED': 'SIGNED',
                '6': 'WAITING_FOR_COUNTERSIGN', 'WAITING_FOR_COUNTERSIGN': 'WAITING_FOR_COUNTERSIGN',
                '7': 'FULLY_EXECUTED', 'FULLY_EXECUTED': 'FULLY_EXECUTED',
            }
            setContractStatus(statusMap[String(rawStatus)] || String(rawStatus))

            // If contract has client signature data, capture it for display
            const cData = contract as any
            if (cData.signatureImageData || cData.signatureHash) {
                setClientSignatureData({
                    signatureImageData: cData.signatureImageData,
                    signatureHash: cData.signatureHash,
                    clientName: cData.clientName,
                    clientEmail: cData.clientEmail,
                    clientTitle: cData.clientTitle || '',
                    signedAt: cData.updatedAt ? new Date(Number(cData.updatedAt)).toISOString() : ''
                })
            }
        } catch (err) {
            console.error('Failed to fetch contract status:', err)
        }
    }

    // Fetch contract status on mount and when contractId changes (for provider)
    useEffect(() => {
        if (userRole === 'provider' && contractId) {
            fetchContractStatus()
        }
    }, [userRole, contractId])

    // Compute countersigner signature evidence
    const computeCountersignerEvidence = async () => {
        if (!countersignerSignatureImageData) return
        const sigHash = await hashSignature(countersignerSignatureImageData)
        const ts = new Date().toISOString()
        const prefix = contractId ? contractId.substring(0, 8).toUpperCase() : 'SIRSI'
        const hashFragment = sigHash.substring(0, 12).toUpperCase()
        const envelopeId = `CS-${prefix}-${hashFragment}`
        setCountersignerEvidence({ hash: sigHash, timestamp: ts, envelopeId })
    }

    // Handle provider countersign submission
    const handleCountersign = async () => {
        if (!contractId || !countersignerSignatureImageData) return
        setLoading(true)
        setError(null)

        try {
            const sigHash = countersignerEvidence?.hash || await hashSignature(countersignerSignatureImageData)
            console.log(`🛡️ Countersigner Hash: ${sigHash}`)
            console.log(`📋 Countersigner Envelope: ${countersignerEvidence?.envelopeId}`)
            console.log(`⏰ Countersigned At: ${countersignerEvidence?.timestamp || new Date().toISOString()}`)

            // Update contract with countersigner evidence → transition to FULLY_EXECUTED
            await contractsClient.updateContract({
                id: contractId,
                contract: {
                    status: 7 as any, // FULLY_EXECUTED
                    // @ts-ignore - Injecting countersigner evidence
                    countersignerSignatureImageData: countersignerSignatureImageData,
                    countersignerSignatureHash: sigHash,
                    countersignerSignedAt: Date.now().toString(),
                    countersignerTitle: signatureData.title || 'CEO',
                    legalAcknowledgment: true,
                }
            })

            setContractStatus('FULLY_EXECUTED')
            console.log('✅ Contract fully executed — both parties signed')
        } catch (err: any) {
            console.error('Countersign failed:', err)
            setError(err?.message || 'Failed to submit countersignature. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    const totalInvestmentResult = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length, 1.0)
    const totalInvestment = totalInvestmentResult.total

    // Compute signature evidence when advancing to Step 4
    const computeSignatureEvidence = async () => {
        if (!signatureImageData) return
        const sigHash = await hashSignature(signatureImageData)
        const ts = new Date().toISOString()
        // Deterministic envelope ID: contract prefix + hash fragment
        const prefix = contractId ? contractId.substring(0, 8).toUpperCase() : 'SIRSI'
        const hashFragment = sigHash.substring(0, 12).toUpperCase()
        const envelopeId = `${prefix}-${hashFragment}`
        setSignatureEvidence({
            hash: sigHash,
            timestamp: ts,
            envelopeId,
            signerIp: 'Captured at execution'
        })
    }

    const openPrintableMSA = () => {
        const timeline = calculateTimeline(selectedBundle, selectedAddons, probateStates.length) // weeks
        const hours = calculateTotalHours(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length) // total dev hours
        const counterpartyTitle = useConfigStore.getState().counterpartyTitle
        // Include signature evidence in URL if available
        const evidenceParams = signatureEvidence
            ? `&sigHash=${encodeURIComponent(signatureEvidence.hash)}&sigTs=${encodeURIComponent(signatureEvidence.timestamp)}&envId=${encodeURIComponent(signatureEvidence.envelopeId)}&signed=true`
            : ''
        // Include countersigner evidence if available (F-07)
        const csEvidenceParams = countersignerEvidence
            ? `&csSigHash=${encodeURIComponent(countersignerEvidence.hash)}&csSigTs=${encodeURIComponent(countersignerEvidence.timestamp)}&csEnvId=${encodeURIComponent(countersignerEvidence.envelopeId)}`
            : ''
        const msaUrl = `/finalwishes/contracts/printable-msa.html?client=${encodeURIComponent(signatureData.name)}&date=${encodeURIComponent(currentDate)}&plan=${selectedPaymentPlan}&total=${totalInvestment}&weeks=${timeline}&hours=${hours}&addons=${selectedAddons.join(',')}&ceoWeeks=${ceoConsultingWeeks}&probateCount=${probateStates.length}&multiplier=1&entity=${encodeURIComponent(entityLegalName)}&cpName=${encodeURIComponent(counterpartyName)}&cpTitle=${encodeURIComponent(counterpartyTitle)}&bundle=${selectedBundle || ''}${evidenceParams}${csEvidenceParams}`
        window.open(msaUrl, '_blank', 'width=900,height=800,scrollbars=yes,resizable=yes')
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setSignatureData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreateDraft = async () => {
        if (contractId) return; // Already created
        setLoading(true);
        setError(null);
        try {
            // Calculate payment amounts in cents (Stripe uses cents)
            const totalAmountCents = totalInvestment * 100
            const monthlyAmountCents = Math.round(totalAmountCents / selectedPaymentPlan)

            // Generate payment plans based on selection (2, 3, or 4 months)
            const paymentPlans = Array.from({ length: selectedPaymentPlan }, (_, i) => ({
                id: `payment-${i + 1}`,
                name: i === 0 ? 'First Payment' : `Payment ${i + 1}`,
                description: i === 0 ? 'Due upon execution' : `Due Month ${i + 1}`,
                paymentCount: 1,
                monthlyAmount: monthlyAmountCents.toString(),
                totalAmount: monthlyAmountCents.toString()
            }))

            const contract = await contractsClient.createContract({
                projectId: storeProjectId,
                projectName: `${projectName} Platform`,
                clientName: signatureData.name,
                clientEmail: signatureData.email,
                totalAmount: totalAmountCents.toString() as any,
                paymentPlans: paymentPlans as any,
                theme: {
                    primaryColor: '#C8A951',
                    secondaryColor: '#0f172a',
                    accentColor: '#10B981',
                    fontHeading: 'Cinzel',
                    fontBody: 'Inter'
                },
                countersignerName: counterpartyName,
                countersignerEmail: 'cylton@sirsi.ai', // Keep email for now as it maps to the auth account
                stripeConnectAccountId: '' // Future: Fetch from useConfigStore/portfolio mapping
            });

            setStoreContractId(contract.id);

            // ADR-015: Create corresponding OpenSign envelope
            try {
                const envelope = await createGuestEnvelope({
                    projectId: storeProjectId || 'finalwishes',
                    docType: tpl.docType,
                    signerName: signatureData.name,
                    signerEmail: signatureData.email,
                    metadata: {
                        contractId: contract.id,
                        projectId: storeProjectId,
                        selectedBundle: selectedBundle,
                        totalAmount: totalAmountCents
                    },
                    plan: `${selectedPaymentPlan}-month`,
                    amount: totalAmountCents
                })
                setOpenSignEnvelopeId(envelope.envelopeId)
                console.log(`📋 OpenSign envelope created: ${envelope.envelopeId}`)
            } catch (envErr) {
                // Non-fatal: payment can still fall back to contractId
                console.warn('OpenSign envelope creation failed (non-blocking):', envErr)
            }
        } catch (err: any) {
            console.error('Failed to create draft:', err);
            // Show more detailed error
            const errorMsg = err?.message || err?.toString() || 'Failed to initialize contract session.'
            setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    // Cryptographic Hashing for Signature Evidence (Rule 5)
    const hashSignature = async (dataUrl: string): Promise<string> => {
        const msgUint8 = new TextEncoder().encode(dataUrl);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleExecute = async () => {
        // MFA Check: Require verification for bank transfers per AUTHORIZATION_POLICY.md Section 4.3
        if (signatureData.selectedPaymentMethod === 'bank' && !mfaVerifiedForFinancial) {
            setShowMFAGate(true)
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Use pre-computed signature evidence (computed on Step 3 → 4 transition)
            const sigHash = signatureEvidence?.hash || (signatureImageData ? await hashSignature(signatureImageData) : '');
            console.log(`🔐 Signature Hash: ${sigHash}`);
            console.log(`📋 Envelope ID: ${signatureEvidence?.envelopeId}`);
            console.log(`⏰ Signed At: ${signatureEvidence?.timestamp}`);
            // Calculate the first payment amount based on selected plan
            const firstPayment = Math.round(totalInvestment / selectedPaymentPlan)

            // Use gRPC flow if we have a contractId
            if (contractId) {
                // 1. Update status to SIGNED and include signature metadata
                await contractsClient.updateContract({
                    id: contractId,
                    contract: {
                        status: 3 as any, // SIGNED -> WAITING_FOR_COUNTERSIGN in backend
                        signatureImageData: signatureImageData || '',
                        // @ts-ignore - Injecting cryptographic evidence into Firestore record
                        signatureHash: sigHash,
                        legalAcknowledgment: clientLegalAck,
                        selectedPaymentPlan: selectedPaymentPlan,
                        paymentMethod: signatureData.selectedPaymentMethod
                    }
                });


                // If Bank Transfer, handle Plaid flow (MFA verified at this point)
                if (signatureData.selectedPaymentMethod === 'bank' && !achLinked) {
                    console.log('🏦 Bank Transfer Selected: Chase / Plaid Flow');
                    console.log('✅ MFA Verified - Proceeding with financial integration');

                    try {
                        const response = await contractsClient.createPlaidLinkToken({
                            userId: signatureData.email || 'anonymous',
                            clientName: projectName
                        })
                        setPlaidLinkToken(response.linkToken)
                        // useEffect will trigger openPlaid()
                        return
                    } catch (err: any) {
                        console.error('Failed to create Plaid session:', err)
                        setError('Failed to initialize bank link. Please try again or use a Card.')
                        setLoading(false)
                        return
                    }
                }

                // If ACH is already linked, create payment session via OpenSign (ADR-015)
                if (signatureData.selectedPaymentMethod === 'bank' && achLinked) {
                    const achSession = await createPaymentSession({
                        envelopeId: openSignEnvelopeId || signatureEvidence?.envelopeId || contractId,
                        planId: 'payment-1',
                        projectId: storeProjectId || 'finalwishes',
                        successUrl: window.location.origin + `/contracts/${storeProjectId}/payment/success?session_id={CHECKOUT_SESSION_ID}&method=ach`,
                        cancelUrl: window.location.href
                    })

                    if (achSession.checkoutUrl) {
                        window.location.href = achSession.checkoutUrl
                    } else if (achSession.sessionId) {
                        const stripe = await getStripe()
                        if (stripe) {
                            await (stripe as any).redirectToCheckout({ sessionId: achSession.sessionId })
                        }
                    }
                    return
                }

                // Wire transfers — request secure wire instructions via OpenSign (ADR-015)
                if (signatureData.selectedPaymentMethod === 'wire') {
                    console.log('🏦 Wire Transfer Selected: Requesting instructions via OpenSign');
                    try {
                        await requestWireInstructions({
                            email: signatureData.email,
                            reference: `SIRSI-${contractId.substring(0, 8).toUpperCase()}`,
                            envelopeId: openSignEnvelopeId || signatureEvidence?.envelopeId || contractId
                        })
                    } catch (wireErr) {
                        console.warn('Wire instructions email failed (non-blocking):', wireErr)
                    }
                    // Also open printable MSA for reference
                    window.location.href = `/finalwishes/contracts/printable-msa.html?client=${encodeURIComponent(signatureData.name)}&date=${encodeURIComponent(currentDate)}&plan=${selectedPaymentPlan}&total=${totalInvestment}&weeks=${calculateTimeline(selectedBundle, selectedAddons, probateStates.length)}&hours=${calculateTotalHours(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)}&addons=${selectedAddons.join(',')}&ceoWeeks=${ceoConsultingWeeks}&probateCount=${probateStates.length}&multiplier=1&entity=${encodeURIComponent(entityLegalName)}&cpName=${encodeURIComponent(counterpartyName)}&cpTitle=${encodeURIComponent(useConfigStore.getState().counterpartyTitle)}&bundle=${selectedBundle || ''}&sigHash=${encodeURIComponent(signatureEvidence?.hash || '')}&sigTs=${encodeURIComponent(signatureEvidence?.timestamp || '')}&envId=${encodeURIComponent(signatureEvidence?.envelopeId || '')}&signed=true`;
                    return;
                }

                // Card payment — create session via OpenSign (ADR-015)
                const session = await createPaymentSession({
                    envelopeId: openSignEnvelopeId || signatureEvidence?.envelopeId || contractId,
                    planId: 'payment-1',
                    projectId: storeProjectId || 'finalwishes',
                    successUrl: window.location.origin + `/contracts/${storeProjectId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: window.location.href
                })


                // 3. Redirect to Stripe
                if (session.checkoutUrl) {
                    window.location.href = session.checkoutUrl
                    return
                } else if (session.sessionId) {
                    const stripe = await getStripe()
                    if (stripe) {
                        await (stripe as any).redirectToCheckout({ sessionId: session.sessionId })
                        return
                    }
                }


                // If no checkout URL returned, show error
                throw new Error('No checkout session URL returned from server')
            } else {
                // No contractId - shouldn't happen but use fallback
                console.warn('No contractId, using fallback payment flow')
            }

            // Fallback: Redirect to payment.html with parameters (legacy flow)
            const paymentParams = new URLSearchParams({
                amount: String(firstPayment),
                total: String(totalInvestment),
                plan: String(selectedPaymentPlan),
                client: signatureData.name,
                email: signatureData.email,
                project: projectName || tpl.projectDisplayName,
                ref: `MSA-${new Date().getFullYear()}-111-${tpl.docCode}`
            })

            window.location.href = `/payment.html?${paymentParams.toString()}`

        } catch (err: any) {
            console.error('Execution failed:', err)
            const errorMessage = typeof err === 'string'
                ? err
                : err?.message
                    ? (typeof err.message === 'string' ? err.message : 'Payment initialization failed')
                    : 'Failed to execute contract. Please try again.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* VAULT HEADER */}
            <div style={{
                textAlign: 'center',
                marginBottom: '4rem',
                marginTop: '2rem'
            }}>
                {/* Role Indicator Banner (ADR-014) */}
                {userRole !== 'detecting' && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: userRole === 'provider'
                            ? 'rgba(200, 169, 81, 0.1)'
                            : userRole === 'viewer'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${userRole === 'provider' ? 'rgba(200, 169, 81, 0.4)' : userRole === 'viewer' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                        borderRadius: '20px',
                        padding: '6px 20px',
                        marginBottom: '1rem'
                    }}>
                        <span style={{
                            color: userRole === 'provider' ? '#C8A951' : userRole === 'viewer' ? '#ef4444' : '#10b981',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em'
                        }}>
                            {userRole === 'provider' ? '🛡️ Provider / Countersigner' : userRole === 'viewer' ? '👁️ View Only' : '📝 Client Signer'}
                        </span>
                        {authUser && (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                • {authUser.email}
                            </span>
                        )}
                    </div>
                )}

                <div style={{
                    display: 'inline-block',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '20px',
                    padding: '6px 20px',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        🔒 Secure Signing Environment
                    </span>
                </div>
                <h2 style={{
                    fontSize: '3.5rem',
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '1.5rem',
                    fontWeight: 700,
                    lineHeight: '1.2'
                }}>
                    Sirsi Vault
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                    {userRole === 'provider'
                        ? 'Configure and send contracts to clients for signature. Countersign after client execution.'
                        : 'Execute your contract in our secure document vault. All signatures are timestamped and cryptographically verified.'}
                </p>
            </div>

            {/* PROGRESS STEPS */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '48px',
                marginBottom: '48px'
            }}>
                {stepLabels.map((s) => (
                    <div key={s.num} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '16px',
                            background: step === s.num
                                ? 'linear-gradient(135deg, #C8A951, #D4AF37)'
                                : step > s.num
                                    ? '#10b981'
                                    : 'rgba(255,255,255,0.1)',
                            color: step >= s.num ? '#000' : 'rgba(255,255,255,0.5)',
                            border: step === s.num ? '2px solid #C8A951' : '2px solid transparent'
                        }}>
                            {step > s.num ? '✓' : s.num}
                        </div>
                        <span style={{
                            color: step >= s.num ? 'white' : 'rgba(255,255,255,0.5)',
                            fontWeight: step === s.num ? 600 : 400,
                            fontSize: '14px'
                        }}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* STEP CONTENT */}
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                {/* ═══ STEP 1: ROLE-AWARE IDENTITY ═══ */}
                {step === 1 && userRole === 'provider' && (
                    /* ── PROVIDER VIEW: Designate Client Signer ── */
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '8px',
                            textAlign: 'center'
                        }}>
                            Step 1: Designate Client Signer
                        </h3>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '24px' }}>
                            Enter the client's information. They will receive an invitation to review and sign.
                        </p>

                        {/* Provider Identity (pre-filled, read-only context) */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(200, 169, 81, 0.06)',
                            border: '1px solid rgba(200, 169, 81, 0.2)',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                🛡️ Your Identity (Provider / Countersigner)
                            </div>
                            <div style={{ color: '#C8A951', fontSize: '16px', fontWeight: 600 }}>
                                {authUser?.displayName || counterpartyName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                                {authUser?.email || 'cylton@sirsi.ai'} • {entityLegalName}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 24px' }} />

                        {/* Client Signer Fields */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                                📝 Client Full Legal Name *
                            </label>
                            <input
                                type="text"
                                value={clientDesignation.clientName}
                                onChange={(e) => setClientDesignation(prev => ({ ...prev, clientName: e.target.value }))}
                                placeholder="Enter client's full legal name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                                📧 Client Email Address *
                            </label>
                            <input
                                type="email"
                                value={clientDesignation.clientEmail}
                                onChange={(e) => setClientDesignation(prev => ({ ...prev, clientEmail: e.target.value }))}
                                placeholder="Enter client's email address"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '6px' }}>
                                Used for signin verification, portal access, and notifications.
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#10b981', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                                Client Title (Optional)
                            </label>
                            <input
                                type="text"
                                value={clientDesignation.clientTitle}
                                onChange={(e) => setClientDesignation(prev => ({ ...prev, clientTitle: e.target.value }))}
                                placeholder="e.g. Founder, CEO, Director"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            onClick={async () => {
                                // Set the client's name/email into the store and signatureData
                                setClientInfo(clientDesignation.clientName, clientDesignation.clientEmail)
                                setSignatureData(prev => ({
                                    ...prev,
                                    name: clientDesignation.clientName,
                                    email: clientDesignation.clientEmail,
                                    title: clientDesignation.clientTitle
                                }))
                                await handleCreateDraft()
                                // Persist configuration selections to Firestore (F-01)
                                await useConfigStore.getState().syncConfig()
                                setStep(2)
                            }}
                            disabled={!clientDesignation.clientName || !clientDesignation.clientEmail || loading}
                            className="select-plan-btn"
                            style={{
                                width: '100%',
                                padding: '14px',
                                opacity: (!clientDesignation.clientName || !clientDesignation.clientEmail || loading) ? 0.5 : 1,
                                cursor: (!clientDesignation.clientName || !clientDesignation.clientEmail || loading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Initializing Vault...' : '📨 Configure & Continue to Review'}
                        </button>
                    </div>
                )}

                {step === 1 && userRole === 'client' && (
                    /* ── CLIENT VIEW: Verify Identity (pre-filled from auth) ── */
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 1: Verify Your Identity
                        </h3>

                        {authUser && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(16, 185, 129, 0.06)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                fontSize: '12px',
                                color: '#10b981'
                            }}>
                                ✓ Pre-filled from your account credentials. You may edit if needed.
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#C8A951', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Full Legal Name *
                            </label>
                            <input
                                type="text"
                                value={signatureData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full legal name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: '#C8A951', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={signatureData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email address"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#C8A951', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                Professional Title *
                            </label>
                            <input
                                type="text"
                                value={signatureData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g. Founder, CEO, Director"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            onClick={async () => {
                                // Persist client info to the store
                                setClientInfo(signatureData.name, signatureData.email)
                                await handleCreateDraft()
                                // Persist configuration selections to Firestore (F-01)
                                await useConfigStore.getState().syncConfig()
                                setStep(2)
                            }}
                            disabled={!signatureData.name || !signatureData.email || !signatureData.title || loading}
                            className="select-plan-btn"
                            style={{
                                width: '100%',
                                padding: '14px',
                                opacity: (!signatureData.name || !signatureData.email || !signatureData.title || loading) ? 0.5 : 1,
                                cursor: (!signatureData.name || !signatureData.email || !signatureData.title || loading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Initializing Vault...' : 'Continue to Document Review'}
                        </button>
                    </div>
                )}

                {step === 1 && userRole === 'viewer' && (
                    /* ── VIEWER: Read-only notice ── */
                    <div className="neo-glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👁️</div>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#ef4444',
                            marginBottom: '16px'
                        }}>
                            View Only Access
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
                            Your email (<strong style={{ color: '#C8A951' }}>{authUser?.email}</strong>) is not authorized
                            as a signer or countersigner on this contract. You may view the documents but cannot sign or execute.
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                            If you believe this is an error, contact the contract administrator.
                        </p>
                    </div>
                )}

                {step === 1 && userRole === 'detecting' && (
                    <div className="neo-glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}>
                            DETECTING ROLE...
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 2: Review Documents
                        </h3>

                        {/* Document List */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                padding: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: '#C8A951' }}>📄</span>
                                        <span style={{ color: 'white' }}>{projectName} Master Agreement</span>
                                    </div>
                                    <span style={{ color: '#10b981', fontSize: '12px' }}>READY</span>
                                </div>
                            </div>
                            <div style={{
                                padding: '16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                marginBottom: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: '#C8A951' }}>📄</span>
                                        <span style={{ color: 'white' }}>Dynamic Statement of Work</span>
                                    </div>
                                    <span style={{ color: '#10b981', fontSize: '12px' }}>GENERATED</span>
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingLeft: '28px' }}>
                                    Includes: {selectedBundle ? BUNDLES[selectedBundle]?.name : 'Custom Stack'}
                                    {selectedAddons.length > 0 ? ` + ${selectedAddons.length} Modules` : ''}
                                </div>
                            </div>

                            <button
                                onClick={openPrintableMSA}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    background: 'rgba(200,169,81,0.1)',
                                    border: '1px solid #C8A951',
                                    borderRadius: '4px',
                                    color: '#C8A951',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: '16px'
                                }}
                            >
                                📥 Preview & Download PDF Agreement
                            </button>
                        </div>

                        {/* Agreement Checkbox */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginBottom: '24px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="checkbox"
                                checked={signatureData.agreed}
                                onChange={(e) => handleInputChange('agreed', e.target.checked)}
                                style={{ width: '20px', height: '20px', marginTop: '2px' }}
                            />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: 1.6 }}>
                                I, <strong style={{ color: '#C8A951' }}>{signatureData.name}</strong>, hereby confirm that
                                I have reviewed and agree to the Master Service Agreement and Statement of Work
                                for a total investment of <strong style={{ color: '#C8A951' }}>${totalInvestment.toLocaleString()}</strong>.
                            </span>
                        </label>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!signatureData.agreed}
                                className="select-plan-btn"
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    opacity: signatureData.agreed ? 1 : 0.5,
                                    cursor: signatureData.agreed ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Proceed to Signature
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ STEP 3: ROLE-AWARE SIGNING ═══ */}
                {step === 3 && userRole !== 'provider' && (
                    /* ── CLIENT SIGNING (existing flow, unchanged) ── */
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 3: Sign Agreement
                        </h3>

                        {/* Signer Info Display */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Signing as</div>
                            <div style={{ color: '#C8A951', fontSize: '18px', fontWeight: 600 }}>{signatureData.name}</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{signatureData.email}</div>
                        </div>

                        {/* Signature Capture Component */}
                        <div style={{ marginBottom: '24px' }}>
                            <SignatureCapture
                                signerName={signatureData.name}
                                onSignatureChange={(hasSig, sigData) => {
                                    setHasSignature(hasSig)
                                    setSignatureImageData(sigData)
                                }}
                            />
                        </div>

                        {/* Legal Acknowledgment */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            marginBottom: '24px',
                            cursor: 'pointer',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px'
                        }}>
                            <input
                                type="checkbox"
                                id="legal-ack"
                                checked={clientLegalAck}
                                onChange={(e) => setClientLegalAck(e.target.checked)}
                                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#C8A951' }}
                            />
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.6 }}>
                                I acknowledge that by signing above, I am executing a legally binding electronic signature
                                pursuant to the ESIGN Act and UETA, equivalent to a handwritten signature.
                            </span>
                        </label>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={async () => {
                                    await computeSignatureEvidence()
                                    setStep(4)
                                }}
                                disabled={!hasSignature || !clientLegalAck}
                                className="select-plan-btn"
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    opacity: (hasSignature && clientLegalAck) ? 1 : 0.5,
                                    cursor: (hasSignature && clientLegalAck) ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Continue to Execution
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && userRole === 'provider' && (
                    /* ── PROVIDER COUNTERSIGNING (ADR-014 Phase 2) ── */
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 3: Countersign Agreement
                        </h3>

                        {/* Contract Status Guard */}
                        {contractStatus !== 'WAITING_FOR_COUNTERSIGN' && contractStatus !== 'FULLY_EXECUTED' && (
                            <div style={{
                                padding: '24px',
                                background: 'rgba(200,169,81,0.08)',
                                border: '1px solid rgba(200,169,81,0.3)',
                                borderRadius: '12px',
                                textAlign: 'center',
                                marginBottom: '24px'
                            }}>
                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                                <div style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '16px', marginBottom: '8px' }}>
                                    Awaiting Client Signature
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6 }}>
                                    The client has not yet signed this agreement. You will be notified
                                    via email when the contract is ready for your countersignature.
                                </div>
                                <div style={{
                                    marginTop: '16px',
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '8px',
                                    display: 'inline-block',
                                    fontSize: '11px',
                                    color: 'rgba(255,255,255,0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    Status: {contractStatus}
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <button
                                        onClick={fetchContractStatus}
                                        style={{
                                            padding: '10px 24px',
                                            background: 'rgba(200,169,81,0.15)',
                                            border: '1px solid #C8A951',
                                            borderRadius: '8px',
                                            color: '#C8A951',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        🔄 Refresh Status
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Countersign Ready — Show client's signature + provider's sign pad */}
                        {(contractStatus === 'WAITING_FOR_COUNTERSIGN' || contractStatus === 'FULLY_EXECUTED') && (
                            <>
                                {/* Client Signature Evidence (read-only) */}
                                <div style={{
                                    padding: '20px',
                                    background: 'rgba(16, 185, 129, 0.06)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        color: '#10b981',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.15em',
                                        marginBottom: '12px',
                                        fontWeight: 600
                                    }}>
                                        ✓ Client Signature on Record
                                    </div>
                                    {clientSignatureData?.signatureImageData && (
                                        <img
                                            src={clientSignatureData.signatureImageData}
                                            alt="Client signature"
                                            style={{
                                                maxWidth: '280px',
                                                maxHeight: '80px',
                                                display: 'block',
                                                margin: '0 auto 12px',
                                                borderRadius: '4px',
                                                opacity: 0.85
                                            }}
                                        />
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                        <span>{clientSignatureData?.clientName || 'Client'} • {clientSignatureData?.clientEmail}</span>
                                        <span style={{ fontFamily: "'Courier New', monospace", color: '#10b981', fontSize: '10px' }}>
                                            {clientSignatureData?.signatureHash?.substring(0, 16)}…
                                        </span>
                                    </div>
                                </div>

                                {/* Provider countersigner identity */}
                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(200,169,81,0.3)',
                                    borderRadius: '8px',
                                    marginBottom: '24px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        Countersigning as
                                    </div>
                                    <div style={{ color: '#C8A951', fontSize: '18px', fontWeight: 600 }}>
                                        {authUser?.displayName || counterpartyName}
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                        {authUser?.email} • {entityLegalName}
                                    </div>
                                </div>

                                {/* Countersignature Capture */}
                                {contractStatus !== 'FULLY_EXECUTED' && (
                                    <>
                                        <div style={{ marginBottom: '24px' }}>
                                            <SignatureCapture
                                                signerName={authUser?.displayName || counterpartyName}
                                                onSignatureChange={(hasSig, sigData) => {
                                                    setHasCountersignerSignature(hasSig)
                                                    setCountersignerSignatureImageData(sigData)
                                                }}
                                            />
                                        </div>

                                        {/* Legal Acknowledgment for Countersigner */}
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '12px',
                                            marginBottom: '24px',
                                            cursor: 'pointer',
                                            padding: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                id="countersign-legal-ack"
                                                checked={countersignerLegalAck}
                                                onChange={(e) => setCountersignerLegalAck(e.target.checked)}
                                                style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#C8A951' }}
                                            />
                                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.6 }}>
                                                I, <strong style={{ color: '#C8A951' }}>{authUser?.displayName || counterpartyName}</strong>, as authorized representative of{' '}
                                                <strong style={{ color: '#C8A951' }}>{entityLegalName}</strong>,
                                                hereby countersign this agreement, executing a legally binding electronic signature
                                                pursuant to the ESIGN Act and UETA.
                                            </span>
                                        </label>
                                    </>
                                )}

                                {contractStatus === 'FULLY_EXECUTED' && (
                                    <div style={{
                                        padding: '20px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '2px solid #10b981',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        marginBottom: '24px'
                                    }}>
                                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                        <div style={{ color: '#10b981', fontFamily: "'Cinzel', serif", fontSize: '16px' }}>
                                            Agreement Fully Executed
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>
                                            Both parties have signed. This contract is legally binding.
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button
                                onClick={() => setStep(2)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            {contractStatus !== 'FULLY_EXECUTED' && (
                                <button
                                    onClick={async () => {
                                        await computeCountersignerEvidence()
                                        setStep(4)
                                    }}
                                    disabled={!hasCountersignerSignature || !countersignerLegalAck || !['WAITING_FOR_COUNTERSIGN', 'PAID'].includes(contractStatus)}
                                    className="select-plan-btn"
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        opacity: (hasCountersignerSignature && countersignerLegalAck && ['WAITING_FOR_COUNTERSIGN', 'PAID'].includes(contractStatus)) ? 1 : 0.5,
                                        cursor: (hasCountersignerSignature && countersignerLegalAck && ['WAITING_FOR_COUNTERSIGN', 'PAID'].includes(contractStatus)) ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Continue to Finalize
                                </button>
                            )}
                            {contractStatus === 'FULLY_EXECUTED' && (
                                <button
                                    onClick={() => setStep(4)}
                                    className="select-plan-btn"
                                    style={{ flex: 2, padding: '14px' }}
                                >
                                    View Executed Agreement
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ STEP 4: ROLE-AWARE EXECUTION ═══ */}
                {step === 4 && userRole !== 'provider' && (
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 4: Execute Agreement
                        </h3>

                        {/* Signature Preview - Show actual captured signature */}
                        <div style={{
                            background: 'rgba(200,169,81,0.08)',
                            border: '2px solid #C8A951',
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
                                Your Signature
                            </div>
                            {signatureImageData ? (
                                <img
                                    src={signatureImageData}
                                    alt="Your signature"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '120px',
                                        margin: '0 auto',
                                        display: 'block',
                                        borderRadius: '4px'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    fontFamily: "'Cinzel', serif",
                                    fontSize: '36px',
                                    color: '#C8A951',
                                    fontStyle: 'italic'
                                }}>
                                    {signatureData.name}
                                </div>
                            )}
                            <div style={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                marginTop: '12px'
                            }}>
                                Electronic Signature • Legally Binding
                            </div>
                        </div>

                        {/* ═══ DIGITAL SIGNATURE EVIDENCE PANEL ═══ */}
                        {signatureEvidence && (
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '24px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Header with shield icon */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '20px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}>🛡️</div>
                                    <div>
                                        <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            Digital Signature Evidence
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                                            Cryptographically Verified • Tamper-Evident
                                        </div>
                                    </div>
                                </div>

                                {/* Evidence Rows */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Envelope ID */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Envelope ID</span>
                                        <span style={{ color: '#C8A951', fontSize: '13px', fontFamily: "'Inter', monospace", fontWeight: 600 }}>{signatureEvidence.envelopeId}</span>
                                    </div>

                                    {/* SHA-256 Hash */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>SHA-256 Checksum</span>
                                        <span
                                            title={signatureEvidence.hash}
                                            style={{
                                                color: '#10b981',
                                                fontSize: '11px',
                                                fontFamily: "'Courier New', monospace",
                                                maxWidth: '220px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                cursor: 'help',
                                                marginLeft: '12px'
                                            }}
                                        >
                                            {signatureEvidence.hash}
                                        </span>
                                    </div>

                                    {/* Timestamp */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Timestamp (UTC)</span>
                                        <span style={{ color: 'white', fontSize: '12px', fontFamily: "'Inter', monospace" }}>{signatureEvidence.timestamp}</span>
                                    </div>

                                    {/* Signer Identity */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Signer</span>
                                        <span style={{ color: 'white', fontSize: '12px' }}>{signatureData.name} ({signatureData.email})</span>
                                    </div>

                                    {/* Signer Title */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Title</span>
                                        <span style={{ color: 'white', fontSize: '12px' }}>{signatureData.title}</span>
                                    </div>

                                    {/* Contract Reference */}
                                    {contractId && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contract ID</span>
                                            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: "'Courier New', monospace" }}>{contractId}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Compliance Footer */}
                                <div style={{
                                    marginTop: '16px',
                                    paddingTop: '12px',
                                    borderTop: '1px solid rgba(16, 185, 129, 0.15)',
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap'
                                }}>
                                    {['ESIGN Act', 'UETA', 'SOC 2 Type II', 'SHA-256'].map(badge => (
                                        <span key={badge} style={{
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            borderRadius: '4px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.2)',
                                            color: '#10b981',
                                            fontSize: '9px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}>{badge}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Payment Method Selector */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                background: 'rgba(255,255,255,0.05)',
                                padding: '4px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                marginBottom: '16px'
                            }}>
                                <button
                                    onClick={() => handleInputChange('selectedPaymentMethod', 'card')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: signatureData.selectedPaymentMethod === 'card' ? '#C8A951' : 'transparent',
                                        color: signatureData.selectedPaymentMethod === 'card' ? '#000' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        fontSize: '11px'
                                    }}
                                >
                                    💳 CARD
                                </button>
                                <button
                                    onClick={() => handleInputChange('selectedPaymentMethod', 'bank')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: signatureData.selectedPaymentMethod === 'bank' ? '#C8A951' : 'transparent',
                                        color: signatureData.selectedPaymentMethod === 'bank' ? '#000' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        fontSize: '11px'
                                    }}
                                >
                                    🏦 ACH (PLAID)
                                </button>
                                <button
                                    onClick={() => handleInputChange('selectedPaymentMethod', 'wire')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: signatureData.selectedPaymentMethod === 'wire' ? '#C8A951' : 'transparent',
                                        color: signatureData.selectedPaymentMethod === 'wire' ? '#000' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        fontSize: '11px'
                                    }}
                                >
                                    🏛️ WIRE (STRIPE)
                                </button>

                            </div>

                            {signatureData.selectedPaymentMethod === 'bank' && (
                                <div style={{
                                    padding: '16px',
                                    background: achLinked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(200, 169, 81, 0.1)',
                                    border: achLinked ? '1px solid #10b981' : '1px solid #C8A951',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    {achLinked ? (
                                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <span>✓ Bank Account Verified via Plaid</span>
                                        </div>
                                    ) : (
                                        <div style={{ color: '#C8A951', fontSize: '12px' }}>
                                            High-value settlement via Chase Treasury Bridge. Plaid verification required.
                                        </div>
                                    )}
                                </div>
                            )}

                            {signatureData.selectedPaymentMethod === 'wire' && (
                                <div style={{
                                    padding: '16px',
                                    background: 'rgba(200, 169, 81, 0.1)',
                                    border: '1px solid #C8A951',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#C8A951', fontSize: '12px' }}>
                                        Stripe virtual bank account will be generated for high-limit settlement.
                                    </div>
                                </div>
                            )}
                        </div>



                        {/* Payment Plan Selection - Royal Neo-Deco */}
                        <div style={{ marginBottom: '32px' }}>
                            <h4 style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: '18px',
                                color: '#C8A951',
                                marginBottom: '20px',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                letterSpacing: '0.15em'
                            }}>
                                Select Payment Plan
                            </h4>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                {([2, 3, 4] as const).map((months) => {
                                    const monthly = Math.round(totalInvestment / months)
                                    const isSelected = selectedPaymentPlan === months
                                    return (
                                        <button
                                            key={months}
                                            type="button"
                                            onClick={() => setSelectedPaymentPlan(months)}
                                            style={{
                                                flex: '1 1 0',
                                                maxWidth: '180px',
                                                padding: '24px 16px',
                                                borderRadius: '16px',
                                                border: isSelected
                                                    ? '2px solid #C8A951'
                                                    : '1px solid rgba(255,255,255,0.1)',
                                                background: isSelected
                                                    ? 'linear-gradient(145deg, rgba(200,169,81,0.2), rgba(200,169,81,0.05))'
                                                    : 'linear-gradient(145deg, rgba(20,30,60,0.8), rgba(10,15,30,0.9))',
                                                backdropFilter: 'blur(10px)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                textAlign: 'center',
                                                boxShadow: isSelected
                                                    ? '0 0 30px rgba(200,169,81,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                                                    : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                                                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)'
                                            }}
                                        >
                                            {/* Number Badge */}
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                margin: '0 auto 12px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: isSelected
                                                    ? 'linear-gradient(135deg, #C8A951, #D4AF37)'
                                                    : 'rgba(255,255,255,0.05)',
                                                border: isSelected
                                                    ? 'none'
                                                    : '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: isSelected
                                                    ? '0 0 20px rgba(200,169,81,0.5)'
                                                    : 'none'
                                            }}>
                                                <span style={{
                                                    fontFamily: "'Cinzel', serif",
                                                    fontSize: '24px',
                                                    fontWeight: 700,
                                                    color: isSelected ? '#0f172a' : 'rgba(255,255,255,0.7)'
                                                }}>
                                                    {months}
                                                </span>
                                            </div>

                                            {/* Label */}
                                            <div style={{
                                                fontSize: '10px',
                                                color: isSelected ? '#C8A951' : 'rgba(255,255,255,0.4)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.15em',
                                                marginBottom: '8px',
                                                fontWeight: 600
                                            }}>
                                                Monthly Payments
                                            </div>

                                            {/* Price */}
                                            <div style={{
                                                fontSize: '20px',
                                                color: isSelected ? '#C8A951' : 'white',
                                                fontWeight: 700,
                                                fontFamily: "'Inter', sans-serif"
                                            }}>
                                                ${monthly.toLocaleString()}
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: 400,
                                                    opacity: 0.7,
                                                    marginLeft: '2px'
                                                }}>/mo</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Total Summary */}
                            <div style={{
                                textAlign: 'center',
                                marginTop: '20px',
                                padding: '12px 20px',
                                background: 'rgba(200,169,81,0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(200,169,81,0.2)'
                            }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                    Total Investment:
                                </span>
                                <span style={{
                                    color: '#C8A951',
                                    fontWeight: 700,
                                    fontSize: '18px',
                                    marginLeft: '8px',
                                    fontFamily: "'Cinzel', serif"
                                }}>
                                    ${totalInvestment.toLocaleString()}
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.4)',
                                    fontSize: '11px',
                                    marginLeft: '12px'
                                }}>
                                    • First payment due upon execution
                                </span>
                            </div>

                            {/* View Executed Agreement (with signature evidence) */}
                            <button
                                onClick={openPrintableMSA}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    width: '100%',
                                    padding: '10px 16px',
                                    marginTop: '16px',
                                    background: 'rgba(16, 185, 129, 0.08)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    borderRadius: '8px',
                                    color: '#10B981',
                                    fontSize: '12px',
                                    fontFamily: "'Cinzel', serif",
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase' as const,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                📄 View & Download Executed Agreement
                            </button>
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '14px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setStep(3)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            <button
                                onClick={handleExecute}
                                disabled={loading}
                                className="select-plan-btn"
                                style={{
                                    flex: 2,
                                    padding: '16px',
                                    fontSize: '16px',
                                    letterSpacing: '0.1em',
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner" style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid rgba(0,0,0,0.1)',
                                            borderTop: '2px solid #000',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔐 Execute & Deploy Platform</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <p style={{
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '11px',
                            lineHeight: 1.6
                        }}>
                            By clicking "Execute & Deploy Platform", you are finalizing your electronic signature
                            and authorizing the commencement of development as per the Project Timeline.
                        </p>
                    </div>
                )}

                {/* ═══ STEP 4: PROVIDER FINALIZATION (ADR-014 Phase 2) ═══ */}
                {step === 4 && userRole === 'provider' && (
                    <div className="neo-glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: '#C8A951',
                            marginBottom: '24px',
                            textAlign: 'center'
                        }}>
                            Step 4: Finalize Agreement
                        </h3>

                        {/* Dual Signature Display */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            {/* Client Signature Block */}
                            <div style={{
                                flex: '1 1 280px',
                                background: 'rgba(16, 185, 129, 0.06)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    color: '#10b981', fontSize: '10px', textTransform: 'uppercase',
                                    letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 600
                                }}>
                                    ✓ Client Signature
                                </div>
                                {clientSignatureData?.signatureImageData && (
                                    <img
                                        src={clientSignatureData.signatureImageData}
                                        alt="Client signature"
                                        style={{
                                            maxWidth: '220px', maxHeight: '70px',
                                            display: 'block', margin: '0 auto 10px',
                                            borderRadius: '4px', opacity: 0.85
                                        }}
                                    />
                                )}
                                <div style={{ color: '#C8A951', fontSize: '14px', fontWeight: 600 }}>
                                    {clientSignatureData?.clientName || 'Client'}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                    {clientSignatureData?.clientEmail}
                                </div>
                                {clientSignatureData?.signatureHash && (
                                    <div style={{
                                        color: '#10b981', fontSize: '9px', fontFamily: "'Courier New', monospace",
                                        marginTop: '8px', wordBreak: 'break-all'
                                    }}>
                                        SHA-256: {clientSignatureData.signatureHash.substring(0, 24)}…
                                    </div>
                                )}
                            </div>

                            {/* Countersigner Signature Block */}
                            <div style={{
                                flex: '1 1 280px',
                                background: 'rgba(200, 169, 81, 0.06)',
                                border: '1px solid rgba(200, 169, 81, 0.3)',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    color: '#C8A951', fontSize: '10px', textTransform: 'uppercase',
                                    letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 600
                                }}>
                                    {countersignerEvidence ? '✓ Countersignature' : '⏳ Countersignature'}
                                </div>
                                {countersignerSignatureImageData ? (
                                    <img
                                        src={countersignerSignatureImageData}
                                        alt="Countersignature"
                                        style={{
                                            maxWidth: '220px', maxHeight: '70px',
                                            display: 'block', margin: '0 auto 10px',
                                            borderRadius: '4px'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        fontFamily: "'Cinzel', serif", fontSize: '24px',
                                        color: '#C8A951', fontStyle: 'italic', marginBottom: '10px'
                                    }}>
                                        {authUser?.displayName || counterpartyName}
                                    </div>
                                )}
                                <div style={{ color: '#C8A951', fontSize: '14px', fontWeight: 600 }}>
                                    {authUser?.displayName || counterpartyName}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                    {authUser?.email} • {entityLegalName}
                                </div>
                                {countersignerEvidence?.hash && (
                                    <div style={{
                                        color: '#C8A951', fontSize: '9px', fontFamily: "'Courier New', monospace",
                                        marginTop: '8px', wordBreak: 'break-all'
                                    }}>
                                        SHA-256: {countersignerEvidence.hash.substring(0, 24)}…
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Countersigner Evidence Panel */}
                        {countersignerEvidence && (
                            <div style={{
                                background: 'rgba(200, 169, 81, 0.05)',
                                border: '1px solid rgba(200, 169, 81, 0.3)',
                                borderRadius: '12px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    marginBottom: '16px', paddingBottom: '12px',
                                    borderBottom: '1px solid rgba(200, 169, 81, 0.2)'
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'rgba(200, 169, 81, 0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                                    }}>🛡️</div>
                                    <div style={{ color: '#C8A951', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Countersign Evidence
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Envelope ID</span>
                                        <span style={{ color: '#C8A951', fontSize: '12px', fontFamily: "'Inter', monospace", fontWeight: 600 }}>{countersignerEvidence.envelopeId}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', flexShrink: 0 }}>SHA-256</span>
                                        <span style={{
                                            color: '#10b981', fontSize: '10px', fontFamily: "'Courier New', monospace",
                                            maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', marginLeft: '12px'
                                        }}>{countersignerEvidence.hash}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Timestamp</span>
                                        <span style={{ color: 'white', fontSize: '12px' }}>{countersignerEvidence.timestamp}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Countersigner</span>
                                        <span style={{ color: 'white', fontSize: '12px' }}>{authUser?.displayName} ({authUser?.email})</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* View Executed Agreement */}
                        <button
                            onClick={openPrintableMSA}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '8px', width: '100%', padding: '10px 16px',
                                marginBottom: '24px',
                                background: 'rgba(16, 185, 129, 0.08)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '8px', color: '#10B981',
                                fontSize: '12px', fontFamily: "'Cinzel', serif",
                                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                                cursor: 'pointer'
                            }}
                        >
                            📄 View Executed Agreement
                        </button>

                        {error && (
                            <div style={{
                                padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid #ef4444', borderRadius: '8px',
                                color: '#ef4444', fontSize: '14px',
                                marginBottom: '20px', textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setStep(3)}
                                style={{
                                    flex: 1, padding: '14px', background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '8px', color: 'white', cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                            {contractStatus !== 'FULLY_EXECUTED' && (
                                <button
                                    onClick={handleCountersign}
                                    disabled={loading || !countersignerSignatureImageData}
                                    className="select-plan-btn"
                                    style={{
                                        flex: 2, padding: '16px', fontSize: '16px',
                                        letterSpacing: '0.1em',
                                        opacity: (loading || !countersignerSignatureImageData) ? 0.7 : 1,
                                        cursor: (loading || !countersignerSignatureImageData) ? 'wait' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner" style={{
                                                width: '20px', height: '20px',
                                                border: '2px solid rgba(0,0,0,0.1)',
                                                borderTop: '2px solid #000',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            <span>Countersigning...</span>
                                        </>
                                    ) : (
                                        <span>🛡️ Finalize & Countersign</span>
                                    )}
                                </button>
                            )}
                            {contractStatus === 'FULLY_EXECUTED' && (
                                <div style={{
                                    flex: 2, padding: '16px', textAlign: 'center',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '2px solid #10b981',
                                    borderRadius: '8px',
                                    color: '#10b981', fontFamily: "'Cinzel', serif",
                                    fontSize: '14px', letterSpacing: '0.1em'
                                }}>
                                    ✅ Fully Executed
                                </div>
                            )}
                        </div>

                        <p style={{
                            textAlign: 'center', color: 'rgba(255,255,255,0.4)',
                            fontSize: '11px', lineHeight: 1.6
                        }}>
                            By clicking "Finalize & Countersign", you are executing this agreement on behalf of{' '}
                            <strong style={{ color: '#C8A951' }}>{entityLegalName}</strong>, making it legally binding for both parties.
                        </p>
                    </div>
                )}
            </div>

            {/* MFA Gate Modal - Per AUTHORIZATION_POLICY.md Section 4.3 */}
            {showMFAGate && (
                <MFAGate
                    isFinancial={true}
                    demoMode={true}
                    onVerified={() => {
                        setMfaVerifiedForFinancial(true)
                        setShowMFAGate(false)
                        // Continue with execution after MFA verification
                        handleExecute()
                    }}
                    onCancel={() => {
                        setShowMFAGate(false)
                    }}
                />
            )}
        </div>
    )
}
