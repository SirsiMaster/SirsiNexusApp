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

    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)
    const totalTimeline = calculateTimeline(selectedBundle, selectedAddons)

    // Market Value logic (approx 1.5x - 2x the bundled cost)
    const marketValue = totalInvestment * 1.6
    const savingsAmount = marketValue - totalInvestment
    const savingsPercent = Math.round((savingsAmount / marketValue) * 100)

    const bundle = selectedBundle ? BUNDLES[selectedBundle] : null

    return (
        <div style={{ paddingTop: '1rem', position: 'relative' }}>
            {/* PACKAGE OVERVIEW */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 48px auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h2 style={{
                        fontSize: '28px',
                        fontFamily: "'Cinzel', serif",
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em'
                    }}>
                        Project Valuation
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
                        Transparent pricing and deliverables allocation
                    </p>
                </div>

                {/* Package Card */}
                <div className="neo-glass-panel" style={{
                    padding: '32px',
                    background: 'rgba(200,169,81,0.05)',
                    border: '2px solid #C8A951',
                    boxShadow: '0 0 40px rgba(200,169,81,0.15)',
                    position: 'relative'
                }}>
                    {/* Selected Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#10b981',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 16px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        Selected
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            fontSize: '12px',
                            color: '#C8A951',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            marginBottom: '8px'
                        }}>
                            {bundle ? 'Unified Platform' : 'Custom Service Stack'}
                        </p>
                        <h3 style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '28px',
                            color: 'white',
                            marginBottom: '8px'
                        }}>
                            {bundle ? bundle.name : 'Standalone Solutions'}
                        </h3>

                        <div style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '56px',
                            color: '#C8A951',
                            fontWeight: 600,
                            margin: '16px 0'
                        }}>
                            ${totalInvestment.toLocaleString()}
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '24px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.8)'
                        }}>
                            <span>📱 iOS + Android + Web</span>
                            <span>⏱ {totalTimeline} Weeks</span>
                        </div>

                        <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            paddingTop: '20px',
                            textAlign: 'left',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <ul style={{
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.9)',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    lineHeight: 2
                                }}>
                                    {bundle ? bundle.features.slice(0, 4).map((f, i) => (
                                        <li key={i}>✓ {f}</li>
                                    )) : selectedAddons.slice(0, 4).map((id, i) => (
                                        <li key={i}>✓ {PRODUCTS[id]?.name}</li>
                                    ))}
                                </ul>
                                <ul style={{
                                    fontSize: '14px',
                                    color: 'rgba(255,255,255,0.9)',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    lineHeight: 2
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
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '48px',
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                {/* True Market Value */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '32px 24px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '12px',
                        fontWeight: 500
                    }}>
                        True Market Value
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontFamily: "'Cinzel', serif",
                        color: '#94a3b8',
                        textDecoration: 'line-through',
                        fontWeight: 400
                    }}>
                        ${marketValue.toLocaleString()}+
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginTop: '8px'
                    }}>
                        Custom Agency Dev
                    </div>
                </div>

                {/* Fixed Bid Price */}
                <div style={{
                    background: 'rgba(200,169,81,0.08)',
                    border: '2px solid #C8A951',
                    borderRadius: '8px',
                    padding: '32px 24px',
                    textAlign: 'center',
                    boxShadow: '0 0 40px rgba(200,169,81,0.15)'
                }}>
                    <div style={{
                        fontSize: '16px',
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        marginBottom: '12px',
                        fontWeight: 600
                    }}>
                        Fixed Bid Price
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontFamily: "'Cinzel', serif",
                        color: 'white',
                        fontWeight: 600
                    }}>
                        ${totalInvestment.toLocaleString()}
                    </div>
                </div>

                {/* Savings */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '32px 24px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '12px',
                        fontWeight: 500
                    }}>
                        Your Savings
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontFamily: "'Cinzel', serif",
                        color: '#10b981',
                        fontWeight: 400
                    }}>
                        {savingsPercent}%
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginTop: '8px'
                    }}>
                        Asset Leverage
                    </div>
                </div>

                {/* Timeline */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '32px 24px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '14px',
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '12px',
                        fontWeight: 500
                    }}>
                        Delivery
                    </div>
                    <div style={{
                        fontSize: '32px',
                        fontFamily: "'Cinzel', serif",
                        color: 'white',
                        fontWeight: 400
                    }}>
                        {totalTimeline} Weeks
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginTop: '8px'
                    }}>
                        Full Deployment
                    </div>
                </div>
            </div>

            {/* 1. COMPARATIVE MARKET ANALYSIS */}
            <div style={{ marginBottom: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                    <h2 style={{
                        fontSize: '28px',
                        fontFamily: "'Cinzel', serif",
                        color: '#C8A951',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        whiteSpace: 'nowrap'
                    }}>
                        1. Comparative Market Analysis
                    </h2>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', color: '#C8A951', fontFamily: "'Cinzel', serif" }}>Metric</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: 'white', fontFamily: "'Cinzel', serif" }}>FinalWishes Platform</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Cinzel', serif" }}>Typical Agency</th>
                                <th style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Cinzel', serif" }}>Freelance Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', color: 'white' }}>Total Investment</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>${totalInvestment.toLocaleString()} (Fixed)</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>${(totalInvestment * 2).toLocaleString()}</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>${(totalInvestment * 1.5).toLocaleString()}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', color: 'white' }}>Platforms</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#C8A951', fontWeight: 600 }}>iOS + Android + Web</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>iOS Only (Initial)</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Variable</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', color: 'white' }}>Time to Market</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#C8A951', fontWeight: 600 }}>{totalTimeline} Weeks</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{Math.round(totalTimeline * 1.5)}-{totalTimeline * 2} Weeks</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{Math.round(totalTimeline * 1.3)}-{Math.round(totalTimeline * 1.8)} Weeks</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px', color: 'white' }}>IP Ownership</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>100% Client Owned</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Restrictive</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Risky</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '16px', color: 'white' }}>AI Capability</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#C8A951', fontWeight: 600 }}>Gemini 3.5 Native</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Add-on Cost (High)</td>
                                <td style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Limited Expertise</td>
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
                    fontSize: '28px',
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em'
                }}>
                    2. Value Realization
                </h2>

                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(200,169,81,0.4)',
                    padding: '32px',
                    borderRadius: '8px'
                }}>
                    {/* Market Standard */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontSize: '20px', color: 'white' }}>Standard Agency (Estimated)</span>
                        <span style={{
                            fontSize: '24px',
                            fontFamily: "'Cinzel', serif",
                            color: '#94a3b8',
                            textDecoration: 'line-through'
                        }}>${marketValue.toLocaleString()}</span>
                    </div>

                    {/* Google Stack Acceleration */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0'
                    }}>
                        <span style={{ fontSize: '20px', color: 'white' }}>Google Stack Acceleration</span>
                        <span style={{ fontSize: '24px', fontFamily: "'Cinzel', serif", color: '#10b981' }}>−${Math.round(savingsAmount * 0.7).toLocaleString()}</span>
                    </div>

                    {/* Sirsi Value Components */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontSize: '20px', color: 'white' }}>Sirsi Value Components</span>
                        <span style={{ fontSize: '24px', fontFamily: "'Cinzel', serif", color: '#10b981' }}>−${Math.round(savingsAmount * 0.3).toLocaleString()}</span>
                    </div>

                    {/* Final Total */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '24px 0 12px 0'
                    }}>
                        <span style={{ fontSize: '20px', fontWeight: 600, color: '#C8A951' }}>Your Fixed Price</span>
                        <span style={{
                            fontSize: '28px',
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
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'flex-end',
                maxWidth: '1000px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <button
                    onClick={() => setTab('msa')}
                    className="select-plan-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 24px'
                    }}
                >
                    <span>Review Master Agreement</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
