# Payment Workflow Documentation

**Last Updated:** 2025-12-31  
**Owner:** Sirsi Platform Team

---

## Business Workflow

### Overview

The Sirsi payment system enables **dynamic contract-to-payment** flows across all tenant projects (FinalWishes, Assiduous, Sirsi). Administrators define contract terms in the Contracts Manager, and clients receive customized payment options.

### Business Process Flow

```mermaid
flowchart TD
    subgraph "Phase 1: Contract Creation"
        A[Admin opens Contracts Manager] --> B[Enters client details]
        B --> C[Configures payment plans]
        C --> D[Selects theme/branding]
        D --> E[Creates contract in system]
    end
    
    subgraph "Phase 2: Client Engagement"
        E --> F[Client receives contract link]
        F --> G[Client reviews proposal/SOW]
        G --> H[Client selects payment plan]
        H --> I[Client signs agreement]
    end
    
    subgraph "Phase 3: Payment Processing"
        I --> J[System generates Stripe checkout]
        J --> K[Client completes payment]
        K --> L[Webhook confirms payment]
        L --> M[Contract status: PAID]
    end
    
    subgraph "Phase 4: Fulfillment"
        M --> N[Signed PDF archived]
        N --> O[Client receives confirmation]
        O --> P[Project kickoff]
    end
```

### Payment Plans

| Plan | Payments | Example ($200K) | Per Month |
|------|----------|-----------------|-----------|
| Plan A | 4 months | $200,000 | $50,000 |
| Plan B | 5 months | $200,000 | $40,000 |
| Plan C | 6 months | $200,000 | $33,333 |

### Status Lifecycle

```
DRAFT → ACTIVE → SIGNED → PAID → ARCHIVED
```

---

## Technical Workflow

### System Architecture

```mermaid
graph TB
    subgraph "Frontend"
        CM[contracts-manager.html<br/>Admin Portal]
        CP[contracts/index.html<br/>Client View]
        PY[payment.html<br/>Payment Page]
    end
    
    subgraph "Cloud Run"
        GS[contracts-grpc<br/>gRPC Service]
    end
    
    subgraph "Firebase"
        FF[Cloud Functions<br/>OpenSign API]
        FS[(Firestore<br/>Database)]
    end
    
    subgraph "External"
        ST{{Stripe API}}
        DS[DocuSeal<br/>E-Signatures]
    end
    
    CM -->|POST /api/contracts| GS
    CP -->|GET contract| GS
    GS -->|Store| FS
    GS -->|Create session| ST
    PY -->|Checkout| ST
    ST -->|Webhook| FF
    FF -->|Update status| FS
    CP -->|Sign| DS
    DS -->|Callback| FF
```

### API Flow: Create Contract

```mermaid
sequenceDiagram
    participant Admin
    participant CM as Contracts Manager
    participant GS as gRPC Service
    participant FS as Firestore
    
    Admin->>CM: Fill contract form
    CM->>GS: POST /api/contracts
    GS->>FS: contracts.add(data)
    FS-->>GS: docRef.id
    GS-->>CM: { id, status: DRAFT }
    CM->>Admin: Show success
```

### API Flow: Payment Checkout

```mermaid
sequenceDiagram
    participant Client
    participant CP as Contract Page
    participant GS as gRPC Service
    participant ST as Stripe
    participant FF as Cloud Functions
    participant FS as Firestore
    
    Client->>CP: Select Plan B
    CP->>GS: POST /CreateCheckoutSession
    GS->>ST: checkout.sessions.create()
    ST-->>GS: session.url
    GS-->>CP: { checkoutUrl }
    CP->>Client: Redirect to Stripe
    Client->>ST: Complete payment
    ST->>FF: Webhook: checkout.session.completed
    FF->>FS: Update contract status: PAID
    FF-->>ST: 200 OK
    ST->>Client: Redirect to success page
```

### API Flow: E-Signature

```mermaid
sequenceDiagram
    participant Client
    participant CP as Contract Page
    participant DS as DocuSeal
    participant FF as Cloud Functions
    participant FS as Firestore
    
    Client->>CP: Click "Sign Agreement"
    CP->>FF: POST /api/guest/envelopes
    FF->>FS: Create envelope
    FF-->>CP: { signingUrl }
    CP->>Client: Redirect to DocuSeal
    Client->>DS: Sign document
    DS->>FF: Webhook: document.signed
    FF->>FS: Update: status = SIGNED
    FF-->>DS: 200 OK
    DS->>Client: Show completion
```

---

## Service Endpoints

### Contracts gRPC Service (Cloud Run)

**URL:** `https://contracts-grpc-210890802638.us-central1.run.app`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contracts` | POST | Create contract |
| `/api/contracts/list` | POST | List contracts |
| `/sirsi.contracts.v1.ContractsService/GetContract` | POST | Get by ID |
| `/sirsi.contracts.v1.ContractsService/GeneratePage` | POST | Generate HTML |
| `/sirsi.contracts.v1.ContractsService/CreateCheckoutSession` | POST | Stripe checkout |
| `/health` | GET | Health check |

### OpenSign API (Cloud Functions)

**URL:** `https://us-central1-sirsi-opensign.cloudfunctions.net/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/guest/envelopes` | POST | Create signing envelope |
| `/api/payments/create-session` | POST | Legacy checkout |
| `/api/payments/webhook` | POST | Stripe webhook |
| `/api/security/verify` | POST | Verify HMAC |

---

## Security

| Layer | Implementation |
|-------|----------------|
| Transport | TLS 1.3 (automatic) |
| Request Auth | HMAC-SHA256 signed tokens |
| Payment | Stripe webhook signature verification |
| CORS | Allowed origins whitelist |

---

## Related Documentation

- [ADR-003: HMAC Security Layer](./ADR-003-HMAC-SECURITY-LAYER.md)
- [ADR-004: Contracts gRPC Service](./ADR-004-CONTRACTS-GRPC-SERVICE.md)
- [Services Registry](./SERVICES_REGISTRY.md)
