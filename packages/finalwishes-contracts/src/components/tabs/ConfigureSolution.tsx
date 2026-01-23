/**
 * Configure Solution Tab
 * PIXEL-PERFECT MIGRATION from index.html renderOfferings
 */
import { useState } from 'react'
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { PRODUCTS, calculateTotal, calculateTimeline } from '../../data/catalog'

export function ConfigureSolution() {
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const setSelectedBundle = useConfigStore(state => state.setSelectedBundle)
    const toggleAddon = useConfigStore(state => state.toggleAddon)
    const ceoConsultingWeeks = useConfigStore(state => state.ceoConsultingWeeks)
    const setCeoConsultingWeeks = useConfigStore(state => state.setCeoConsultingWeeks)
    const probateStates = useConfigStore(state => state.probateStates)
    const toggleProbateState = useConfigStore(state => state.toggleProbateState)

    const [flippedCard, setFlippedCard] = useState<string | null>(null)

    const totalInvestment = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)
    const estimatedTimeline = calculateTimeline(selectedBundle, selectedAddons)
    const itemCount = (selectedBundle ? 1 : 0) + selectedAddons.length

    const bundleSelected = selectedBundle === 'finalwishes-core'
    const standaloneSelected = !bundleSelected && selectedAddons.length > 0

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* SECTION HEADER - CONFIGURE YOUR SOLUTION */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    fontSize: '3.5rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '1.5rem',
                    lineHeight: '1.2'
                }}>
                    Configure Your Solution
                </h2>
                <p style={{
                    fontSize: '1.25rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    maxWidth: '800px',
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', width: '100%', margin: '0 auto' }}>

                    {/* OPTION 1: Core Platform Bundle */}
                    <div
                        onClick={() => setSelectedBundle('finalwishes-core')}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${bundleSelected ? '#10B981' : '#C8A951'}`,
                            background: bundleSelected
                                ? 'linear-gradient(145deg, #0f3d2e, #0a2820)'
                                : 'linear-gradient(145deg, #141e3c, #0a0f1e)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
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
                            <div style={{ background: 'linear-gradient(135deg, #C8A951, #D4AF37)', color: '#000', padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                ✨ Recommended
                            </div>
                        </div>

                        {/* ROW 2: Title */}
                        <div style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: 'white', margin: 0, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                                FinalWishes Core Platform
                            </h3>
                        </div>

                        {/* ROW 3: Subtitle */}
                        <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                            <p style={{ fontSize: '11px', color: '#C8A951', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
                                Complete Digital Legacy Solution
                            </p>
                        </div>

                        {/* ROW 4: Price Box */}
                        <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Investment</div>
                            <div style={{ color: 'white', fontFamily: 'Cinzel, serif', fontSize: '32px', fontWeight: 600 }}>$95,000</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>16 Week Delivery</div>
                        </div>

                        {/* ROW 6: Label */}
                        <div style={{ height: '20px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ color: '#93c5fd', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's Included:</div>
                        </div>

                        {/* ROW 7: List */}
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>
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
                        onClick={() => setSelectedBundle(null)}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${standaloneSelected ? '#10B981' : 'rgba(255,255,255,0.3)'}`,
                            background: standaloneSelected
                                ? 'linear-gradient(145deg, #0f3d2e, #0a2820)'
                                : 'linear-gradient(145deg, #0f172a, #080c16)',
                            position: 'relative',
                            transition: 'all 0.3s ease',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
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
                            <div style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '6px 16px', borderRadius: '20px', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                À La Carte
                            </div>
                        </div>

                        <div style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px' }}>
                            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: 'white', margin: 0, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                                Standalone Services
                            </h3>
                        </div>

                        <div style={{ height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                            <p style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, textAlign: 'center' }}>
                                Individual Module Selection
                            </p>
                        </div>

                        <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Starting From</div>
                            <div style={{ color: 'white', fontFamily: 'Cinzel, serif', fontSize: '32px', fontWeight: 600 }}>$18,000</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px' }}>Per Individual Module</div>
                        </div>

                        <div style={{ height: '20px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Services:</div>
                        </div>

                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
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
                    borderRadius: '8px', width: '100%'
                }}>
                    <span style={{ color: (bundleSelected || standaloneSelected) ? '#C8A951' : 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '15px' }}>
                        {bundleSelected ? '✓ Core Platform Bundle selected — strategic synergies unlocked.' : ''}
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

                <div className="neo-glass-panel" style={{ width: '100%', margin: '0 auto 3rem auto', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', lineHeight: 1.75, color: 'rgba(255, 255, 255, 0.9)' }}>
                        Enhance your platform with specialized modules designed for long-term growth and operational efficiency.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    {[
                        'maintenance',
                        'ceo-consulting',
                        'branding',
                        'estate',
                        'probate',
                        'probate-ai',
                        'comms',
                        'memorial',
                        'financial',
                        'ai-legacy',
                        'liquidator',
                        'compliance',
                        'white-label',
                        'charity',
                        'genealogy',
                        'multi-sig',
                        'publishing',
                        'crypto',
                        'blockchain',
                        'documentary',
                        'vault-guard',
                        'analytics'
                    ].map(id => {
                        const item = PRODUCTS[id]
                        if (!item) return null

                        const inCart = selectedAddons.includes(item.id)
                        const standPrice = item.standalonePrice || Math.round(item.bundledPrice * 1.5)
                        const currPrice = bundleSelected ? item.bundledPrice : standPrice
                        const showSavings = bundleSelected && standPrice > item.bundledPrice
                        const isFlipped = flippedCard === item.id

                        return (
                            <div
                                key={item.id}
                                style={{
                                    perspective: '1000px',
                                    height: '380px',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    transition: 'transform 0.6s',
                                    transformStyle: 'preserve-3d',
                                    transform: isFlipped ? 'rotateY(180deg)' : 'none'
                                }}>
                                    {/* Front Side */}
                                    <div
                                        onClick={() => toggleAddon(item.id)}
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            backfaceVisibility: 'hidden',
                                            background: inCart
                                                ? 'linear-gradient(145deg, #0f3d2e, #0a2820)'
                                                : 'linear-gradient(145deg, #0f172a, #080c16)',
                                            border: `2px solid ${inCart ? '#10B981' : 'rgba(255, 255, 255, 0.15)'}`,
                                            borderRadius: '12px',
                                            padding: '1.25rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ padding: '12px', background: 'rgba(200, 169, 81, 0.1)', borderRadius: '8px', color: '#C8A951' }}>
                                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFlippedCard(item.id);
                                                }}
                                                style={{ background: 'transparent', border: 'none', color: '#C8A951', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Details ⓘ
                                            </button>
                                        </div>

                                        <h4 style={{ color: 'white', fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', fontFamily: 'Inter, sans-serif' }}>
                                            {item.name}
                                        </h4>

                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                            {showSavings && <span style={{ color: '#64748b', textDecoration: 'line-through', fontSize: '16px' }}>${standPrice.toLocaleString()}</span>}
                                            <span style={{ color: '#C8A951', fontWeight: 'bold', fontSize: '28px' }}>
                                                {item.id === 'ceo-consulting'
                                                    ? `$${(currPrice * ceoConsultingWeeks).toLocaleString()}`
                                                    : item.id === 'probate' && probateStates.length > 0
                                                        ? `$${(currPrice * probateStates.length).toLocaleString()}`
                                                        : `$${currPrice.toLocaleString()}`
                                                }
                                                {item.id === 'ceo-consulting'
                                                    ? <span style={{ fontSize: '14px', marginLeft: '4px' }}>({ceoConsultingWeeks} weeks)</span>
                                                    : item.id === 'probate' && probateStates.length > 0
                                                        ? <span style={{ fontSize: '14px', marginLeft: '4px' }}>({probateStates.length} states)</span>
                                                        : item.id === 'probate'
                                                            ? <span style={{ fontSize: '14px', marginLeft: '4px' }}>/state</span>
                                                            : (item.id === 'maintenance'
                                                                ? <span style={{ fontSize: '14px', marginLeft: '4px' }}>/year</span>
                                                                : (item.recurring ? <span style={{ fontSize: '14px', marginLeft: '4px' }}>/mo</span> : ''))}
                                            </span>
                                        </div>

                                        {/* CEO Consulting Week Selector */}
                                        {item.id === 'ceo-consulting' && inCart && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '12px',
                                                    padding: '8px 12px',
                                                    background: 'rgba(200, 169, 81, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(200, 169, 81, 0.3)'
                                                }}
                                            >
                                                <span style={{ color: 'white', fontSize: '13px' }}>Weeks:</span>
                                                <button
                                                    onClick={() => setCeoConsultingWeeks(ceoConsultingWeeks - 1)}
                                                    disabled={ceoConsultingWeeks <= 1}
                                                    style={{
                                                        width: '28px', height: '28px', borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                                        color: 'white', fontSize: '16px', cursor: 'pointer',
                                                        opacity: ceoConsultingWeeks <= 1 ? 0.3 : 1
                                                    }}
                                                >−</button>
                                                <span style={{ color: '#C8A951', fontWeight: 'bold', fontSize: '18px', minWidth: '32px', textAlign: 'center' }}>
                                                    {ceoConsultingWeeks}
                                                </span>
                                                <button
                                                    onClick={() => setCeoConsultingWeeks(ceoConsultingWeeks + 1)}
                                                    disabled={ceoConsultingWeeks >= 52}
                                                    style={{
                                                        width: '28px', height: '28px', borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.1)', border: 'none',
                                                        color: 'white', fontSize: '16px', cursor: 'pointer',
                                                        opacity: ceoConsultingWeeks >= 52 ? 0.3 : 1
                                                    }}
                                                >+</button>
                                                <span style={{ color: '#64748b', fontSize: '11px', marginLeft: '4px' }}>
                                                    @ $6K/week
                                                </span>
                                            </div>
                                        )}

                                        <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                                            {item.id === 'ceo-consulting'
                                                ? `${ceoConsultingWeeks} week${ceoConsultingWeeks > 1 ? 's' : ''} engagement`
                                                : item.id === 'probate' && probateStates.length > 0
                                                    ? `${probateStates.length} state${probateStates.length > 1 ? 's' : ''} selected`
                                                    : `${item.timeline} ${item.timelineUnit} Delivery`}
                                        </div>
                                        <p style={{ fontSize: '1rem', color: 'rgba(147, 197, 253, 0.8)', lineHeight: 1.6, margin: 0 }}>
                                            {item.shortDescription}
                                        </p>

                                        {/* Probate Engine State Selector */}
                                        {item.id === 'probate' && inCart && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '12px',
                                                    background: 'rgba(200, 169, 81, 0.1)',
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(200, 169, 81, 0.3)'
                                                }}
                                            >
                                                <div style={{ color: 'white', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>
                                                    Select States:
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {[
                                                        { code: 'MD', name: 'Maryland', priority: true },
                                                        { code: 'IL', name: 'Illinois', priority: true },
                                                        { code: 'MN', name: 'Minnesota', priority: true },
                                                        { code: 'DC', name: 'D.C.', priority: false },
                                                        { code: 'VA', name: 'Virginia', priority: false }
                                                    ].map(state => (
                                                        <button
                                                            key={state.code}
                                                            onClick={() => toggleProbateState(state.code)}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                border: probateStates.includes(state.code)
                                                                    ? '1px solid #10B981'
                                                                    : '1px solid rgba(255,255,255,0.2)',
                                                                background: probateStates.includes(state.code)
                                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                                    : 'rgba(255,255,255,0.05)',
                                                                color: probateStates.includes(state.code)
                                                                    ? '#10B981'
                                                                    : 'rgba(255,255,255,0.7)'
                                                            }}
                                                        >
                                                            {state.code}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div style={{ color: '#64748b', fontSize: '10px', marginTop: '8px' }}>
                                                    ${bundleSelected ? '24,500' : '35,000'}/state
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {/* Caption for CEO Consulting when not selected */}
                                            {item.id === 'ceo-consulting' && !inCart ? (
                                                <span style={{ color: '#C8A951', fontSize: '11px', fontStyle: 'italic' }}>
                                                    ☑ Check box to select weeks
                                                </span>
                                            ) : item.id === 'probate' && !inCart ? (
                                                <span style={{ color: '#C8A951', fontSize: '11px', fontStyle: 'italic' }}>
                                                    ☑ Check box to select states
                                                </span>
                                            ) : <span></span>}
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '4px', border: inCart ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                                background: inCart ? '#10B981' : 'transparent', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {inCart ? '✓' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div
                                        onClick={() => setFlippedCard(null)}
                                        style={{
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            backfaceVisibility: 'hidden',
                                            background: 'rgba(15, 23, 42, 0.98)',
                                            border: '2px solid #C8A951',
                                            borderRadius: '12px',
                                            padding: '2rem',
                                            transform: 'rotateY(180deg)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <h4 style={{ color: '#C8A951', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
                                            Scope of Services:
                                        </h4>
                                        <div style={{ color: 'white', fontSize: '14px', lineHeight: 1.6, flex: 1 }}>
                                            {item.detailedScope?.map((scope, idx) => (
                                                <div key={idx} style={{ marginBottom: '16px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: '4px' }}>{scope.title}</div>
                                                    <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                                                        {scope.subItems.map((si, sidx) => (
                                                            <li key={sidx} style={{ marginBottom: '2px' }}>{si}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            {(!item.detailedScope || item.detailedScope.length === 0) && (
                                                <p>Detailed architectural implementation and service integration.</p>
                                            )}
                                        </div>
                                        <button
                                            style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                                        >
                                            Return to Selection
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* SELECTION SUMMARY */}
            <div className="summary-box" style={{ width: '100%', margin: '4rem auto 2rem auto', padding: '32px', border: '1px solid rgba(200, 169, 81, 0.3)', borderRadius: '12px', background: 'rgba(200, 169, 81, 0.08)' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#C8A951', marginBottom: '32px', textAlign: 'center', marginTop: 0 }}>
                    4. Selection Summary
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '64px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Modules</div>
                        <div style={{ color: 'white', fontSize: '32px', fontWeight: 600 }}>{itemCount}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Estimated Investment</div>
                        <div style={{ color: '#C8A951', fontSize: '32px', fontWeight: 600 }}>${totalInvestment.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Timeline</div>
                        <div style={{ color: 'white', fontSize: '32px', fontWeight: 600 }}>{estimatedTimeline} Weeks</div>
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
