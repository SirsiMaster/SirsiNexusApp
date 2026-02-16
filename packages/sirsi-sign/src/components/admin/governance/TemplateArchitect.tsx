import { useState } from 'react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';
import type { ProjectTemplate } from '../../../data/projectTemplates';

const S = {
    section: "bg-black/20 border border-white/10 rounded-2xl p-8 mb-8",
    label: "inter text-[10px] text-slate-500 uppercase tracking-widest mb-2 block font-bold",
    input: "w-full bg-navy border border-white/10 rounded px-4 py-3 text-white text-sm inter outline-none focus:border-gold/50 transition-all",
    textarea: "w-full bg-navy border border-white/10 rounded px-4 py-3 text-white text-sm inter outline-none focus:border-gold/50 transition-all min-h-[100px] resize-y",
    h3: "cinzel text-xl text-gold tracking-widest mb-6 border-b border-gold/10 pb-4 flex justify-between items-center",
    btnPrimary: "px-6 py-2 bg-gold text-navy cinzel font-bold text-xs tracking-widest uppercase rounded hover:bg-gold-bright transition-all",
    btnGhost: "px-4 py-2 border border-white/10 text-white inter text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white/5"
};

export function TemplateArchitect() {
    const { templates, updateTemplate } = useGovernanceStore();
    const [activeTemplate, setActiveTemplate] = useState<string>('finalwishes');

    const template = templates[activeTemplate];

    if (!template) return <div>Template not found.</div>;

    const handleFieldUpdate = (field: keyof ProjectTemplate, value: any) => {
        updateTemplate(activeTemplate, { [field]: value });
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Template Selector */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                <div>
                    <h3 className="cinzel text-lg text-gold tracking-widest">Master Base Configuration</h3>
                    <p className="inter text-[10px] text-slate-500 uppercase mt-1">Design the legal and strategic blueprints for each project type</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={activeTemplate}
                        onChange={(e) => setActiveTemplate(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 inter text-sm text-gold outline-none focus:border-gold/30 w-64 cinzel font-bold"
                    >
                        {Object.values(templates).map(t => (
                            <option key={t.key} value={t.key}>{t.projectDisplayName}</option>
                        ))}
                    </select>
                    <button className={S.btnPrimary}>+ New Template Base</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* 1. Identity & Strategy */}
                <div className={S.section}>
                    <h3 className={S.h3}>I. Strategic Positioning</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className={S.label}>Project Display Name</label>
                            <input
                                className={S.input}
                                value={template.projectDisplayName}
                                onChange={(e) => handleFieldUpdate('projectDisplayName', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={S.label}>Provider Entity</label>
                            <input
                                className={S.input}
                                value={template.providerName}
                                onChange={(e) => handleFieldUpdate('providerName', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={S.label}>Primary Objective Title</label>
                            <input
                                className={S.input}
                                value={template.primaryObjectiveTitle}
                                onChange={(e) => handleFieldUpdate('primaryObjectiveTitle', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={S.label}>Executive Summary Objective</label>
                            <textarea
                                className={S.textarea}
                                value={template.primaryObjectiveDescription}
                                onChange={(e) => handleFieldUpdate('primaryObjectiveDescription', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={S.label}>Strategic Market Position</label>
                            <textarea
                                className={S.textarea}
                                value={template.strategicPosition}
                                onChange={(e) => handleFieldUpdate('strategicPosition', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. SOW Terms */}
                <div className={S.section}>
                    <h3 className={S.h3}>II. Statement of Work (SOW) Definitions</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={S.label}>SOW Platform Type</label>
                            <input
                                className={S.input}
                                value={template.sowPlatformType}
                                onChange={(e) => handleFieldUpdate('sowPlatformType', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={S.label}>SOW High-Level Objective</label>
                            <textarea
                                className={S.textarea}
                                value={template.sowObjective}
                                onChange={(e) => handleFieldUpdate('sowObjective', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. MSA Legalese */}
                <div className={S.section}>
                    <h3 className={S.h3}>III. Master Service Agreement (MSA) Terms</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className={S.label}>MSA Recitals (Introductory Clauses)</label>
                            <textarea
                                className={S.textarea}
                                style={{ minHeight: '150px' }}
                                value={template.msaRecital}
                                onChange={(e) => handleFieldUpdate('msaRecital', e.target.value)}
                            />
                            <p className="text-[9px] text-slate-500 mt-2 italic">Use {'{projectName}'} for dynamic interpolation.</p>
                        </div>

                        <div>
                            <label className={S.label}>Foreground Intellectual Property Description</label>
                            <textarea
                                className={S.textarea}
                                value={template.msaForegroundIpDescription}
                                onChange={(e) => handleFieldUpdate('msaForegroundIpDescription', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={S.label}>Vertical Exclusive License Field</label>
                                <input
                                    className={S.input}
                                    value={template.msaVerticalLicense}
                                    onChange={(e) => handleFieldUpdate('msaVerticalLicense', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className={S.label}>Non-Compete Vertical Restricted Field</label>
                                <input
                                    className={S.input}
                                    value={template.msaNonCompeteVertical}
                                    onChange={(e) => handleFieldUpdate('msaNonCompeteVertical', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
