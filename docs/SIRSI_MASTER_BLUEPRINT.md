# SIRSI NEXUS — THE AUTONOMOUS CTO
## Total Maximal Blueprint v4.0.0

**Version:** 4.0.0 — Canonical  
**Date:** March 7, 2026  
**Classification:** Revolutionary — Patent-Grade IP  
**Status:** 📋 PROPOSED (Rule 17)  
**Target Canonization:** `docs/SIRSI_MASTER_BLUEPRINT.md`

---

## 0. Governing Principles

1. **Revenue first.** Client portals, investor portals, tenant onboarding, and payment path are the lifeblood. Nothing advanced ships until the commerce engine is E2E verified.
2. **Clean repo, clean code.** Failed CI jobs, hanging PRs, stale branches, and dead dependencies are eliminated before writing a single new feature. Repository hygiene is not optional — it is infrastructure.
3. **Web-first.** The browser is how 95% of users will discover and use Sirsi. Every capability proves itself in React before proliferating to native platforms.
4. **Then everywhere.** Rust desktop/headless, React Native mobile, and Mac Studio native all consume the same Go + gRPC backend via the same protobuf contracts.
5. **Hashgraph is the glue.** Hedera HCS is not a peripheral service — it is the **fundamental consensus substrate** that coordinates distributed inference across neural fractal logic shards. Every AI decision, every infrastructure state verification, every agent coordination message flows through deterministically ordered Hedera topics.
6. **Direct to metal.** Sirsi bypasses IaC tools entirely and speaks directly to Cisco IOS-XE, Dell iDRAC, NVIDIA DCGM, and Google TPU APIs. We don't wrap Terraform — we replace it.
7. **Every feature is a patent.** If someone else has built it, we're building the wrong thing. 

---

## I. THE DUAL-SHARD ARCHITECTURE

> **This is the core innovation. This is the patent. This is what makes Sirsi unprecedented.**

Sirsi's distributed intelligence operates on two parallel sharding planes that together constitute the **Neural-Fractal Architecture**:

### Plane 1: Tensor Shards (Compute Layer — Exo/MLX)

**What it does**: Distributes the raw numerical computation of an LLM across multiple silicon nodes. When a Gemma 3 27B model is too large for a single Mac Studio's memory, Exo partitions the model's weight tensors across 2-4 nodes. Each node computes its portion of the forward pass, then exchanges intermediate activations via RDMA.

**Protocol Stack**:
```
┌─────────────────────────────────────┐
│  Exo Tensor Sharding Engine         │
│  (or Sirsi Shard Engine if we build) │
├─────────────────────────────────────┤
│  MLX Inference Runtime               │
│  (Apple Neural Engine + Metal GPU)   │
├─────────────────────────────────────┤
│  RDMA Transport                      │
│  ├── Thunderbolt 5 (120Gbps, desk)   │
│  └── RoCE v2 (100GbE, rack)         │
├─────────────────────────────────────┤
│  Physical Silicon                    │
│  Mac Studio M5 / NVIDIA A100 / TPUv5│
└─────────────────────────────────────┘
```

**Technical Detail**:
- Exo shards model layers using `shard_linear` / `shard_inplace` from MLX
- Each node holds a contiguous range of transformer layers (pipeline parallelism) or splits attention heads (tensor parallelism)
- Activations shuttle between nodes via RDMA zero-copy transfers
- Exo's P2P discovery uses UDP broadcast over the local network
- Fall back to TCP sockets if RDMA is unavailable

### Plane 2: Logic Shards (Consensus Layer — Hedera HCS)

**What it does**: While Exo handles *tensor math*, Hedera HCS handles *reasoning coordination*. When the Sirsi Hypervisor decomposes a complex infrastructure task into subtasks (neural fractals), each subtask's input, output, and verification state is published to an HCS topic. This provides:

1. **Deterministic ordering** (aBFT consensus) — every agent sees subtasks in the same canonical order
2. **Immutable audit trail** — every AI decision is permanently recorded with consensus timestamps  
3. **Cross-node coordination** — agents on different machines coordinate through shared HCS topics without centralized orchestration
4. **Cryptographic verification** — any inference result can be verified by replaying the HCS topic from its anchor point

**Protocol Stack**:
```
┌─────────────────────────────────────┐
│  Sirsi Hypervisor                    │
│  (Claude Opus / Gemini Flash)        │
├─────────────────────────────────────┤
│  Neural Fractal Decomposer           │
│  Task → Subtask₁..Subtaskₙ          │
├─────────────────────────────────────┤
│  HCS Topic Mesh                      │
│  ├── topic.agent.tasks      (assign) │
│  ├── topic.agent.results    (report) │
│  ├── topic.kg.anchors       (verify) │
│  ├── topic.infra.proofs     (prove)  │
│  ├── topic.compliance.attest(audit)  │
│  └── topic.fractal.coord    (sync)   │
├─────────────────────────────────────┤
│  Hedera Consensus Service (HCS)      │
│  aBFT, 10,000 TPS, ~$0.0001/msg    │
│  Deterministic ordering, 3s finality │
└─────────────────────────────────────┘
```

**How the two planes interconnect**:
```
User: "Provision a HIPAA healthcare app"
  │
  ▼
Claude Opus 4.6 decomposes into Neural Fractals:
  ├── Fractal-1: Schema design    → HCS topic.fractal.coord (ordered)
  ├── Fractal-2: RBAC policies    → HCS topic.fractal.coord (ordered)
  ├── Fractal-3: Cloud Run config  → HCS topic.fractal.coord (ordered)
  └── Fractal-4: Compliance check  → HCS topic.fractal.coord (ordered)
  │
  ▼
Each fractal may invoke LLM inference:
  ├── Gemini Flash (speed) → Vertex AI API (cloud)
  ├── Claude Opus (depth)  → Anthropic API (cloud)
  └── Gemma 3 (sovereign)  → Exo cluster (local tensor shards via RDMA)
  │
  ▼
Results published back to HCS:
  ├── Fractal-1 result → HCS topic.agent.results (consensus timestamp)
  ├── SHA-256(all results) → HCS topic.infra.proofs (cryptographic proof)
  └── Verification: any node can replay topic to verify result integrity
```

**Why this is patent-worthy**: No system in existence combines DLT-consensus-ordered reasoning with distributed tensor computation. Existing systems (LangGraph, CrewAI) coordinate agents via HTTP/RPC — no deterministic ordering, no immutability, no cryptographic proofs. Existing sharding (Exo, vLLM) distributes compute but has no consensus layer. Sirsi unifies both.

