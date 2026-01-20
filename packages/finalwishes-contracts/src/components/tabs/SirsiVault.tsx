/**
 * Sirsi Vault Tab
 * Document signing and contract execution
 */
import { useState } from 'react'
import { useConfigStore } from '../../store/useConfigStore'
import { BUNDLES, calculateTotal } from '../../data/catalog'

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

    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)

    const handleInputChange = (field: string, value: string | boolean) => {
        setSignatureData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div style={{ paddingTop: '1rem', position: 'relative' }}>
            {/* VAULT HEADER */}
            <div style={{ maxWidth: '800px', margin: '0 auto 48px auto', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    marginBottom: '16px'
                }}>
                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        🔒 Secure Signing Environment
                    </span>
                </div>
                <h2 style={{
                    fontSize: '2.5rem',
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '16px'
                }}>
                    Sirsi Vault
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
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
                            onClick={() => {
                                // Persist client info to the store
                                setClientInfo(signatureData.name, signatureData.email)
                                setStep(2)
                            }}
                            disabled={!signatureData.name || !signatureData.email || !signatureData.title}
                            className="select-plan-btn"
                            style={{
                                width: '100%',
                                padding: '14px',
                                opacity: signatureData.name && signatureData.email && signatureData.title ? 1 : 0.5,
                                cursor: signatureData.name && signatureData.email && signatureData.title ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Continue to Document Review
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

                        <button
                            onClick={() => alert('Contract Executed! In production, this would submit to OpenSign and trigger the deposit payment.')}
                            className="select-plan-btn"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '16px',
                                letterSpacing: '0.1em'
                            }}
                        >
                            🔐 Execute & Deploy Platform
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
