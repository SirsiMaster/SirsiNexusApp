/**
 * Sirsi Vault Tab
 * Document signing and contract execution
 */
import { useState } from 'react'
import { useConfigStore } from '../../store/useConfigStore'
import { BUNDLES, calculateTotal } from '../../data/catalog'
import { contractsClient } from '../../lib/grpc'
import { getStripe } from '../../lib/stripe'
import { downloadContractPdf } from '../../lib/pdf'

export function SirsiVault() {
    const [step, setStep] = useState(1)
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const setClientInfo = useConfigStore(state => state.setClientInfo)

    const [signatureData, setSignatureData] = useState({
        name: '',
        email: '',
        title: '',
        agreed: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [contractId, setContractId] = useState<string | null>(null)

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)

    const handleInputChange = (field: string, value: string | boolean) => {
        setSignatureData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreateDraft = async () => {
        if (contractId) return; // Already created
        setLoading(true);
        setError(null);
        try {
            const contract = await contractsClient.createContract({
                projectId: 'finalwishes',
                projectName: 'FinalWishes Platform',
                clientName: signatureData.name,
                clientEmail: signatureData.email,
                totalAmount: BigInt(totalInvestment * 100),
                paymentPlans: [
                    {
                        id: 'deposit',
                        name: 'Initial Deposit',
                        description: '10% Commencement Deposit',
                        paymentCount: 1,
                        monthlyAmount: BigInt(Math.round(totalInvestment * 0.1 * 100)),
                        totalAmount: BigInt(Math.round(totalInvestment * 0.1 * 100))
                    }
                ],
                theme: {
                    primaryColor: '#C8A951',
                    secondaryColor: '#0f172a',
                    accentColor: '#10B981',
                    fontHeading: 'Cinzel',
                    fontBody: 'Inter'
                }
            });
            setContractId(contract.id);
        } catch (err: any) {
            console.error('Failed to create draft:', err);
            setError('Failed to initialize contract session.');
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        if (!contractId) return;
        setLoading(true)
        setError(null)
        try {
            // 1. Update status to SIGNED
            await contractsClient.updateContract({
                id: contractId,
                contract: {
                    status: 3 // SIGNED
                } as any
            });

            // 2. Create the checkout session for the deposit
            const session = await contractsClient.createCheckoutSession({
                contractId: contractId,
                planId: 'deposit',
                successUrl: window.location.origin + '/payment/success?session_id={CHECKOUT_SESSION_ID}',
                cancelUrl: window.location.href
            })

            // 3. Redirect to Stripe
            if (session.checkoutUrl) {
                window.location.href = session.checkoutUrl
            } else if (session.sessionId) {
                const stripe = await getStripe()
                if (stripe) {
                    await (stripe as any).redirectToCheckout({ sessionId: session.sessionId })
                }
            }
        } catch (err: any) {
            console.error('Execution failed:', err)
            setError(err.message || 'Failed to execute contract. Please try again.')
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
                    { num: 3, label: 'Execute Agreement' }
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
                                        <span style={{ color: 'white' }}>FinalWishes Master Agreement</span>
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
                                onClick={() => contractId && downloadContractPdf(contractId)}
                                disabled={!contractId}
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
                                    cursor: contractId ? 'pointer' : 'not-allowed',
                                    opacity: contractId ? 1 : 0.5,
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
                            Step 3: Execute Agreement
                        </h3>

                        {/* Signature Preview */}
                        <div style={{
                            background: 'rgba(200,169,81,0.08)',
                            border: '2px solid #C8A951',
                            borderRadius: '12px',
                            padding: '32px',
                            marginBottom: '24px',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative line */}
                            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', height: '1px', background: 'rgba(200,169,81,0.3)' }} />

                            <div style={{
                                fontFamily: "'Cinzel', serif",
                                fontSize: '36px',
                                color: '#C8A951',
                                marginBottom: '8px',
                                fontStyle: 'italic',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                {signatureData.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                Cryptographic Electronic Signature
                            </div>
                        </div>

                        {/* Signature Details */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '24px',
                            fontSize: '13px'
                        }}>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Signer</div>
                                <div style={{ color: 'white' }}>{signatureData.name} ({signatureData.title})</div>
                            </div>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Date</div>
                                <div style={{ color: 'white' }}>{currentDate}</div>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Platform Certificate ID</div>
                                <div style={{ color: '#10b981', fontFamily: 'monospace' }}>SIRSI-VAULT-{(Math.random() * 1000000).toFixed(0)}-EXEC</div>
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

                        <button
                            onClick={handleExecute}
                            disabled={loading}
                            className="select-plan-btn"
                            style={{
                                width: '100%',
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

                        <p style={{
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '11px',
                            marginTop: '20px',
                            lineHeight: 1.6
                        }}>
                            By clicking "Execute & Deploy Platform", you are applying your electronic signature
                            and authorizing the commencement of development as per the Project Timeline.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