---

## II. REPO HYGIENE AUDIT

> **Current state as of 2026-03-07T09:19:10 EST**

### Open Pull Requests (4 hanging)

| PR # | Title | Branch | Age | Action |
|:-----|:------|:-------|:----|:-------|
| #20 | `chore(deps): bump go.opentelemetry.io/otel/sdk 1.39→1.40` | `dependabot/go_modules/...go_modules-6b971a9d7e` | 0 days | **REVIEW → MERGE or CLOSE** |
| #19 | `chore(deps): bump npm_and_yarn group (3 updates)` | `dependabot/npm_and_yarn/...c02264355b` | 3 days | **REVIEW → MERGE or CLOSE** |
| #18 | `chore(deps): bump npm_and_yarn group (4 updates)` | `dependabot/npm_and_yarn/.../pitch-deck/...5ecfec5b07` | 4 days | **REVIEW → MERGE or CLOSE** |
| #9 | `chore(deps): bump pip group (2 updates)` | `dependabot/pip/analytics-platform/...6d02a2de66` | 11 days | **CLOSE** — analytics-platform is legacy |

### Failed CI Runs (15 of last 50)

| Count | Type | Root Cause | Action |
|:------|:-----|:-----------|:-------|
| 7 | `CI: Validate & Build` failures on `main` | Lock file drift during rapid commits from last session | Resolved — latest CI passes ✅ |
| 3 | Cancelled runs on `main` | Superseded by newer commits | No action needed |
| 1 | `npm_and_yarn` Dependabot graph update failure | Transitive dependency conflict | Close PR #19 and #18, re-run Dependabot |
| 4 | Earlier failures on `main` (Mar 6) | Lock file sync issues | Resolved by subsequent passing commits |

**Current CI status: ✅ GREEN** — most recent `CI: Validate & Build` on `main` passes. Most recent `Build & Deploy` on `main` passes.

### Dead Dependencies (from Integration Audit)

| Package | Location | Status |
|:--------|:---------|:-------|
| `@sendgrid/mail` | `sirsi-auth/functions/package.json` | Dead — never imported |
| `sendgrid-go` | `sirsi-admin-service/go.mod` | Redundant — nodemailer/Gmail handles email |
| `nodemailer` | `sirsi-auth/functions/package.json` | Migrate → Firebase Trigger Email |

### Sprint 0 Cleanup Task List

| # | Task | Est | Detail |
|:--|:-----|:----|:-------|
| 0.1 | Triage PR #20 (OTel SDK bump) — review changelog for breaking changes, if safe → merge, else close | 20m | Check `go.opentelemetry.io/otel/sdk` 1.39→1.40 release notes. If no breaking API changes in our telemetry.go usage, merge. Run `go build` to verify. |
| 0.2 | Triage PR #19 (npm 3-update) — review each dep, test build, merge or close | 30m | Check each updated package for potential issues. Run `npm ci && npm run build` in affected dirs. |
| 0.3 | Triage PR #18 (pitch-deck 4-update) — likely safe, mostly dev deps | 20m | Pitch deck deps are isolated — low risk. |
| 0.4 | Close PR #9 (pip analytics-platform) — legacy platform, not in production path | 5m | `gh pr close 9 --comment "Closing — analytics-platform is legacy/decommissioned"` |
| 0.5 | Delete stale remote branches from closed PRs | 10m | `gh pr list --state closed --json headRefName` → delete any remaining remote branches |
| 0.6 | Remove `@sendgrid/mail` from `sirsi-auth/functions/package.json` | 5m | Dead dependency, zero imports |
| 0.7 | Remove `sendgrid-go` from `sirsi-admin-service/go.mod` | 15m | Revert SendGrid integration from `signing_service.go`, replace with Firestore email write |
| 0.8 | Run `npm audit fix` across all packages | 15m | Address any remaining vulnerabilities |
| 0.9 | Verify clean CI pass after all cleanup | 10m | Push cleanup commit → verify green ✅ |

---

## III. AI ENGINE STACK

| Model | Class | Role | Deployment | Latency | Cost |
|:------|:------|:-----|:-----------|:--------|:-----|
| **Claude Opus 4.6** | Primary | Deep reasoning: infrastructure genesis, code gen, patent-grade analysis, complex multi-step planning | Anthropic API (HTTPS) | ~3-8s | ~$15/M input, $75/M output |
| **Gemini 3 Flash** | Speed | Real-time Hypervisor: anomaly detection, NL commands, telemetry analysis, quick classification | Vertex AI (gRPC) | ~200ms | ~$0.075/M input |
| **Gemma 3 27B** | Sovereign | On-prem inference: data that can't leave the mesh, edge deployment, offline mode | Exo cluster (MLX/RDMA) or Cloud Run GPU (L4) | ~500ms-2s | $0 (open weights) + compute |
| **AlloyDB AI** | In-Database | Cognitive SQL: `ai.generate`, `ai.rank`, `ai.if` inside SQL queries, auto vector embeddings | AlloyDB managed (Gemini integration) | ~100ms | Included in AlloyDB pricing |

### LLM Routing Logic (implemented in Go)
```go
func (h *HypervisorEngine) RouteInference(ctx context.Context, req *InferenceRequest) (*InferenceResponse, error) {
    switch {
    case req.RequiresDeepReasoning || req.TokenBudget > 8000:
        // Complex: infrastructure genesis, code generation, multi-step planning
        return h.claudeOpus.Generate(ctx, req)

    case req.LatencySLA < 500*time.Millisecond:
        // Speed-critical: real-time dashboards, anomaly detection, quick classification
        return h.geminiFlash.Generate(ctx, req)

    case req.DataSovereignty == SOVEREIGN_ONLY || !h.isCloudAvailable():
        // On-prem: data can't leave the mesh, or cloud is unreachable
        return h.exoCluster.Generate(ctx, req) // Gemma 3 via Exo/MLX

    case req.IsSQLContext:
        // In-database: queries that benefit from proximity to data
        return h.alloyDBInfer(ctx, req) // ai.generate() inside SQL

    default:
        // Default: Gemini Flash for cost-efficiency
        return h.geminiFlash.Generate(ctx, req)
    }
}
```

---

## IV. PLATFORM DELIVERY MATRIX

