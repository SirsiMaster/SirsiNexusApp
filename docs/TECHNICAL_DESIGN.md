# SirsiNexus Technical Design Document

**Version:** 4.0.0
**Last Updated:** March 7, 2026
**Status:** Master Blueprint v4 — Total Maximal Architecture
**Architecture:** Autonomous CTO — AI-Powered Sovereign Infrastructure Platform

---

## 1. Executive Summary

SirsiNexus is the world's first **Autonomous CTO** — a platform that autonomously builds, manages, verifies, and cryptographically proves its own infrastructure. Unlike traditional infrastructure-as-code tools that require deep technical expertise, Sirsi accepts natural language descriptions of desired infrastructure and generates complete, production-ready stacks with zero human intervention.

The platform operates on a **Dual-Shard Architecture** — a patented fusion of consensus-ordered reasoning (Logic Shards) and distributed tensor computation (Tensor Shards) — that provides deterministic, immutable, and cryptographically verifiable AI operations.

### Key Technical Differentiators

| Differentiator | Description |
|:---------------|:------------|
| **Autonomous Infrastructure Genesis** | Natural language → complete production stack, zero human touch |
| **Quad-Model AI Engine** | Four specialized AI models for different latency/quality/sovereignty requirements |
| **Knowledge Graph + Truth Anchoring** | AI that cannot hallucinate about your infrastructure |
| **Fire Team Protocol** | Persistent AI agents that live inside the business, communicate via NebuLang, and self-escalate (Agent → Hypervisor → SirsiMaster) |
| **Direct Hardware Communication** | Bypass IaC tools — speak directly to Cisco, Dell, NVIDIA, Google TPU, Apple Silicon |
| **Cryptographic Infrastructure Proofs** | Mathematically verifiable infrastructure state via distributed ledger |
| **Multi-Platform Delivery** | Web, Desktop, Mobile, Headless Daemon, Mac Studio Native — all sharing one backend |

---

## 2. Technology Stack

| Layer | Technology | Decision |
| :--- | :--- | :--- |
| **01 Core Kernel** | **Rust** | Native systems: Tauri desktop, headless daemon, and Mac Studio cluster coordination. |
| **02 Orchestration** | **Go** | Stack Fabric: gRPC + Protobuf, High-frequency data mesh, Relational persistence. |
| **03 Trust Layer** | **Hedera** | DLT Verification: aBFT consensus, KG anchoring, cryptographic infra proofs. |
| **04 Edge Fabric** | **NGINX** | Connectivity: Reverse proxy, encryption, and edge acceleration for the gRPC mesh. |
| **Database** | **AlloyDB AI + Firestore** | Hybrid: SQL + AI for PII/KG/Vault, NoSQL for real-time state. |
| **Auth** | **Firebase Auth** | MFA (TOTP) required for all accounts. |
| **Security** | **SOC 2 + KMS** | AES-256 encryption at rest, software-managed keys. |
| **AI** | **Quad-Model Engine** | Primary reasoning + speed + sovereign + in-database AI inference. |
| **E-Signature** | **OpenSign (Community)** | Self-hosted on Google Cloud Run. |

> **Removed:** CockroachDB (decommissioned), Rust/WASM for browser (decommissioned), NGINX IPC, Redis, Python analytics platform. See ADR-017, ADR-019.

---

## 3. AI Engine Architecture

Sirsi employs a **quad-model AI architecture** — four specialized inference engines selected based on the characteristics of each request:

### 3.1 Model Routing Strategy

| Engine Role | Use Case | Latency | Deployment |
|:------------|:---------|:--------|:-----------|
| **Primary Reasoning** | Deep analysis, infrastructure genesis, code generation, multi-step planning | 3–8s | Cloud API (HTTPS) |
| **Speed-Optimized** | Real-time dashboards, anomaly detection, quick classification, telemetry analysis | ~200ms | Cloud API (gRPC) |
| **Sovereign / On-Prem** | Data that cannot leave the mesh, edge deployment, offline mode | 500ms–2s | Local cluster (open weights) |
| **In-Database AI** | Queries that benefit from proximity to data: semantic search, auto-embeddings, AI-powered SQL | ~100ms | Managed database |

### 3.2 Routing Logic

Inference routing is implemented in the Go backend. The routing decision considers:

