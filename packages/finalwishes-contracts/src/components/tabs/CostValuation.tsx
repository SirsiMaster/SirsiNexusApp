/**
 * Cost & Valuation Tab
 * Project pricing, market analysis, and value breakdown
 */
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { BUNDLES, PRODUCTS, calculateTotal, calculateTimeline } from '../../data/catalog'

export function CostValuation() {
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const ceoConsultingWeeks = useConfigStore(state => state.ceoConsultingWeeks)

    const totalInvestment = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks)
    const totalTimeline = calculateTimeline(selectedBundle, selectedAddons)

    // Market Value logic (approx 1.5x - 2x the bundled cost)
    const marketValue = (totalInvestment / 125) * 250
    const efficiencyDiscount = Math.round(marketValue * 0.25);
    const familyDiscount = marketValue - efficiencyDiscount - totalInvestment;

    const bundle = selectedBundle ? BUNDLES[selectedBundle] : null

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* PACKAGE OVERVIEW */}
            <div style={{ marginBottom: '48px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '2rem' }}>
                    <h2 style={{
                        fontSize: '3.5rem',
                        fontFamily: "'Cinzel', serif",
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '1rem'
                    }}>
                        Project Valuation
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)' }}>
                        Transparent fixed-bid investment and deliverables allocation
                    </p>
                </div>

                {/* Package Card */}
                <div className="neo-glass-panel" style={{
                    padding: '48px',
                    background: 'rgba(200,169,81,0.05)',
                    border: '2px solid #C8A951',
                    boxShadow: '0 0 60px rgba(200,169,81,0.15)',
                    position: 'relative',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#C8A951',
                            textTransform: 'uppercase',
                            letterSpacing: '0.25em',
                            marginBottom: '12px'
                        }}>
                            {bundle ? 'Unified Platform' : 'Custom Service Stack'}
                        </p>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '36px',
                            color: 'white',
                            marginBottom: '12px'
                        }}>
                            {bundle ? bundle.name : 'Standalone Solutions'}
                        </h3>

                        <div style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '72px',
                            color: '#C8A951',
                            fontWeight: 600,
                            margin: '24px 0'
                        }}>
                            ${totalInvestment.toLocaleString()}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '32px',
                            marginBottom: '32px',
                            fontSize: '16px',
                            color: 'rgba(255,255,255,0.8)'
                        }}>
                            <span>📱 iOS + Android + Web</span>
                            <span>⏱ {totalTimeline} Weeks Delivery</span>
                        </div>

                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '32px',
                            textAlign: 'left',
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <ul style={{
                                    fontSize: '15px',
                                    color: 'rgba(255,255,255,0.9)',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    lineHeight: 2.2
                                }}>
                                    {bundle ? bundle.features.slice(0, 4).map((f, i) => (
                                        <li key={i}>✓ {f}</li>
                                    )) : selectedAddons.slice(0, 4).map((id, i) => (
                                        <li key={i}>✓ {PRODUCTS[id]?.name}</li>
                                    ))}
                                </ul>
                                <ul style={{
                                    fontSize: '15px',
                                    color: 'rgba(255,255,255,0.9)',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    lineHeight: 2.2
                                }}>
                                    {bundle ? bundle.features.slice(4, 8).map((f, i) => (
                                        <li key={i}>✓ {f}</li>
                                    )) : selectedAddons.slice(4, 8).map((id, i) => (
                                        <li key={i}>✓ {PRODUCTS[id]?.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS GRID */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '32px',
                marginBottom: '64px',
                width: '100%'
            }}>
                {/* True Market Value */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '16px',
                        fontWeight: 500
                    }}>
                        Market Valuation
                    </div>
                    <div style={{
                        fontSize: '36px',
                        fontFamily: "'Cinzel', serif",
                        color: 'rgba(255,255,255,0.3)',
                        textDecoration: 'line-through',
                        fontWeight: 400
                    }}>
                        ${marketValue.toLocaleString()}+
                    </div>
                    <p style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Custom Agency Development
                    </p>
                </div>

                {/* Fixed Bid Price */}
                <div style={{
                    background: 'rgba(200,169,81,0.08)',
                    border: '2px solid #C8A951',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(200,169,81,0.1)'
                }}>
                    <div style={{
                        fontSize: '16px',
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        marginBottom: '16px',
                        fontWeight: 600
                    }}>
                        Sirsi Fixed Price
                    </div>
                    <div style={{
                        fontSize: '40px',
                        fontFamily: "'Cinzel', serif",
                        color: 'white',
                        fontWeight: 600
                    }}>
                        ${totalInvestment.toLocaleString()}
                    </div>
                    <p style={{
                        fontSize: '11px',
                        color: '#C8A951',
                        marginTop: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        End-to-End Delivery
                    </p>
                </div>


                {/* Timeline */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '40px 32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '16px',
                        fontWeight: 500
                    }}>
                        Strategic Timeline
                    </div>
                    <div style={{
                        fontSize: '36px',
                        fontFamily: "'Cinzel', serif",
                        color: 'white',
                        fontWeight: 400
                    }}>
                        {totalTimeline} Weeks
                    </div>
                    <p style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Accelerated Launch
                    </p>
                </div>
            </div>

            {/* 1. COMPARATIVE MARKET ANALYSIS */}
            <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '48px' }}>
                    <div style={{ height: '1px', background: 'rgba(200, 169, 81, 0.2)', flex: 1 }} />
                    <h2 style={{
                        fontSize: '2rem',
                        fontFamily: "'Cinzel', serif",
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        whiteSpace: 'nowrap'
                    }}>
                        1. Market Comparison
                    </h2>
                    <div style={{ height: '1px', background: 'rgba(200, 169, 81, 0.2)', flex: 1 }} />
                </div>

                <div style={{ width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '24px', textAlign: 'left', color: '#C8A951', fontFamily: "'Cinzel', serif", textTransform: 'uppercase', fontSize: '12px' }}>Value Metric</th>
                                <th style={{ padding: '24px', textAlign: 'center', color: 'white', fontFamily: "'Cinzel', serif", textTransform: 'uppercase', fontSize: '12px' }}>Sirsi Platform</th>
                                <th style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Cinzel', serif", textTransform: 'uppercase', fontSize: '12px' }}>Traditional Agency</th>
                                <th style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Cinzel', serif", textTransform: 'uppercase', fontSize: '12px' }}>Freelance Cloud</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '24px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Investment Structure</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>Fixed Bid</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Estimates Only</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Hourly/Variable</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '24px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Technical Stack</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: '#C8A951', fontWeight: 600 }}>Nexus V4 Core</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>From Scratch</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Third-party</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '24px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Intelligence Integration</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: '#C8A951', fontWeight: 600 }}>Gemini Native</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>External APIs</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Limited</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '24px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Intellectual Property</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>Full Client Ownership</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Restricted Use</td>
                                <td style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Uncertain</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 2. VALUE REALIZATION */}
            <div style={{ marginBottom: '96px' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '48px',
                    fontSize: '2rem',
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                }}>
                    2. Strategic Scaling
                </h2>

                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(200,169,81,0.3)',
                    padding: '48px',
                    borderRadius: '12px'
                }}>
                    {/* Market Standard */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)' }}>Market Infrastructure Cost</span>
                        <span style={{
                            fontSize: '1.5rem',
                            fontFamily: "'Cinzel', serif",
                            color: 'rgba(255,255,255,0.3)',
                            textDecoration: 'line-through'
                        }}>${marketValue.toLocaleString()}</span>
                    </div>

                    {/* Sirsi Efficiencies */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div>
                            <div style={{ fontSize: '1.25rem', color: 'white' }}>Sirsi Efficiency & Strategic Discounts</div>
                            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Nexus V4 Shared Libraries & Engine</div>
                        </div>
                        <span style={{ fontSize: '1.5rem', fontFamily: "'Cinzel', serif", color: '#10b981' }}>−${(efficiencyDiscount + familyDiscount).toLocaleString()}</span>
                    </div>

                    {/* Final Total */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '32px 0 0 0'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#C8A951', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Service Investment</span>
                        <span style={{
                            fontSize: '2.5rem',
                            fontFamily: "'Cinzel', serif",
                            fontWeight: 600,
                            color: '#C8A951'
                        }}>${totalInvestment.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* NEXT BUTTON */}
            <div style={{
                width: '100%',
                marginTop: '4rem',
                marginBottom: '6rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <button
                    onClick={() => setTab('msa')}
                    className="select-plan-btn"
                    style={{
                        padding: '16px 40px',
                        fontSize: '18px'
                    }}
                >
                    Review Master Agreement →
                </button>
            </div>
        </div>

    )
}