| Platform | Technology | Transport | Target Users | Priority |
|:---------|:-----------|:----------|:-------------|:---------|
| **Web** | React 19 + Vite 7 | gRPC-Web (ConnectRPC) | All users — browser discovery | 🔴 P0 |
| **Rust Desktop** | Tauri 2.x (Rust + Web UI) | gRPC native (tonic) | DevOps engineers, sysadmins | 🟡 P2 |
| **Rust Headless** | Pure Rust daemon (no GUI) | gRPC native (tonic) + CLI | Data center, CI/CD integration | 🟡 P2 |
| **iOS** | React Native + Expo | gRPC-Web (ConnectRPC) | Mobile monitoring, approvals | 🟢 P3 |
| **Android** | React Native + Expo | gRPC-Web (ConnectRPC) | Mobile monitoring, approvals | 🟢 P3 |
| **Mac Studio Native** | Rust + Swift FFI + MLX + Exo | gRPC native + RDMA | Sovereign compute clusters | 🔵 P4 |

### Shared Code Architecture
```
packages/
├── sirsi-proto/          ← Protobuf definitions (single source of truth)
│   ├── gen/go/           ← Go codegen (Cloud Run backend)
│   ├── gen/ts/           ← TypeScript codegen (Web + React Native)
│   └── gen/rust/         ← Rust codegen (Desktop + Headless + Mac Studio) [NEW]
├── sirsi-core-rs/        ← Rust core library [NEW]
│   ├── src/client/       ← gRPC client (tonic)
│   ├── src/auth/         ← Firebase token management
│   ├── src/crypto/       ← Hedera HCS signing, SHA-256, KG hashing
│   ├── src/inference/    ← Exo/MLX inference dispatch
│   └── src/hardware/     ← NETCONF, Redfish, DCGM, TPU bindings
├── sirsi-desktop/        ← Tauri 2.x desktop app [NEW]
├── sirsi-headless/       ← Rust daemon binary [NEW]
├── sirsi-cluster/        ← Mac Studio cluster coordinator [NEW]
└── sirsi-mobile/         ← React Native app [NEW, uses mobile/ as base]
```

---

## V. DIRECT HARDWARE COMMUNICATION

> **Sirsi doesn't wrap Terraform. Sirsi IS the infrastructure layer.**

### Protocol Matrix

| Vendor | Hardware | Protocol | Go Library | Data Collected | Configuration Capability |
|:-------|:---------|:---------|:-----------|:---------------|:------------------------|
| **Cisco** | Catalyst/Nexus switches, ISR/ASR routers | NETCONF (RFC 6241), RESTCONF (RFC 8040), gNMI (streaming telemetry) | `scrapligo` (Go NETCONF/SSH), `gnmic` (gNMI) | Interface stats, routing tables, ACLs, VLAN membership, spanning tree, OSPF/BGP state | VLAN creation, ACL rules, QoS policies, route redistribution, interface config |
| **Dell** | PowerEdge servers, PowerStore storage | Redfish (DMTF), iDRAC REST API | Go `net/http` + Redfish schema | Server power state, CPU/memory utilization, disk health, firmware versions, thermal sensors, NIC status | Power on/off/cycle, BIOS settings, RAID configuration, firmware update initiation, boot order |
| **NVIDIA** | A100/H100/L4 GPUs, BlueField DPUs | DCGM (Data Center GPU Manager), NVML (Management Library) | `go-dcgm` (CGo bindings) | GPU utilization, memory usage, temperature, ECC errors, clock throttling, NVLink topology, power draw | GPU reset, persistence mode, compute mode, ECC enable/disable, clock limits |
| **Google** | TPU v5e/v6 pods | Cloud TPU API (gRPC) | `cloud.google.com/go/tpu` | TPU utilization, XLA compilation status, pod topology, training/inference throughput | Pod provisioning, firmware updates, preemptible vs reserved scheduling |
| **Apple** | Mac Studio M5/M4 Ultra | IOKit (Mach kernel), MLX, custom cluster protocol | Rust FFI → Swift/ObjC | Neural Engine utilization, GPU compute usage, unified memory pressure, Thunderbolt topology, thermal state | MLX inference dispatch, memory allocation, Thunderbolt peer management |
| **Juniper** | MX/QFX series | NETCONF (RFC 6241), Junos XML API | `scrapligo` | BGP neighbors, firewall counters, interface errors, routing instances | Firewall rules, BGP peering, VXLAN config |
| **Arista** | 7000/7500 series | eAPI (HTTPS JSON-RPC), gNMI | Go `net/http` + eAPI client | VXLAN VTEPs, EVPN routes, interface counters, MLAG state | VXLAN fabric configuration, BGP EVPN, interface provisioning |

### `HardwareService` Proto Definition (Sprint 18)
```protobuf
service HardwareService {
  // Discovery — find all reachable hardware
  rpc DiscoverDevices(DiscoverRequest) returns (DiscoverResponse);
  
  // Inventory — detailed hardware specs
  rpc GetDeviceInventory(DeviceRequest) returns (DeviceInventory);
  
  // Telemetry — real-time metrics
  rpc StreamTelemetry(TelemetryRequest) returns (stream TelemetryEvent);
  
  // Configuration — direct config changes
  rpc ConfigureDevice(ConfigureRequest) returns (ConfigureResponse);
  
  // Verification — compare actual state vs desired state
  rpc VerifyState(VerifyStateRequest) returns (VerifyStateResponse);
  
  // Lifecycle — power, firmware, maintenance
  rpc ManageLifecycle(LifecycleRequest) returns (LifecycleResponse);
}

message DeviceInventory {
  string device_id = 1;
  string vendor = 2;          // CISCO, DELL, NVIDIA, GOOGLE_TPU, APPLE
  string model = 3;           // "Catalyst 9300", "PowerEdge R760", "A100 80GB", "TPU v5e", "Mac Studio M5"
  string firmware_version = 4;
  SiliconCapabilities silicon = 5;
  repeated NetworkInterface interfaces = 6;
  ThermalState thermal = 7;
  PowerState power = 8;
}

message SiliconCapabilities {
  SiliconType type = 1;       // NVIDIA_CUDA, GOOGLE_TPU_MXU, APPLE_NEURAL_ENGINE, APPLE_AMX, x86_64
  uint64 compute_units = 2;   // CUDA cores, MXU units, Neural Engine cores
  uint64 memory_bytes = 3;    // VRAM, HBM, Unified Memory
  uint64 memory_bandwidth = 4; // bytes/sec
  double flops_fp16 = 5;      // TFLOPS
  double flops_fp32 = 6;
  repeated string supported_frameworks = 7; // ["CUDA", "MLX", "XLA", "Metal"]
}
```

