/**
 * Executive Summary Tab
 * Template-aware: reads content from projectTemplates registry
 */
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { getProjectTemplate } from '../../data/projectTemplates'


export function ExecutiveSummary() {
    const setTab = useSetTab()
    const clientName = useConfigStore(state => state.clientName)
    const companyName = useConfigStore(state => state.companyName)
    const projectName = useConfigStore(state => state.projectName)
    const projectId = useConfigStore(state => state.projectId)
    const setClientInfo = useConfigStore(state => state.setClientInfo)
    const setStore = useConfigStore.setState

    const template = getProjectTemplate(projectId)

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

            {/* CLIENT IDENTIFICATION SECTION */}
            <div style={{
                background: 'rgba(200, 169, 81, 0.05)',
                border: '1px solid rgba(200, 169, 81, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '4rem',
                maxWidth: '800px',
                margin: '0 auto 4rem auto'
            }}>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#FFFFFF',
                    fontSize: '20px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    Prepared For
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Client Name</label>
                        <input
                            type="text"
                            placeholder="Enter Name..."
                            value={clientName}
                            onChange={(e) => setClientInfo(e.target.value, useConfigStore.getState().clientEmail)}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(200, 169, 81, 0.3)',
                                borderRadius: '6px',
                                padding: '12px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Organization</label>
                        <input
                            type="text"
                            placeholder="Company (Optional)..."
                            value={companyName}
                            onChange={(e) => setStore({ companyName: e.target.value })}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(200, 169, 81, 0.3)',
                                borderRadius: '6px',
                                padding: '12px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Project Name</label>
                        <input
                            type="text"
                            placeholder="e.g. The Lockhart Estate..."
                            value={projectName}
                            onChange={(e) => setStore({ projectName: e.target.value })}

                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(200, 169, 81, 0.3)',
                                borderRadius: '6px',
                                padding: '12px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

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
                    {template.primaryObjectiveTitle}
                </h3>
                <p style={{ fontSize: '20px', lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
                    {template.primaryObjectiveDescription}
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
                        {template.strategicPosition}
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
                        {template.techStack.map((item, i) => (
                            <li key={i} style={{ fontSize: '1.25rem' }}>• <strong>{item.label}:</strong> {item.value}</li>
                        ))}
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
