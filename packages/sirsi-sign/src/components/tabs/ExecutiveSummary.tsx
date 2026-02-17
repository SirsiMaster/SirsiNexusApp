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
                    color: '#A68936',
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
                background: '#ffffff',
                border: '1px solid rgba(2, 44, 34, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '4rem',
                maxWidth: '800px',
                margin: '0 auto 4rem auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#022c22',
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
                        <label style={{ display: 'block', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Client Name</label>
                        <input
                            type="text"
                            placeholder="Enter Name..."
                            value={clientName}
                            onChange={(e) => setClientInfo(e.target.value, useConfigStore.getState().clientEmail)}
                            style={{
                                width: '100%',
                                background: '#f8faf9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '12px',
                                color: '#022c22',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Organization</label>
                        <input
                            type="text"
                            placeholder="Company (Optional)..."
                            value={companyName}
                            onChange={(e) => setStore({ companyName: e.target.value })}
                            style={{
                                width: '100%',
                                background: '#f8faf9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '12px',
                                color: '#022c22',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Project Name</label>
                        <input
                            type="text"
                            placeholder="e.g. The Lockhart Estate..."
                            value={projectName}
                            onChange={(e) => setStore({ projectName: e.target.value })}

                            style={{
                                width: '100%',
                                background: '#f8faf9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '12px',
                                color: '#022c22',
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

            </div>


            <div
                style={{
                    background: '#ffffff',
                    marginBottom: '3rem',
                    cursor: 'default',
                    padding: '28px',
                    borderRadius: '12px',
                    border: '1px solid rgba(166, 137, 54, 0.3)',
                    boxShadow: '0 10px 40px rgba(2, 44, 34, 0.05)'
                }}
            >
                <div style={{
                    display: 'inline-block',
                    background: '#A68936',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '28px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    boxShadow: '0 4px 15px rgba(166, 137, 54, 0.2)'
                }}>
                    Primary Objective
                </div>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '36px',
                    color: '#022c22',
                    marginBottom: '24px'
                }}>
                    {template.primaryObjectiveTitle}
                </h3>
                <p style={{ fontSize: '20px', lineHeight: 1.8, color: '#475569' }}>
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
                        color: '#A68936',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '1.5rem',
                        fontSize: '16px'
                    }}>
                        Strategic Position
                    </h4>
                    <p style={{ lineHeight: 1.8, opacity: 0.9, fontSize: '1.25rem' }}>
                        {template.strategicPosition}
                    </p>
                </div>
                <div>
                    <h4 style={{
                        color: '#A68936',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        marginBottom: '1.5rem',
                        fontSize: '16px'
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
