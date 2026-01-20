/**
 * Configure Solution Tab
 * PIXEL-PERFECT MIGRATION from index.html renderOfferings
 */
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { PRODUCTS, calculateTotal, calculateTimeline } from '../../data/catalog'

export function ConfigureSolution() {
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const setSelectedBundle = useConfigStore(state => state.setSelectedBundle)
    const toggleAddon = useConfigStore(state => state.toggleAddon)

    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)
    const estimatedTimeline = calculateTimeline(selectedBundle, selectedAddons)
    const itemCount = (selectedBundle ? 1 : 0) + selectedAddons.length

    const bundleSelected = selectedBundle === 'finalwishes-core'
    const standaloneSelected = !bundleSelected && selectedAddons.length > 0

    return (
        <div style={{ padding: '0 2rem' }}>
            {/* SECTION HEADER - CONFIGURE YOUR SOLUTION */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '1.5rem',
                    lineHeight: '1.2'
                }}>
                    Configure Your Solution
                </h2>
                <p style={{
                    fontSize: '1.125rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.6
                }}>
                    Select your core platform and strategic add-on modules. Your selections will generate a custom Statement of Work.
                </p>
            </div>

            {/* 1. CHOOSE YOUR PATH */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#C8A951',
                    fontSize: '2.25rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '4rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    lineHeight: '2.5rem'
                }}>
                    1. Choose Your Path
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>

                    {/* OPTION 1: Core Platform Bundle */}
                    <div
                        className={`neo-card-gold ${bundleSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedBundle('finalwishes-core')}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${bundleSelected ? '#10B981' : '#C8A951'}`,
                            background: bundleSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(200, 169, 81, 0.05)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            padding: '24px'
                        }}
                    >
                        {/* Selection Indicator */}
                        <div style={{
                            position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '50%',
                            border: `2px solid ${bundleSelected ? '#10B981' : 'rgba(255,255,255,0.3)'}`,
                            background: bundleSelected ? '#10B981' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {bundleSelected && <span style={{ color: 'white', fontWeight: 'bold' }}>✓</span>}
                        </div>

                        {/* ROW 1: Badge */}
                        <div style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #C8A951, #D4AF37)', color: '#000', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ✨ Recommended
                            </div>
                        </div>

                        {/* ROW 2: Title */}
                        <div style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '17px', color: 'white', margin: 0, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                                FinalWishes Core Platform
                            </h3>
                        </div>

                        {/* ROW 3: Subtitle */}
                        <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                            <p style={{ fontSize: '9px', color: '#C8A951', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
                                Complete Digital Legacy Solution
                            </p>
                        </div>

                        {/* ROW 4: Price Box */}
                        <div style={{ height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px' }}>Investment</div>
                            <div style={{ color: 'white', fontFamily: 'Cinzel, serif', fontSize: '24px', fontWeight: 600 }}>$95,000</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginTop: '4px' }}>16 Week Delivery</div>
                        </div>

                        {/* ROW 5: Highlight Box */}
                        <div style={{ height: '44px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ color: '#10B981', fontWeight: 700, fontSize: '11px' }}>💰 Add-ons cost 33% less</span>
                        </div>

                        {/* ROW 6: Label */}
                        <div style={{ height: '20px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's Included:</div>
                        </div>

                        {/* ROW 7: List */}
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
                            <li>iOS & Android Native Apps</li>
                            <li>Web Application (React)</li>
                            <li>"The Shepherd" AI Foundation</li>
                            <li>Secure Cloud Infrastructure</li>
                            <li>Legacy Media Vault</li>
                            <li>Digital Lockbox Storage</li>
                            <li>Beneficiary Management</li>
                            <li>User Authentication & MFA</li>
                        </ul>
                    </div>

                    {/* OPTION 2: Standalone Services */}
                    <div
                        className={`neo-card-gold ${standaloneSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedBundle(null)}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${standaloneSelected ? '#10B981' : 'rgba(255,255,255,0.2)'}`,
                            background: standaloneSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            padding: '24px'
                        }}
                    >
                        {/* Selection Indicator */}
                        <div style={{
                            position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', borderRadius: '50%',
                            border: `2px solid ${standaloneSelected ? '#10B981' : 'rgba(255,255,255,0.3)'}`,
                            background: standaloneSelected ? '#10B981' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {standaloneSelected && <span style={{ color: 'white', fontWeight: 'bold' }}>✓</span>}
                        </div>

                        <div style={{ height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '6px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                À La Carte
                            </div>
                        </div>

                        <div style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '17px', color: 'white', margin: 0, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                                Standalone Services
                            </h3>
                        </div>

                        <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                            <p style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
                                Individual Module Selection
                            </p>
                        </div>

                        <div style={{ height: '90px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px' }}>Starting From</div>
                            <div style={{ color: 'white', fontFamily: 'Cinzel, serif', fontSize: '24px', fontWeight: 600 }}>$18,000</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginTop: '4px' }}>Per Individual Module</div>
                        </div>

                        <div style={{ height: '44px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <span style={{ color: '#f87171', fontWeight: 600, fontSize: '11px' }}>⚠️ No bundle discounts</span>
                        </div>

                        <div style={{ height: '20px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Services:</div>
                        </div>

                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                            <li>Branding & Identity</li>
                            <li>Maintenance & Support</li>
                            <li>Estate Administration</li>
                            <li>Probate Engine</li>
                            <li>Secure Communications</li>
                            <li>Virtual Memorial Services</li>
                            <li>Advanced Asset Discovery</li>
                            <li style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>+ More modules available</li>
                        </ul>
                    </div>
                </div>

                {/* Callout */}
                <div style={{
                    textAlign: 'center', margin: '24px auto 0 auto', padding: '16px',
                    background: (bundleSelected || standaloneSelected) ? 'rgba(200, 169, 81, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${(bundleSelected || standaloneSelected) ? 'rgba(200, 169, 81, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px', maxWidth: '1000px'
                }}>
                    <span style={{ color: (bundleSelected || standaloneSelected) ? '#C8A951' : 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '14px' }}>
                        {bundleSelected ? '✓ Core Platform Bundle selected — add-on discounts unlocked!' : ''}
                        {standaloneSelected ? '✓ Standalone path selected — select individual services below' : ''}
                        {!bundleSelected && !standaloneSelected ? 'Click a card above to select your path' : ''}
                    </span>
                </div>
            </div>

            {/* 2. STRATEGIC ADD-ON MODULES */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#C8A951',
                    fontSize: '2.25rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '4rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    lineHeight: '2.5rem'
                }}>
                    2. Strategic Add-On Modules
                </h2>

                <div className="neo-glass-panel" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.125rem', lineHeight: 1.75, color: 'rgba(255, 255, 255, 0.9)' }}>
                        Enhance your platform with specialized modules designed for long-term growth and operational efficiency.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {Object.values(PRODUCTS).filter(p => p.category !== 'platform').map(item => {
                        const inCart = selectedAddons.includes(item.id)
                        const standPrice = item.standalonePrice || Math.round(item.bundledPrice * 1.5)
                        const currPrice = bundleSelected ? item.bundledPrice : standPrice
                        const showSavings = bundleSelected && standPrice > item.bundledPrice

                        return (
                            <div
                                key={item.id}
                                onClick={() => toggleAddon(item.id)}
                                className={`addon-card ${inCart ? 'selected' : ''}`}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: `1px solid ${inCart ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(200, 169, 81, 0.1)', borderRadius: '8px', color: '#C8A951' }}>
                                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '4px', border: inCart ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                        background: inCart ? '#10B981' : 'transparent', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {inCart ? '✓' : ''}
                                    </div>
                                </div>

                                <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
                                    {item.name}
                                </h4>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    {showSavings && <span style={{ color: '#64748b', textDecoration: 'line-through', fontSize: '16px' }}>${standPrice.toLocaleString()}</span>}
                                    <span style={{ color: '#C8A951', fontWeight: 'bold', fontSize: '24px' }}>${currPrice.toLocaleString()}</span>
                                    {showSavings && <span style={{ color: '#10B981', fontSize: '11px', fontWeight: 600, background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>SAVE ${(standPrice - item.bundledPrice).toLocaleString()}</span>}
                                </div>

                                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>{item.timeline} {item.timelineUnit}</div>
                                <p style={{ fontSize: '0.875rem', color: 'rgba(147, 197, 253, 0.8)', lineHeight: 1.6, margin: 0 }}>
                                    {item.shortDescription}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SELECTION SUMMARY */}
            <div className="summary-box" style={{ maxWidth: '1000px', margin: '4rem auto 2rem auto', padding: '24px', border: '1px solid rgba(200, 169, 81, 0.3)', borderRadius: '12px', background: 'rgba(200, 169, 81, 0.08)' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#C8A951', marginBottom: '24px', textAlign: 'center', marginTop: 0 }}>
                    4. Selection Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Selected Items</div>
                        <div style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>{itemCount}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated Investment</div>
                        <div style={{ color: '#C8A951', fontSize: '24px', fontWeight: 600 }}>${totalInvestment.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Timeline</div>
                        <div style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>{estimatedTimeline} Weeks</div>
                    </div>
                </div>
            </div>

            {/* NEXT BUTTON */}
            <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '6rem' }}>
                <button
                    onClick={() => setTab('sow')}
                    className="select-plan-btn"
                >
                    Review Statement of Work →
                </button>
            </div>
        </div>
    )
}