---

## VI. MAC STUDIO NATIVE ARCHITECTURE

### Hardware Target
- **4× Mac Studio M5 Ultra** (when available; M4 Ultra in the interim)
- **512GB Unified RAM per node** (2TB total cluster)
- **Thunderbolt 5**: 120Gbps per link, max 3 daisy-chained per bus
- **100GbE**: Production rack interconnect (RoCE v2 for RDMA)

### Software Stack
```
┌──────────────────────────────────────────────┐
│  Sirsi Cluster Coordinator (Rust)             │
│  ├── Node Discovery (Thunderbolt + mDNS)      │
│  ├── Health Monitoring (heartbeat + thermal)   │
│  ├── Work Scheduler (silicon-aware)            │
│  └── HCS Integration (logic shard ordering)    │
├──────────────────────────────────────────────┤
│  Exo Inference Engine                          │
│  ├── Tensor Partitioning (MLX shard_linear)    │
│  ├── Pipeline Parallelism (layer-wise split)   │
│  ├── Tensor Parallelism (attention head split) │
│  └── Activation Exchange (RDMA zero-copy)      │
├──────────────────────────────────────────────┤
│  MLX Runtime (Apple)                           │
│  ├── Metal GPU backend                         │
│  ├── Neural Engine backend                     │
│  ├── Lazy evaluation + JIT compilation         │
│  └── Unified Memory (zero-copy CPU↔GPU)        │
├──────────────────────────────────────────────┤
│  RDMA Transport                                │
│  ├── Thunderbolt 5 (libpcap + custom DMA)      │
│  ├── RoCE v2 (libibverbs via Rust FFI)         │
│  └── Fallback: TCP sockets (MPI ring backend)  │
├──────────────────────────────────────────────┤
│  macOS Kernel (Darwin/Mach)                    │
│  ├── IOKit (hardware discovery)                │
│  ├── Secure Enclave (data-at-rest encryption)  │
│  └── Thunderbolt fabric driver                 │
└──────────────────────────────────────────────┘
```

### Exo vs Sirsi Shard Engine Decision Matrix

| Criterion | Exo (Open Source) | Sirsi Shard Engine (Build) |
|:----------|:------------------|:--------------------------|
| **Maturity** | Production-researchy; gaps in security/fault tolerance | Clean-room; fully controlled |
| **Patent** | MIT license — no IP exclusivity | Full patent ownership |
| **Silicon Awareness** | Generic device profiling | Deep SiliconCapabilities integration (Neural Engine cores, AMX units, Metal CUs) |
| **HCS Integration** | None — pure compute framework | Natively coordinates via Hedera topics |
| **Cost** | Free + integration effort | 4-6 weeks engineering |
| **Recommendation** | **Sprint 29: Start with Exo.** If perf/patent limitations hit → Sprint 30: Build Sirsi Shard Engine. |

---

## VII. HEDERA HASHGRAPH — FULL INTEGRATION MAP

> **Hedera is not a peripheral. It is the consensus backbone of the Neural Fractal Architecture.**

### HCS Topic Architecture

| Topic ID | Purpose | Message Format | Throughput | Retention |
|:---------|:--------|:---------------|:-----------|:----------|
| `sirsi.kg.anchors` | Knowledge Graph state anchoring — SHA-256 hash of KG snapshot | `{hash, node_count, edge_count, timestamp}` | ~1/min | Permanent |
| `sirsi.fractal.coord` | Neural Fractal subtask coordination — deterministic ordering of inference tasks | `{fractal_id, parent_id, task_spec, assigned_agent, priority}` | ~100/min during genesis | Permanent |
| `sirsi.agent.tasks` | Agent task assignment — Hypervisor → Agent | `{agent_id, task_type, payload, deadline}` | ~50/min | 30 days |
| `sirsi.agent.results` | Agent result reporting — Agent → Hypervisor | `{agent_id, task_id, result, confidence, hash}` | ~50/min | Permanent |
| `sirsi.infra.proofs` | Infrastructure state proofs — cryptographic proof of correct state | `{state_hash, components[], verification_result, hedera_timestamp}` | ~10/min | Permanent |
| `sirsi.compliance.attest` | SOC 2 attestation records — evidence anchoring | `{evidence_type, evidence_hash, attestor_id, compliance_framework}` | ~5/hour | Permanent |
| `sirsi.hardware.state` | Direct hardware state snapshots — verified configuration | `{device_id, config_hash, silicon_state, thermal, power}` | ~1/device/5min | 90 days |

### Go SDK Integration Pattern
```go
import (
    "github.com/hashgraph/hedera-sdk-go/v2"
)

type HederaCoordinator struct {
    client          *hedera.Client
    fractalTopicID  hedera.TopicID
    kgAnchorTopicID hedera.TopicID
    proofTopicID    hedera.TopicID
}

// AnchorKGState publishes a SHA-256 hash of the current Knowledge Graph state
// to Hedera HCS, creating an immutable, consensus-timestamped proof that the
// KG was in this exact state at this exact moment.
func (h *HederaCoordinator) AnchorKGState(ctx context.Context, hash [32]byte, meta KGMeta) error {
    msg := fmt.Sprintf(`{"hash":"%x","nodes":%d,"edges":%d,"ts":"%s"}`,
        hash, meta.NodeCount, meta.EdgeCount, time.Now().UTC().Format(time.RFC3339))
    
    _, err := hedera.NewTopicMessageSubmitTransaction().
        SetTopicID(h.kgAnchorTopicID).
        SetMessage([]byte(msg)).
        Execute(h.client)
    return err
}

// PublishFractal submits a Neural Fractal subtask to HCS for deterministic ordering.
// All agents subscribed to this topic will receive the task in the SAME canonical
// order, guaranteed by Hedera's aBFT consensus.
func (h *HederaCoordinator) PublishFractal(ctx context.Context, f NeuralFractal) error {
    payload, _ := proto.Marshal(&f)
    _, err := hedera.NewTopicMessageSubmitTransaction().
        SetTopicID(h.fractalTopicID).
        SetMessage(payload).
        Execute(h.client)
    return err
}
```

---

## VIII. COMPLETE BILL OF MATERIALS

