# Sirsi Portfolio: Unified Product & Service Flows

**Version:** 1.0.0  
**Status:** Canonical Directive

## 1. Objective
To provide anyone exploring the Sirsi ecosystem with a clear, technically provable map of how services (SOW contracts) and products (catalog goods) are created, executed, and settled.

---

## 2. Path 1: The Administrative "Service" Flow
*Used for high-value strategic partnerships, software development, and complex SOWs.*

### A. Creation (Admin)
*   **Location**: `admin/contracts-manager.html`
*   **API**: `POST /api/envelopes/create`
*   **Logic**: An administrator manually configurations a Statement of Work (SOW) with milestones, WBS phases, and unique legal clauses.

### B. Execution (Signer)
*   **Location**: `sign.html`
*   **Gate**: ESIGN/UETA compliant signature.
*   **Evidence**: A Master Services Agreement (MSA) is generated and locked in the vault.

### C. Settlement (Payer)
*   **Location**: `payment.html`
*   **Gate**: **MFA (UCS Universal Guard)**.
*   **Rail**: High-fidelity settlement via Stripe/Plaid/Chase.

---

## 3. Path 2: The Consumer "Product" Flow
*Used for purchasing standalone goods, platform access, or catalog items without manual SOWs.*

### A. Selection (Consumer)
*   **Location**: Portfolio Catalog (e.g., `FinalWishes Catalog`)
*   **Source of Truth**: `src/data/catalog.ts`
*   **Logic**: User selects products directly from a pre-defined registry.

### B. Execution (Signer)
*   **Location**: `purchase.html` (Planned)
*   **Branch 1 (One-Time)**: Generates a "Verified Receipt & Payment Acknowledgment".
*   **Branch 2 (Installments)**: Generates a lightweight "Payment Agreement" (Simplified MSA).

### C. Settlement (Payer)
*   **Location**: `payment.html`
*   **Gate**: **MFA (UCS Universal Guard)**.
*   **Rail**: Instant card/ACH settlement.

---

## 4. Technical Orchestration Identification

| Component | Responsibility | Path |
| :--- | :--- | :--- |
| **Contracts Manager** | Admin-driven SOW instantiation | Service |
| **Catalog Registry** | Developer-driven product definition | Product |
| **UCS Guard** | Enforces MFA on both paths | Both |
| **OpenSign Engine** | Generates the legal PDF artifacts | Both |
| **Sirsi Vault** | Immutable storage of executed agreements | Both |

## 5. Summary of Roles

1.  **Founder/Admin**: Uses `admin/infrastructure/projects.html` to set global pricing/branding and `admin/contracts-manager.html` for client service proposals.
2.  **Consumer**: Uses the Portfolio App to browse the catalog and proceeds to a streamlined `purchase.html` flow.
3.  **The Hypervisor**: Orchestrates the handshakes between Signature and Payment to ensure no transaction happens without legal evidence and MFA verification.