1. **Depth requirement** — Does the task require deep reasoning (complex planning, genesis) or quick classification?
2. **Latency SLA** — Is the caller a real-time dashboard (<500ms) or a batch pipeline?
3. **Data sovereignty** — Must the data remain on-premises or within the customer's network?
4. **SQL context** — Is the request naturally expressed as a database query with AI capabilities?

Fallback: if the cloud is unreachable, the system automatically routes to the sovereign on-premises model.

### 3.3 In-Database AI

The platform's PostgreSQL-compatible database includes built-in AI capabilities:

- **Semantic search** — Vector embeddings auto-generated from text columns
- **AI-powered queries** — SQL functions that invoke AI models within the query execution path
- **Zero-copy inference** — Data never leaves the database for AI processing, eliminating latency and security concerns

---

## 4. Knowledge Graph

The Knowledge Graph (KG) is the platform's "memory and truth layer." It models the customer's entire infrastructure as a directed graph:

### 4.1 Graph Structure

- **Nodes** represent infrastructure entities: services, agents, hardware devices, configurations, policies, incidents
- **Edges** represent relationships: `depends_on`, `routes_to`, `manages`, `runs_on`, `generated_by`
- **Embeddings** — Every node description is auto-embedded into a 768-dimensional vector space, enabling semantic search ("find me all services similar to this one")

### 4.2 Truth Anchoring

Every KG state snapshot is hashed (SHA-256) and published to a distributed ledger, creating an **immutable, consensus-timestamped proof** that the graph was in a specific state at a specific moment.

This enables:
- **Cryptographic verification** — Any party can independently verify the KG state at any point in history
- **Tamper detection** — Any modification to historical state is immediately detectable
- **Compliance automation** — SOC 2 evidence is generated automatically from the ledger trail

### 4.3 Predictive Intelligence

The KG Query Engine (Patent P-003) enables predictive infrastructure management:
- Query historical patterns to identify failure precursors
- Forecast resource exhaustion before it occurs
- Recommend preventive actions based on graph-learned correlations

---

## 5. Agent Swarm Architecture — Fire Team Protocol (Patent P-004)

Sirsi employs a hierarchical **coordinator + domain agents** pattern governed by the **Fire Team Protocol** — a composition patent that requires and unifies all four other patents (P-001 through P-003, P-005) into a single orchestration system.

### 5.1 Coordinator: The Sirsi Hypervisor

The **Sirsi Hypervisor** (powered by the primary reasoning engine) acts as the central coordinator. It:
- Decomposes complex tasks into subtasks using the **Neural-Fractal decomposition** algorithm (Patent P-002)
- Assigns subtasks to the most capable domain agent via **NebuLang** (Patent P-001)
- Monitors progress and handles failures
- Maintains consensus ordering via the distributed ledger

### 5.2 Domain Agents (Permanent Residents)

Unlike ephemeral agent frameworks (CrewAI, AutoGen, LangGraph) that spin up agents per request, Fire Team agents are **permanent denizens** of the business entity. They:

- **Never sleep or rest** — always-on, always available, continuously monitoring their domain
- **Communicate exclusively in NebuLang** (Patent P-001) — pure protobuf, not LLM text prompts
- **Traverse both planes natively** — can read the LLM output buffer AND query the Knowledge Graph (Patent P-003) without human mediation
- **Self-administer and self-coordinate** — negotiate task boundaries, handle failures, and redistribute work autonomously

| Agent Domain | Responsibility |
|:-------------|:---------------|
| **DevOps Agent** | CI/CD pipeline management, deployment automation, DORA metrics |
| **Security Agent** | Vulnerability scanning, compliance checks, threat detection |
| **Cost Agent** | Cloud spend optimization, resource right-sizing, billing anomaly detection |
| **Database Agent** | Schema management, query optimization, backup/recovery |
| **Infrastructure Agent** | Provisioning, scaling, load balancing, health monitoring |
| **Integration Agent** | Third-party service coordination, API health, webhook management |
| **Compliance Agent** | Regulatory framework enforcement, evidence collection, audit preparation |

### 5.3 Tiered Escalation Protocol

When an agent encounters a problem it cannot resolve autonomously, it follows a strict three-tier escalation chain:

1. **Agent → Hypervisor (Sirsi AI)**: The agent escalates to the Sirsi Hypervisor, which has full platform context and can make autonomous decisions or coordinate multiple agents.
2. **Hypervisor → SirsiMaster (Human Superadmin)**: If the Hypervisor determines the decision exceeds its authority (e.g., financial commitments, architectural changes, compliance exceptions), it escalates to the SirsiMaster.
3. **SirsiMaster → Resolution**: The human superadmin resolves the issue, and the decision is recorded on the consensus ledger as an immutable precedent.

