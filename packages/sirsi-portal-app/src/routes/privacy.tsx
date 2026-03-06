/**
 * Privacy Policy — Full GDPR/CCPA compliant privacy policy
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Content sourced from docs/policies/PRIVACY_POLICY.md (canonical).
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/privacy',
    component: PrivacyPage,
})

/* ── Reusable section heading ── */
function SH({ n, title }: { n: string; title: string }) {
    return <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{n}. {title}</h2>
}

function PrivacyPage() {
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-12" style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #d1fae5)' }}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Privacy <span className="text-emerald-600">Policy</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        <strong>Document ID:</strong> SIRSI-PP-001 &nbsp;·&nbsp;
                        <strong>Version:</strong> 1.0.0 &nbsp;·&nbsp;
                        <strong>Effective:</strong> January 28, 2026
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Classification: Public &nbsp;·&nbsp; Owner: Data Protection Officer (DPO)
                    </p>
                </div>
            </section>

            {/* ═══════════════ POLICY BODY ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <article className="max-w-4xl mx-auto px-6 prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-emerald-600 prose-table:text-sm max-w-none">

                    {/* Introduction */}
                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        Sirsi Technologies Inc. ("Sirsi," "we," "us," or "our") is committed to protecting
                        the privacy and security of your personal information. This Privacy Policy explains
                        how we collect, use, disclose, and safeguard your information when you use our
                        services, applications, and platforms, including <strong>SirsiNexus</strong>,{' '}
                        <strong>Assiduous</strong>, <strong>FinalWishes</strong>, and all associated websites,
                        mobile applications, and services.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                        This Privacy Policy is designed to comply with the <strong>General Data Protection Regulation (GDPR)</strong>,{' '}
                        <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>,{' '}
                        <strong>SOC 2 Privacy Trust Service Criteria</strong>,{' '}
                        <strong>ISO/IEC 27701:2019</strong>, and{' '}
                        <strong>HIPAA</strong> where applicable.
                    </p>

                    <SH n="1" title="Data Controller Information" />
                    <p><strong>Data Controller:</strong> Sirsi Technologies Inc.<br />
                        909 Rose Avenue, Suite 400, North Bethesda, MD 20852<br />
                        <strong>Data Protection Officer:</strong> <a href="mailto:privacy@sirsi.ai">privacy@sirsi.ai</a>
                    </p>

                    <SH n="2" title="Categories of Personal Information Collected" />
                    <h3 className="text-lg font-semibold mt-6 mb-2">Information You Provide Directly</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Category</th><th>Examples</th></tr></thead>
                            <tbody>
                                <tr><td>Identity Data</td><td>Name, username, date of birth, government ID</td></tr>
                                <tr><td>Contact Data</td><td>Email, phone number, billing address</td></tr>
                                <tr><td>Account Data</td><td>Username, password, account preferences</td></tr>
                                <tr><td>Financial Data</td><td>Bank account numbers, payment card details</td></tr>
                                <tr><td>Transaction Data</td><td>Purchase history, services subscribed</td></tr>
                                <tr><td>Professional Data</td><td>Employment history, job title, company name</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-2">Information Collected Automatically</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Category</th><th>Collection Method</th></tr></thead>
                            <tbody>
                                <tr><td>Device Data (IP, browser, OS)</td><td>Automatic</td></tr>
                                <tr><td>Usage Data (pages, features, time)</td><td>Analytics</td></tr>
                                <tr><td>Location Data (approximate)</td><td>IP-based</td></tr>
                                <tr><td>Log Data (access times, errors)</td><td>Server Logs</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold mt-6 mb-2">Information from Third Parties</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Source</th><th>Data Received</th><th>Purpose</th></tr></thead>
                            <tbody>
                                <tr><td>Plaid</td><td>Bank account details</td><td>Account linking</td></tr>
                                <tr><td>Stripe</td><td>Payment confirmation</td><td>Payment processing</td></tr>
                                <tr><td>Analytics Providers</td><td>Aggregated usage stats</td><td>Service improvement</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <SH n="3" title="How We Collect Personal Information" />
                    <ul>
                        <li><strong>Direct:</strong> Account registration, service subscriptions, support interactions, document uploads</li>
                        <li><strong>Automated:</strong> Cookies, server logs, analytics, API integrations</li>
                        <li><strong>Third-Party:</strong> Social login providers (Google, Microsoft), financial data aggregators, identity verification</li>
                    </ul>

                    <SH n="4" title="Legal Basis for Processing (GDPR)" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Legal Basis</th><th>Examples</th></tr></thead>
                            <tbody>
                                <tr><td>Consent (Art. 6(1)(a))</td><td>Marketing emails, cookies, special category data</td></tr>
                                <tr><td>Contract (Art. 6(1)(b))</td><td>Account management, service delivery, payments</td></tr>
                                <tr><td>Legal Obligation (Art. 6(1)(c))</td><td>Tax records, AML compliance</td></tr>
                                <tr><td>Legitimate Interests (Art. 6(1)(f))</td><td>Security, fraud prevention, service improvement</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p>Consent is freely given, specific, informed, unambiguous, and can be withdrawn at any time.</p>

                    <SH n="5" title="How We Use Your Information" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Purpose</th><th>Legal Basis</th><th>Retention</th></tr></thead>
                            <tbody>
                                <tr><td>Account Management</td><td>Contract</td><td>Account duration + 7 years</td></tr>
                                <tr><td>Service Delivery</td><td>Contract</td><td>Service duration + 7 years</td></tr>
                                <tr><td>Payment Processing</td><td>Contract</td><td>7 years (legal requirement)</td></tr>
                                <tr><td>Security &amp; Fraud Prevention</td><td>Legitimate Interest</td><td>3 years</td></tr>
                                <tr><td>Marketing Communications</td><td>Consent</td><td>Until withdrawn</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4"><strong>We do NOT:</strong> sell your personal data, use automated decision-making with legal effects without consent, or profile in ways that result in discrimination.</p>

                    <SH n="6" title="Data Sharing and Disclosure" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Third Party</th><th>Purpose</th></tr></thead>
                            <tbody>
                                <tr><td>Google Cloud Platform</td><td>Infrastructure hosting</td></tr>
                                <tr><td>Firebase</td><td>Authentication, database</td></tr>
                                <tr><td>Stripe</td><td>Payment processing</td></tr>
                                <tr><td>Plaid</td><td>Financial data aggregation</td></tr>
                                <tr><td>SendGrid</td><td>Email delivery</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">We do <strong>NOT</strong> share data with data brokers, advertising networks (without consent), unauthorized third parties, or foreign governments (except as required by law).</p>

                    <SH n="7" title="International Data Transfers" />
                    <p>When transferring personal data outside the EEA, we use Standard Contractual Clauses (SCCs), Adequacy Decisions, and Binding Corporate Rules. US-based processing implements technical and organizational measures equivalent to GDPR standards, including annual third-party security assessments and SOC 2 Type II certification.</p>

                    <SH n="8" title="Data Retention" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Data Category</th><th>Retention Period</th></tr></thead>
                            <tbody>
                                <tr><td>Account Data</td><td>Account lifetime + 7 years</td></tr>
                                <tr><td>Transaction Data</td><td>7 years</td></tr>
                                <tr><td>Communication Records</td><td>3 years</td></tr>
                                <tr><td>Security Logs</td><td>1 year</td></tr>
                                <tr><td>Anonymized Analytics</td><td>Indefinite</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p>Data is securely deleted using cryptographic erasure and industry-standard methods.</p>

                    <SH n="9" title="Your Privacy Rights" />
                    <h3 className="text-lg font-semibold mt-6 mb-2">GDPR Rights (EEA Residents)</h3>
                    <ul>
                        <li><strong>Right of Access</strong> (Art. 15) — Obtain a copy of your personal data within 30 days</li>
                        <li><strong>Right to Rectification</strong> (Art. 16) — Correct inaccurate data</li>
                        <li><strong>Right to Erasure</strong> (Art. 17) — "Right to be forgotten"</li>
                        <li><strong>Right to Restriction</strong> (Art. 18) — Limit processing</li>
                        <li><strong>Right to Portability</strong> (Art. 20) — Receive data in machine-readable format</li>
                        <li><strong>Right to Object</strong> (Art. 21) — Object to legitimate interest processing</li>
                        <li><strong>Withdraw Consent</strong> (Art. 7) — Withdraw at any time, effective immediately</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-6 mb-2">CCPA/CPRA Rights (California Residents)</h3>
                    <ul>
                        <li><strong>Right to Know</strong> — Categories and specific pieces of information collected</li>
                        <li><strong>Right to Delete</strong> — Request deletion of personal information</li>
                        <li><strong>Right to Opt-Out</strong> — Opt out of sale/sharing of personal information</li>
                        <li><strong>Right to Correct</strong> — Request correction of inaccurate information</li>
                        <li><strong>Right to Non-Discrimination</strong> — Equal service regardless of rights exercised</li>
                    </ul>

                    <p className="mt-4"><strong>To submit a privacy request:</strong> Email <a href="mailto:privacy@sirsi.ai">privacy@sirsi.ai</a>. We verify your identity before processing via account authentication, email verification, or government ID for sensitive requests.</p>

                    <SH n="10" title="Security Measures" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Control</th><th>Implementation</th></tr></thead>
                            <tbody>
                                <tr><td>Encryption at Rest</td><td>AES-256-GCM for all stored data</td></tr>
                                <tr><td>Encryption in Transit</td><td>TLS 1.3 for all communications</td></tr>
                                <tr><td>Access Control</td><td>Role-based access with MFA required</td></tr>
                                <tr><td>Network Security</td><td>Firewalls, IDS/IPS, DDoS protection</td></tr>
                                <tr><td>Application Security</td><td>SAST/DAST testing, vulnerability management</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">Multi-Factor Authentication (MFA) is <strong>required</strong> before accessing any service that processes personal data, including login, financial data access, payment processing, and document signing.</p>

                    <SH n="11" title="Cookies and Tracking Technologies" />
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Cookie Type</th><th>Purpose</th><th>Consent Required</th></tr></thead>
                            <tbody>
                                <tr><td>Strictly Necessary</td><td>Site functionality, security</td><td>No</td></tr>
                                <tr><td>Functional</td><td>Preferences, language</td><td>No (Legitimate Interest)</td></tr>
                                <tr><td>Analytics</td><td>Usage statistics</td><td>Yes</td></tr>
                                <tr><td>Marketing</td><td>Personalized advertising</td><td>Yes</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p>We honor Do Not Track (DNT) and Global Privacy Control (GPC) signals as opt-out requests.</p>

                    <SH n="12" title="Children's Privacy" />
                    <p>Our services are not intended for children under 16 (GDPR) or 13 (COPPA). We do not knowingly collect data from children. If we discover such data, we will delete it promptly.</p>

                    <SH n="13" title="Third-Party Services" />
                    <p>Our services may contain links to third-party websites. We are not responsible for their privacy practices. When using social login (Google, Microsoft), we receive limited profile information as authorized by you.</p>

                    <SH n="14" title="Financial Data and Payment Processing" />
                    <ul>
                        <li>We do <strong>not</strong> store complete payment card numbers — processed directly by Stripe (PCI DSS Level 1)</li>
                        <li>Bank account data via Plaid uses tokenized references only — account numbers are not stored</li>
                        <li>You may disconnect linked accounts at any time; financial data deleted within 30 days</li>
                    </ul>

                    <SH n="15" title="Changes to This Policy" />
                    <p>Material changes are notified via email 30 days in advance. Non-material changes are effective upon posting. Previous versions are archived and available upon request. Continued use constitutes acceptance.</p>

                    <SH n="16" title="Contact Information" />
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mt-4">
                        <p className="mb-2"><strong>Data Protection Officer:</strong> <a href="mailto:privacy@sirsi.ai">privacy@sirsi.ai</a></p>
                        <p className="mb-2"><strong>Mail:</strong> Sirsi Technologies Inc., Attn: Privacy, 909 Rose Avenue, Suite 400, North Bethesda, MD 20852</p>
                        <p className="mb-2"><strong>EU Supervisory Authority:</strong> <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener">Find your local authority</a></p>
                        <p><strong>California Attorney General:</strong> Office of the Attorney General, P.O. Box 944255, Sacramento, CA 94244-2550</p>
                    </div>

                    <hr className="my-8" />
                    <p className="text-sm text-slate-500 text-center">© 2026 Sirsi Technologies Inc. All Rights Reserved. · Classification: Public</p>
                </article>
            </section>
        </>
    )
}