### 8.1 Google Cloud (35 services)
*(Unchanged from v3 — see Section 6.1 of previous version)*

### 8.2 Essential Third-Party

| # | Service | Purpose | Cost |
|:--|:--------|:--------|:-----|
| 1 | **Anthropic API** (Claude Opus 4.6) | Primary LLM — increments with releases | Pay-per-token |
| 2 | **Stripe** | Payments, subscriptions, catalog, Connect | 2.9%+$0.30 |
| 3 | **Plaid** | Bank linking, asset discovery | Per-link |
| 4 | **Hedera SDK** (Go + Rust) | HCS consensus coordination, KG anchoring, infra proofs | ~$0.0001/msg |
| 5 | **GitHub API** | Tenant provisioning, CI/CD | Free |
| 6 | **OpenSign** (Community) | E-signatures (self-hosted) | Free |
| 7 | **Puppeteer** | Legal PDF rendering | Free |
| 8 | **Exo** | Tensor sharding (evaluate → replace if needed) | Free (MIT) |

### 8.3 Direct Hardware SDKs

| # | SDK | Target | Language |
|:--|:----|:-------|:---------|
| 1 | `scrapligo` | Cisco NETCONF/SSH, Juniper NETCONF | Go |
| 2 | `gnmic` | Cisco/Arista gNMI streaming telemetry | Go |
| 3 | Redfish HTTP | Dell iDRAC, HPE iLO | Go |
| 4 | `go-dcgm` | NVIDIA GPU management | Go (CGo) |
| 5 | `cloud.google.com/go/tpu` | Google TPU v5e/v6 | Go |
| 6 | IOKit + Metal | Apple Silicon hardware discovery | Rust → Swift FFI |
| 7 | MLX | Apple ML inference runtime | Python/Swift → Rust FFI |
| 8 | Arista eAPI | Arista switch JSON-RPC | Go HTTP |

### 8.4 Visualization (all free)
Cytoscape.js, D3.js, Three.js, Recharts, vis-network, Mermaid.js

### 8.5 MCP Servers
Google Cloud, GitHub, Stripe, Firebase, AlloyDB, Custom: Hedera, Custom: Hardware

### 8.6 Remove
`sendgrid-go`, `@sendgrid/mail`, `nodemailer` → Firebase Trigger Email. Cloud SQL → AlloyDB AI.

---

## IX. PHASED EXECUTION (10 Epochs, 30 Sprints + Sprint 0)

### Priority Hierarchy
```
0. REPO HYGIENE (Sprint 0)
1. CONTINUATION WORK — existing P0-P3 items
2. CLIENT & INVESTOR PORTALS — complete dashboards, role routing
3. TENANT MANAGEMENT & ONBOARDING — wizard E2E, management UI
4. PAYMENT PATH — Stripe Checkout → webhook → provision → deploy
   ════════════════════ REVENUE LINE ════════════════════
5. Security hardening, observability, Sirsi Sign vault
6. AlloyDB AI + Knowledge Graph + Hedera HCS
7. Agent Swarm + Self-Evolution
8. Claude Opus + Gemini Flash + Infrastructure Genesis
9. Multi-Platform (Rust, React Native)
10. Direct-to-Metal + Sovereign Compute
```

---

### SPRINT 0: Repo Hygiene (Pre-Epoch) — 1 day
| # | Task | Detail | Est |
|:--|:-----|:-------|:----|
| 0.1 | Triage PR #20 (OTel SDK 1.39→1.40) | Check release notes vs `telemetry.go` usage. If no breaking API → merge. Run `cd packages/sirsi-admin-service && go build` to confirm. | 20m |
| 0.2 | Triage PR #19 (npm group 3 updates) | Review each dep (`npm diff`). Run `npm ci && npm run build` in affected packages. If build passes → merge. | 30m |
| 0.3 | Triage PR #18 (pitch-deck 4 updates) | Dev deps only — low risk. Merge if build passes. | 20m |
| 0.4 | Close PR #9 (pip analytics-platform) | Legacy — `gh pr close 9 --comment "analytics-platform decommissioned per Phase 10"` | 5m |
| 0.5 | Delete stale remote branches | `gh pr list --state closed --json headRefName --jq '.[].headRefName' \| xargs -I{} git push origin --delete {}` | 10m |
| 0.6 | Remove dead deps | `@sendgrid/mail` from Node package.json, `sendgrid-go` from Go go.mod | 15m |
| 0.7 | npm audit fix | Address remaining vuln warnings across all packages | 15m |
| 0.8 | Verify clean CI | Push cleanup commit → verify all workflows green | 10m |
| 0.9 | Version bump → v0.9.4-alpha | Update `package.json`, `VERSION`, `CHANGELOG.md` | 10m |

---

### EPOCH 1: Ship the Business (Sprints 1–3) — 3 weeks

