/**
 * Terms of Service — Full legal terms grounded in Sirsi operational data
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Content synthesized from PRIVACY_POLICY.md, INFORMATION_SECURITY_POLICY.md,
 * and SECURITY_COMPLIANCE.md canonical documents.
 */

import { createRoute, Link } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

const LinkComp = Link as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/terms',
    component: TermsPage,
})

function SH({ n, title }: { n: string; title: string }) {
    return <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">{n}. {title}</h2>
}

function TermsPage() {
    return (
        <>
            {/* ═══════════════ HERO ═══════════════ */}
            <section className="relative py-12" style={{ background: 'linear-gradient(135deg, #f8fafc, #ecfdf5, #d1fae5)' }}>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Terms of <span className="text-emerald-600">Service</span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        <strong>Document ID:</strong> SIRSI-TOS-001 &nbsp;·&nbsp;
                        <strong>Version:</strong> 1.0.0 &nbsp;·&nbsp;
                        <strong>Effective:</strong> January 28, 2026
                    </p>
                    <p className="text-sm text-slate-500 mt-2">Last Updated: January 28, 2026</p>
                </div>
            </section>

            {/* ═══════════════ TERMS BODY ═══════════════ */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <article className="max-w-4xl mx-auto px-6 prose prose-slate dark:prose-invert prose-headings:font-bold prose-a:text-emerald-600 prose-table:text-sm max-w-none">

                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                        These Terms of Service ("Terms") govern your access to and use of the services,
                        applications, and platforms operated by Sirsi Technologies Inc. ("Sirsi," "we," "us," or "our"),
                        including the SirsiNexus platform, Sirsi Sign, and all associated websites and services
                        (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms.
                    </p>

                    <SH n="1" title="Acceptance of Terms" />
                    <p>By creating an account, accessing, or using any part of the Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our <LinkComp to="/privacy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</LinkComp>. If you do not agree, you must not access or use the Services.</p>
                    <p>If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>

                    <SH n="2" title="Description of Services" />
                    <p>Sirsi Technologies operates an AI-powered cloud infrastructure management platform that includes:</p>
                    <ul>
                        <li><strong>SirsiNexus Platform</strong> — Agent-embedded infrastructure orchestration, multi-cloud management, and autonomous optimization across NVIDIA, Google TPU, and Apple Silicon architectures</li>
                        <li><strong>Sirsi Sign</strong> — Digital document execution, e-signing, payment processing, and contract lifecycle management</li>
                        <li><strong>Sirsi Vault</strong> — Secure document storage, financial ledger, and asset management</li>
                        <li><strong>Administrative Portal</strong> — User management, analytics, security monitoring, and system administration</li>
                        <li><strong>API Services</strong> — gRPC and REST APIs for programmatic access to platform capabilities</li>
                    </ul>

                    <SH n="3" title="Account Registration and Security" />
                    <p>To access certain features, you must create an account. You agree to:</p>
                    <ul>
                        <li>Provide accurate, current, and complete registration information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security and confidentiality of your login credentials</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized use at <a href="mailto:security@sirsi.ai">security@sirsi.ai</a></li>
                    </ul>
                    <h3 className="text-lg font-semibold mt-6 mb-2">Multi-Factor Authentication (MFA)</h3>
                    <p>MFA is <strong>mandatory</strong> for all administrative, developer, and financial service access. Supported methods include TOTP (Authenticator Apps), SMS, and FIDO2/WebAuthn hardware keys. MFA must be completed before accessing any service that processes personal or financial data, including Plaid, Stripe, and Sirsi Sign.</p>

                    <SH n="4" title="Acceptable Use" />
                    <p>You agree not to:</p>
                    <ul>
                        <li>Violate any applicable law, regulation, or third-party rights</li>
                        <li>Use the Services for any illegal, fraudulent, or harmful purpose</li>
                        <li>Attempt to gain unauthorized access to any system, network, or account</li>
                        <li>Interfere with the security, integrity, or performance of the Services</li>
                        <li>Reverse engineer, decompile, or disassemble any part of the Services</li>
                        <li>Use automated tools (scrapers, bots) to access the Services without authorization</li>
                        <li>Transmit malware, viruses, or other harmful code</li>
                        <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                        <li>Exceed API rate limits (100 requests/minute standard, 1000/minute authenticated)</li>
                    </ul>

                    <SH n="5" title="Intellectual Property Rights" />
                    <p>The Services and all content, features, and functionality — including source code, algorithms, designs, text, graphics, logos, and the proprietary NebuLang Protocol, Neural-Fractal Architecture, and KG Query Engine technologies — are owned by Sirsi Technologies Inc. and are protected by U.S. and international copyright, trademark, patent, and trade secret laws.</p>
                    <p>We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services solely for your authorized business purposes, subject to these Terms.</p>
                    <h3 className="text-lg font-semibold mt-6 mb-2">Your Content</h3>
                    <p>You retain ownership of content you submit to the Services. By submitting content, you grant Sirsi a worldwide, non-exclusive license to use, process, and store that content solely for the purpose of providing the Services to you.</p>

                    <SH n="6" title="Payment Terms" />
                    <p>Certain Services require payment. All fees are stated in U.S. dollars and are non-refundable unless otherwise specified.</p>
                    <ul>
                        <li>Payment is processed by <strong>Stripe</strong> (PCI DSS Level 1 certified) — we do not store complete payment card numbers</li>
                        <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                        <li>Usage-based fees are billed in arrears based on actual consumption</li>
                        <li>We may change pricing with 30 days' advance notice</li>
                        <li>Failure to pay may result in suspension or termination of access</li>
                    </ul>

                    <SH n="7" title="Data Protection and Security" />
                    <p>We implement enterprise-grade security measures to protect your data:</p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead><tr><th>Measure</th><th>Standard</th></tr></thead>
                            <tbody>
                                <tr><td>Encryption at Rest</td><td>AES-256-GCM via Google Cloud KMS</td></tr>
                                <tr><td>Encryption in Transit</td><td>TLS 1.3 (minimum TLS 1.2)</td></tr>
                                <tr><td>Authentication</td><td>Firebase Auth with mandatory MFA</td></tr>
                                <tr><td>Authorization</td><td>Role-based access control (RBAC)</td></tr>
                                <tr><td>Compliance Target</td><td>SOC 2 Type II</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4">For complete details, see our <LinkComp to="/privacy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</LinkComp> and <LinkComp to="/security" className="text-emerald-600 hover:text-emerald-700">Security page</LinkComp>.</p>

                    <SH n="8" title="Service Availability and Support" />
                    <p>We strive for 99.9% platform uptime using Google Cloud Run auto-scaling and Firebase global CDN. However, the Services are provided "as available" and we do not guarantee uninterrupted access. Planned maintenance will be communicated in advance.</p>
                    <p>Support is available via <a href="mailto:cylton@sirsi.ai">cylton@sirsi.ai</a> and through the administrative portal.</p>

                    <SH n="9" title="Disclaimers" />
                    <p className="uppercase text-sm tracking-wide">THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>
                    <p>We do not warrant that the Services will be uninterrupted, error-free, secure, or free from viruses or other harmful components. AI-generated recommendations are provided as guidance and should be validated by qualified professionals before implementation in production environments.</p>

                    <SH n="10" title="Limitation of Liability" />
                    <p className="uppercase text-sm tracking-wide">TO THE MAXIMUM EXTENT PERMITTED BY LAW, SIRSI TECHNOLOGIES INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.</p>
                    <p>Our aggregate liability for all claims arising from these Terms shall not exceed the greater of (a) the amount you paid us in the twelve months preceding the claim, or (b) one hundred dollars ($100).</p>

                    <SH n="11" title="Indemnification" />
                    <p>You agree to indemnify, defend, and hold harmless Sirsi Technologies Inc. and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.</p>

                    <SH n="12" title="Termination" />
                    <p>Either party may terminate these Terms at any time. We may suspend or terminate your access if you violate these Terms, fail to pay applicable fees, or if required by law. Upon termination:</p>
                    <ul>
                        <li>Your right to access the Services ceases immediately</li>
                        <li>We will retain your data in accordance with our <LinkComp to="/privacy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</LinkComp> retention schedules</li>
                        <li>You may request export of your data within 30 days of termination</li>
                        <li>Sections 5, 9, 10, 11, and 13 survive termination</li>
                    </ul>

                    <SH n="13" title="Governing Law and Dispute Resolution" />
                    <p>These Terms are governed by the laws of the State of Maryland, without regard to conflict of law principles. Any disputes arising from these Terms shall be resolved through binding arbitration administered by the American Arbitration Association in Montgomery County, Maryland.</p>
                    <p>You waive any right to participate in a class action lawsuit or class-wide arbitration against Sirsi Technologies Inc.</p>

                    <SH n="14" title="Modifications to Terms" />
                    <p>We may modify these Terms at any time. Material changes will be communicated via email at least 30 days before taking effect. Your continued use of the Services after modifications constitutes acceptance. If you disagree with changes, you must stop using the Services and contact us for account closure.</p>

                    <SH n="15" title="General Provisions" />
                    <ul>
                        <li><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and Sirsi</li>
                        <li><strong>Severability:</strong> If any provision is held invalid, the remaining provisions continue in effect</li>
                        <li><strong>Waiver:</strong> Failure to enforce any provision does not constitute a waiver</li>
                        <li><strong>Assignment:</strong> You may not assign these Terms without our written consent</li>
                        <li><strong>Force Majeure:</strong> Neither party is liable for failure due to events beyond reasonable control</li>
                    </ul>

                    <SH n="16" title="Contact Information" />
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mt-4">
                        <p className="mb-2"><strong>Sirsi Technologies Inc.</strong></p>
                        <p className="mb-2">909 Rose Avenue, Suite 400, North Bethesda, MD 20852</p>
                        <p className="mb-2"><strong>General Inquiries:</strong> <a href="mailto:cylton@sirsi.ai">cylton@sirsi.ai</a></p>
                        <p className="mb-2"><strong>Legal:</strong> <a href="mailto:legal@sirsi.ai">legal@sirsi.ai</a></p>
                        <p><strong>Security:</strong> <a href="mailto:security@sirsi.ai">security@sirsi.ai</a></p>
                    </div>

                    <hr className="my-8" />
                    <p className="text-sm text-slate-500 text-center">© 2026 Sirsi Technologies Inc. All Rights Reserved.</p>
                </article>
            </section>
        </>
    )
}
