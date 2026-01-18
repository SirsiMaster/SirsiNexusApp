# Implementation Plan: Sirsi Infrastructure Portal (Project Onboarding)

This plan outlines the creation of a centralized admin portal for managing the **Sirsi Infrastructure Layer**. This portal allows administrators to onboard new portfolio projects or modify existing ones by managing their catalog configurations, legal disclosures, and pricing multipliers.

## 1. Objectives
*   **Centralized Configuration**: Eliminate manual JS editing for project onboarding.
*   **Visual Validation**: Provide a live preview of how a project's branding and legal content will appear in the contract portal.
*   **Schema Enforcement**: Ensure all projects adhere to the Sirsi Infrastructure metadata standards.
*   **Nexus Migration Path**: Build using components that can be easily ported to the Go/React-based Sirsi Nexus application.

## 2. Technical Strategy
*   **Location**: `public/admin/infrastructure/projects.html`
*   **Design System**: "Royal Neo-Deco" (Standardized CSS variables).
*   **Form Management**: Dynamic JSON generation from UI state.
*   **Persistence (V1)**: Client-side storage (localStorage) + JSON Export.
*   **Persistence (V2 - Nexus)**: Firestore/Cloud SQL integration.

## 3. UI Components
### 3.1 Project List (Sidebar or Card Grid)
*   Displays existing tenants (e.g., FinalWishes, Sirsi Engineering).
*   Status indicators (Active/Pending).

### 3.2 Configuration Form (Tabs)
*   **Branding**: Name, Brand Colors, Tagline, Logo URL.
*   **Legal**: Jurisdiction, AI Disclosures, Financial Data addendums, Company Legal Name.
*   **Pricing (Value Realization)**: Multipliers for Market/Google/Sirsi savings, custom labels.
*   **Standard Scope**: Platform description, Architecture foundation, Baseline timeline.

### 3.3 Live Preview Panel
*   Side-by-side view showing a "Mini-Contract" rendered with the current form data.

## 4. Immediate Action Steps
1.  [ ] Create `public/admin/infrastructure/projects.html` with the Royal Neo-Deco foundation.
2.  [ ] Implement the `projectConfig` form logic.
3.  [ ] Integrate `catalog-data.js` to pre-load existing configurations.
4.  [ ] Add "Generate Configuration" tool to export standardized project blocks for the catalog.
5.  [ ] Document the migration path to Sirsi Nexus (Go Backend).

## 5. Metadata Schema
```json
{
  "projectId": "string",
  "name": "string",
  "tagline": "string",
  "logo": "url",
  "theme": "string",
  "primaryColor": "hex",
  "legalMetadata": {
    "companyName": "string",
    "jurisdiction": "string",
    "disclosureAI": "boolean",
    "disclosureFinancial": "boolean"
  },
  "valueRealization": {
    "marketMultiplier": "number",
    "marketLabel": "string"
  }
}
```
