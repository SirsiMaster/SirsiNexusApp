# Data Room Implementation Guide

**Author:** Antigravity (AI Agent)
**Date:** February 28, 2026
**Status:** Pending Implementation
**Conversation Reference:** Admin Data Room build session — Feb 28, 2026

---

## Context: What Was Done and Why

### The Problem (Feb 28, 2026)
The "Data Room" link in the admin sidebar pointed to `dashboard/analytics-advanced.html` — a completely wrong page. The Data Room had no admin-side management interface. The investor portal's `data-room.html` existed only in `sngp/investor-portal/` (the old pre-monorepo location) and was never migrated to `sirsi-portal/investor-portal/`.

### What We Built
We created the **Admin Data Room** at `packages/sirsi-portal/admin/data-room/index.html` — a full RWXD (Read, Write, eXecute, Delete) management interface where administrators:
- Upload documents (drag-and-drop, multi-file)
- Categorize documents (Financial, Legal, Strategic, Technical, Marketing, Operations)
- Set access levels (Public, Restricted, Confidential)
- Manage version history
- Publish/unpublish documents to the investor portal
- Search and filter the document library
- Preview document metadata and version timelines
- Delete documents with confirmation

### What Still Needs to Be Built
The **Investor Portal Data Room** — the read-only, public-facing view at `sirsi-portal/investor-portal/data-room.html`. This is what investors see. It consumes data from the admin data room but provides NO write capabilities.

---

## Architecture: Admin vs Investor Portal

```
┌──────────────────────────────────────────────────────────┐
│                    ADMIN DATA ROOM                        │
│          admin/data-room/index.html                       │
│                                                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐ │
│  │ Upload  │  │  Edit   │  │ Delete  │  │  Publish /  │ │
│  │         │  │         │  │         │  │  Unpublish  │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘ │
│                       │                                   │
│              Writes to data store                         │
│              (localStorage now → Firestore later)         │
└──────────────────────────┬───────────────────────────────┘
                           │
                    Published docs only
                    (published === true)
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│               INVESTOR PORTAL DATA ROOM                   │
│       investor-portal/data-room.html                      │
│                                                           │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  View   │  │ Download │  │  Search  │  │  Filter   │ │
│  │         │  │          │  │          │  │           │ │
│  └─────────┘  └──────────┘  └──────────┘  └───────────┘ │
│                                                           │
│  NO upload. NO delete. NO edit. NO access control mgmt.   │
└──────────────────────────────────────────────────────────┘
```

---

## Existing Assets (Already Built)

### Files the investor portal page should USE:

| File | Location | Purpose | Notes |
|:-----|:---------|:--------|:------|
| `data-room-config.json` | `investor-portal/assets/` | Document structure/categories | 88 lines, defines sections and file metadata |
| `data-room-management.js` | `investor-portal/assets/js/` | Client-side document manager class | 841 lines — `DataRoomManager` class. Has search, filter, preview, download, drag-drop. **Strip out upload/delete/edit for investor view.** |
| `data-room-api.js` | `investor-portal/assets/js/` | API service abstraction | 464 lines — `DataRoomAPI` class. Document CRUD, access control, search, analytics. |
| `DATA_ROOM_README.md` | `investor-portal/` | Full feature overview | 278 lines — architecture, security model, customization |

### Reference implementation (old location, NOT deployed):

| File | Location | Notes |
|:-----|:---------|:------|
| `data-room.html` | `sngp/investor-portal/` | 678 lines. The original investor-facing page. Use as structural reference but DO NOT copy blindly — it uses Tailwind classes and its own design language. Must be adapted to Swiss Neo-Deco. |

### Admin source of truth (just built):

| File | Location | Notes |
|:-----|:---------|:------|
| `index.html` | `admin/data-room/` | The RWXD admin interface. Stores docs in `localStorage` key `sirsi_admin_data_room`. Investor portal should READ from this same key (HTML phase) or from Firestore (React/Go phase). |

---

## How to Build the Investor Portal Data Room

### Phase 1: HTML (Current Architecture)

#### Step 1: Create `sirsi-portal/investor-portal/data-room.html`