This creates a continuously expanding capability surface — every escalation that the Hypervisor resolves becomes a learned precedent, reducing future escalations.

### 5.4 Why Fire Team is Patent-Worthy

No existing agent framework combines: (a) persistent stateful agents communicating via a proprietary protocol, (b) native dual-plane traversal of both LLM inference and Knowledge Graph, and (c) autonomous governance with a tiered escalation hierarchy. The Fire Team Protocol is a **composition patent** — it cannot function without NebuLang (P-001), Neural-Fractal Architecture (P-002), KG Query Engine (P-003), and KG Sharding (P-005).

---

## 6. Multi-Platform Delivery

All platforms share the same **Go + gRPC backend** via **Protobuf contracts** as the single source of truth:

### 6.1 Platform Matrix

| Platform | Technology | Transport | Target Users | Priority |
|:---------|:-----------|:----------|:-------------|:---------|
| **Web** | React 19 + Vite 7 | gRPC-Web (ConnectRPC) | All users — browser discovery | P0 |
| **Desktop** | Rust / Tauri 2.x | gRPC native | DevOps engineers, sysadmins | P2 |
| **Headless** | Rust daemon (no GUI) | gRPC native + CLI | Data center, CI/CD integration | P2 |
| **iOS** | React Native + Expo | gRPC-Web (ConnectRPC) | Mobile monitoring, approvals | P3 |
| **Android** | React Native + Expo | gRPC-Web (ConnectRPC) | Mobile monitoring, approvals | P3 |
| **Mac Studio** | Rust + Swift FFI + ML runtime | gRPC native + RDMA | Sovereign compute clusters | P4 |

### 6.2 Shared Code Architecture

```
packages/
├── sirsi-proto/          ← Protobuf definitions (single source of truth)
│   ├── gen/go/           ← Go codegen (Cloud Run backend)
│   ├── gen/ts/           ← TypeScript codegen (Web + React Native)
│   └── gen/rust/         ← Rust codegen (Desktop + Headless + Mac Studio)
├── sirsi-portal-app/     ← React web application
├── sirsi-admin-service/  ← Go ConnectRPC backend
├── sirsi-desktop/        ← Tauri 2.x desktop app
├── sirsi-headless/       ← Rust daemon binary
├── sirsi-cluster/        ← Mac Studio cluster coordinator
└── sirsi-mobile/         ← React Native app
```

### 6.3 gRPC-Web Architecture (Current Production)

The web frontend communicates with the Go backend via **ConnectRPC** (gRPC-Web compatible):

- **Backend** (Go): Connect-Go serves gRPC over HTTP/1.1 and HTTP/2 with integrated CORS handling
- **Frontend** (React): `@connectrpc/connect-web` transport with TanStack Query v5 for caching and optimistic updates
- **State Management**: Zustand for global state, TanStack Query for server state
- **UI Components**: shadcn/ui + TanStack Table for data-intensive admin views

---

## 7. Direct Hardware Communication

> **Sirsi doesn't wrap Terraform. Sirsi IS the infrastructure layer.**

Sirsi bypasses infrastructure-as-code tools entirely and communicates directly with vendor hardware via native protocols.

### 7.1 Supported Vendors

| Vendor | Hardware | Communication Protocol | Capabilities |
|:-------|:---------|:----------------------|:-------------|
| **Cisco** | Catalyst/Nexus switches, ISR/ASR routers | NETCONF (RFC 6241), RESTCONF, gNMI | Interface stats, routing tables, ACLs, VLAN management, BGP/OSPF |
| **Dell** | PowerEdge servers, PowerStore storage | Redfish (DMTF), iDRAC REST API | Power management, firmware, RAID, thermal/NIC monitoring |
| **NVIDIA** | A100/H100/L4 GPUs, BlueField DPUs | Vendor GPU management APIs | Utilization, ECC errors, NVLink topology, power, clock management |
| **Google** | TPU v5e/v6 pods | Cloud TPU API (gRPC) | Provisioning, utilization, XLA status, scheduling |
| **Apple** | Mac Studio M5/M4 Ultra | Native kernel + ML frameworks | Neural Engine utilization, unified memory, Thunderbolt peer discovery |
| **Juniper** | MX/QFX series | NETCONF (RFC 6241), Junos XML | Firewall counters, BGP, VXLAN |
| **Arista** | 7000/7500 series | eAPI (HTTPS), gNMI | EVPN, MLAG, VXLAN fabric |

