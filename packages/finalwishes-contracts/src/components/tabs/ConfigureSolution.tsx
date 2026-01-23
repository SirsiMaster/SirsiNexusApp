/**
 * Configure Solution Tab
 * PIXEL-PERFECT MIGRATION from index.html renderOfferings
 */
import { useState } from 'react'
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { PRODUCTS, calculateTotal, calculateTimeline } from '../../data/catalog'

// All 50 US States + DC
const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'Washington D.C.' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
]

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
    const [isStateModalOpen, setIsStateModalOpen] = useState(false)
    const [stateSearchQuery, setStateSearchQuery] = useState('')
    const [tempSelectedStates, setTempSelectedStates] = useState<string[]>([])

    const totalInvestmentResult = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)
    const totalInvestment = totalInvestmentResult.total
    const estimatedTimeline = calculateTimeline(selectedBundle, selectedAddons, probateStates.length)
    const itemCount = (selectedBundle ? 1 : 0) + selectedAddons.length

    const bundleSelected = selectedBundle === 'finalwishes-core'
    const standaloneSelected = !bundleSelected && selectedAddons.length > 0

    // Filter states based on search query
    const filteredStates = US_STATES.filter(state =>
        state.name.toLowerCase().includes(stateSearchQuery.toLowerCase()) ||
        state.code.toLowerCase().includes(stateSearchQuery.toLowerCase())
    )

    // Open state selector and initialize with current selections
    const openStateSelector = () => {
        setTempSelectedStates([...probateStates])
        setStateSearchQuery('')
        setIsStateModalOpen(true)
    }

    // Toggle state in temporary selection
    const toggleTempState = (code: string) => {
        setTempSelectedStates(prev =>
            prev.includes(code) ? prev.filter(s => s !== code) : [...prev, code]
        )
    }

    // Confirm selection - sync to store and keep Probate Engine selected
    const confirmStateSelection = () => {
        // Sync states to store
        // We'll just replace the entire set to keep it clean
        // The store currently has toggleProbateState, so we use it carefully
        const toAdd = tempSelectedStates.filter(s => !probateStates.includes(s))
        const toRemove = probateStates.filter(s => !tempSelectedStates.includes(s))

        toAdd.forEach(s => toggleProbateState(s))
        toRemove.forEach(s => toggleProbateState(s))

        setIsStateModalOpen(false)

        // Ensure Probate Engine is in cart if states > 0
        if (tempSelectedStates.length > 0 && !selectedAddons.includes('probate')) {
            toggleAddon('probate')
        }
        // Remove from cart if no states
        if (tempSelectedStates.length === 0 && selectedAddons.includes('probate')) {
            toggleAddon('probate')
        }
    }

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
                                        onClick={() => {
                                            if (item.id === 'probate' && !inCart && probateStates.length === 0) {
                                                openStateSelector();
                                            } else {
                                                toggleAddon(item.id);
                                            }
                                        }}
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
                                                : item.id === 'probate'
                                                    ? (probateStates.length > 0
                                                        ? `${probateStates.length} State${probateStates.length > 1 ? 's' : ''} Licensed`
                                                        : 'Select coverage states')
                                                    : `${item.timeline} ${item.timelineUnit} Delivery`}
                                        </div>
                                        <p style={{ fontSize: '1rem', color: 'rgba(147, 197, 253, 0.8)', lineHeight: 1.6, margin: 0 }}>
                                            {item.shortDescription}
                                        </p>

                                        {/* CARD FOOTER - Unified Selection & Configuration */}
                                        <div style={{ marginTop: 'auto' }}>
                                            {/* Probate Engine - Premium State Selector UI */}
                                            {item.id === 'probate' && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ marginBottom: '16px' }}
                                                >
                                                    {/* Selected States Pills */}
                                                    {probateStates.length > 0 && (
                                                        <div style={{
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: '6px',
                                                            marginBottom: '12px',
                                                            maxHeight: '44px',
                                                            overflowY: 'auto',
                                                            padding: '4px'
                                                        }}>
                                                            {probateStates.map(st => (
                                                                <div key={st} style={{
                                                                    background: 'rgba(200, 169, 81, 0.15)',
                                                                    border: '1px solid rgba(200, 169, 81, 0.4)',
                                                                    borderRadius: '4px',
                                                                    padding: '2px 6px',
                                                                    fontSize: '10px',
                                                                    color: '#C8A951',
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    {st}
                                                                    <span
                                                                        onClick={() => toggleProbateState(st)}
                                                                        style={{ cursor: 'pointer', opacity: 0.6 }}
                                                                    >×</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openStateSelector();
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px',
                                                            background: 'linear-gradient(135deg, #C8A951 0%, #A08332 100%)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: '#000',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                            <path d="M12 5v14M5 12h14" />
                                                        </svg>
                                                        {probateStates.length > 0 ? 'Edit Jurisdictions' : 'Configure States'}
                                                    </button>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                {/* Caption for CEO Consulting when not selected */}
                                                {item.id === 'ceo-consulting' && !inCart ? (
                                                    <span style={{ color: '#C8A951', fontSize: '11px', fontStyle: 'italic' }}>
                                                        ☑ Check box to select weeks
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                                        {inCart ? 'Module Selected' : 'Add to Solution'}
                                                    </span>
                                                )}
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '4px', border: inCart ? 'none' : '2px solid rgba(255,255,255,0.3)',
                                                    background: inCart ? '#10B981' : 'transparent', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {inCart ? '✓' : ''}
                                                </div>
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

            {/* STATE SELECTION MODAL */}
            {isStateModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        width: '90%', maxWidth: '500px', background: '#0a0f1e',
                        border: '2px solid #C8A951', borderRadius: '16px',
                        overflow: 'hidden', boxShadow: '0 0 50px rgba(200,169,81,0.2)'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px', borderBottom: '1px solid rgba(200,169,81,0.2)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'linear-gradient(to right, rgba(200,169,81,0.1), transparent)'
                        }}>
                            <h3 style={{ fontFamily: 'Cinzel, serif', color: '#C8A951', fontSize: '20px', margin: 0 }}>
                                Select Jurisdictions
                            </h3>
                            <button
                                onClick={() => setIsStateModalOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search states (e.g. New York, CA)..."
                                    value={stateSearchQuery}
                                    onChange={(e) => setStateSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{
                                height: '300px', overflowY: 'auto', paddingRight: '12px',
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
                            }}>
                                {filteredStates.map(state => {
                                    const isSelected = tempSelectedStates.includes(state.code)
                                    return (
                                        <div
                                            key={state.code}
                                            onClick={() => toggleTempState(state.code)}
                                            style={{
                                                padding: '10px 12px', cursor: 'pointer', borderRadius: '6px',
                                                border: `1px solid ${isSelected ? '#C8A951' : 'rgba(255,255,255,0.05)'}`,
                                                background: isSelected ? 'rgba(200,169,81,0.1)' : 'rgba(255,255,255,0.02)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <span style={{ fontSize: '13px', color: isSelected ? 'white' : 'rgba(255,255,255,0.6)' }}>
                                                {state.name}
                                            </span>
                                            {isSelected && <span style={{ color: '#C8A951', fontWeight: 'bold' }}>✓</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '24px', background: 'rgba(0,0,0,0.3)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderTop: '1px solid rgba(200,169,81,0.2)'
                        }}>
                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}>Current Selection</div>
                                <div style={{ color: '#C8A951', fontWeight: 700, fontSize: '18px' }}>
                                    ${(tempSelectedStates.length * (bundleSelected ? 24500 : 35000)).toLocaleString()}
                                    <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
                                        ({tempSelectedStates.length} Estates)
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={confirmStateSelection}
                                style={{
                                    padding: '12px 24px', background: '#C8A951', border: 'none', borderRadius: '6px',
                                    color: '#000', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                                }}
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>

    )
}
