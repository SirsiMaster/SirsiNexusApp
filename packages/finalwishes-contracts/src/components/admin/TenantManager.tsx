/**
 * TenantManager — Admin UI for viewing and managing project templates/tenants.
 * 
 * Each tenant maps to a projectId in the TEMPLATES registry.
 * This component provides a read/write view of registered tenants
 * and the ability to preview their contract content.
 */
import { useState } from 'react';
import { TEMPLATES } from '../../data/projectTemplates';

// ── Shared Styles ──────────────────────────────────────────────
const S = {
    card: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '24px', transition: 'all 0.3s',
        cursor: 'pointer', position: 'relative' as const, overflow: 'hidden' as const,
    },
    cardActive: {
        border: '1px solid rgba(200,169,81,0.4)', background: 'rgba(200,169,81,0.05)',
        boxShadow: '0 0 30px rgba(200,169,81,0.08)',
    },
    label: {
        fontFamily: 'Inter, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontWeight: 600,
        display: 'block' as const, marginBottom: '4px',
    },
    value: {
        fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'white', fontWeight: 500,
    },
    sectionTitle: {
        fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#C8A951',
        letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase' as const,
        borderBottom: '1px solid rgba(200,169,81,0.15)', paddingBottom: '8px',
        marginBottom: '16px', marginTop: '32px',
    },
    chip: {
        display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
        fontSize: '10px', fontWeight: 700, fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.05em', textTransform: 'uppercase' as const,
    },
    previewBox: {
        padding: '14px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Inter, sans-serif',
        fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
        marginBottom: '12px',
    },
};

export function TenantManager() {
    const tenantEntries = Object.entries(TEMPLATES);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const selectedTemplate = selectedKey ? TEMPLATES[selectedKey] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C8A951', letterSpacing: '0.15em', margin: 0, fontWeight: 700 }}>
                    Tenant Registry
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
                    {tenantEntries.length} Registered Project Template{tenantEntries.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Tenant Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {tenantEntries.map(([key, tpl]) => {
                    const isActive = selectedKey === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setSelectedKey(isActive ? null : key)}
                            style={{ ...S.card, ...(isActive ? S.cardActive : {}) }}
                            onMouseEnter={e => {
                                if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseLeave={e => {
                                if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                            }}
                        >
                            {/* Glow line at top */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                                background: isActive ? 'linear-gradient(90deg, transparent, #C8A951, transparent)' : 'transparent',
                                transition: 'background 0.3s',
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', color: 'white', margin: 0, fontWeight: 700 }}>
                                        {tpl.projectDisplayName}
                                    </h3>
                                    <p style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(200,169,81,0.6)', marginTop: '4px' }}>
                                        {tpl.key}
                                    </p>
                                </div>
                                <span style={{
                                    ...S.chip,
                                    border: '1px solid rgba(200,169,81,0.3)', color: '#C8A951',
                                    background: 'rgba(200,169,81,0.08)',
                                }}>
                                    {tpl.docCode}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <span style={S.label}>Provider</span>
                                    <span style={S.value}>{tpl.providerName}</span>
                                </div>
                                <div>
                                    <span style={S.label}>Doc Type</span>
                                    <span style={S.value}>{tpl.docType}</span>
                                </div>
                                <div>
                                    <span style={S.label}>SOW Type</span>
                                    <span style={S.value}>{tpl.sowPlatformType}</span>
                                </div>
                                <div>
                                    <span style={S.label}>Tech Stack</span>
                                    <span style={S.value}>{tpl.techStack.length} layers</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* Template Detail Panel                                  */}
            {/* ═══════════════════════════════════════════════════════ */}
            {selectedTemplate && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(200,169,81,0.15)', borderRadius: '16px',
                    padding: '32px', marginTop: '8px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#C8A951', margin: 0 }}>
                                {selectedTemplate.projectDisplayName}
                            </h3>
                            <p style={{ fontFamily: 'Inter', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                Template Preview — All contract tabs will use this content for <code style={{ color: 'rgba(200,169,81,0.7)', fontSize: '11px' }}>{selectedKey}</code> contracts
                            </p>
                        </div>
                        <button
                            onClick={() => window.open(`/contracts/${selectedKey}`, '_blank')}
                            style={{
                                padding: '8px 20px', borderRadius: '8px',
                                background: 'rgba(200,169,81,0.1)', border: '1px solid rgba(200,169,81,0.3)',
                                color: '#C8A951', fontFamily: 'Cinzel, serif', fontWeight: 700,
                                fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                                cursor: 'pointer', transition: 'all 0.3s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#C8A951'; e.currentTarget.style.color = '#0A0F1D'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,169,81,0.1)'; e.currentTarget.style.color = '#C8A951'; }}
                        >
                            Preview Contract →
                        </button>
                    </div>

                    {/* Executive Summary Content */}
                    <div style={S.sectionTitle}>Executive Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        <div>
                            <span style={S.label}>Primary Objective Title</span>
                            <div style={{ ...S.previewBox, fontSize: '14px', fontWeight: 600, color: 'white' }}>
                                {selectedTemplate.primaryObjectiveTitle}
                            </div>
                        </div>
                        <div>
                            <span style={S.label}>Description</span>
                            <div style={S.previewBox}>
                                {selectedTemplate.primaryObjectiveDescription}
                            </div>
                        </div>
                    </div>
                    <span style={S.label}>Strategic Position</span>
                    <div style={S.previewBox}>{selectedTemplate.strategicPosition}</div>

                    {/* Tech Stack */}
                    <span style={S.label}>Tech Stack</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {selectedTemplate.techStack.map(item => (
                            <div key={item.label} style={{
                                padding: '6px 12px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(200,169,81,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                                <div style={{ fontFamily: 'Inter', fontSize: '12px', color: 'white', marginTop: '2px' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* SOW Content */}
                    <div style={S.sectionTitle}>Statement of Work</div>
                    <span style={S.label}>SOW Objective</span>
                    <div style={S.previewBox}>{selectedTemplate.sowObjective}</div>

                    {/* MSA Content */}
                    <div style={S.sectionTitle}>Master Service Agreement</div>
                    <span style={S.label}>Recital</span>
                    <div style={S.previewBox}>{selectedTemplate.msaRecital}</div>

                    <span style={S.label}>Foreground IP Description</span>
                    <div style={S.previewBox}>{selectedTemplate.msaForegroundIpDescription}</div>

                    <span style={S.label}>Foreground IP Items</span>
                    <div style={S.previewBox}>
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                            {selectedTemplate.msaForegroundIpItems.map((item, i) => (
                                <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <span style={S.label}>Vertical License Scope</span>
                            <div style={S.previewBox}>{selectedTemplate.msaVerticalLicense}</div>
                        </div>
                        <div>
                            <span style={S.label}>Non-Compete Vertical</span>
                            <div style={S.previewBox}>{selectedTemplate.msaNonCompeteVertical}</div>
                        </div>
                    </div>

                    <span style={S.label}>Assumptions</span>
                    <div style={S.previewBox}>
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                            {selectedTemplate.msaAssumptions.map((item, i) => (
                                <li key={i} style={{ marginBottom: '6px' }}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Document Scope */}
                    <div style={S.sectionTitle}>Document Scope (Exhibit A)</div>
                    {selectedTemplate.msaDocumentScope.map((scope, i) => (
                        <div key={i} style={{ marginBottom: '12px' }}>
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: '12px', color: 'rgba(200,169,81,0.8)', fontWeight: 600 }}>{scope.title}</span>
                            <div style={{ ...S.previewBox, marginTop: '6px' }}>{scope.content}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