### 7.2 Capability Model

For every supported device, Sirsi can:

1. **Discover** — Find all reachable hardware on the network
2. **Inventory** — Retrieve detailed specifications (model, firmware, silicon capabilities)
3. **Monitor** — Stream real-time telemetry (utilization, temperature, errors)
4. **Configure** — Make direct configuration changes (VLANs, ACLs, power, firmware)
5. **Verify** — Compare actual state against desired state and detect drift
6. **Manage Lifecycle** — Power on/off, firmware updates, maintenance scheduling

### 7.3 Every Change is Verifiable

Every hardware configuration change follows a strict lifecycle:
1. AI proposes the change
2. KG patterns validate the proposal
3. Distributed ledger orders the change deterministically
4. Change is executed against the hardware
5. Post-change verification confirms desired state
6. Cryptographic proof is anchored on the ledger

---

## 8. Sovereign Compute (Mac Studio Clusters)

### 8.1 Concept

Sovereign compute enables organizations to run Sirsi's full AI stack on their own hardware — no cloud dependency. A desk-sized cluster of Mac Studio nodes can run the entire inference pipeline locally.

### 8.2 Hardware Target

- **4× Mac Studio Ultra** nodes
- **512GB unified memory per node** (2TB total cluster RAM)
- **High-speed interconnect** for inter-node tensor exchange
- **100GbE** for production rack deployment (optional)

### 8.3 Key Capabilities

| Capability | Description |
|:-----------|:------------|
| **Local AI Inference** | Run open-weights models locally on Apple Neural Engine + Metal GPU |
| **Data Sovereignty** | Customer data never leaves the local network |
| **Offline Operation** | Full functionality without cloud connectivity |
| **Distributed Inference** | Model weights partitioned across multiple nodes for large models |
| **Silicon-Aware Scheduling** | Workloads routed to optimal silicon (Neural Engine vs GPU vs CPU) |

### 8.4 Cluster Coordination

A Rust-based coordinator manages the cluster:
- **Node discovery** via local network protocols
- **Health monitoring** with heartbeat + thermal awareness
- **Work scheduling** based on silicon capabilities of each node
- **Distributed ledger integration** for consensus ordering of inference tasks

---

## 9. The Dual-Shard Architecture (Patent Core)

### 9.1 Overview

Sirsi's distributed intelligence operates on two parallel sharding planes that together constitute the **Neural-Fractal Architecture** (Patent P-002):

**Tensor Shards (Compute Layer):** Distribute raw numerical computation across multiple silicon nodes. When a model is too large for a single node's memory, the sharding engine partitions model weights across 2–4 nodes, each computing its portion and exchanging intermediate activations.

**Logic Shards (Consensus Layer):** While the compute layer handles tensor math, the consensus layer handles reasoning coordination. When the Hypervisor decomposes a complex task into subtasks (neural fractals), each subtask's lifecycle is managed through consensus-ordered messaging:

1. **Deterministic ordering** — Every agent sees subtasks in the same canonical order
2. **Immutable audit trail** — Every AI decision is permanently recorded
3. **Cross-node coordination** — Agents on different machines coordinate through shared topics without centralized orchestration
4. **Cryptographic verification** — Any result can be verified by replaying the consensus stream

### 9.2 Why This is Patent-Worthy

No system combines distributed-ledger-consensus-ordered reasoning with distributed tensor computation. Existing agent frameworks coordinate via HTTP/RPC — no deterministic ordering, no immutability, no cryptographic proofs. Existing sharding frameworks distribute compute but have no consensus layer. Sirsi unifies both planes into a single architecture.

---

## 10. Patent Portfolio (5 Patents)