#### Sprint 1 — Google-Native Email + SQL Persistence
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 1.1 | Install Firebase Trigger Email Extension | `firebase ext:install firebase/firestore-send-email --project sirsi-nexus-live`. Configure with Gmail SMTP (`MAIL_USER`/`MAIL_PASS`). Creates `mail` collection in Firestore. | 1h |
| 1.2 | Migrate `signing_service.go` email | Replace SendGrid SDK calls in `RequestWireInstructions` and `SendMFACode` with Firestore Admin SDK writes to `mail` collection. Each doc: `{to, message: {subject, html}}`. Extension auto-sends. | 3h |
| 1.3 | Migrate Cloud Function email (opensign.ts) | Replace 3 `nodemailer.createTransport()` calls with Firestore `admin.firestore().collection('mail').add()` writes. Same `{to, message}` schema. | 2h |
| 1.4 | Migrate secrets → Secret Manager | Move `MAIL_USER`, `MAIL_PASS`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` from Cloud Function secrets to Secret Manager. Update Cloud Function config to reference via `process.env`. | 2h |
| 1.5 | Write `signing_sql.go` | Implement `InsertEnvelope`, `UpdateEnvelopeStatus`, `GetEnvelopeByRef`, `ListEnvelopes` against `signing_envelopes` table. Use parameterized pgx queries. | 4h |
| 1.6 | Write `tenant_sql.go` | Implement `InsertTenant`, `GetTenantBySlug`, `UpdateTenantStatus`, `ListTenants`, `InsertProvisioningStep`, `GetProvisioningStatus` against `tenants` + `provisioning_status` tables. | 4h |
| 1.7 | Wire AdminService to Firebase Auth | Go Firebase Admin SDK (`firebase.google.com/go`): `auth.ListUsers()`, `auth.GetUser()`. Replace in-memory user list with live Firebase Auth reads. | 3h |

#### Sprint 2 — Client & Investor Portals
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 2.1 | **Client Portal** (`/client-portal`) | Dashboard: contract status cards (from `signingClient.listEnvelopes`), payment history (from Stripe `customer.charges`), document vault (from `signingClient.listVaultFiles`), support messaging placeholder. Reuse existing `sirsi-card` components. Swiss Neo-Deco styling (Inter, no Cinzel in data views). | 8h |
| 2.2 | **Investor Portal** (`/investor-portal`) | Dashboard: KPI metrics (MRR from Stripe, user count from Firebase Auth, deployment count from Cloud Run telemetry), committee view (board meeting schedule from Firestore), portfolio overview with Recharts line/bar charts. | 8h |
| 2.3 | Role-based routing | In `ProtectedRoute.tsx`: check `user.customClaims.role` from Firebase Auth token. `admin` → `/dashboard`, `investor` → `/investor-portal`, `client` → `/client-portal`. Add role claim on user creation via Cloud Function. | 3h |
| 2.4 | Sidebar per role | In `AdminSidebar.tsx`: filter sidebar items based on `useAuth().role`. Admin sees full sidebar. Investor sees KPI/committee/docs. Client sees contracts/vault/support. | 2h |
| 2.5 | Cloud Functions audit | List all deployed functions: `firebase functions:list`. Cross-reference with `signing_service.go` Stripe handlers. Decommission: `createCheckoutSession` (→ SigningService.CreateCheckoutSession gRPC), `handlePaymentWebhook` (→ verify if still active or replaced by Cloud Run). Keep: `sendContactEmail`, `grantInvestorAccess` (if not replaced), scheduled functions. | 2h |
| 2.6 | ADR-021 → Accepted | Change status from "Proposed" to "Accepted" in `docs/ADR-021-UNIFIED-GRPC-CONVERGENCE.md`. Update `docs/ADR-INDEX.md` table. | 15m |

#### Sprint 3 — Onboarding + Payment E2E
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 3.1 | **Onboarding E2E** (5 steps) | Step 1: Plan selection (Free/Solo/Business) → sets `planId` state. Step 2: Company info (name, domain, admin email) → validates unique slug. Step 3: Stripe Checkout → `catalogClient.createCheckoutSession({planId, email})` → Stripe redirects with `?session_id`. Step 4: GitHub repo → `tenantClient.createTenantGitHubRepo({slug, templateRepo: 'SirsiMaster/tenant-scaffold'})`. Step 5: Success → redirect to `/dashboard`. **Test with live Stripe test mode credentials.** | 6h |
| 3.2 | **Payment webhook verification** | Ensure Stripe webhook at `/api/stripe/webhook` on Cloud Run correctly: a) Verifies signature with `STRIPE_WEBHOOK_SECRET`. b) Handles `checkout.session.completed` → creates tenant record in AlloyDB. c) Handles `invoice.paid` → updates subscription status. Test with `stripe listen --forward-to localhost:8080/api/stripe/webhook`. | 3h |
| 3.3 | **Tenant Management UI** | `/tenants` route (existing, extend): Admin table showing all tenants (slug, plan, status, billing info, provisioning steps). Actions: View details, resend invite, deactivate. Data from `tenantClient.listTenants()`. | 4h |
| 3.4 | Dependabot resolution | Resolve 4 remaining Dependabot alerts (fast-xml-parser, @tootallnate/once x3). Check if in production dependency path — if only in devDeps, suppress with `.github/dependabot.yml` ignore rules. | 1h |
| 3.5 | Command Palette actions | "New Contract" → `navigate('/contracts?action=create')`, contracts page reads `action` param and opens create modal. "Ask AI" → placeholder modal with chat input (wired in Epoch 5 to Claude Opus). | 2h |
| 3.6 | Version → v0.9.5-alpha | Update `package.json`, `VERSION`, `CHANGELOG.md`, git tag. | 15m |

---

### EPOCH 2: Harden & Observe (Sprints 4–6) — 3 weeks
*(Production security, monitoring, Sirsi Sign vault — full details per sprint)*

#### Sprint 4 — Security Hardening
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 4.1 | Cloud Armor policies | Create security policy: rate limiting (100 req/10s per IP), geo-blocking (optional), SQLi/XSS protection via pre-configured WAF rules. Apply to Cloud Run via serverless NEG + load balancer. | 4h |
| 4.2 | reCAPTCHA Enterprise | Install on `/login`, `/signup`, `sign.sirsi.ai` auth forms. Server-side verification via `recaptchaenterprise.googleapis.com/v1/projects/{project}/assessments`. Score threshold: 0.5. | 3h |
| 4.3 | Cloud CDN | Configure for Firebase Hosting static assets. Already served via Firebase CDN, but add `Cache-Control: public, max-age=31536000, immutable` headers for hashed JS/CSS bundles. | 1h |
| 4.4 | Cloud Monitoring dashboards | Create custom dashboard: Cloud Run request latency (p50/p95/p99), error rate, instance count. Firebase Auth sign-in rate, MFA enrollment rate. Alerting: >5% error rate → PagerDuty/email. | 3h |
| 4.5 | Structured logging | In Go backend: use `slog.New(slog.NewJSONHandler(os.Stdout, nil))`. Add trace context (`X-Cloud-Trace-Context`) to all log entries. Cloud Logging auto-ingests structured JSON from Cloud Run stdout. | 2h |

#### Sprint 5 — Hypervisor Live Wiring
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 5.1 | DEVOPS tab → live GitHub Actions | `go-github` SDK: `client.Actions.ListWorkflowRuns()`. Calculate DORA: Deployment Frequency = runs/week, Lead Time = avg(merged_at - created_at), Change Failure Rate = failed/total, MTTR = avg(fixed_at - failed_at). | 4h |
| 5.2 | DATABASE tab → live pg_stat | Direct SQL queries from Go: `SELECT * FROM pg_stat_activity`, `SELECT * FROM pg_stat_user_tables`, `SELECT * FROM pg_stat_statements` (requires extension). Display connection pool utilization, slow query log, table sizes. | 4h |
| 5.3 | INTEGRATIONS tab → Stripe + GitHub health | Stripe: `stripe.Balance.Get()` → balance. `stripe.Subscription.List()` → active count. GitHub: `client.RateLimits()` → remaining quota. OpenSign: HTTP health check to `sign.sirsi.ai/api/health`. | 3h |
| 5.4 | SECURITY tab → Firebase Auth telemetry | Firebase Admin SDK: `auth.ListUsers()` → total users, MFA enrolled count, last sign-in distribution. Cloud Audit Logs: query for auth events in last 24h. | 3h |
| 5.5 | COST tab → Recommender + Stripe | GCP Recommender API: `recommender.ListRecommendations()` for cost optimization. Stripe: MRR calculation from active subscriptions. GCP Billing: `billingbudgets.googleapis.com` for current spend. | 3h |

#### Sprint 6 — Sirsi Sign Vault + Contract Builder
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 6.1 | Vault Landing | `sign.sirsi.ai/` → proper auth gate. Login form (Firebase Auth `signInWithEmailAndPassword`), registration form (if feature-flagged). Post-auth → contract management dashboard. | 4h |
| 6.2 | Contract Builder | Generalize `MasterAgreement.tsx` into template system: `ContractTemplate` model with `sections[]`, `variables{}`, `pricingTable{}`. Template stored in Firestore. Builder UI: drag sections, fill variables, preview render. | 8h |
| 6.3 | SSE for real-time | Go Cloud Run: `http.HandleFunc("/api/events", sseHandler)`. Handler: `w.Header().Set("Content-Type", "text/event-stream")`. Push telemetry updates every 5s. React: `useEventSource("/api/events")` custom hook. | 3h |
| 6.4 | Version → v1.0.0-beta 🎉 | Major milestone — commerce engine complete, portals working, monitoring live. | 30m |

---

### EPOCH 3: The Truth Engine (Sprints 7–9) — 3 weeks
*(AlloyDB AI + Hedera + KG — the NebuLang Protocol implementation)*

#### Sprint 7 — AlloyDB AI Migration
| # | Task | Technical Detail | Est |
|:--|:-----|:-----------------|:----|
| 7.1 | Provision AlloyDB | `gcloud alloy-db clusters create sirsi-kg-cluster --region=us-central1 --database-version=POSTGRES_15`. Create primary instance: `gcloud alloy-db instances create sirsi-primary --cluster=sirsi-kg-cluster --instance-type=PRIMARY --cpu-count=2`. | 1h |
| 7.2 | Data migration | Export Cloud SQL: `pg_dump -h /cloudsql/sirsi-nexus-live:us-central1:sirsi-vault-sql -U postgres sirsi_admin > dump.sql`. Import to AlloyDB: `psql -h $ALLOYDB_IP -U postgres sirsi_admin < dump.sql`. Update `DATABASE_URL` env var on Cloud Run. **Zero code change** — same pgx driver. | 2h |
| 7.3 | Enable AI features | `CREATE EXTENSION IF NOT EXISTS google_ml_integration;`. Enable Vertex AI model access: `CALL google_ml.create_model(model_id => 'gemini-flash', model_type => 'text_generation', model_qualified_name => 'publishers/google/models/gemini-2.0-flash');`. | 1h |
| 7.4 | KG schema | See below — full `schema_kg.sql` with vector columns, auto-embedding triggers, GIN indexes. | 2h |
| 7.5 | Enable auto vector embeddings | `SELECT google_ml.create_auto_embedding(table_name => 'knowledge_nodes', content_column => 'description', embedding_column => 'embedding', model_id => 'gemini-embedding-001');` | 30m |
| 7.6 | ADR-033 | AlloyDB AI Migration + Cognitive SQL decision record. | 1h |

**Knowledge Graph Schema (Sprint 7.4)**:
```sql
-- Knowledge Graph nodes with auto-embeddings
CREATE TABLE knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type VARCHAR(64) NOT NULL,    -- 'service', 'agent', 'hardware', 'config', 'policy', 'incident'
    name VARCHAR(256) NOT NULL,
    description TEXT,
    properties JSONB DEFAULT '{}',
    embedding REAL[768],               -- Auto-populated by AlloyDB AI
    hedera_anchor_hash BYTEA,          -- SHA-256 of node state, anchored on HCS
    hedera_anchor_ts TIMESTAMPTZ,      -- HCS consensus timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Graph edges (relationships)
