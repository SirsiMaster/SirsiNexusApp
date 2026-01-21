/**
 * Master Agreement (MSA) Tab
 * Full legal agreement with terms and conditions
 * 
 * CANONICAL NOTICE: FULL-FIDELITY ENFORCEMENT
 * This component MUST maintain absolute parity with CONTRACT.md.
 * PER RULE 9: Under no circumstances shall the legal language herein be truncated, 
 * summarized, or shortened. All 11 articles must be presented in full.
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
    const clientName = storeClientName || "Tameeka Lockhart" // Default client for FinalWishes proposal
    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
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
                {/* Full MSA Content */}
                {/* Full MSA Content - VERBATIM REPRODUCTION PER RULE 9 */}
                <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}>

                    <section style={{ marginBottom: '48px' }}>
                        <h2 style={{ marginTop: 0, color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '28px', textAlign: 'center', letterSpacing: '0.1em' }}>MASTER SERVICES AGREEMENT (MSA)</h2>
                        <p style={{ marginTop: '24px' }}>
                            <strong>This Master Services Agreement ("Agreement") is entered into as of {currentDate} (the "Effective Date") by and between:</strong>
                        </p>
                        <ul style={{ listStyleType: 'none', paddingLeft: '20px', marginBottom: '24px' }}>
                            <li style={{ marginBottom: '12px' }}>
                                - <strong>{clientName}</strong>, CEO of <strong>FinalWishes Inc.</strong> ("Client"); and
                            </li>
                            <li>
                                - <strong>Sirsi Technologies, Inc.</strong>, a Delaware corporation (FEIN: 93-1696269), with its principal place of business at 909 Rose Avenue, Suite 400, North Bethesda MD 20852 ("Provider" or "Sirsi").
                            </li>
                        </ul>
                        <p>Client and Provider may be referred to individually as a "Party" and collectively as the "Parties".</p>

                        <div style={{ margin: '40px 0', borderTop: '1px solid rgba(200,169,81,0.2)' }}></div>

                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>1. RECITALS</h3>
                        <p><strong>WHEREAS</strong>, Client desires to engage Provider to design, develop, and implement a comprehensive estate settlement software platform known as <strong>FinalWishes</strong> (the "Platform");</p>
                        <p><strong>WHEREAS</strong>, Provider (Sirsi Technologies, Inc) possesses the requisite technical expertise, personnel, and infrastructure, including expertise in artificial intelligence, cloud architecture, and secure software development, to perform the Services;</p>
                        <p><strong>WHEREAS</strong>, the Platform is to be constructed utilizing Provider's proprietary <strong>Sirsi Nexus V4 Framework</strong> as the foundational architectural layer;</p>
                        <p><strong>WHEREAS</strong>, the Parties wish to set forth the terms and conditions under which Provider will provide such Services and license certain technologies to Client.</p>
                        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>2. DEFINITIONS</h3>
                        <p>For purposes of this Agreement, the following terms shall have the meanings set forth below:</p>
                        <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                            <li style={{ marginBottom: '16px' }}><strong>- "Affiliate"</strong> means any entity that directly or indirectly controls, is controlled by, or is under common control with a Party.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Background Technology" or "Sirsi Nexus V4"</strong> means all software, code, tools, libraries, frameworks, know-how, methodologies, and Intellectual Property Rights owned or licensed by Provider prior to the Effective Date or developed independently of the Services.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Confidential Information"</strong> means any non-public information disclosed by one Party to the other Party that is designated as confidential.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Deliverables"</strong> means all documents, work product, code, software, reports, and other materials that are specifically created for and delivered to Client by Provider pursuant to a Statement of Work.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Foreground IP"</strong> means the Intellectual Property Rights in the specific business logic, probate-specific scripts, and configurations developed strictly and exclusively for FinalWishes, excluding any Background Technology.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Intellectual Property Rights"</strong> means all patent rights, copyright rights, mask work rights, moral rights, trademark, and trade secret rights.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Services"</strong> means the professional software development, consulting, and design services to be performed by Provider.</li>
                            <li style={{ marginBottom: '16px' }}><strong>- "Statement of Work" or "SOW"</strong> means a document describing the specific Services to be performed and Deliverables to be provided.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>3. SERVICES AND ENGAGEMENT</h3>
                        <p><strong>3.1 Statements of Work.</strong> Provider shall provide the Services and Deliverables to Client as specified in each SOW. Each SOW shall be effectively incorporated into this Agreement.</p>
                        <p><strong>3.2 Standard of Performance.</strong> Provider represents and warrants that the Services will be performed in a professional, workmanlike manner, by qualified personnel, and consistent with the highest industry standards.</p>
                        <p><strong>3.3 Resource Commitment.</strong> Provider commits a **Lead Architect** (Cylton Collymore) at a minimum **60% time commitment** for the duration of the initial development and designates the Project as "Priority Status" within the Sirsi infrastructure.</p>
                        <p><strong>3.4 Review and Close Period.</strong> Following the launch of the Platform, Provider shall provide a **sixty (60) day** "Review and Close" period. During this time, Provider will provide reasonable support to ensure the Platform functions as specified in the SOW.</p>
                        <p><strong>3.5 Ongoing Maintenance & Support.</strong> Client acknowledges that any technical maintenance, feature updates, or priority SLA support beyond the initial 60-day period is **not included** in the base Service Fees and requires the separate purchase of the "Maintenance and Support" add-on.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>4. COMPENSATION AND PAYMENT</h3>
                        <p><strong>4.1 Total Contract Value.</strong> The total fixed price for the Services described in Exhibit A as configured in this builder reflects the use of the SirsiNexus accelerator and the extended support framework.</p>
                        <p><strong>4.2 Payment Terms.</strong> Provider shall submit invoices to Client upon completion of Milestones. Invoices are due and payable <strong>Net Fifteen (15)</strong> days from the invoice date via the Sirsi Vault payment gateway.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>5. INTELLECTUAL PROPERTY RIGHTS</h3>
                        <p><strong>5.1 Foreground IP (Work Made for Hire).</strong> Provider agrees that the <strong>Foreground IP</strong> (specific probate scripts, brand assets, and business logic created exclusively for Client) shall be considered "works made for hire" and owned 100% by Client upon payment of all fees.</p>
                        <p><strong>5.2 Background Technology (Sirsi Nexus V4 Retention).</strong> Notwithstanding Section 5.1, Provider retains all right, title, and interest in and to its <strong>Background Technology</strong> (the Sirsi Nexus V4 Framework). Provider hereby grants to Client a **perpetual, irrevocable, worldwide, royalty-free, and exclusive vertical license** to use, reproduce, and exploit the Background Technology *within the field of Estate Settlement and Probate Automation* for the purpose of operating the Platform.</p>
                        <p><strong>5.3 Third-Party and Open Source Software.</strong> The Deliverables may contain third-party software or open source software. Provider warrants that its use of such software will comply with the applicable licenses.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>6. CONFIDENTIALITY AND SECURITY</h3>
                        <p><strong>6.1 Obligations.</strong> The Receiving Party agrees: (i) to hold the Disclosing Party's Confidential Information in strict confidence; (ii) not to divulge any such Confidential Information to any third party; and (iii) not to use such Confidential Information except for the performance of this Agreement.</p>
                        <p><strong>6.2 Data Security & SOC 2 Compliance.</strong> Provider agrees to implement and maintain security measures—consistent with SOC 2 Type II criteria—to protect Client data. Provider shall maintain strict logical separation of Client's production data to ensure no leakage between the Platform and other Sirsi tenants.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>7. WARRANTIES AND COVENANTS</h3>
                        <p><strong>7.1 Provider Warranties.</strong> Provider represents and warrants that: (a) the Deliverables will be original; (b) Services will comply with all laws; and (c) Deliverables will be free of Malicious Code.</p>
                        <p><strong>7.2 Performance Warranty.</strong> The Performance Warranty is limited to the **sixty (60) day** Review and Close Period. Provider shall correct any material non-conformity with the Specifications at its sole expense during this period. Any requests for remediation following this period shall be governed by the terms of the Maintenance and Support add-on, if purchased.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>8. INDEMNIFICATION</h3>
                        <p><strong>8.1 By Provider.</strong> Provider shall indemnify and hold harmless Client from third-party claims alleging that the Deliverables or Services infringe any U.S. copyright, trademark, or trade secret.</p>
                        <p><strong>8.2 By Client.</strong> Client shall indemnify Provider from claims resulting from: (i) Client's specific instructions; or (ii) data provided by Client.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>9. LIMITATION OF LIABILITY</h3>
                        <p><strong>9.1 Exclusion.</strong> Neither Party shall be liable for indirect, incidental, or consequential damages.</p>
                        <p><strong>9.2 Cap.</strong> EACH PARTY'S TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE UNDER THE APPLICABLE SOW IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>10. TERM AND TERMINATION</h3>
                        <p><strong>10.1 Term.</strong> This Agreement shall continue in full force and effect until terminated or through the expiration of all SOWs and maintenance periods.</p>
                        <p><strong>10.2 Survival.</strong> Sections 2, 4, 5, 6, 7.3, 8, 9, 11, and the Non-Competition covenant shall survive any termination or expiration of this Agreement.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>11. GENERAL PROVISIONS</h3>
                        <p><strong>11.1 Independent Contractor.</strong> Provider is an independent contractor. No partnership or employment relationship is created.</p>
                        <p><strong>11.2 Market Vertical Non-Competition.</strong> Provider agrees that during the term of this Agreement and for a period of **three (3) years** thereafter, Provider shall not directly develop, market, or provide services for a competing **Estate Settlement, Probate Automation, or Legacy Planning** platform.</p>
                        <p><strong>11.3 Dispute Resolution.</strong> Negotiation followed by binding arbitration in **Wilmington, Delaware**. Governed by **Delaware Law**.</p>
                    </section>
                </div>

                {/* Appendix A Header */}
                <div style={{ margin: '80px 0 40px 0', borderTop: '2px solid #C8A951', paddingTop: '40px' }}>
                    <h2 style={{ color: '#C8A951', textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '24px' }}>EXHIBIT A: STATEMENT OF WORK (SOW)</h2>
                    <h4 style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '8px', marginBottom: '40px' }}>Summary of Selected Software Modules</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '60px' }}>
                    {bundle && (
                        <div style={{ padding: '24px', background: 'rgba(200,169,81,0.05)', border: '1px solid #C8A951', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <strong style={{ color: 'white', fontSize: '16px' }}>{bundle.name} (Core Platform)</strong>
                                <span style={{ color: '#C8A951', fontWeight: 700 }}>INCLUDED</span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
                                Full platform foundation including iOS, Android, and Web applications. Includes the "The Shepherd" logic engine, Vault security architecture, and multi-state probate support.
                            </p>
                        </div>
                    )}

                    {selectedAddons.map(id => {
                        const product = PRODUCTS[id]
                        if (!product) return null
                        return (
                            <div key={id} style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'white', fontWeight: 600 }}>{product.name}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Add-on Module</span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                                    {product.shortDescription}
                                </p>
                            </div>
                        )
                    })}

                    {selectedAddons.length === 0 && !bundle && (
                        <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: 0 }}>
                                No modules selected yet. Please return to the configuration tab to build your solution.
                            </p>
                        </div>
                    )}
                </div>
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