This file does NOT exist yet. It must be created from scratch, NOT copied from `sngp/investor-portal/data-room.html` (that file uses incompatible styling).

#### Step 2: Design Language

The investor portal uses the **Swiss Neo-Deco** design language (same as admin):
- **Fonts**: `Cinzel` (headings), `Inter` (body)
- **Colors**: Emerald (`#059669`, `#10B981`) + Gold accents (`#C8A951`)
- **Background**: Deep emerald gradient (`#022c22` → `#000000`) for dark/hero sections, clean white for content
- **Components**: Glass panels (`backdrop-filter: blur`), gold borders, clean typography

The investor portal is public-facing, so it should be MORE polished than the admin — think institutional finance, not a CRUD admin panel.

#### Step 3: Data Source (HTML Phase)

Read from localStorage key: `sirsi_admin_data_room`

```javascript
// Read ONLY published documents from admin data store
function getPublishedDocuments() {
    const stored = localStorage.getItem('sirsi_admin_data_room');
    if (!stored) return [];
    const allDocs = JSON.parse(stored);
    // CRITICAL: Only show published documents
    return allDocs.filter(doc => doc.published === true);
}
```

#### Step 4: Required Features (READ-ONLY)

| Feature | Required | Notes |
|:--------|:---------|:------|
| View document list | ✅ | Grid or table layout, grouped by category |
| Search documents | ✅ | By name, description, tags |
| Filter by category | ✅ | Financial, Legal, Strategic, Technical, etc. |
| Download documents | ✅ | Increment `downloadCount` in store |
| Preview metadata | ✅ | Name, category, version, size, description |
| Upload | ❌ | Admin only |
| Delete | ❌ | Admin only |
| Edit | ❌ | Admin only |
| Change access level | ❌ | Admin only |
| Publish/unpublish | ❌ | Admin only |
| Version management | ❌ | Admin only |

#### Step 5: Access Level Filtering

The admin data room assigns access levels. The investor portal should:
- **Public docs**: Show to all visitors
- **Restricted docs**: Show to authenticated/NDA-signed investors only
- **Confidential docs**: NEVER show in investor portal (admin-only)

```javascript
function getVisibleDocuments(userRole) {
    const published = getPublishedDocuments();
    if (userRole === 'committee') {
        return published.filter(d => d.accessLevel !== 'confidential');
    }
    // Default: public only
    return published.filter(d => d.accessLevel === 'public');
}
```

#### Step 6: Page Structure

```
┌─────────────────────────────────────────────────┐
│  HEADER: Sirsi Technologies logo, navigation    │
├─────────────────────────────────────────────────┤
│  HERO: "Investor Data Room"                     │
│  Subtitle: "Secure document repository"         │
│  Stats: X documents, Y categories               │
├─────────────────────────────────────────────────┤
│  TOOLBAR: Search bar | Category filters         │
├─────────────────────────────────────────────────┤
│  DOCUMENT GRID (card-based, not table)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 📄 Doc 1 │  │ 📊 Doc 2 │  │ 📋 Doc 3 │      │
│  │  Name    │  │  Name    │  │  Name    │      │
│  │  Cat     │  │  Cat     │  │  Cat     │      │
│  │  Size    │  │  Size    │  │  Size    │      │
│  │ [Download]│  │ [Download]│  │ [Download]│      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤
│  FOOTER: Confidentiality notice, NDA reminder   │
└─────────────────────────────────────────────────┘
```

The investor portal should use a **card grid**, NOT a table. Cards are more appropriate for a public-facing investor experience. Each card shows:
- File type icon (color-coded by category)
- Document name
- Category badge
- File size
- Last updated date
- Download button
- Version number

### Phase 2: React/Go Port

When porting to React/Go, the architecture changes:

| Concern | HTML Phase | React/Go Phase |
|:--------|:-----------|:---------------|
| **Data store** | `localStorage` | Firestore + Cloud SQL |
| **Admin writes** | Direct localStorage | gRPC → Go backend → Firestore |
| **Investor reads** | Read localStorage | gRPC-Web → Go backend → Firestore |
| **Auth** | None (local files) | Firebase Auth + role-based access |
| **File storage** | Simulated | Google Cloud Storage (signed URLs) |
| **Access control** | Client-side filter | Server-side enforcement |