| # | Title | Core Innovation | Status |
|:--|:------|:----------------|:-------|
| P-001 | **NebuLang Protocol** | The machine-to-machine communication language for all node and agent interaction in the Neural-Fractal Architecture. | Filed |
| P-002 | **Neural-Fractal Architecture** | The recursive dual-shard (Logic + Tensor) system architecture that provides consensus-ordered reasoning with distributed inference. | Filed |
| P-003 | **KG Query Engine** | Translates human-readable queries into NebuLang for system execution, and translates machine responses back to human-readable intent. | Filed |
| P-004 | **Fire Team Protocol** | Persistent autonomous agents that live inside the business entity, communicate exclusively via NebuLang (P-001), traverse both LLM buffer and Knowledge Graph (P-003) without human interaction, and self-escalate through a tiered command chain (Agent → Hypervisor → SirsiMaster). Composition patent requiring P-001, P-002, P-003, P-005. | In Design |
| P-005 | **KG Sharding Protocol** | Sharding overlay for distributing Knowledge Graph management and query execution across heterogeneous silicon nodes. | In Design |

> **Note:** Capabilities such as Tri-Silicon Mesh Orchestration, Cryptographic Infrastructure Proofs, Direct-to-Metal Communication, and Autonomous Infrastructure Genesis are **platform features** — not standalone patents. They are implementations of the patented protocols above.

---

## 11. Security Architecture

### 11.1 Defense in Depth

| Layer | Protection |
|:------|:-----------|
| **Network** | Cloud Armor WAF, rate limiting, geo-filtering |
| **Auth** | Firebase Auth + MFA (TOTP), reCAPTCHA Enterprise |
| **Transport** | TLS 1.3, gRPC with mTLS option |
| **Data at Rest** | AES-256 via Cloud KMS for all PII |
| **API** | AuthZ checks on every endpoint, role-based access control |
| **Audit** | Structured JSON logging, Cloud Audit Logs, distributed ledger anchoring |
| **Compliance** | SOC 2 Type II, automated evidence collection |

### 11.2 Canonical MFA Hub

All MFA enforcement is handled by a single canonical MFA hub (`/mfa`) via `ProtectedRoute` redirection. This prevents scattered MFA logic and ensures consistent enforcement.

### 11.3 PII Encryption

All PII fields are encrypted at rest using AES-256 via Google Cloud KMS. Key rotation is automatic. See `docs/SECURITY_COMPLIANCE.md` for key management details.

---

## 12. Deployment Architecture

### 12.1 Current Production

| Component | Platform | URL |
|:----------|:---------|:----|
| **React Portal** | Firebase Hosting | `sirsi.ai` |
| **Go Backend** | Cloud Run | `sirsi-admin-*.run.app` |
| **Sirsi Sign** | Firebase Hosting | `sign.sirsi.ai` |
| **Cloud Functions** | Firebase Functions | `us-central1` |

### 12.2 CI/CD Pipeline

- **Workflow**: `.github/workflows/ci-validate.yml`
- **Gate**: Lock file sync → Production build → Artifact verification → Bundle size guard
- **Deploy**: `firebase deploy --only hosting:sirsi-ai --project sirsi-nexus-live`
- **Backend**: `gcloud run deploy sirsi-admin --source . --region us-central1`

### 12.3 Performance Targets

| Metric | Target |
|:-------|:-------|
| Frontend Load Time | < 3 seconds |
| gRPC Latency (p95) | < 200ms |
| Database Queries | < 50ms |
| AI Inference (speed model) | < 500ms |
| AI Inference (deep reasoning) | < 10s |
| Uptime SLA | 99.9% |

---

## 13. Roadmap (Epochs)

| Epoch | Focus | Sprints | Target |
|:------|:------|:--------|:-------|
| **0** | Repo Hygiene | 0 | March 2026 |
| **1** | Ship the Business | 1–3 | March–April 2026 |
| **2** | Harden & Observe | 4–6 | April–May 2026 |
| **3** | Truth Engine (KG + Ledger) | 7–9 | May–June 2026 |
| **4** | Agent Swarm | 10–13 | June–July 2026 |
| **5** | Autonomous CTO | 14–16 | July–August 2026 |
| **6** | Commerce at Scale | 17–18 | August 2026 |
| **7** | Real-Time Intelligence | 19–21 | September 2026 |
| **8** | Multi-Platform | 22–24 | Sept–Oct 2026 |
| **9** | Direct-to-Metal | 25–27 | Oct–Nov 2026 |
| **10** | Sovereign Compute | 28–30 | Nov–Dec 2026 |

> **Canonical Blueprint**: `docs/SIRSI_MASTER_BLUEPRINT.md`

---

*SirsiNexus: The Autonomous CTO. Building, managing, and cryptographically proving infrastructure at the speed of thought.*
