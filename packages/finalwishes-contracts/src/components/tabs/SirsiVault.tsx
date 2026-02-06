/**
 * Sirsi Vault Tab
 * Document signing and contract execution
 * 
 * MFA ENFORCEMENT: Per AUTHORIZATION_POLICY.md Section 4.3, MFA is required
 * before accessing financial services (Plaid, Stripe bank transfers)
 */
import { useState } from 'react'
import { useConfigStore } from '../../store/useConfigStore'
import { BUNDLES, calculateTotal, calculateTimeline, calculateTotalHours } from '../../data/catalog'
import { contractsClient } from '../../lib/grpc'
import { getStripe } from '../../lib/stripe'
import { SignatureCapture } from '../vault/SignatureCapture'
import { MFAGate } from '../auth/MFAGate'
import { usePlaidLink } from 'react-plaid-link'
import { useEffect } from 'react'

export function SirsiVault() {
    const [step, setStep] = useState(1)
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const storeProjectId = useConfigStore(state => state.projectId)
    const projectName = useConfigStore(state => state.projectName)
    const setClientInfo = useConfigStore(state => state.setClientInfo)
    const entityLegalName = useConfigStore(state => state.entityLegalName)
    const counterpartyName = useConfigStore(state => state.counterpartyName)

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
    const contractId = useConfigStore(state => state.contractId)
    const setStoreContractId = useConfigStore(state => state.setContractId)
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<2 | 3 | 4>(2)

    // Plaid State
    const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null)
    const [achLinked, setAchLinked] = useState(false)

    // MFA State - Per AUTHORIZATION_POLICY.md Section 4.3
    const [showMFAGate, setShowMFAGate] = useState(false)
    const [mfaVerifiedForFinancial, setMfaVerifiedForFinancial] = useState(false)

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
    const sirsiMultiplier = useConfigStore(state => state.sirsiMultiplier)

    const totalInvestmentResult = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length, sirsiMultiplier)
    const totalInvestment = totalInvestmentResult.total

    const openPrintableMSA = () => {
        const timeline = calculateTimeline(selectedBundle, selectedAddons, probateStates.length) // weeks
        const hours = calculateTotalHours(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length) // total dev hours
        const counterpartyTitle = useConfigStore.getState().counterpartyTitle
        const msaUrl = `/finalwishes/contracts/printable-msa.html?client=${encodeURIComponent(signatureData.name)}&date=${encodeURIComponent(currentDate)}&plan=${selectedPaymentPlan}&total=${totalInvestment}&weeks=${timeline}&hours=${hours}&addons=${selectedAddons.join(',')}&ceoWeeks=${ceoConsultingWeeks}&probateCount=${probateStates.length}&multiplier=${sirsiMultiplier}&entity=${encodeURIComponent(entityLegalName)}&cpName=${encodeURIComponent(counterpartyName)}&cpTitle=${encodeURIComponent(counterpartyTitle)}&bundle=${selectedBundle || ''}`
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
            // Generate Cryptographic Hash of Signature
            const sigHash = signatureImageData ? await hashSignature(signatureImageData) : '';
            console.log(`🔐 Generated Signature Hash: ${sigHash}`);
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
                        legalAcknowledgment: (document.getElementById('legal-ack') as HTMLInputElement)?.checked || false,
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

                // If ACH is already linked or Card is selected, proceed to final confirmation/checkout
                if (signatureData.selectedPaymentMethod === 'bank' && achLinked) {
                    // For ACH, we've already stored the btok on the backend. 
                    // We could trigger a payment intent here or redirect to a success page.
                    alert('Bank transfer successfully authorized. Settlement will begin within 24 hours. Redirecting to confirmation...');
                    window.location.href = `/contracts/${storeProjectId}/payment/success?method=ach&contract=${contractId}`;
                    return;
                }

                // 2. Create the checkout session for the first payment
                const paymentMethodTypes = []
                if (signatureData.selectedPaymentMethod === 'card') paymentMethodTypes.push('card')
                if (signatureData.selectedPaymentMethod === 'bank') paymentMethodTypes.push('us_bank_account')
                if (signatureData.selectedPaymentMethod === 'wire') paymentMethodTypes.push('customer_balance')

                const session = await contractsClient.createCheckoutSession({
                    contractId: contractId,
                    planId: 'payment-1', // First payment plan
                    successUrl: window.location.origin + `/contracts/${storeProjectId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: window.location.href,
                    paymentMethodTypes: paymentMethodTypes,
                    stripeConnectAccountId: '' // Future: Map to project-specific Connect account
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
                project: projectName || 'FinalWishes',
                ref: `MSA-${new Date().getFullYear()}-111-FW`
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
                    Execute your contract in our secure document vault. All signatures are timestamped
                    and cryptographically verified.
                </p>
            </div>

            {/* PROGRESS STEPS */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '48px',
                marginBottom: '48px'
            }}>
                {[
                    { num: 1, label: 'Verify Identity' },
                    { num: 2, label: 'Review Documents' },
                    { num: 3, label: 'Sign Agreement' },
                    { num: 4, label: 'Execute Agreement' }
                ].map((s) => (
                    <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                {step === 1 && (
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

                {step === 3 && (
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
                                onClick={() => setStep(4)}
                                disabled={!hasSignature}
                                className="select-plan-btn"
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    opacity: hasSignature ? 1 : 0.5,
                                    cursor: hasSignature ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Continue to Execution
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
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