CREATE TABLE knowledge_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    edge_type VARCHAR(64) NOT NULL,    -- 'depends_on', 'routes_to', 'manages', 'runs_on', 'generated_by'
    weight FLOAT DEFAULT 1.0,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, target_id, edge_type)
);

-- Hedera HCS anchor records (cryptographic proofs)
CREATE TABLE kg_anchors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_hash BYTEA NOT NULL,         -- SHA-256 of full KG state at anchor time
    node_count INTEGER NOT NULL,
    edge_count INTEGER NOT NULL,
    hedera_topic_id VARCHAR(32) NOT NULL,
    hedera_sequence_number BIGINT NOT NULL,
    hedera_consensus_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Infrastructure state snapshots (for Neural-Fractal verification)
CREATE TABLE infrastructure_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_type VARCHAR(64) NOT NULL,  -- 'cloud_run_service', 'alloydb_instance', 'firestore_db', 'cisco_switch', 'nvidia_gpu'
    component_id VARCHAR(256) NOT NULL,
    desired_state JSONB NOT NULL,
    actual_state JSONB NOT NULL,
    drift_detected BOOLEAN DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    verification_proof_id UUID REFERENCES kg_anchors(id),
    UNIQUE(component_type, component_id)
);

-- Indexes
CREATE INDEX idx_nodes_type ON knowledge_nodes(node_type);
CREATE INDEX idx_nodes_embedding ON knowledge_nodes USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_edges_source ON knowledge_edges(source_id);
CREATE INDEX idx_edges_target ON knowledge_edges(target_id);
CREATE INDEX idx_edges_type ON knowledge_edges(edge_type);
CREATE INDEX idx_infra_drift ON infrastructure_state(drift_detected) WHERE drift_detected = TRUE;
```

#### Sprint 8 — Hedera + KnowledgeGraphService
*(Full Hedera integration as described in Section VII)*

#### Sprint 9 — Graph Explorer UI
*(Cytoscape.js + semantic search as described in v3)*

---

### EPOCHS 4–10: (Sprint-level detail matches v3 structure with the following key changes)

**Epoch 4 (Sprints 10–13)** — Agent Swarm: All agent coordination messages flow through HCS topics (not just Pub/Sub). Pub/Sub handles internal GCP event routing; HCS handles deterministic ordering for agent consensus operations.

**Epoch 5 (Sprints 14–16)** — Autonomous CTO: Infrastructure Genesis Engine now publishes each Neural Fractal subtask to `sirsi.fractal.coord` HCS topic before execution. Results are anchored on `sirsi.infra.proofs`. The genesis flow is: NL → Claude Opus decomposes → HCS orders fractals → Agents execute → Results anchored → Neural-Fractal recursive verification → Deploy.

**Epoch 6 (Sprints 17–18)** — Commerce + Direct Hardware: Hardware state snapshots published to `sirsi.hardware.state` HCS topic for permanent audit trail of all direct-to-metal configuration changes.

**Epoch 7 (Sprints 19–21)** — Real-Time Intelligence: Predictive models trained on HCS-timestamped historical data (deterministic ordering guarantees clean time-series).

**Epoch 8 (Sprints 22–24)** — Multi-Platform: `sirsi-core-rs` Rust library includes Hedera SDK bindings (Rust) for native clients to verify HCS proofs locally without Go backend.

**Epoch 9 (Sprints 25–27)** — Direct-to-Metal: Every hardware configuration change is: a) proposed by AI, b) verified against KG patterns, c) published to HCS for deterministic ordering, d) executed, e) verified again, f) proof anchored. Ful sovereign audit trail.

**Epoch 10 (Sprints 28–30)** — Sovereign Compute: Mac Studio cluster uses HCS for inter-node consensus on tensor shard assignment. Exo handles the data-plane (RDMA tensor exchange), Hedera handles the control-plane (which node gets which layers, in what order, verified how).

---

## X. THE DUAL-SHARD SUMMARY

```
┌──────────────────────────────────────────────────────────────┐
│                    SIRSI HYPERVISOR                            │
│              (Claude Opus 4.6 — Primary Brain)                │
│                                                               │
│    ┌─────────────────────┐    ┌─────────────────────┐        │
│    │  LOGIC SHARDS       │    │  TENSOR SHARDS      │        │
│    │  (Hedera HCS)       │    │  (Exo/MLX)          │        │
│    │                     │    │                     │        │
│    │  • aBFT consensus   │    │  • Pipeline par.    │        │
│    │  • Deterministic    │    │  • Tensor par.      │        │
│    │    ordering         │    │  • RDMA transport   │        │
│    │  • Immutable audit  │    │  • Zero-copy GPU    │        │
│    │  • 3s finality      │    │  • 120Gbps TB5      │        │
│    │  • $0.0001/msg      │    │  • Free (MIT)       │        │
│    │                     │    │                     │        │
│    │  Controls:          │    │  Computes:          │        │
│    │  WHAT to compute    │    │  HOW to compute     │        │
│    │  WHO computes it    │    │  WHERE (which GPU)  │        │
│    │  WHEN (order)       │    │  WHAT (matrix math) │        │
│    │  WHY (proof)        │    │                     │        │
│    └─────────┬───────────┘    └──────────┬──────────┘        │
│              │                           │                    │
│              └───────────┬───────────────┘                    │
│                          │                                    │
│              ┌───────────▼───────────┐                        │
│              │  NEURAL FRACTAL       │                        │
│              │  (The Unified Output) │                        │
│              │                       │                        │
│              │  Logic-verified +     │                        │
│              │  Compute-optimized +  │                        │
│              │  Cryptographically    │                        │
│              │  proven infrastructure│                        │
│              └───────────────────────┘                        │
│                                                               │
│  Patent P-001: NebuLang (KG + HCS grounding)                 │
│  Patent P-002: Neural-Fractal (recursive dual-shard verif.)  │
│  Patent P-005: Tri-Silicon (silicon-aware scheduling)         │
└──────────────────────────────────────────────────────────────┘
```

---

## XI. TIMELINE

| Epoch | Focus | Sprints | Target |
|:------|:------|:--------|:-------|
| **0** | Repo Hygiene | 0 | March 2026 (1 day) |
| **1** | Ship the Business | 1–3 | March–April 2026 |
| **2** | Harden & Observe | 4–6 | April–May 2026 |
| **3** | Truth Engine | 7–9 | May–June 2026 |
| **4** | Agent Swarm | 10–13 | June–July 2026 |
| **5** | Autonomous CTO | 14–16 | July–August 2026 |
| **6** | Commerce at Scale | 17–18 | August 2026 |
| **7** | Real-Time Intelligence | 19–21 | Sept 2026 |
| **8** | Multi-Platform | 22–24 | Sept–Oct 2026 |
| **9** | Direct-to-Metal | 25–27 | Oct–Nov 2026 |
| **10** | Sovereign Compute | 28–30 | Nov–Dec 2026 |

---

## XII. 8 PATENTS

| # | Title | Core Innovation | Epoch |
|:--|:------|:----------------|:------|
| P-001 | NebuLang Protocol | Zero-hallucination LLM via DLT-consensus-verified Knowledge Graph grounding | 3 |
| P-002 | Neural-Fractal Architecture | Recursive dual-shard (logic + tensor) verification at every infrastructure level | 5 |
| P-003 | KG Query Engine | Predictive Infrastructure-as-Data — databases that predict their own failures | 7 |
| P-004 | Autonomous Infrastructure Genesis | Natural language → complete production stack, zero human intervention | 5 |
| P-005 | Tri-Silicon Mesh Orchestration | Silicon-characteristic-aware workload scheduling (CUDA/MXU/Neural Engine) | 9 |
| P-006 | Cryptographic Infrastructure Proofs | Mathematically verifiable infrastructure state via Hedera consensus anchoring | 3 |
| P-007 | Self-Evolving Agent Protocol | Agents observe operations and autonomously expand their capability registry | 4 |
| P-008 | Direct-to-Metal Orchestration | Bypass IaC — direct NETCONF/Redfish/DCGM/TPU with AI-driven silicon-aware config | 9 |

---

> [!CAUTION]
> **Sprint 0 (repo hygiene) is immediate and requires no approval — it's housekeeping.  
> Epoch 1 (Sprints 1–3) requires your approval per Rule 17.**  
> Every token spent on this plan maps to either **revenue** (Epochs 1–2) or a **patent** (Epochs 3–10).  
> **Approve Epoch 1 to begin.**
