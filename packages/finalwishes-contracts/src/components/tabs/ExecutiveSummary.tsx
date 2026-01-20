/**
 * Executive Summary Tab
 * Exact migration from the original HTML
 */
import { useSetTab } from '../../store/useConfigStore'

export function ExecutiveSummary() {
    const setTab = useSetTab()

    return (
        <div style={{ maxWidth: '60rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
            {/* PRIMARY OBJECTIVE BOX */}
            <div
                className="neo-card-gold"
                style={{
                    background: 'rgba(200, 169, 81, 0.05)',
                    marginBottom: '4rem',
                    cursor: 'default'
                }}
            >
                <div style={{
                    display: 'inline-block',
                    background: '#C8A951',
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                }}>
                    Primary Objective
                </div>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '32px',
                    color: 'white',
                    marginBottom: '24px'
                }}>
                    The Living Legacy Platform
                </h3>
                <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
                    To architect and deploy a secure, multi-tenant digital preservation engine that
                    allows Principals to curate their "Final Wishes"—including digital assets, legal
                    instructions, and emotional legacies—using AI-driven guidance and a "Vault-Grade"
                    security infrastructure.
                </p>
            </div>

            {/* TWO COLUMN SECTION */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '3rem',
                marginBottom: '4rem'
            }}>
                <div>
                    <h4 style={{
                        color: '#C8A951',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        Strategic Position
                    </h4>
                    <p style={{ lineHeight: 1.7, opacity: 0.8, fontSize: '1.125rem' }}>
                        Sirsi acts as the Technical Lead, leveraging the <strong>Nexus V4 Core</strong> to
                        accelerate 0-to-1 development by 60%. We are not just building an app; we are
                        deploying a private, permanent infrastructure for estate management.
                    </p>
                </div>
                <div>
                    <h4 style={{
                        color: '#C8A951',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                    }}>
                        Technology Stack
                    </h4>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        opacity: 0.8
                    }}>
                        <li style={{ fontSize: '1.125rem' }}>• <strong>Logic:</strong> Go (Golang) / Cloud Run</li>
                        <li style={{ fontSize: '1.125rem' }}>• <strong>Intelligence:</strong> Google Vertex AI (Gemini)</li>
                        <li style={{ fontSize: '1.125rem' }}>• <strong>Vault:</strong> Cloud SQL + KMS Encryption</li>
                        <li style={{ fontSize: '1.125rem' }}>• <strong>Mobile:</strong> React Native Expo</li>
                    </ul>
                </div>
            </div>

            {/* CTA BUTTON */}
            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => setTab('configure')}
                    className="select-plan-btn"
                >
                    Configure Your Solution →
                </button>
            </div>
        </div>
    )
}
