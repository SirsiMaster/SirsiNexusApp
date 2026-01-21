/**
 * Master Agreement (MSA) Tab
 * Full legal agreement with terms and conditions
 */
import { useState } from 'react'
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { PRODUCTS, BUNDLES, calculateTotal } from '../../data/catalog'

export function MasterAgreement() {
    const [agreed, setAgreed] = useState(false)
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)

    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const bundle = selectedBundle ? BUNDLES[selectedBundle] : null
    const storeClientName = useConfigStore(state => state.clientName)
    const clientName = storeClientName || "Cylton Collymore" // Fallback to GEMINI.md Test Credentials
    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            {/* MSA HEADER */}
            <div style={{
                textAlign: 'center',
                marginBottom: '4rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(200,169,81,0.1)',
                    border: '1px solid rgba(200,169,81,0.3)',
                    borderRadius: '20px',
                    padding: '6px 20px',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: '#C8A951', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Governing Legal Framework
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
                    Master Service Agreement
                </h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '40px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#93c5fd',
                    opacity: 0.8
                }}>
                    <div><strong style={{ color: 'white' }}>Document:</strong> MSA-{currentYear}-111-FW</div>
                    <div><strong style={{ color: 'white' }}>Effective Date:</strong> {currentDate}</div>
                    <div><strong style={{ color: 'white' }}>Status:</strong> BINDING ENFORCEABLE</div>
                </div>
            </div>

            {/* LEGAL DOCUMENT VIEWER */}
            <div className="legal-viewer" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '60px',
                borderRadius: '4px',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Preamble */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ marginTop: 0, color: '#C8A951', fontFamily: "'Cinzel', serif" }}>Master Service Agreement</h2>
                    <p>
                        This Master Service Agreement ("Agreement") is entered into as of the Effective Date by and between:
                    </p>
                    <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ margin: '0 0 12px 0' }}>
                            <strong style={{ color: '#C8A951' }}>SERVICE PROVIDER:</strong> Sirsi Technology Partners, LLC, a Maryland Limited Liability Company ("Sirsi", "Provider", "We")
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: '#C8A951' }}>CLIENT:</strong> {clientName} / FinalWishes Platform ("Client", "You")
                        </p>
                    </div>
                </section>

                {/* Article 1 */}
                <section style={{ marginBottom: '48px' }}>
                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", borderBottom: '1px solid rgba(200,169,81,0.2)', paddingBottom: '8px' }}>
                        Article 1: Scope of Services
                    </h3>
                    <p>
                        <strong>1.1 Services.</strong> Provider agrees to provide Client with software development,
                        consulting, and related technology services as described in the Statement of Work(s)
                        ("SOW(s)") attached hereto and incorporated herein by reference.
                    </p>
                    <p>
                        <strong>1.2 Statements of Work.</strong> Each SOW shall specify the particular services to
                        be performed, deliverables, milestones, timeline, and compensation. In the event of any
                        conflict between this Agreement and a SOW, the terms of this Agreement shall prevail.
                    </p>
                </section>

                {/* Article 3: IP (Critical for Studio) */}
                <section style={{ marginBottom: '48px' }}>
                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", borderBottom: '1px solid rgba(200,169,81,0.2)', paddingBottom: '8px' }}>
                        Article 3: Intellectual Property
                    </h3>
                    <p>
                        <strong>3.1 Work Product Ownership.</strong> Upon full payment of all fees, all deliverables created specifically for Client under an SOW shall be deemed "Work Made for Hire" and shall be the exclusive property of Client.
                    </p>
                    <p>
                        <strong>3.2 Provider Tools & Nexus V4.</strong> Client acknowledges that Provider utilizes pre-existing intellectual property, including but not limited to the "Sirsi Nexus V4 Framework" and associated component libraries ("Provider Tools"). Provider grants Client a perpetual, royalty-free, worldwide license to use Provider Tools as integrated into the Deliverables.
                    </p>
                </section>

                {/* Dynamic Appendix A */}
                <section style={{ marginTop: '80px', paddingTop: '40px', borderTop: '2px solid #C8A951' }}>
                    <h2 style={{ color: '#C8A951', textAlign: 'center', fontFamily: "'Cinzel', serif" }}>Appendix A</h2>
                    <h4 style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '-10px', marginBottom: '40px' }}>Summary of Selected Software Modules</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {bundle && (
                            <div style={{ padding: '20px', background: 'rgba(200,169,81,0.05)', border: '1px solid #C8A951', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong style={{ color: 'white' }}>{bundle.name} (Core)</strong>
                                    <span style={{ color: '#C8A951' }}>INCLUDED</span>
                                </div>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                                    Full platform foundation including iOS, Android, and Web applications.
                                </p>
                            </div>
                        )}

                        {selectedAddons.map(id => {
                            const product = PRODUCTS[id]
                            if (!product) return null
                            return (
                                <div key={id} style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ color: 'white' }}>{product.name}</span>
                                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>ADD-ON MODULE</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                        {product.shortDescription}
                                    </p>
                                </div>
                            )
                        })}

                        {selectedAddons.length === 0 && !bundle && (
                            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                                No modules selected yet. Return to "Configure Solution" to build your platform.
                            </p>
                        )}
                    </div>
                </section>
            </div>

            {/* ACKNOWLEDGMENT SECTION */}
            <div style={{
                maxWidth: '1200px',
                margin: '48px auto',
                background: 'rgba(200,169,81,0.08)',
                border: '1px solid rgba(200,169,81,0.3)',
                borderRadius: '12px',
                padding: '32px'
            }}>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '18px',
                    color: '#C8A951',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    Agreement Acknowledgment
                </h3>
                <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    cursor: 'pointer'
                }}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        style={{ width: '20px', height: '20px', marginTop: '2px' }}
                    />
                    <span>
                        I, <strong style={{ color: '#C8A951' }}>{clientName}</strong>, have read, understand, and agree to be bound by the terms and conditions of this
                        Master Service Agreement. I acknowledge that this Agreement, together with the attached
                        Statement of Work, constitutes a binding legal contract for a total investment of <strong style={{ color: '#C8A951' }}>${totalInvestment.toLocaleString()}</strong>.
                    </span>
                </label>
            </div>

            {/* NEXT BUTTON */}
            <div style={{
                width: '100%',
                marginTop: '4rem',
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'flex-end',
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <button
                    onClick={() => setTab('vault')}
                    disabled={!agreed}
                    className="select-plan-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 24px',
                        opacity: agreed ? 1 : 0.5,
                        cursor: agreed ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span>Proceed to Signature</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
