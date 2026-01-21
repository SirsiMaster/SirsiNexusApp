/**
 * Executive Summary Tab
 * Exact migration from the original HTML
 */
import { useSetTab } from '../../store/useConfigStore'

export function ExecutiveSummary() {
    const setTab = useSetTab()

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* PRIMARY OBJECTIVE BOX */}
            <div style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
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
                    Executive Summary
                </h2>
            </div>

            <div
                style={{
                    background: 'linear-gradient(145deg, #141e3c, #0a0f1e)',
                    marginBottom: '3rem',
                    cursor: 'default',
                    padding: '28px',
                    borderRadius: '12px',
                    border: '2px solid rgba(200, 169, 81, 0.5)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                }}
            >
                <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #C8A951, #E2C76B)',
                    color: '#000',
                    padding: '8px 20px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    marginBottom: '28px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    boxShadow: '0 4px 15px rgba(200, 169, 81, 0.3)'
                }}>
                    Primary Objective
                </div>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '36px',
                    color: '#FFFFFF',
                    marginBottom: '24px',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}>
                    The Living Legacy Platform
                </h3>
                <p style={{ fontSize: '20px', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
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
                gap: '4rem',
                marginBottom: '5rem'
            }}>
                <div>
                    <h4 style={{
                        color: '#C8A951',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '1.5rem',
                        fontSize: '14px'
                    }}>
                        Strategic Position
                    </h4>
                    <p style={{ lineHeight: 1.8, opacity: 0.9, fontSize: '1.25rem' }}>
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
                        letterSpacing: '0.15em',
                        marginBottom: '1.5rem',
                        fontSize: '14px'
                    }}>
                        Technology Stack
                    </h4>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        opacity: 0.9
                    }}>
                        <li style={{ fontSize: '1.25rem' }}>• <strong>Logic:</strong> Go (Golang) / Cloud Run</li>
                        <li style={{ fontSize: '1.25rem' }}>• <strong>Intelligence:</strong> Google Vertex AI (Gemini)</li>
                        <li style={{ fontSize: '1.25rem' }}>• <strong>Vault:</strong> Cloud SQL + KMS Encryption</li>
                        <li style={{ fontSize: '1.25rem' }}>• <strong>Mobile:</strong> React Native Expo</li>
                    </ul>
                </div>
            </div>

            {/* CTA BUTTON */}
            <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                <button
                    onClick={() => setTab('configure')}
                    className="select-plan-btn"
                    style={{ padding: '16px 40px', fontSize: '18px' }}
                >
                    Configure Your Solution →
                </button>
            </div>
        </div>

    )
}