#### React Components to Create:
- `DataRoom.tsx` — Main layout (investor portal route `/data-room`)
- `DataRoomAdmin.tsx` — Admin RWXD interface (admin route `/admin/data-room`)
- `DocumentCard.tsx` — Reusable card component
- `DocumentPreview.tsx` — Preview modal
- `useDataRoom.ts` — Zustand store for data room state
- `data-room.service.ts` — gRPC client for document operations

#### gRPC Service Definition:
```protobuf
service DataRoomService {
    rpc ListDocuments(ListDocumentsRequest) returns (ListDocumentsResponse);
    rpc GetDocument(GetDocumentRequest) returns (Document);
    rpc UploadDocument(UploadDocumentRequest) returns (Document);
    rpc UpdateDocument(UpdateDocumentRequest) returns (Document);
    rpc DeleteDocument(DeleteDocumentRequest) returns (Empty);
    rpc PublishDocument(PublishDocumentRequest) returns (Document);
    rpc GetDownloadUrl(GetDownloadUrlRequest) returns (DownloadUrlResponse);
}
```

---

## Document Data Schema

This is the schema used by the admin data room. The investor portal must be able to read this:

```typescript
interface DataRoomDocument {
    id: string;                    // Unique ID (e.g., "dr_1")
    name: string;                  // Display name
    category: Category;            // "financial" | "legal" | "strategic" | "technical" | "marketing" | "operations"
    size: number;                  // Bytes
    type: string;                  // MIME type
    uploadDate: string;            // ISO 8601
    lastModified: string;          // ISO 8601
    description: string;           // Brief description
    accessLevel: AccessLevel;      // "public" | "restricted" | "confidential"
    version: number;               // Current version number
    versions: VersionEntry[];      // Full version history
    tags: string[];                // Searchable tags
    downloadCount: number;         // Analytics
    published: boolean;            // If true, visible in investor portal
}

interface VersionEntry {
    version: number;
    date: string;                  // YYYY-MM-DD
    uploadedBy: string;            // Role/name
    notes: string;                 // Changelog
}
```

---

## Key Decisions & Guardrails

1. **The admin data room is the source of truth.** The investor portal is a read-only consumer. Never build write functionality into the investor portal.

2. **"Published" is the gate.** Only documents where `published === true` should appear in the investor portal. The admin controls this toggle.

3. **Access levels are enforced.** "Confidential" documents NEVER appear in the investor portal. "Restricted" documents require investor authentication. "Public" documents are visible to all.

4. **The investor portal is public-facing.** It must be beautiful, polished, and institutional. Use card grids, not admin tables. Add a proper hero section, smooth animations, and a professional confidentiality footer.

5. **Swiss Neo-Deco design language.** Emerald + Gold. Cinzel headings. Inter body. Glass panels. This is the Sirsi brand — see `GEMINI.md` Section 4.

6. **LocalStorage key: `sirsi_admin_data_room`** — This is the shared data channel during the HTML phase. Both admin and investor pages read/write from this key. In React/Go, this becomes Firestore.

---

## Files Changed in This Session (Feb 28, 2026)

| File | Change |
|:-----|:-------|
| `admin/data-room/index.html` | **CREATED** — Full RWXD admin interface |
| `admin/_template.html` | **CREATED** — Canonical page template (Rule 20) |
| `admin/components/admin-sidebar.js` | **MODIFIED** — Data Room link → `data-room/index.html` |
| `admin/components/admin-header.js` | **MODIFIED** — Search index → `data-room/index.html` |
| `admin/index.html` | **MODIFIED** — Dashboard quick action → `data-room/index.html` |
| `GEMINI.md` | **MODIFIED** — Added Rule 20 (Admin Page Layout Contract) |

---

*This guide should be read by any agent or developer before touching the investor portal data room. Do not start from scratch — the infrastructure is already in place.*
