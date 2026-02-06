/**
 * Statement of Work Tab
 * Dynamically generated document based on 22+ potential modules
 */
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { PRODUCTS, BUNDLES, calculateTotal, calculateTimeline, getAggregatedWBS, calculateTotalHours } from '../../data/catalog'

export function StatementOfWork() {
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const ceoConsultingWeeks = useConfigStore(state => state.ceoConsultingWeeks)
    const probateStates = useConfigStore(state => state.probateStates)
    const projectName = useConfigStore(state => state.projectName)

    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const totalInvestmentResult = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)
    const totalInvestment = totalInvestmentResult.total
    const totalTimeline = calculateTimeline(selectedBundle, selectedAddons, probateStates.length)
    const totalHours = calculateTotalHours(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)
    const aggregatedPhases = getAggregatedWBS(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)

    // Aggregate all detailed scope items from selections
    const allScopeItems: any[] = []
    if (selectedBundle && BUNDLES[selectedBundle].detailedScope) {
        allScopeItems.push(...BUNDLES[selectedBundle].detailedScope!)
    }
    selectedAddons.forEach(id => {
        const product = PRODUCTS[id]
        if (product && product.detailedScope) {
            allScopeItems.push(...product.detailedScope)
        }
    })

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* SOW HEADER */}
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
                        Project Documentation
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
                    Statement of Work
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
                    <div><strong style={{ color: 'white' }}>Project:</strong> {projectName} Platform</div>
                    <div><strong style={{ color: 'white' }}>Date:</strong> {currentDate}</div>
                    <div><strong style={{ color: 'white' }}>SOW:</strong> SOW-{currentYear}-001</div>
                    <div><strong style={{ color: 'white' }}>MSA:</strong> MSA-{currentYear}-111-FW</div>
                </div>
            </div>

            {/* SOW DOCUMENT CONTENT */}
            <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '40px',
                boxShadow: '0 4px 60px rgba(0,0,0,0.3)',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8
            }}>
                {/* 1. Executive Overview */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '20px',
                        color: '#C8A951',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(200,169,81,0.3)',
                        paddingBottom: '8px'
                    }}>
                        1. Executive Overview
                    </h3>
                    <p>
                        This Statement of Work ("SOW") defines the comprehensive scope for the
                        <strong> {projectName} Unified Platform</strong>.
                        {selectedBundle ? ' This engagement includes the full Core Platform foundation.' : ''}
                        {selectedAddons.length > 0 ? ` Additionally, ${selectedAddons.length} strategic modules have been integrated to expand platform capabilities.` : ''}
                    </p>
                    <p>
                        <strong style={{ color: '#C8A951' }}>Objective:</strong> Establish a permanent,
                        industrial-grade "Living Legacy" platform spanning iOS, Android, and Web, powered by Sirsi's
                        component library and Google Cloud's enterprise AI infrastructure.
                    </p>
                </section>

                {/* 2. Atomic Development Breakdown (WBS) */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '20px',
                        color: '#C8A951',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(200,169,81,0.3)',
                        paddingBottom: '8px'
                    }}>
                        2. Atomic Development Breakdown
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {aggregatedPhases.length > 0 ? aggregatedPhases.map((phase, idx) => (
                            <div key={idx} style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '15px',
                                borderRadius: '8px',
                                borderLeft: '3px solid #C8A951'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ color: '#C8A951', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
                                        Phase {phase.phaseNum}: {phase.name}
                                    </span>
                                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{phase.weeks} Weeks</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' }}>
                                    {phase.activities.map((act, i) => (
                                        <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                            • {act.name} ({act.hours}h)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Select a bundle or modules to generate breakdown.</p>
                        )}
                    </div>
                </section>

                {/* 3. Detailed Scope of Work */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '20px',
                        color: '#C8A951',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(200,169,81,0.3)',
                        paddingBottom: '8px'
                    }}>
                        3. Detailed Scope of Work
                    </h3>
                    <div>
                        {allScopeItems.length > 0 ? allScopeItems.map((scope, idx) => (
                            <div key={idx} style={{ marginBottom: '24px' }}>
                                <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
                                    {scope.title}
                                </h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '10px' }}>
                                    {scope.content}
                                </p>
                                <ul style={{ paddingLeft: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                                    {scope.subItems.map((item: string, i: number) => (
                                        <li key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Select products to populate detailed scope.</p>
                        )}
                    </div>
                </section>

                {/* 4. Project Investment & Timeline */}
                <section style={{ marginBottom: '40px' }}>
                    <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '20px',
                        color: '#C8A951',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(200,169,81,0.3)',
                        paddingBottom: '8px'
                    }}>
                        4. Timeline & Investment
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                        <div style={{ background: 'rgba(200,169,81,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Total Timeline</div>
                            <div style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>{totalTimeline} Weeks</div>
                        </div>
                        <div style={{ background: 'rgba(200,169,81,0.05)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Engineering Load</div>
                            <div style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>{totalHours} Hours</div>
                        </div>
                        <div style={{ background: 'rgba(200,169,81,0.1)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(200,169,81,0.3)' }}>
                            <div style={{ color: '#C8A951', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Total Investment</div>
                            <div style={{ color: '#C8A951', fontSize: '24px', fontWeight: 700 }}>${totalInvestment.toLocaleString()}</div>
                        </div>
                    </div>
                </section>
            </div>

            {/* NEXT BUTTON */}
            <div style={{
                width: '100%',
                marginTop: '4rem',
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={() => setTab('cost')}
                    className="select-plan-btn"
                >
                    <span>Proceed to Cost & Valuation</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginLeft: '12px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
