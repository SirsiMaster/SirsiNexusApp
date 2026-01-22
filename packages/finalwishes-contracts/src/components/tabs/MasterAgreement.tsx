/**
 * Master Agreement (MSA) Tab
 * Full legal agreement with terms and conditions
 * 
 * CANONICAL NOTICE: FULL-FIDELITY ENFORCEMENT
 * This component MUST maintain absolute parity with CONTRACT.md.
 * PER RULE 9: Under no circumstances shall the legal language herein be truncated, 
 * summarized, or shortened. All 11 articles must be presented in full.
 */
import { useState } from 'react'
import { useConfigStore, useSetTab } from '../../store/useConfigStore'
import { calculateTotal } from '../../data/catalog'

export function MasterAgreement() {
    const [agreed, setAgreed] = useState(false)
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)

    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })


    // FinalWishes Client is ALWAYS Tameeka Lockhart - not the logged-in user
    // This is a specific contract between Provider (Sirsi/Cylton) and Client (Tameeka)
    const clientName = "Tameeka Lockhart"
    const totalInvestment = calculateTotal(selectedBundle, selectedAddons)

    return (
        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 4rem' }}>
            {/* MSA HEADER */}
            <div style={{
                textAlign: 'center',
                marginBottom: '4rem',
                marginTop: '2rem'
            }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(200,169,81,0.1)',
                    border: '1px solid rgba(200,169,81,0.3)',
                    borderRadius: '20px',
                    padding: '6px 20px',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: '#C8A951', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Governing Legal Framework
                    </span>
                </div>
                <h2 style={{
                    fontSize: '3.5rem',
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    marginBottom: '1.5rem',
                    fontWeight: 700,
                    lineHeight: '1.2'
                }}>
                    Master Service Agreement
                </h2>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '40px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#93c5fd',
                    opacity: 0.8
                }}>
                    <div><strong style={{ color: 'white' }}>Document:</strong> MSA-{currentYear}-111-FW</div>
                    <div><strong style={{ color: 'white' }}>Effective Date:</strong> {currentDate}</div>
                    <div><strong style={{ color: 'white' }}>Status:</strong> BINDING ENFORCEABLE</div>
                </div>
            </div>

            {/* LEGAL DOCUMENT VIEWER */}
            <div className="legal-viewer" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                background: 'rgba(0,0,0,0.2)',
                padding: '60px',
                borderRadius: '4px',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Full MSA Content */}
                {/* Full MSA Content - VERBATIM REPRODUCTION PER RULE 9 */}
                <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', fontSize: '15px', textAlign: 'justify' }}>

                    <section style={{ marginBottom: '48px' }}>
                        <h2 style={{ marginTop: 0, color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '28px', textAlign: 'center', letterSpacing: '0.1em' }}>MASTER SERVICES AGREEMENT (MSA)</h2>
                        <p style={{ marginTop: '24px' }}>
                            <strong>AGREEMENT NUMBER:</strong> MSA-{currentYear}-111-FW<br />
                            <strong>EFFECTIVE DATE:</strong> {currentDate}
                        </p>
                        <p>
                            This <strong>Master Services Agreement</strong> (this "Agreement") is entered into by and between:
                        </p>
                        <p>
                            <strong>{clientName}</strong>, an individual with principal place of business at [Address] ("Client"), and
                            {" "}<strong>Sirsi Technologies, Inc.</strong>, a Delaware corporation (FEIN: 93-1696269), with its principal place of business at 909 Rose Avenue, Suite 400, North Bethesda MD 20852 ("Provider" or "Sirsi"), represented by <strong>Cylton Collymore</strong>, CEO.
                        </p>
                        <p>Client and Provider may be referred to individually as a "Party" and collectively as the "Parties."</p>

                        <div style={{ margin: '40px 0', borderTop: '1px solid rgba(200,169,81,0.2)' }}></div>

                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>1. RECITALS</h3>
                        <p><strong>WHEREAS</strong>, Client desires to engage Provider to design, develop, and implement a <strong>legacy management system</strong> known as <strong>FinalWishes</strong> (the "Platform"), with sufficient foundational infrastructure to support future expansion into estate settlement capabilities in jurisdictions such as Maryland, Illinois, and Minnesota; and</p>
                        <p><strong>WHEREAS</strong>, Provider (Sirsi Technologies, Inc) possesses the requisite technical expertise, personnel, and infrastructure, including expertise in artificial intelligence, cloud architecture, and secure software development, to perform the Services; and</p>
                        <p><strong>WHEREAS</strong>, the Platform is to be constructed utilizing Provider's proprietary <strong>Sirsi Nexus V4 Framework</strong> as the foundational architectural layer; and</p>
                        <p><strong>WHEREAS</strong>, the Parties desire to set forth the terms and conditions under which Provider will provide such services and license certain technologies to Client.</p>
                        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants, terms, and conditions set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>2. DEFINITIONS</h3>
                        <p>For purposes of this Agreement, the following terms shall have the meanings set forth below:</p>
                        <p><strong>2.1 "Affiliate"</strong> means any entity that directly or indirectly controls, is controlled by, or is under common control with a Party, where "control" means ownership of more than fifty percent (50%) of the voting stock or other ownership interest.</p>
                        <p><strong>2.2 "Background Technology" or "Sirsi Nexus V4"</strong> means all software, code, tools, libraries, frameworks, know-how, methodologies, and Intellectual Property Rights owned or licensed by Provider prior to the Effective Date or developed independently of the Services (including, without limitation, Provider's "Sirsi" component library, "The Vault" encryption protocols, "Gemini" guidance patterns, and standard deployment scripts).</p>
                        <p><strong>2.3 "Confidential Information"</strong> means any non-public information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party") that is designated as confidential or that, given the nature of the information or circumstances of disclosure, reasonably should be understood to be confidential.</p>
                        <p><strong>2.4 "Deliverables"</strong> means all documents, work product, code, software, reports, and other materials that are specifically created for and delivered to Client by Provider pursuant to a Statement of Work.</p>
                        <p><strong>2.5 "Foreground IP"</strong> means the Intellectual Property Rights in the specific business logic, probate-specific scripts, and configurations developed strictly and exclusively for FinalWishes, excluding any Background Technology.</p>
                        <p><strong>2.6 "Intellectual Property Rights"</strong> means all patent rights, copyright rights, mask work rights, moral rights, rights of publicity, trademark, trade dress and service mark rights, goodwill, trade secret rights and other intellectual property rights as may now exist or hereafter come into existence, and all applications therefore and registrations, renewals and extensions thereof, under the laws of any state, country, territory or other jurisdiction.</p>
                        <p><strong>2.7 "Services"</strong> means the professional software development, consulting, and design services to be performed by Provider as described in a Statement of Work.</p>
                        <p><strong>2.8 "Statement of Work" or "SOW"</strong> means a document describing the specific Services to be performed, Deliverables to be provided, fees to be paid, and timeline for performance, which is agreed upon and signed by authorized representatives of both Parties. Each SOW shall be substantially in the form of <strong>Exhibit A</strong>.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>3. SERVICES AND ENGAGEMENT</h3>
                        <p><strong>3.1 Statements of Work.</strong> Provider shall provide the Services and Deliverables to Client as specified in each SOW. Each SOW shall be effectively incorporated into this Agreement. In the event of a conflict between the terms of this Agreement and an SOW, the terms of the SOW shall control ONLY regarding the specific description of Services, fees, and timeline; for all other legal terms and conditions, this Agreement shall control.</p>
                        <p><strong>3.2 Standard of Performance.</strong> Provider represents and warrants that the Services will be performed in a professional, workmanlike manner, by qualified personnel, and consistent with the highest industry standards for similar enterprise-grade software development services. Provider shall devote adequate resources to meet its obligations under this Agreement.</p>
                        <p><strong>3.3 Change Orders.</strong> Client may, at any time, request changes to the scope of the Services ("Change Request"). If Provider determines that such changes will impact the fees, timeline, or technical architecture, Provider shall submit a written "Change Order" detailing the impact. No change shall be effective until the Change Order is signed by both Parties. Minor changes requiring less than eight (8) hours of effort may be approved via written correspondence (email sufficient).</p>
                        <p><strong>3.4 Resource Commitment.</strong> Provider commits a <strong>Lead Architect</strong> (Cylton Collymore) at a minimum <strong>60% time commitment</strong> for the duration of the initial development and designates the Project as "Priority Status" within the Sirsi infrastructure.</p>
                        <p><strong>3.5 Review and Close Period.</strong> Following the launch of the Platform, Provider shall provide a <strong>sixty (60) day</strong> "Review and Close" period. During this time, Provider will provide reasonable support to ensure the Platform functions as specified in the SOW.</p>
                        <p><strong>3.6 Ongoing Maintenance & Support.</strong> Client acknowledges that any technical maintenance, feature updates, or priority SLA support beyond the initial 60-day period is <strong>not included</strong> in the base Service Fees and requires the separate purchase of the "Maintenance and Support" add-on as specified in the service catalog.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>4. COMPENSATION AND PAYMENT</h3>
                        <p><strong>4.1 Fees.</strong> Client shall pay Provider the fees set forth in the applicable SOW. Unless otherwise specified in an SOW, fees for fixed-price projects shall be payable according to the agreed-upon milestone schedule.</p>
                        <p><strong>4.2 Expenses.</strong> Client shall reimburse Provider for reasonable, documented "Pass-Through Expenses" incurred in connection with the Services (e.g., specific cloud infrastructure costs, third-party API licensing fees, software licenses specifically required for the Project). Provider shall obtain Client’s prior written approval for any individual expense exceeding Five Hundred Dollars ($500.00).</p>
                        <p><strong>4.3 Payment Terms.</strong> Provider shall submit invoices to Client upon completion of Milestones. Invoices are due and payable <strong>Net Fifteen (15)</strong> days from the invoice date via the Sirsi Vault payment gateway.</p>
                        <p><strong>4.4 Late Payments.</strong> Undisputed payments not received by the due date shall accrue interest at the lesser of one and one-half percent (1.5%) per month or the maximum rate permitted by law, calculated from the due date until paid in full.</p>
                        <p><strong>4.5 Taxes.</strong> Fees do not include any sales, use, value-added, or similar taxes. Client shall be responsible for paying all such taxes properly levied on the Services, excluding taxes based on Provider’s net income, property, or employees.</p>
                        <p><strong>4.6 Sirsi Backend Services.</strong> As part of Provider's Background Technology, the Platform shall integrate with third-party services including but not limited to <strong>OpenSign</strong> (e-signatures), <strong>Plaid</strong> (financial account linking), and <strong>Stripe</strong> (payment processing) through the <strong>Sirsi Backend Service Architecture</strong>. These integrations shall route through Provider's infrastructure to reduce cost complexity and time to market, unless otherwise indicated in writing or upon termination of any maintenance contract between the Parties.</p>
                        <p><strong>4.7 Merchant Fees.</strong> Provider does not pay merchant fees for making payment processing available to the Platform. All payment processing fees (including but not limited to Stripe transaction fees, chargeback fees, and related merchant service charges) shall be <strong>passed through to Client</strong>. Provider shall not pass through any other costs related to infrastructure maintenance and availability.</p>
                        <p><strong>4.8 Future Migration.</strong> If at some time in the future Client opts for its own full signatory and payments integrations independent of Provider's Payment Backend Service Architecture, Provider shall migrate a working implementation to Client for a <strong>nominal fee not to exceed One Thousand Dollars ($1,000.00)</strong>.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>5. INTELLECTUAL PROPERTY RIGHTS</h3>
                        <p><strong>5.1 Work Made for Hire (Foreground IP).</strong> Provider agrees that the <strong>Foreground IP</strong> (specific probate scripts, brand assets, and business logic created exclusively for Client) shall be considered "works made for hire" and owned 100% by Client upon payment of all fees. To the extent that any Deliverable does not qualify as a work made for hire under applicable law, Provider hereby irrevocably helps, transfers, commercializes and assigns to Client all right, title, and interest in and to such Deliverable, including all Intellectual Property Rights therein, free and clear of all liens and encumbrances.</p>
                        <p><strong>5.2 Background Technology (Sirsi Nexus V4 Retention).</strong> Notwithstanding Section 5.1, Provider retains all right, title, and interest in and to its <strong>Background Technology</strong> (the Sirsi Nexus V4 Framework). Provider hereby grants to Client a <strong>perpetual, irrevocable, worldwide, royalty-free, and exclusive vertical license</strong> to use, reproduce, and exploit the Background Technology <em>within the field of Estate Settlement and Probate Automation</em> for the purpose of operating the Platform.</p>
                        <p><strong>5.3 Third-Party and Open Source Software.</strong> The Deliverables may contain third-party software or open source software. Provider warrants that its use of such software will comply with the applicable licenses (e.g., AGPL-3.0, MIT, Apache 2.0). Provider shall identify any "Copyleft" libraries (that would mandate disclosure of Client’s source code) prior to integration and obtain Client’s approval.</p>
                        <p><strong>5.4 AI-Generated Content.</strong> The Parties acknowledge that Provider utilizes advanced Artificial Intelligence tools. Provider warrants that it has the full legal right to assign ownership of such AI-generated output to Client as part of the Deliverables, and that such use does not violate the terms of service of the AI providers.</p>
                        <p><strong>5.5 Further Assurances.</strong> Provider agrees to execute any documents and take any actions reasonably requested by Client to perfect Client’s ownership of the Intellectual Property Rights in the Foreground IP.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>6. CONFIDENTIALITY</h3>
                        <p><strong>6.1 Obligations.</strong> The Receiving Party agrees: (i) to hold the Disclosing Party’s Confidential Information in strict confidence and take reasonable precautions to protect it; (ii) not to divulge any such Confidential Information to any third party; and (iii) not to use such Confidential Information except for the performance of this Agreement.</p>
                        <p><strong>6.2 Exclusions.</strong> Confidential Information shall not include information that: (a) is or becomes generally available to the public without breach of this Agreement; (b) was in the Receiving Party’s possession prior to disclosure without legal restriction; (c) is captured by the Receiving Party from a third party who had the legal right to disclose it; or (d) is independently developed by the Receiving Party without reference to or use of the Confidential Information.</p>
                        <p><strong>6.3 Data Security & SOC 2 Compliance.</strong> Provider agrees to implement and maintain commercially reasonable technical and organizational security measures—consistent with SOC 2 Type II criteria—to protect Client data. Provider shall maintain strict logical separation of Client's production data to ensure no leakage between the Platform and other Sirsi infrastructure tenants.</p>
                        <p><strong>6.4 Compelled Disclosure.</strong> If the Receiving Party is required by law or court order to disclose Confidential Information, it shall give the Disclosing Party prompt written notice (if legally permitted) to allow the Disclosing Party to seek a protective order.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>7. WARRANTIES AND COVENANTS</h3>
                        <p><strong>7.1 Provider Warranties.</strong> Provider represents and warrants that:</p>
                        <p>(a) <strong>Non-Infringement:</strong> The Deliverables will be original and will not infringe, misappropriate, or violate any patent, copyright, trademark, trade secret, or other proprietary right of any third party.</p>
                        <p>(b) <strong>Compliance with Laws:</strong> The Services will be performed in compliance with all applicable federal, state, and local laws and regulations.</p>
                        <p>(c) <strong>Malicious Code:</strong> Provider will use industry-standard measures to ensure the Deliverables do not contain any viruses, malware, trojan horses, time bombs, or other harmful code.</p>
                        <p><strong>7.2 Performance Warranty.</strong> The Performance Warranty is limited to the <strong>sixty (60) day</strong> Review and Close Period. Provider shall correct any material non-conformity with the Specifications at its sole expense during this period. Any requests for remediation following this period shall be governed by the terms of the Maintenance and Support add-on, if purchased.</p>
                        <p><strong>7.3 Disclaimer.</strong> EXCEPT AS EXPRESSLY SET FORTH IN THIS AGREEMENT, PROVIDER MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, AND HEREBY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>8. INDEMNIFICATION</h3>
                        <p><strong>8.1 By Provider.</strong> Provider shall indemnify, defend, and hold harmless Client and its officers, directors, employees, and agents from and against any and all losses, damages, liabilities, costs, and expenses (including reasonable attorneys’ fees) arising out of or resulting from any third-party claim alleging that the Deliverables or Services infringe or misappropriate any U.S. copyright, trademark, or trade secret.</p>
                        <p><strong>8.2 By Client.</strong> Client shall indemnify, defend, and hold harmless Provider from and against any and all losses, damages, liabilities, costs, and expenses arising out of or resulting from: (i) Client’s specific specifications or instructions that compelled the infringement; or (ii) content or data provided by Client to Provider.</p>
                        <p><strong>8.3 Procedure.</strong> The indemnified party shall: (a) promptly notify the indemnifying party in writing of the claim; (b) allow the indemnifying party sole control of the defense and settlement of the claim; and (c) provide reasonable assistance to the indemnifying party.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>9. LIMITATION OF LIABILITY</h3>
                        <p><strong>9.1 Exclusion of Consequential Damages.</strong> EXCEPT FOR BREACHES OF CONFIDENTIALITY (SECTION 6) OR INDEMNIFICATION OBLIGATIONS (SECTION 8), IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR USE), EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
                        <p><strong>9.2 Liability Cap.</strong> EXCEPT FOR PROVIDER'S INDEMNIFICATION OBLIGATIONS FOR IP INFRINGEMENT (SECTION 8.1), EACH PARTY’S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT, OR OTHERWISE, SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY CLIENT TO PROVIDER UNDER THE APPLICABLE SOW IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>10. TERM AND TERMINATION</h3>
                        <p><strong>10.1 Term.</strong> This Agreement shall commence on the Effective Date and shall continue in full force and effect until terminated as provided herein.</p>
                        <p><strong>10.2 Termination for Convenience.</strong> Client may terminate this Agreement or any SOW for any reason or no reason upon thirty (30) days' prior written notice to Provider. Upon such termination, Client shall pay Provider for all Services performed and non-cancellable expenses incurred up to the date of termination.</p>
                        <p><strong>10.3 Termination for Cause.</strong> Either Party may terminate this Agreement or any SOW immediately upon written notice if the other Party: (i) materially breaches this Agreement and fails to cure such breach within fifteen (15) days after receiving written notice thereof; or (ii) becomes insolvent, makes an assignment for the benefit of creditors, or files for bankruptcy.</p>
                        <p><strong>10.4 Effect of Termination.</strong> Upon termination: (i) Client shall pay all outstanding undisputed invoices; (ii) Provider shall deliver to Client all completed and partially completed Deliverables; and (iii) each Party shall return or destroy the other Party’s Confidential Information.</p>
                        <p><strong>10.5 Survival.</strong> Sections 2, 4, 5, 6, 7.3, 8, 9, and 11 shall survive any termination or expiration of this Agreement.</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>11. GENERAL PROVISIONS</h3>
                        <p><strong>11.1 Independent Contractor.</strong> Provider is an independent contractor. No partnership or employment relationship is created.</p>
                        <p><strong>11.2 Market Vertical Non-Competition.</strong> Provider agrees that during the term of this Agreement and for a period of <strong>three (3) years</strong> thereafter, Provider shall not directly develop, market, or provide services for a competing <strong>Estate Settlement, Probate Automation, or Legacy Planning</strong> platform. This does not restrict Provider from using its foundational tech in unrelated market verticals.</p>
                        <p><strong>11.3 Force Majeure.</strong> Neither Party shall be liable for any delay or failure to perform (excluding payment obligations) due to causes beyond its reasonable control, including acts of God, war, terrorism, riot, embargoes, acts of civil or military authorities, fire, floods, or accidents.</p>
                        <p><strong>11.4 Non-Solicitation.</strong> During the Term and for one (1) year thereafter, neither Party shall knowingly solicit for employment or hire any employee or contractor of the other Party who was directly involved in the provision of Services under this Agreement, without the prior written consent of the other Party.</p>
                        <p><strong>11.5 Dispute Resolution.</strong> Negotiation followed by binding arbitration in <strong>Wilmington, Delaware</strong>. Governed by <strong>Delaware Law</strong>.</p>
                    </section>
                </div>

                {/* Appendix A Header */}
                <div style={{ margin: '80px 0 40px 0', borderTop: '2px solid #C8A951', paddingTop: '40px' }}>
                    <h2 style={{ color: '#C8A951', textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '24px' }}>EXHIBIT A: STATEMENT OF WORK (SOW)</h2>
                    <h4 style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '8px', marginBottom: '40px' }}>Full Execution Details and Technical Specifications</h4>
                </div>

                <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', fontSize: '15px' }}>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: '40px' }}>
                        Project Name: FinalWishes Platform Development • SOW Reference: SOW-2026-001 • Date: January 22, 2026
                    </p>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>1. EXECUTIVE OVERVIEW</h3>
                    <p>This Statement of Work (“SOW”) defines the comprehensive scope for the <strong>FinalWishes Legacy Management System</strong>. This project aims to build foundational legacy management infrastructure with foundational support for future expansion into estate settlement capabilities in jurisdictions such as Maryland, Illinois, and Minnesota.</p>
                    <p><strong>Objective:</strong> deliver a “Vault-Grade” secure platform that allows users to securely organize, document, and manage their legacy assets and final wishes, providing a permanent, cryptographically-secure repository for digital inheritance and beneficiary instructions.</p>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', marginTop: '40px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>2. DETAILED SCOPE OF SERVICES</h3>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.1 Core Vault & Data Architecture</h4>
                    <p>Provider shall implement a <strong>Multi-Tenant, Zero-Knowledge</strong> architecture to ensure total data privacy.</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                        <li><strong>Storage Layer:</strong> Hybrid approach using <strong>Cloud SQL (PostgreSQL)</strong> for structured PII (Encrypted) and <strong>Firestore</strong> for real-time document metadata.</li>
                        <li><strong>File Vault:</strong> <strong>Cloud Storage</strong> buckets with per-tenant isolation boundaries. All files encrypted at rest using <strong>Cloud KMS</strong> (AES-256).</li>
                        <li><strong>Security:</strong> Implementation of <strong>SOC 2 Type II</strong> controls, including strict IAM roles, audit logging, and encryption in transit (TLS 1.3).</li>
                    </ul>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.2 Technology Stack (SirsiNexus V4)</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                        <li><strong>Frontend:</strong> <strong>React 18</strong> (Vite), <strong>Tanstack</strong> (Query, Router, Table), <strong>shadcn/ui</strong> (Radix Primitives + Tailwind).</li>
                        <li><strong>Backend:</strong> <strong>Go (Golang)</strong> on <strong>Cloud Run</strong> (Serverless), <strong>Firebase Auth</strong>.</li>
                        <li><strong>Database:</strong> <strong>Cloud SQL</strong> (PostgreSQL) + <strong>Firestore</strong> (Real-time).</li>
                        <li><strong>Mobile:</strong> <strong>React Native</strong> (Expo) sharing core business logic.</li>
                    </ul>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.3 Document Inventory & Automation Scope</h4>
                    <p>Provider will build automation or manual guidance paths for the following specific document categories:</p>
                    <p><strong>A. Identity & Vital Records:</strong> Death Certificate (Manual upload/OCR processing); Social Security/Gov ID (Secure entry & validation).</p>
                    <p><strong>B. Future State Engine Framework (Expansion):</strong> Maryland/Illinois/Minnesota: Foundational logic mapping for future expansion into MDEC (Maryland), eCourt (Illinois), and MNCIS (Minnesota) e-filing guidance. <em>Note: Active development of direct court filing automation is reserved for future statement(s) of work.</em></p>
                    <p><strong>C. Financial & Asset Documents:</strong> Asset Discovery (Plaid integration for 12,000+ institutions); Life Insurance/Retirement (Standard claim letter generation); Real Estate (Manual tracking + valuation APIs).</p>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.4 System Integrations</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Service</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Purpose</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Integration Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>Plaid</strong></td>
                                <td style={{ padding: '12px' }}>Financial Account Linking</td>
                                <td style={{ padding: '12px' }}>Deep Integration</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>OpenSign</strong></td>
                                <td style={{ padding: '12px' }}>E-Signatures</td>
                                <td style={{ padding: '12px' }}>Self-Hosted API</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>Lob</strong></td>
                                <td style={{ padding: '12px' }}>Physical Mail</td>
                                <td style={{ padding: '12px' }}>API Triggered</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}><strong>Vertex AI</strong></td>
                                <td style={{ padding: '12px' }}>Process Guidance</td>
                                <td style={{ padding: '12px' }}>RAG Pipeline</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', marginTop: '40px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>3. WORK BREAKDOWN STRUCTURE (WBS)</h3>
                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div>
                            <h4 style={{ color: 'white', marginBottom: '8px' }}>PHASE 1: FOUNDATION & VAULT ARCHITECTURE (Weeks 1-4)</h4>
                            <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                <li>GCP Infrastructure provisioning (Run, SQL, Firestore)</li>
                                <li>Firebase Auth + MFA implementation</li>
                                <li>AES-256 Vault crypto service implementation</li>
                                <li>React 18 Component System & CI/CD Setup</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'white', marginBottom: '8px' }}>PHASE 2: LEGACY LOGIC & ASSET FRAMEWORK (Weeks 5-10)</h4>
                            <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                <li>Plaid Integration & Legacy Inventory</li>
                                <li>Beneficiary Logic & Secure Access Delegation</li>
                                <li>Instruction Engine & Digital Inheritance Protocols</li>
                                <li>Document Management & Metadata Mapping</li>
                                <li>Gemini RAG: Legacy Framework Context & Guidance</li>
                                <li>Notification System: Life-Event Triggering Logic</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'white', marginBottom: '8px' }}>PHASE 3: MOBILE & DEEP INTEGRATIONS (Weeks 11-16)</h4>
                            <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                <li>React Native Expo development (iOS/Android)</li>
                                <li>Biometric Auth & Native Camera modules</li>
                                <li>Full Webhook handling for Plaid/Stripe/Lob</li>
                                <li>Offline sync engine for mobile resilience</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: 'white', marginBottom: '8px' }}>PHASE 4: AUDIT, SECURITY & LAUNCH (Weeks 17-20)</h4>
                            <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                <li>Internal security audit & SOC 2 evidence collection</li>
                                <li>Load testing (k6) to 1,000 concurrent users</li>
                                <li>App Store & Play Store submission</li>
                                <li>Production migration & DNS switchover</li>
                            </ul>
                        </div>
                    </div>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', marginTop: '40px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>4. ASSUMPTIONS</h3>
                    <ol style={{ paddingLeft: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        <li><strong>Future Expansion Support:</strong> Logic is focused on foundational legacy management, with future support planned for Maryland, Illinois, and Minnesota.</li>
                        <li><strong>No Legal Advice:</strong> The “Shepherd” provides procedural guidance, not legal advice.</li>
                        <li><strong>Third-Party Costs:</strong> Client pays direct consumption costs for Stripe, Plaid, Lob, and Google Cloud.</li>
                        <li><strong>Content:</strong> Client is responsible for final validation of court form templates.</li>
                    </ol>
                </div>
            </div>

            {/* ACKNOWLEDGMENT SECTION */}
            <div style={{
                maxWidth: '1200px',
                margin: '48px auto',
                background: 'rgba(200,169,81,0.08)',
                border: '1px solid rgba(200,169,81,0.3)',
                borderRadius: '12px',
                padding: '32px'
            }}>
                <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '18px',
                    color: '#C8A951',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    Agreement Acknowledgment
                </h3>
                <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '14px',
                    cursor: 'pointer'
                }}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        style={{ width: '20px', height: '20px', marginTop: '2px' }}
                    />
                    <span>
                        I, <strong style={{ color: '#C8A951' }}>{clientName}</strong>, have read, understand, and agree to be bound by the terms and conditions of this
                        Master Service Agreement. I acknowledge that this Agreement, together with the attached
                        Statement of Work, constitutes a binding legal contract for a total investment of <strong style={{ color: '#C8A951' }}>${totalInvestment.toLocaleString()}</strong>.
                    </span>
                </label>
            </div>

            {/* NEXT BUTTON */}
            <div style={{
                width: '100%',
                marginTop: '4rem',
                marginBottom: '3rem',
                display: 'flex',
                justifyContent: 'flex-end',
                maxWidth: '1200px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <button
                    onClick={() => setTab('vault')}
                    disabled={!agreed}
                    className="select-plan-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 24px',
                        opacity: agreed ? 1 : 0.5,
                        cursor: agreed ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span>Proceed to Signature</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
