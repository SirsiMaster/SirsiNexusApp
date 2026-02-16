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
import { PRODUCTS, calculateTotal, calculateTimeline, calculateTotalHours, getAggregatedWBS } from '../../data/catalog'
import { getInterpolatedTemplate } from '../../data/projectTemplates'

export function MasterAgreement() {
    const [agreed, setAgreed] = useState(false)
    const setTab = useSetTab()
    const selectedBundle = useConfigStore(state => state.selectedBundle)
    const selectedAddons = useConfigStore(state => state.selectedAddons)
    const ceoConsultingWeeks = useConfigStore(state => state.ceoConsultingWeeks)
    const probateStates = useConfigStore(state => state.probateStates)
    const clientName = useConfigStore(state => state.clientName)
    const projectName = useConfigStore(state => state.projectName)
    const projectId = useConfigStore(state => state.projectId)
    const entityLegalName = useConfigStore(state => state.entityLegalName)
    const counterpartyName = useConfigStore(state => state.counterpartyName)
    const counterpartyTitle = useConfigStore(state => state.counterpartyTitle)

    const tpl = getInterpolatedTemplate(projectId, projectName)

    const currentYear = new Date().getFullYear()
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })


    // CRITICAL: PER GEMINI.MD RULE 12, all calculations MUST be dynamic.
    // Hardcoded financial values are strictly prohibited.
    const totalAmountResult = calculateTotal(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length, 1.0);
    const totalAmount = totalAmountResult.total;
    const marketValue = totalAmountResult.marketTotal;
    const totalTimeline = calculateTimeline(selectedBundle, selectedAddons, probateStates.length)
    const totalHours = calculateTotalHours(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)
    const aggregatedPhases = getAggregatedWBS(selectedBundle, selectedAddons, ceoConsultingWeeks, probateStates.length)

    const efficiencyDiscount = Math.round(marketValue * 0.15); // 15% platform efficiency
    const familyDiscount = marketValue - efficiencyDiscount - totalAmount;





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
                    <div><strong style={{ color: 'white' }}>Document:</strong> MSA-{currentYear}-111-{tpl.docCode}</div>
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
                            <strong>AGREEMENT NUMBER:</strong> MSA-{currentYear}-111-{tpl.docCode}<br />
                            <strong>EFFECTIVE DATE:</strong> {currentDate}
                        </p>
                        <p>
                            This <strong>Master Services Agreement</strong> (this "Agreement") is entered into by and between:
                        </p>
                        <p>
                            <strong>{clientName || 'The Client'}</strong>, an individual or entity ("Client"), and
                            {" "}<strong>{entityLegalName}</strong>, a Delaware corporation (FEIN: 99-1057313), with its principal place of business at 909 Rose Avenue, Suite 400, North Bethesda MD 20852 ("Provider" or "Sirsi"), represented by <strong>{counterpartyName}</strong>, {counterpartyTitle}.
                        </p>
                        <p>Client and Provider may be referred to individually as a "Party" and collectively as the "Parties."</p>

                        <div style={{ margin: '40px 0', borderTop: '1px solid rgba(200,169,81,0.2)' }}></div>

                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>1. RECITALS</h3>
                        <p><strong>WHEREAS</strong>, {tpl.msaRecital}; and</p>
                        <p><strong>WHEREAS</strong>, Provider ({entityLegalName}) possesses the requisite technical expertise, personnel, and infrastructure, including expertise in artificial intelligence, cloud architecture, and secure software development, to perform the Services; and</p>
                        <p><strong>WHEREAS</strong>, the Platform is to be constructed utilizing Provider's proprietary <strong>Sirsi Nexus V4 Framework</strong> as the foundational architectural layer; and</p>
                        <p><strong>WHEREAS</strong>, the Parties desire to set forth the terms and conditions under which Provider will provide such services and license certain technologies to Client.</p>
                        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants, terms, and conditions set forth herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the Parties agree as follows:</p>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>2. DEFINITIONS</h3>
                        <p>For purposes of this Agreement, the following terms shall have the meanings set forth below:</p>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.1 "Affiliate"</strong> means any entity that directly or indirectly controls, is controlled by, or is under common control with a Party, where "control" means ownership of more than fifty percent (50%) of the voting stock or other ownership interest.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '12px' }}><strong>2.2 "Background Technology" or "Sirsi Nexus V4"</strong> means the Provider's proprietary foundational technology platform, including all software, code, tools, libraries, frameworks, know-how, methodologies, algorithms, and Intellectual Property Rights owned, licensed, or developed by Provider, whether prior to the Effective Date or during the Term. This expansive definition explicitly includes, without limitation:</p>
                            <div style={{ paddingLeft: '24px', borderLeft: '2px solid rgba(200,169,81,0.3)' }}>
                                <p style={{ marginBottom: '8px' }}><strong>(i) Core Architecture & Infrastructure:</strong> The "Sirsi Nexus" application framework, serverless deployment configurations, Infrastructure-as-Code (IaC) templates, CI/CD pipelines, and microservices architectures;</p>
                                <p style={{ marginBottom: '8px' }}><strong>(ii) Security & Compliance Engines:</strong> "The Vault" encryption protocols (AES-256, KMS integration), Identity and Access Management (IAM) systems, SOC 2 compliance controls, and audit logging mechanisms;</p>
                                <p style={{ marginBottom: '8px' }}><strong>(iii) Universal Component System (UCS):</strong> The standardized integration layer and adapters for third-party services (including but not limited to Stripe, Plaid, OpenSign, and SendGrid) designed for portfolio-wide reuse;</p>
                                <p style={{ marginBottom: '8px' }}><strong>(iv) AI & Orchestration:</strong> The "Gemini" guidance engine patterns, RAG (Retrieval-Augmented Generation) pipelines, prompt engineering frameworks, and agentic workflow orchestration logic;</p>
                                <p style={{ marginBottom: '8px' }}><strong>(v) Interface & Design Systems:</strong> The "Sirsi UI" component library, reusable React/Tailwind components, design tokens, and aesthetic themes (e.g., "Royal Neo-Deco" base styles); and</p>
                                <p style={{ marginBottom: '0' }}><strong>(vi) Continuous Evolution:</strong> Any updates, upgrades, improvements, patches, derivative works, or new modules added to the foregoing during the Term to support Provider's broader portfolio of services.</p>
                            </div>
                            <p style={{ marginTop: '12px' }}>Background Technology is the underlying "operating system" upon which the Platform is built.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.3 "Confidential Information"</strong> means any non-public information disclosed by one Party (the "Disclosing Party") to the other Party (the "Receiving Party") that is designated as confidential or that, given the nature of the information or circumstances of disclosure, reasonably should be understood to be confidential.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.4 "Deliverables"</strong> means all documents, work product, code, software, reports, and other materials that are specifically created for and delivered to Client by Provider pursuant to a Statement of Work.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '12px' }}><strong>2.5 "Foreground IP"</strong> means {tpl.msaForegroundIpDescription}. This explicitly encompasses the custom-built application layer and includes, without limitation:</p>
                            <div style={{ paddingLeft: '24px', borderLeft: '2px solid rgba(200,169,81,0.3)' }}>
                                {tpl.msaForegroundIpItems.map((item, i) => (
                                    <p key={i} style={{ marginBottom: '8px' }}><strong>({String.fromCharCode(105 + i)})</strong> {item}{i < tpl.msaForegroundIpItems.length - 1 ? ';' : '.'}</p>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.6 "Intellectual Property Rights"</strong> means all patent rights, copyright rights, mask work rights, moral rights, rights of publicity, trademark, trade dress and service mark rights, goodwill, trade secret rights and other intellectual property rights as may now exist or hereafter come into existence, and all applications therefore and registrations, renewals and extensions thereof, under the laws of any state, country, territory or other jurisdiction.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.7 "Services"</strong> means the professional software development, consulting, and design services to be performed by Provider as described in a Statement of Work.</p>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ marginBottom: '8px' }}><strong>2.8 "Statement of Work" or "SOW"</strong> means a document describing the specific Services to be performed, Deliverables to be provided, fees to be paid, and timeline for performance, which is agreed upon and signed by authorized representatives of both Parties. Each SOW shall be substantially in the form of <strong>Exhibit A</strong>.</p>
                        </div>
                    </section>

                    <section style={{ marginBottom: '48px' }}>
                        <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px' }}>3. SERVICES AND ENGAGEMENT</h3>
                        <p><strong>3.1 Statements of Work.</strong> Provider shall provide the Services and Deliverables to Client as specified in each SOW. Each SOW shall be effectively incorporated into this Agreement. In the event of a conflict between the terms of this Agreement and an SOW, the terms of the SOW shall control ONLY regarding the specific description of Services, fees, and timeline; for all other legal terms and conditions, this Agreement shall control.</p>
                        <p><strong>3.2 Standard of Performance.</strong> Provider represents and warrants that the Services will be performed in a professional, workmanlike manner, by qualified personnel, and consistent with the highest industry standards for similar enterprise-grade software development services. Provider shall devote adequate resources to meet its obligations under this Agreement.</p>
                        <p><strong>3.3 Change Orders.</strong> Client may, at any time, request changes to the scope of the Services ("Change Request"). If Provider determines that such changes will impact the fees, timeline, or technical architecture, Provider shall submit a written "Change Order" detailing the impact. No change shall be effective until the Change Order is signed by both Parties. Minor changes requiring less than eight (8) hours of effort may be approved via written correspondence (email sufficient).</p>
                        <p><strong>3.4 Resource Commitment.</strong> Provider commits a <strong>Lead Architect</strong> (Cylton Collymore) at a maximum of <strong>50% time commitment</strong> for the duration of the initial development and designates the Project as "Priority Status" within the Sirsi infrastructure.</p>
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
                        <p><strong>5.1 Work Made for Hire (Foreground IP).</strong> Provider agrees that the <strong>Foreground IP</strong> (specific business logic, brand assets, and custom workflows created exclusively for Client) shall be considered "works made for hire" and owned 100% by Client upon payment of all fees. To the extent that any Deliverable does not qualify as a work made for hire under applicable law, Provider hereby irrevocably helps, transfers, commercializes and assigns to Client all right, title, and interest in and to such Deliverable, including all Intellectual Property Rights therein, free and clear of all liens and encumbrances.</p>
                        <p><strong>5.2 Background Technology (Sirsi Nexus V4 Retention).</strong> Notwithstanding Section 5.1, Provider retains all right, title, and interest in and to its <strong>Background Technology</strong> (the Sirsi Nexus V4 Framework). Provider hereby grants to Client a <strong>perpetual, irrevocable, worldwide, royalty-free, and exclusive vertical license</strong> to use, reproduce, and exploit the Background Technology <em>{tpl.msaVerticalLicense}</em> for the purpose of operating the Platform.</p>
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
                        <p><strong>11.2 Market Vertical Non-Competition.</strong> Provider agrees that during the term of this Agreement and for a period of <strong>three (3) years</strong> thereafter, Provider shall not directly develop, market, or provide services for a competing <strong>{tpl.msaNonCompeteVertical}</strong> platform. This does not restrict Provider from using its foundational tech in unrelated market verticals.</p>
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
                        Project Name: {projectName} Platform Development • SOW Reference: SOW-{currentYear}-001 • Date: {currentDate}
                    </p>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>1. EXECUTIVE OVERVIEW</h3>
                    <p>{tpl.msaSowOverview}</p>
                    <p><strong>Objective:</strong> {tpl.msaSowObjective}</p>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', marginTop: '40px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>2. DETAILED SCOPE OF SERVICES</h3>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.1 Core Vault & Data Architecture</h4>
                    <p>Provider shall implement a <strong>Multi-Tenant, Zero-Knowledge</strong> architecture to ensure total data privacy.</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                        <li><strong>Storage Layer:</strong> Hybrid approach using <strong>Cloud SQL (PostgreSQL)</strong> for structured PII (Encrypted) and <strong>Firestore</strong> for real-time document metadata.</li>
                        <li><strong>File Vault:</strong> <strong>Cloud Storage</strong> buckets with per-tenant isolation boundaries. All files encrypted at rest using <strong>Cloud KMS</strong> (AES-256).</li>
                        <li><strong>Security:</strong> Implementation of <strong>SOC 2 Type II</strong> controls, including strict IAM roles, audit logging, and encryption in transit (TLS 1.3).</li>
                    </ul>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.2 Selected Service Modules</h4>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '24px' }}>
                        {selectedAddons.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {selectedAddons.map(id => {
                                    const product = PRODUCTS[id]
                                    let displayName = product?.name || id
                                    if (id === 'ceo-consulting') displayName += ` (${ceoConsultingWeeks} weeks)`
                                    if (id === 'probate') displayName += ` (${probateStates.length} state${probateStates.length > 1 ? 's' : ''})`
                                    return (
                                        <li key={id} style={{ marginBottom: '8px' }}>
                                            <strong>{displayName}:</strong> {product?.shortDescription || 'Strategic add-on module.'}
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{tpl.msaNoSelectFallback}</p>
                        )}
                    </div>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.3 Technology Stack (SirsiNexus V4)</h4>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                        <li><strong>Frontend:</strong> <strong>React 18</strong> (Vite), <strong>Tanstack</strong> (Query, Router, Table), <strong>shadcn/ui</strong> (Radix Primitives + Tailwind).</li>
                        <li><strong>Backend:</strong> <strong>Go (Golang)</strong> on <strong>Cloud Run</strong> (Serverless), <strong>Firebase Auth</strong>.</li>
                        <li><strong>Database:</strong> <strong>Cloud SQL</strong> (PostgreSQL) + <strong>Firestore</strong> (Real-time).</li>
                        <li><strong>Mobile:</strong> <strong>React Native</strong> (Expo) sharing core business logic.</li>
                    </ul>

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.4 Document Inventory & Scope</h4>
                    <p>Provider will build automation or guidance paths for the following specific categories:</p>
                    {tpl.msaDocumentScope.map((scope, idx) => (
                        <p key={idx}><strong>{scope.title}:</strong> {scope.content}</p>
                    ))}

                    <h4 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>2.5 System Integrations</h4>
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
                        {aggregatedPhases.length > 0 ? aggregatedPhases.map((phase, idx) => (
                            <div key={idx}>
                                <h4 style={{ color: 'white', marginBottom: '8px', textTransform: 'uppercase' }}>
                                    PHASE {phase.phaseNum}: {phase.name} (Weeks {phase.weeks})
                                </h4>
                                <ul style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                                    {phase.activities.map((act, i) => (
                                        <li key={i}>{act.name} — {act.hours}h ({act.role})</li>
                                    ))}
                                </ul>
                            </div>
                        )) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Select a bundle or modules to generate WBS.</p>
                        )}
                    </div>

                    {/* Dynamic Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '32px' }}>
                        <div style={{ background: 'rgba(200,169,81,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Total Timeline</div>
                            <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>{totalTimeline} Weeks</div>
                        </div>
                        <div style={{ background: 'rgba(200,169,81,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Engineering Load</div>
                            <div style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>{totalHours} Hours</div>
                        </div>
                        <div style={{ background: 'rgba(200,169,81,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(200,169,81,0.3)' }}>
                            <div style={{ color: '#C8A951', fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Total Investment</div>
                            <div style={{ color: '#C8A951', fontSize: '20px', fontWeight: 700 }}>${totalAmount.toLocaleString()}</div>
                        </div>
                    </div>

                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', marginTop: '40px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>4. ASSUMPTIONS</h3>
                    <ol style={{ paddingLeft: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                        {tpl.msaAssumptions.map((assumption, idx) => (
                            <li key={idx}><strong>{assumption.split(':')[0]}:</strong>{assumption.split(':').slice(1).join(':')}</li>
                        ))}
                    </ol>
                </div>
                <div style={{ margin: '80px 0 40px 0', borderTop: '2px solid #C8A951', paddingTop: '40px' }}>
                    <h2 style={{ color: '#C8A951', textAlign: 'center', fontFamily: "'Cinzel', serif", fontSize: '24px' }}>EXHIBIT B: COST & VALUATION ANALYSIS</h2>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', lineHeight: '1.8', fontSize: '15px' }}>
                    <h3 style={{ color: '#C8A951', fontFamily: "'Cinzel', serif", fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(200,169,81,0.3)', paddingBottom: '10px' }}>1. DISCOUNT & VALUATION REALIZATION</h3>
                    <p>{tpl.msaCostIntro}</p>

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(200,169,81,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <span>Gross Development Value (Market Valuation)</span>
                            <span style={{ color: 'white' }}>${marketValue.toLocaleString()}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#10B981' }}>
                            <span>SirsiNexus Efficiency Discount (25%)</span>
                            <span>-${efficiencyDiscount.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#C8A951' }}>
                            <span>SirsiNexus Efficiency Discount (Discount Realization)</span>
                            <span>-${familyDiscount.toLocaleString()}</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                            <span style={{ color: '#C8A951' }}>TOTAL PROJECT INVESTMENT</span>
                            <span style={{ color: 'white' }}>${totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '16px', fontStyle: 'italic' }}>* Valuations based on standard $250/hr agency blended rates. SirsiNexus efficiency discount reflects component library reuse and accelerated delivery methodology.</p>
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
                        I hereby acknowledge that I have read, understand, and agree to be bound by the terms and conditions of this
                        Master Service Agreement. I acknowledge that this Agreement, together with the attached
                        Statement of Work, constitutes a binding legal contract for a total investment of <strong style={{ color: '#C8A951' }}>${totalAmount.toLocaleString()}</strong>.
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
