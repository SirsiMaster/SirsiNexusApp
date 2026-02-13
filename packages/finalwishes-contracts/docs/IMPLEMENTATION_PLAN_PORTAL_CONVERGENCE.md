# Implementation Plan - Sirsi Sign Portal Convergence

The goal is to evolve the Sirsi Vault into a comprehensive **Sirsi Sign Portal** that surfaces full OpenSign capabilities, including generic document signing, PDF management, and a dedicated financial ledger.

## 1. Architectural Refactoring
- Rename the core vault interface to `SirsiSignPortal`.
- Implement a three-tier navigation system:
    - **Contracts & Management**: gRPC-powered enterprise contract lifecycle.
    - **Signatures & Documents**: OpenSign-powered generic document signing (NDAs, etc.) and PDF uploads.
    - **Financials & Receipts**: Unified ledger of all payments and executing agreements.

## 2. Infrastructure Expansion (OpenSign API)
- Ensure the `OpenSign` REST SDK supports generic PDF uploads (via Firebase Storage).
- Map generic "Envelopes" to the UI.

## 3. UI/UX Implementation (Royal Neo-Deco)
- **Portal Shell**: Update `VaultDashboard.tsx` to include top-level tabs.
- **Contract Ledger**: Preserve existing "Permanent Record" look for gRPC contracts.
- **Document Vault**:
    - "New Signing Session" button (PDF upload).
    - Status tracking for generic envelopes.
- **Financial Center**:
    - Aggregate statistics (Total Paid, Outstanding).
    - Receipt generation/viewing.

## 4. Feature Parity Check (Rule 0 / Rule 2)
- Replicate full OpenSign feature set:
    - Draw/Type Signatures (Integrated via `sign.html`).
    - Audit Trail Evidence (SHA-256).
    - payment Rails (Stripe/ACH/Wire).

## 5. Verification
- Test PDF upload and envelope creation.
- Verify payment status reflects in the financial tab.
- Ensure cross-tenant visibility (Assiduous/FinalWishes) is preserved for power users.
