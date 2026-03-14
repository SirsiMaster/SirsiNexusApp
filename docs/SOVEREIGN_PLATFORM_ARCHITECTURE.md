# Sirsi Nexus Sovereign Platform — Canonical Hardware Architecture

**Version:** 1.0.0  
**Date:** March 14, 2026  
**Patent:** P-006 — Sovereign Platform  
**ADR:** ADR-044  
**Classification:** INTERNAL ONLY (Documentation Firewall — Rule 26)  
**Authors:** Cylton Collymore

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Memory Bandwidth Problem](#2-the-memory-bandwidth-problem)
3. [Apple Silicon Memory Architecture Deep Dive](#3-apple-silicon-memory-architecture-deep-dive)
4. [The LPDDR6 Inflection](#4-the-lpddr6-inflection)
5. [Competitive Hardware Analysis](#5-competitive-hardware-analysis)
6. [Sovereign Platform Hardware Design](#6-sovereign-platform-hardware-design)
7. [Mag-Dock Baseplate Engineering](#7-mag-dock-baseplate-engineering)
8. [PCIe Gen 5 Signal Integrity](#8-pcie-gen-5-signal-integrity)
9. [Non-Transparent Bridge Fabric](#9-non-transparent-bridge-fabric)
10. [Thermal Management System](#10-thermal-management-system)
11. [Software & Firmware Stack](#11-software--firmware-stack)
12. [AI Inference Performance Model](#12-ai-inference-performance-model)
13. [Manufacturing & Bill of Materials](#13-manufacturing--bill-of-materials)
14. [Regulatory & Legal Considerations](#14-regulatory--legal-considerations)
15. [Commercialization Strategy](#15-commercialization-strategy)
16. [Future Roadmap](#16-future-roadmap)

---

## 1. Executive Summary

The **Sirsi Nexus Sovereign Platform** is a proprietary hardware appliance that transforms 4 off-the-shelf Apple Mac Studio workstations into a unified AI supercomputer with **2 TB of shared memory** and **~120 GB/s cluster fabric bandwidth**.

It solves the fundamental problem of local frontier AI: consumer silicon has extraordinary internal bandwidth (1.2 TB/s per M5 Ultra), but the external interconnects (Thunderbolt 5 at 15 GB/s) create an 80:1 bottleneck that makes multi-node AI clustering impractical for tensor-parallel workloads.

The Sovereign Platform bypasses Thunderbolt entirely by intercepting the Mac Studio's internal PCIe Gen 5 NVMe lanes and routing them through a **magnetic docking interface** ("Mag-Dock") to a central **PCIe fabric switch** operating in **Non-Transparent Bridge (NTB)** mode.

### Key Claims

| Claim | Description |
|:------|:-----------|
| **Magnetic Coherence Docking** | Halbach Array magnets align differential-pair pogo-pins to sub-millimeter precision for cable-free PCIe Gen 5 data transfer |
| **SSD Slot Interposition** | Dual-path Y-splitter maintains Apple's Secure Enclave boot chain while routing PCIe 5.0 lanes to external fabric |
| **Unified Memory Fabric** | Broadcom PEX 89105 NTB presents 4 independent root complexes as a single coherent memory address space |
| **Thermal Vapor-Chamber Dock** | Magnetically-coupled heat transfer from PCIe Gen 5 SSDs to rack cooling system |

### Market Position

| | NVIDIA DGX H100 | 4× DGX Spark | 4× Mac Studio (TB5) | **Sovereign Platform** |
|:--|:----------------|:-------------|:---------------------|:-----------------------|
| **VRAM** | 640 GB | 512 GB | 2 TB | **2 TB** |
| **Cluster Bandwidth** | 900 GB/s | 900 GB/s | 40 GB/s | **126 GB/s** |
| **Price** | $350K+ | $160K | $40K | **$55K** |
| **Data Sovereignty** | ❌ Cloud | ❌ Cloud | ✅ Local | **✅ Local** |
| **Setup** | Rack + Cooling | Rack + Cooling | Cables | **Snap-to-Dock** |

---

## 2. The Memory Bandwidth Problem

### 2.1 Why Bandwidth Determines AI Speed

Large Language Model (LLM) inference has two computational phases:

1. **Prefill** (prompt ingestion): Compute-bound. The entire prompt is processed in a single forward pass. Performance scales with FLOPS (floating-point operations per second).

2. **Decode** (token generation): **Memory-bound**. Each new token requires reading the entire model weights from memory. Performance scales with **memory bandwidth** (GB/s).

For interactive AI — the "ChatGPT experience" — decode speed is the metric that matters. A human reads at ~4 tokens/second. A "snappy" chat interface streams at 20–30 tokens/second. To achieve this:

```
Required Bandwidth = Model Size (bytes) × Tokens Per Second

Example: Llama 3 70B at Q8 quantization (70 GB)
  70 GB × 20 tok/s = 1,400 GB/s = 1.4 TB/s
```

A single M5 Ultra (1.22 TB/s) can almost achieve 20 tok/s on a 70B model. But for a 405B model (200 GB at Q4), you need:

```
200 GB × 20 tok/s = 4,000 GB/s = 4 TB/s
```

This requires distributing the model across 4 Mac Studios — but only if their interconnect doesn't bottleneck the data flow.

### 2.2 The Thunderbolt Bottleneck

When a model is sharded across 4 nodes connected via Thunderbolt 5:

| Segment | Speed |
|:--------|:------|
| Mac₁ internal memory → Mac₁ GPU | 1,220 GB/s |
| Mac₁ GPU → **Thunderbolt 5 cable** → Mac₂ | **15 GB/s** |
| Mac₂ Thunderbolt → Mac₂ GPU | 15 GB/s |
| Mac₂ internal memory → Mac₂ GPU | 1,220 GB/s |

The 15 GB/s cable stage is the "traffic jam." In tensor-parallel mode (where every layer requires cross-node communication), each GPU spends **98%** of its time waiting for the cable:

```
GPU compute time per layer:  ~0.05 ms (at 1,220 GB/s)
Cable transfer time per layer: ~3.3 ms (at 15 GB/s)
GPU utilization: 0.05 / (0.05 + 3.3) = 1.5%
```

### 2.3 The Sovereign Platform Solution

The Sovereign Platform replaces the 15 GB/s cable with a 30 GB/s PCIe Gen 5 direct fabric:

```
GPU compute time per layer:  ~0.05 ms
Fabric transfer time per layer: ~0.82 ms (at 30 GB/s, sub-µs latency)
GPU utilization: 0.05 / (0.05 + 0.82) = 5.7% (tensor parallel)
```

More importantly, at 30 GB/s with sub-microsecond latency, **pipeline parallelism** becomes viable:

```
Pipeline parallel (data crosses fabric 1× per full forward pass):
GPU compute time:  ~12 ms (full layer set)
Fabric transfer:   ~3.3 ms (one large transfer)
GPU utilization: 12 / (12 + 3.3) = 78%
```

This transforms the cluster from a "team of independent machines" into a "virtual monolithic chip."

---

## 3. Apple Silicon Memory Architecture Deep Dive

### 3.1 Unified Memory Architecture (UMA)

Apple Silicon uses a fundamentally different memory model than traditional PCs:

**Traditional PC:**
```
CPU ←→ DDR5 (128-bit, 76 GB/s)
  ↕ PCIe
GPU ←→ GDDR6X (384-bit, 1,008 GB/s)
```

**Apple Silicon:**
```
CPU + GPU + Neural Engine ←→ LPDDR5X (512-bit, 614 GB/s)
        (Single unified pool)
```

In a PC, the CPU memory (76 GB/s) and GPU memory (1,008 GB/s) are isolated pools connected by PCIe (~32 GB/s). Data must be explicitly copied between them. Apple's UMA eliminates this copy — all processors share one massive memory bus.

### 3.2 Channel Architecture

Apple Silicon scales bandwidth by adding physical memory controllers ("channels"):

| Chip | Channels | Bits/Channel | Bus Width | Memory Type | Bandwidth |
|:-----|:---------|:-------------|:----------|:-----------|:----------|
| M1 | 8 | 16-bit | 128-bit | LPDDR4X | 68 GB/s |
| M1 Max | 16 | 16-bit | 256-bit | LPDDR5 | 400 GB/s |
| M1 Ultra | 32 | 16-bit | 512-bit | LPDDR5 | 800 GB/s |
| M4 Max | 32 | 16-bit | 512-bit | LPDDR5X | 546 GB/s |
| **M5 Max** | **32** | **16-bit** | **512-bit** | **LPDDR5X-9600** | **614 GB/s** |
| **M5 Ultra (est.)** | **64** | **16-bit** | **1024-bit** | **LPDDR5X-9600** | **~1,228 GB/s** |

### 3.3 The "Ultra" Doubling Pattern

Apple's Ultra chips are physically two Max dies connected by a silicon interposer called **UltraFusion**:

- UltraFusion bandwidth: **2.5 TB/s** inter-die
- Bus width doubling: M5 Max 512-bit → M5 Ultra 1024-bit
- Memory doubling: 128 GB → 256 GB (or 512 GB in max config)
- GPU core doubling: 40 → 80 cores

This pattern is the foundation of the Sovereign Platform's thesis: if Apple can fuse two dies at 2.5 TB/s inside a single package, we can approximate a similar fusion across separate packages using PCIe Gen 5.

### 3.4 PCIe Gen 5 in M5

The M5 generation officially introduced PCIe Gen 5 for internal storage:

| Interface | Generation | Per-Lane Speed | Lanes | Total |
|:----------|:----------|:---------------|:------|:------|
| Internal SSD Slot 1 | PCIe 5.0 | 4 GB/s | x4 | 16 GB/s |
| Internal SSD Slot 2 | PCIe 5.0 | 4 GB/s | x4 | 16 GB/s |
| Thunderbolt 5 Port | TB5 | — | — | 10–15 GB/s |

**Critical insight**: The internal SSD slots provide **32 GB/s of raw PCIe Gen 5 bandwidth** per Mac — more than double what Thunderbolt 5 can deliver. This is the "backdoor" that the Sovereign Platform exploits.

---

## 4. The LPDDR6 Inflection

### 4.1 JEDEC LPDDR6 Standard (JESD209-6)

Ratified July 2025, LPDDR6 changes the fundamental building block of mobile memory:

| Parameter | LPDDR5X | LPDDR6 | Change |
|:----------|:--------|:-------|:-------|
| **Channel Width** | 16-bit | **24-bit** | **+50%** |
| **Sub-channel Width** | 8-bit | 12-bit | +50% |
| **Data Rate** | 9,600 MT/s | 10,700–14,400 MT/s | +12–50% |
| **Voltage** | 1.05V | 1.0V | –5% |
| **Partial Array Self-Refresh** | Limited | Full | Better sleep efficiency |

### 4.2 Impact on Apple M6 (Predicted)

If Apple maintains its 32-channel architecture with LPDDR6:

```
M6 Max:  32 channels × 24-bit = 768-bit bus
M6 Ultra: 64 channels × 24-bit = 1,536-bit bus
```

| Chip (Est.) | Bus Width | Memory Type | Est. Bandwidth |
|:------------|:----------|:-----------|:---------------|
| M6 Max | 768-bit | LPDDR6-10700 | ~1,027 GB/s |
| M6 Ultra | 1,536-bit | LPDDR6-10700 | ~2,054 GB/s |

A 4-node Sovereign Platform with M6 Ultras would provide:
- **Internal bandwidth**: 4 × 2,054 GB/s = **8.2 TB/s** (aggregate)
- **Total VRAM**: 4 × 512 GB = **2 TB** (or 4 TB if Apple expands)
- **Cluster fabric**: ~126 GB/s (PCIe Gen 5, unchanged)

At 8.2 TB/s internal bandwidth, a 405B model at Q8 (400 GB) could decode at:

```
8,200 GB/s ÷ 400 GB = 20.5 full model reads per second = ~20 tok/s
```

This matches the web-connected frontier experience without any cloud dependency.

### 4.3 Why Apple Uses LPDDR (Not GDDR or HBM)

| Memory Type | Voltage | Heat | Max Capacity | Cost | Best For |
|:-----------|:--------|:-----|:-------------|:-----|:---------|
| GDDR7 | 1.35V | High | 32 GB (GPU card) | Med | Speed-first gaming |
| HBM4 | 1.1V | Very High | 288 GB (per stack) | $$$$ | AI data center |
| **LPDDR6** | **1.0V** | **Low** | **512 GB+** | **$** | **Width-first AI inference** |

Apple's thesis: build the widest possible bus of the cheapest, coolest memory. Sacrifice per-pin speed for total bandwidth through parallelism. The Sovereign Platform amplifies this thesis across 4 nodes.

---

## 5. Competitive Hardware Analysis

### 5.1 NVIDIA Grace Blackwell Architecture

The NVIDIA Vera Rubin platform (2026–2027) splits memory across two specialized processors:

| Component | Memory | Bandwidth | Role |
|:----------|:-------|:----------|:-----|
| **Vera CPU** | LPDDR5X/6, 1.5 TB | 1.2 TB/s | Orchestration, KV-cache, data preprocessing |
| **Rubin GPU** | HBM4, 288 GB | 22 TB/s | Matrix multiplication, tensor compute |
| **NVLink-C2C** | — | 1.8 TB/s | Coherent CPU↔GPU interconnect |

The Vera-Rubin system costs $300K+ and requires data center infrastructure. The Sovereign Platform offers 2 TB of unified memory at 1/6th the cost, trading raw TOPS for capacity and accessibility.

### 5.2 AMD Magnus APU (Xbox Project Helix)

Microsoft's next-gen console APU represents a different trade-off:

| Spec | AMD Magnus (est.) | Sovereign Platform (4× M5 Ultra) |
|:-----|:-------------------|:----------------------------------|
| **Memory Type** | GDDR7 | LPDDR5X (M5) / LPDDR6 (M6) |
| **Bus Width** | 192-bit | 4× 1024-bit (4,096-bit aggregate) |
| **Bandwidth** | ~672 GB/s | ~4,880 GB/s (aggregate internal) |
| **Capacity** | 48 GB | 2,048 GB |
| **Primary Use** | 4K/120fps gaming | Frontier AI inference |

AMD chose GDDR7 for the Magnus APU because gaming workloads need speed-per-pin (GDDR7 at 32 Gbps/pin) more than bus width. For AI inference, the opposite is true — the Sovereign Platform's massive bus width dominates.

### 5.3 NVIDIA DGX Spark

The most direct competitor for desktop AI:

| Spec | DGX Spark | Sovereign Platform Node |
|:-----|:----------|:------------------------|
| **Chip** | Grace Blackwell GB10 | Apple M5 Ultra |
| **Memory** | 128 GB | 512 GB |
| **Bandwidth** | 273 GB/s | 1,220 GB/s |
| **AI TOPS** | 1,000 (FP4) | ~200 (FP16 AMX) |
| **Prefill Speed** | 1,700+ tok/s | ~500 tok/s |
| **Decode Speed** | 4–6 tok/s | **18–22 tok/s** |
| **Price** | ~$40K | ~$14K (Mac Studio + dock share) |

The DGX Spark is a "thinking machine" (fast prefill, slow decode). The Sovereign Platform is a "talking machine" (moderate prefill, fast decode). For interactive AI, decode speed determines the user experience.

---

## 6. Sovereign Platform Hardware Design

### 6.1 System Overview

The Sovereign Platform is a **2U rack-mount appliance** containing:

1. **4× Mag-Dock Baseplates** (one per Mac Studio)
2. **1× PCIe Gen 5 Fabric Switch** (Broadcom PEX 89105, NTB mode)
3. **4× Active Retimers** (Astera Labs PT5161L)
4. **1× Network Uplink** (Mellanox ConnectX-7, 100GbE)
5. **1× Power Supply** (2000W 80+ Platinum, redundant)
6. **1× Cooling System** (counter-rotating 40mm fan array)

The Mac Studios sit on top of the rack unit, magnetically docked to their baseplates. No cables connect the Macs to the rack — all data, power monitoring, and thermal coupling flows through the magnetic dock interface.

### 6.2 Data Flow Architecture

```
┌─────────── MAC STUDIO (M5/M6 Ultra) ───────────┐
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │         UNIFIED MEMORY (512 GB)          │    │
│  │         LPDDR5X-9600 / LPDDR6           │    │
│  │         1,220 GB/s internal              │    │
│  └────────────────┬─────────────────────────┘    │
│                   │                              │
│  ┌────────────────▼─────────────────────────┐    │
│  │         M5 ULTRA SoC                     │    │
│  │  CPU (36 cores) + GPU (80 cores)         │    │
│  │  + Neural Engine (32 cores)              │    │
│  │  + AMX (Matrix Extensions)              │    │
│  └────┬───────────────────────────────┬─────┘    │
│       │                               │          │
│  ┌────▼─────┐                    ┌───▼──────┐   │
│  │ SSD Slot │                    │ SSD Slot  │   │
│  │ PCIe 5.0 │                    │ PCIe 5.0  │   │
│  │   x4     │                    │   x4      │   │
│  └────┬─────┘                    └───┬──────┘   │
│       │ (Ribbon Cable)               │          │
│  ┌────▼──────────────────────────────▼──────┐   │
│  │       DUAL-PATH INTERPOSER PCB           │   │
│  │                                          │   │
│  │  Path A ──→ Original Apple SSD (Boot)    │   │
│  │  Path B ──→ Pogo-Pin Array (Data Fabric) │   │
│  │                                          │   │
│  │  Astera Labs PT5161L Retimer             │   │
│  └──────────────────┬───────────────────────┘   │
└─────────────────────│───────────────────────────┘
                      │
              ════════╪═══════════  (Magnetic Dock Interface)
                      │               Halbach Array + Mu-Metal
              ┌───────▼───────┐
              │  POGO-PIN     │
              │  ARRAY        │
              │  60 pins      │
              │  32 GT/s      │
              └───────┬───────┘
                      │
┌─────────────────────│──────────────────────────────────┐
│  SOVEREIGN PLATFORM RACK (2U)                          │
│                     │                                  │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │           PEX 89105 NTB SWITCH                  │   │
│  │                                                  │   │
│  │  Port 0 ←→ Mac₁ (x8, 30 GB/s bidirectional)    │   │
│  │  Port 1 ←→ Mac₂ (x8, 30 GB/s bidirectional)    │   │
│  │  Port 2 ←→ Mac₃ (x8, 30 GB/s bidirectional)    │   │
│  │  Port 3 ←→ Mac₄ (x8, 30 GB/s bidirectional)    │   │
│  │                                                  │   │
│  │  NTB: Each Mac = independent Root Complex        │   │
│  │  P2P: Direct GPU₁↔GPU₂ memory writes            │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                  │
│  ┌──────────────────▼──────────────────────────────┐   │
│  │         ConnectX-7 (100GbE QSFP28)              │   │
│  │         Unified Uplink — Single IP              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  2000W PSU  │  6× Counter-Rotating 40mm Fans   │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

---

## 7. Mag-Dock Baseplate Engineering

### 7.1 Mechanical Design

The Mag-Dock baseplate replaces the Mac Studio's circular intake base (attached with 4 screws):

| Parameter | Specification |
|:----------|:-------------|
| **Material** | 6061-T6 Aluminum, CNC-milled, hard-anodized (MIL-A-8625 Type III) |
| **Dimensions** | 197mm × 197mm × 18mm (matches Mac Studio footprint) |
| **Mass** | ~450g (including magnets and pogo-array) |
| **Surface Finish** | Bead-blasted, anodized Space Gray (matches Apple aesthetic) |
| **Mounting** | 4× M3 screws (re-uses Apple's existing threaded inserts) |

### 7.2 Halbach Array Magnet System

Standard magnets would create a magnetic field that permeates both sides of the baseplate, interfering with the Mac Studio's internal components and the PCIe Gen 5 signals. A **Halbach Array** concentrates the field on one side:

```
Standard Magnet:          Halbach Array:
    ↑ ↑ ↑ ↑                  ↑ → ↓ ← ↑ → ↓ ←
  ┌─────────┐              ┌─────────────────────┐
  │ N N N N │              │ N → S ← N → S ← N  │
  │ S S S S │              │ N → S ← N → S ← N  │
  └─────────┘              └─────────────────────┘
    ↓ ↓ ↓ ↓                  (Near-zero field)
  Field both                Field concentrated
  sides                     ONLY on dock side
```

| Parameter | Specification |
|:----------|:-------------|
| **Magnet Grade** | N52 Neodymium (strongest commercially available) |
| **Configuration** | 4× Halbach clusters, 8 magnets each (32 total) |
| **Clamping Force** | ~20 lbs (89 N) total — sufficient to resist fan vibration |
| **Field on Mac Side** | < 0.5 mT (below threshold for LPDDR interference) |
| **Field on Dock Side** | ~300 mT (strong alignment/clamping) |

### 7.3 Mu-Metal Shielding

Between the Halbach magnets and the pogo-pin data array, a layer of **Mu-Metal** (a nickel-iron alloy with permeability µ > 50,000) absorbs stray magnetic flux:

| Parameter | Specification |
|:----------|:-------------|
| **Material** | Mu-Metal (80% Ni, 15% Fe, 5% Mo) |
| **Thickness** | 0.5mm sheet, laser-cut to pogo-array perimeter |
| **Annealing** | Hydrogen-atmosphere anneal at 1100°C (required for max permeability) |
| **Shielding Effectiveness** | > 40 dB attenuation at DC–1 MHz |
| **Purpose** | Prevents magnetic flux from distorting differential PCIe signals |

### 7.4 Pogo-Pin Array

Standard pogo-pins (like MagSafe's power contacts) cannot carry 32 GT/s signals. The Sovereign Platform uses **differential-pair pogo-pins** — twin-axial spring contacts surrounded by grounded shield pins:

| Parameter | Specification |
|:----------|:-------------|
| **Total Pins** | 60 per Mac |
| **Signal Pins** | 32 (16 differential pairs for PCIe 5.0 x8) |
| **Ground/Shield Pins** | 20 (surrounding each diff pair for crosstalk isolation) |
| **Sideband/Clock Pins** | 8 (PCIe reference clock, PERST#, WAKE#) |
| **Contact Plating** | 50 µ" hard gold (Au) over 100 µ" nickel barrier |
| **Contact Resistance** | < 20 mΩ (at 20 lb clamping force) |
| **Spring Travel** | 1.5mm (accommodates ±0.3mm mechanical tolerance) |
| **Insertion Rating** | 500,000 cycles (rated for daily dock/undock for 10 years) |
| **Pitch** | 1.27mm center-to-center (fine-pitch for SI requirements) |

### 7.5 SSD Cradle

The baseplate houses the original Apple SSD modules in a sideways orientation:

| Parameter | Specification |
|:----------|:-------------|
| **Connector** | Proprietary Apple SSD blade connector (reversible) |
| **Orientation** | 90° rotated from original — saves 8mm of vertical height |
| **Capacity** | Supports Apple's standard 1TB–8TB modules |
| **Expansion** | Optional: 3rd-party high-capacity modules (16TB, 32TB) |
| **Thermal Pad** | 3M 5590H (thermal conductivity: 5 W/m·K) from SSD to vapor chamber |

---

## 8. PCIe Gen 5 Signal Integrity

### 8.1 The Challenge

PCIe Gen 5 operates at 32 GT/s (gigatransfers per second) using NRZ (Non-Return-to-Zero) encoding. At these frequencies:

- **Wavelength**: ~9.4mm in FR-4 PCB material
- **Skin effect**: Current flows only on the outer ~1.8 µm of copper traces
- **Insertion loss budget**: < 30 dB at 16 GHz (Nyquist frequency)
- **Crosstalk**: Near-end (NEXT) must be < –30 dB

The signal path in the Sovereign Platform is:

```
M5 SoC → SSD Slot → Ribbon Cable (5cm) → Interposer PCB → 
Pogo-Pin (1.5mm travel) → Rack Backplane (15cm) → PEX 89105
```

Total path length: ~25cm — significantly longer than a standard NVMe connection (~3cm).

### 8.2 Interposer PCB

| Parameter | Specification |
|:----------|:-------------|
| **Layer Count** | 16-layer HDI (High Density Interconnect) |
| **Dielectric Material** | Panasonic Megtron 6 (Dk=3.4, Df=0.002 @ 10 GHz) |
| **Copper Weight** | 0.5 oz (inner), 1 oz (outer) |
| **Differential Impedance** | 85Ω ±5% |
| **Via Structure** | Blind/buried microvias, backdrilled for stub removal |
| **Anti-pad Clearance** | 300 µm minimum (prevents via-to-plane coupling) |
| **Insertion Loss** | < 3 dB at 16 GHz (for PCB segment only) |

### 8.3 Active Retiming

Because the total signal path (~25cm) exceeds PCIe Gen 5's passive reach (~15cm in FR-4), each Mag-Dock includes an **Astera Labs PT5161L PCIe 5.0 Retimer**:

| Parameter | Specification |
|:----------|:-------------|
| **IC** | Astera Labs PT5161L |
| **Function** | Full signal regeneration — CDR (Clock Data Recovery) + re-drive |
| **Lanes** | 16 (supports x8 + x8 or x16) |
| **Data Rate** | 2.5–32 GT/s (auto-negotiation) |
| **Latency** | < 5 ns added per retimer stage |
| **Equalization** | CTLE + DFE (adaptive, trained per boot) |
| **Power** | ~3.5W per IC |
| **Location** | On the rack-side backplane, immediately before the PEX switch |

### 8.4 Eye Diagram Requirements

The PCIe Gen 5 specification requires the following at the receiver input:

| Parameter | Requirement | Sovereign Platform Target |
|:----------|:-----------|:--------------------------|
| **Eye Height** | > 15 mV | > 25 mV (with retimer) |
| **Eye Width** | > 0.3 UI (9.4 ps) | > 0.4 UI (12.5 ps) |
| **Jitter (Total)** | < 0.3 UI | < 0.25 UI |
| **BER** | < 10⁻¹² | < 10⁻¹⁵ (with FEC) |

The retimer stage ensures the pogo-pin's small insertion loss and impedance discontinuity are fully compensated before the signal reaches the PEX switch.

---

## 9. Non-Transparent Bridge Fabric

### 9.1 The NTB Problem

In standard PCIe, there is exactly one **Root Complex** (the CPU) that "owns" the entire bus. If you connect two CPUs via PCIe, both try to enumerate the bus, causing a collision.

**Non-Transparent Bridging (NTB)** solves this by inserting a "translator" between two independent root complexes:

```
Standard PCIe:
  CPU₁ (Root Complex) ──→ Device₁, Device₂, Device₃
  CPU₂ (Root Complex) ──→ Device₄, Device₅, Device₆
  (Cannot connect CPU₁ to CPU₂)

NTB PCIe:
  CPU₁ (Root Complex) ──→ [NTB Port] ←→ [NTB Port] ←── CPU₂ (Root Complex)
  Each CPU sees the other as a "memory-mapped endpoint"
```

### 9.2 Broadcom PEX 89105

| Parameter | Specification |
|:----------|:-------------|
| **IC** | Broadcom PEX 89105 |
| **Lanes** | 105 (configurable) |
| **Generation** | PCIe 5.0 (32 GT/s) |
| **NTB Ports** | 4 (one per Mac Studio) |
| **Configuration** | Each port: x8 Gen 5 (15.75 GB/s per direction) |
| **Cross-Sectional BW** | 126 GB/s (4 ports × 15.75 GB/s × 2 directions) |
| **P2P Support** | Direct peer-to-peer DMA between any two ports |
| **Doorbell Registers** | 64 per NTB port (for inter-node signaling) |
| **Scratchpad Registers** | 16 per NTB port (for configuration exchange) |
| **TDP** | ~35W |
| **Package** | 45mm × 45mm FCBGA |

### 9.3 Memory Mapping

When a Mac is docked, the DriverKit extension performs:

1. **Enumeration**: Detect PEX 89105 NTB port via PCIe hot-plug
2. **BAR Allocation**: Map a 64 GB window into the local Mac's PCIe memory space
3. **Doorbell Setup**: Configure interrupt-driven signaling for cross-node events
4. **P2P Path**: Enable direct GPU-to-GPU memory writes (bypass CPU)

The result: each Mac's MLX framework sees the other 3 Macs' memory as additional `MTLBuffer` regions that can be read at ~15 GB/s and written at ~15 GB/s.

### 9.4 Topology Options

| Configuration | Nodes | Total VRAM | Fabric BW | Use Case |
|:-------------|:------|:-----------|:----------|:---------|
| **Duo** | 2 | 1.0 TB | 31.5 GB/s | Small/medium LLMs (70B–200B) |
| **Quad** | 4 | 2.0 TB | 126 GB/s | Frontier LLMs (405B+) |
| **Octet** | 8 | 4.0 TB | 252 GB/s | Multi-model serving, training |

The Quad configuration is the primary product. Duo and Octet are expansion options using additional PEX switches.

---

## 10. Thermal Management System

### 10.1 Heat Sources

| Component | TDP | Location |
|:----------|:----|:---------|
| Mac Studio M5 Ultra (×4) | 370W each | On top of dock |
| PCIe Gen 5 SSD (×8) | 12W each | Inside Mag-Dock baseplate |
| Astera Labs Retimer (×4) | 3.5W each | Rack backplane |
| Broadcom PEX 89105 (×1) | 35W | Rack backplane |
| **Total Rack Thermal** | **~170W** (excluding Mac Studio self-cooling) |

### 10.2 Vapor Chamber Baseplate

Each Mag-Dock baseplate doubles as a vapor chamber heatsink:

| Parameter | Specification |
|:----------|:-------------|
| **Type** | Copper vapor chamber, sintered wick |
| **Dimensions** | 180mm × 180mm × 2mm |
| **Heat Capacity** | 50W continuous (far exceeds 24W from 2 SSDs) |
| **Evaporator Zone** | Under SSD cradle |
| **Condenser Zone** | Bottom surface (contacts rack thermal interface) |
| **Working Fluid** | Deionized water |
| **Thermal Resistance** | < 0.15°C/W |

### 10.3 Rack Cooling

| Parameter | Specification |
|:----------|:-------------|
| **Fan Array** | 6× 40mm counter-rotating (Delta PFB0412GHN) |
| **Airflow** | Front-to-back, 120 CFM total |
| **Noise** | < 42 dBA idle, < 55 dBA full load |
| **Management** | PWM-controlled via BMC (Baseboard Management Controller) |
| **Thermal Zones** | 4 dock zones + 1 switch zone, independently managed |
| **Target Temperatures** | SSD: < 55°C, PEX Switch: < 75°C, Retimers: < 65°C |

---

## 11. Software & Firmware Stack

### 11.1 macOS DriverKit Extension

Apple deprecated kernel extensions (KEXTs) in favor of DriverKit — a user-space driver framework with controlled hardware access:

| Layer | Component | Function |
|:------|:----------|:---------|
| **DriverKit** | `SovereignPCIeDriver.dext` | PCIe NTB enumeration, BAR mapping, P2P DMA |
| **IOKit** | `IOPCIDevice` | Low-level PCIe device management |
| **Metal** | `SovereignMetalPlugin` | Exposes remote GPU memory as `MTLBuffer` |
| **System Extension** | `SovereignDockMonitor.systemextension` | Dock/undock detection, cluster membership |

### 11.2 Cluster Orchestration

```
┌────────────────────────────────────────────┐
│         SOVEREIGN PLATFORM SOFTWARE        │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  App Layer                           │  │
│  │  MLX / PyTorch / llama.cpp           │  │
│  │  Exo Cluster Manager                 │  │
│  └──────────────┬───────────────────────┘  │
│                 │                          │
│  ┌──────────────▼───────────────────────┐  │
│  │  Sovereign Metal Abstraction         │  │
│  │  • Unified MTLDevice (4 GPUs as 1)   │  │
│  │  • Remote MTLBuffer mapping          │  │
│  │  • P2P DMA command submission        │  │
│  └──────────────┬───────────────────────┘  │
│                 │                          │
│  ┌──────────────▼───────────────────────┐  │
│  │  DriverKit PCIe NTB Driver           │  │
│  │  • Hot-plug management               │  │
│  │  • BAR window allocation             │  │
│  │  • Doorbell interrupt routing        │  │
│  │  • DMA engine programming            │  │
│  └──────────────┬───────────────────────┘  │
│                 │                          │
│  ┌──────────────▼───────────────────────┐  │
│  │  PEX 89105 Firmware                  │  │
│  │  • NTB configuration                 │  │
│  │  • Lane training & equalization      │  │
│  │  • Error detection & recovery        │  │
│  │  • Power management (L1 substates)   │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### 11.3 Exo Integration Protocol

The Sovereign Platform provides a custom Exo transport layer:

```python
# Exo transport for Sovereign Platform
class SovereignTransport(ExoTransport):
    """PCIe P2P transport — replaces TCP/RDMA for docked nodes."""
    
    def __init__(self, node_id: int, pex_driver: SovereignDriver):
        self.node_id = node_id
        self.driver = pex_driver
        self.remote_bars = {}  # BAR mappings to other nodes
    
    async def send_tensor(self, dest_node: int, tensor: mx.array):
        """Direct P2P DMA write to remote node's GPU memory."""
        remote_bar = self.remote_bars[dest_node]
        await self.driver.p2p_dma_write(
            src_buffer=tensor.data_ptr(),
            dst_bar=remote_bar,
            size=tensor.nbytes
        )
    
    async def recv_tensor(self, src_node: int, shape, dtype):
        """Read tensor from remote node via P2P DMA."""
        remote_bar = self.remote_bars[src_node]
        buffer = await self.driver.p2p_dma_read(
            src_bar=remote_bar,
            size=np.prod(shape) * dtype.itemsize
        )
        return mx.array(buffer, dtype=dtype).reshape(shape)
    
    @property
    def bandwidth_gbps(self) -> float:
        return 30.0  # GB/s (PCIe 5.0 x8, bidirectional)
    
    @property
    def latency_us(self) -> float:
        return 0.15  # Sub-microsecond via raw PCIe
```

### 11.4 HiveOS Dashboard

Integrated into the Sirsi Hypervisor (ADR-026) as a dedicated instrument panel:

| Instrument | Description | Data Source |
|:-----------|:-----------|:-----------|
| **Cluster Topology** | Visual map of docked nodes, link status, NTB health | PCIe NTB doorbell registers |
| **Thermal Heatmap** | Per-node SSD, GPU, ambient temperatures | IOKit `AppleSMC` thermal sensors |
| **Memory Pressure** | Per-node unified memory utilization | `mach_host_statistics64` |
| **Fabric Utilization** | Real-time PCIe P2P transfer rate per link | PEX 89105 performance counters |
| **Model Shard Map** | Which layers are assigned to which node | Exo cluster state |
| **Inference Metrics** | Tokens/sec, prefill latency, KV-cache size | MLX instrumentation |
| **Power Draw** | Per-node wattage estimation | macOS `powermetrics` |
| **Dock Status** | Magnetic alignment quality, pogo-pin contact resistance | Sideband pin ADC |

---

## 12. AI Inference Performance Model

### 12.1 Single Node vs. Cluster Performance (Llama 3 405B, Q4)

| Metric | 1× M5 Ultra | 4× M5 Ultra (TB5) | 4× M5 Ultra (Sovereign) |
|:-------|:------------|:-------------------|:-------------------------|
| **Model fits in RAM?** | ❌ (200GB > 128GB) | ✅ (200GB split 4 ways) | ✅ (200GB split 4 ways) |
| **Per-node model shard** | — | 50 GB | 50 GB |
| **Per-node bandwidth** | 1,220 GB/s | 1,220 GB/s | 1,220 GB/s |
| **Cross-node transfer** | — | 50 GB / 15 GB/s = 3.3s | 50 GB / 30 GB/s = 1.7s |
| **Pipeline latency** | — | ~3.3s per pass | ~1.7s per pass |
| **Effective tok/s** | 0 (can't load) | ~10–12 tok/s | **~18–22 tok/s** |
| **"Web feel"?** | ❌ | ⚠️ Sluggish | **✅ Matches ChatGPT** |

### 12.2 Model Size Compatibility

| Model | Size (Q4) | Nodes Needed | Sovereign TPS (est.) |
|:------|:---------|:------------|:--------------------|
| Llama 3.1 8B | 4 GB | 1 | 80+ tok/s |
| Llama 3.1 70B | 35 GB | 1 | 35 tok/s |
| Llama 3.1 405B | 200 GB | 4 | 18–22 tok/s |
| DeepSeek V3 671B | 335 GB | 4 | 10–14 tok/s |
| GPT-4 class (1.8T est.) | 900 GB | 4 (Q2) | 4–6 tok/s |

### 12.3 Quantization & Precision Trade-offs

| Quantization | Model Size (405B) | Quality Loss | Sovereign TPS |
|:------------|:-----------------|:-------------|:-------------|
| FP16 (full) | 810 GB | None | 5–6 tok/s |
| Q8 | 405 GB | Negligible | 10–12 tok/s |
| **Q4 (recommended)** | **200 GB** | **< 1% perplexity** | **18–22 tok/s** |
| Q2 | 100 GB | Noticeable | 30+ tok/s |

Modern quantization techniques (GGUF K-Quants, EXL2, AWQ) produce Q4/Q6 models that are perceptually indistinguishable from full-precision variants in human evaluation. Web-connected frontier models (GPT-4o, Claude 3.5) also run quantized infrastructure for cost efficiency.

---

## 13. Manufacturing & Bill of Materials

### 13.1 Unit BOM (4-Node Sovereign Platform Rack)

| Component | Qty | Unit Cost | Subtotal |
|:----------|:----|:----------|:---------|
| CNC 6061-T6 Baseplate (anodized) | 4 | $200 | $800 |
| 16-Layer Megtron 6 Interposer PCB | 4 | $150 | $600 |
| Differential-Pair Pogo-Pin Array (60-pin) | 4 | $100 | $400 |
| Halbach Array Magnet Set (N52, 32 pcs) | 4 | $50 | $200 |
| Mu-Metal Shielding (laser-cut) | 4 | $25 | $100 |
| Astera Labs PT5161L Retimer | 4 | $100 | $400 |
| Broadcom PEX 89105 Switch | 1 | $1,800 | $1,800 |
| Mellanox ConnectX-7 NIC (100GbE) | 1 | $1,200 | $1,200 |
| PCIe Gen 5 Flyover Ribbons (Samtec) | 8 | $50 | $400 |
| 2U Rack Chassis (extruded aluminum) | 1 | $250 | $250 |
| 2000W 80+ Platinum PSU (redundant) | 1 | $350 | $350 |
| Counter-Rotating Fan Array (6× 40mm) | 1 | $90 | $90 |
| Vapor Chamber (copper, sintered wick) | 4 | $80 | $320 |
| Thermal Interface Materials | 1 | $50 | $50 |
| Switch Backplane PCB (16-layer) | 1 | $200 | $200 |
| BMC Controller + Firmware | 1 | $80 | $80 |
| Cables, Connectors, Miscellaneous | 1 | $100 | $100 |
| Assembly & QA | 1 | $500 | $500 |
| **Total COGS** | | | **~$6,840** |

### 13.2 R&D Investment

| Phase | Timeline | Budget |
|:------|:---------|:-------|
| Signal Integrity R&D (SI simulation, BER, eye diagrams) | Months 1–6 | $1,200,000 |
| Mechanical Prototyping (CNC, magnets, thermal) | Months 3–9 | $800,000 |
| Firmware & Driver Development (DriverKit, NTB, Metal) | Months 1–15 | $1,500,000 |
| Test Equipment (Keysight/Anritsu oscilloscopes, BERT) | Month 1 | $1,000,000 |
| Thermal Fatigue Testing (1000-hour burn-in) | Months 9–14 | $300,000 |
| Regulatory Certification (FCC Part 15B, CE EMC) | Months 12–18 | $400,000 |
| Apple Compatibility Red Team (macOS update tracking) | Ongoing | $500,000/yr |
| Beta Program (10 units to AI labs) | Months 15–18 | $200,000 |
| **Total R&D** | **18 months** | **$5.9M – $8M** |

### 13.3 Unit Economics

| Metric | Value |
|:-------|:------|
| **COGS** | ~$6,840 |
| **MSRP** | $14,999 – $19,999 |
| **Gross Margin** | 65–75% |
| **Breakeven Volume** | ~400 units (at $15K MSRP) |
| **Year 1 Target** | 200 units |
| **Year 2 Target** | 1,000 units |
| **TAM (Sovereign AI Infrastructure)** | $2B+ (growing 40% YoY) |

---

## 14. Regulatory & Legal Considerations

### 14.1 FCC / CE Compliance

The Mag-Dock PCIe Gen 5 interface operates at 16 GHz (Nyquist frequency). At these frequencies, the dock assembly is an unintentional radiator:

| Requirement | Standard | Status |
|:-----------|:---------|:-------|
| **FCC Part 15B** | Unintentional radiator emissions (Class A) | Required |
| **CE EMC** | EN 55032 (emissions), EN 55035 (immunity) | Required |
| **RoHS** | Restriction of Hazardous Substances | Compliant by design |
| **REACH** | Chemical registration (EU) | Compliant by design |

The Mu-Metal shielding and Halbach Array field containment will be critical for passing emissions testing. Pre-compliance testing should begin in Month 10.

### 14.2 Apple IP & Warranty

| Concern | Assessment | Mitigation |
|:--------|:----------|:-----------|
| **AppleCare voiding** | Replacing intake base voids AppleCare | Customer acknowledgment; Sovereign Platform warranty covers dock-related damage |
| **DMCA circumvention** | No firmware is modified; no Secure Enclave bypass; boot chain is preserved | Low risk — the interposer is a passive electrical splitter, not a circumvention device |
| **Apple SSD authentication** | SSD remains paired to its original Mac | Dual-path design ensures Secure Enclave sees the original SSD at all times |
| **macOS compatibility** | Apple may change SSD slot electrical specifications | Red Team monitors macOS betas; DriverKit extension tested against every point release |

### 14.3 Patent Filing Strategy

| Claim | Category | Priority |
|:------|:---------|:---------|
| Magnetic alignment docking for PCIe Gen 5 data transfer | Utility Patent | P0 — File immediately |
| Dual-path SSD interposer maintaining secure boot while routing to external fabric | Utility Patent | P0 |
| Non-transparent bridge clustering of consumer SoCs via pogo-pin array | Utility Patent | P1 |
| Vapor-chamber baseplate with magnetically-coupled thermal interface | Utility Patent | P2 |
| Unified Metal device abstraction across PCIe NTB fabric | Software Patent | P2 |

---

## 15. Commercialization Strategy

### 15.1 Product SKUs

| SKU | Configuration | MSRP | Target Customer |
|:----|:-------------|:-----|:---------------|
| **Sovereign Duo** | 2-node rack + 2 Mag-Docks | $8,999 | Indie AI developers, small studios |
| **Sovereign Quad** | 4-node rack + 4 Mag-Docks | $17,999 | AI labs, VFX studios, hedge funds |
| **Sovereign Octet** | 8-node rack + 8 Mag-Docks (dual PEX) | $39,999 | Enterprise, government, biotech |
| **Sovereign Turnkey** | Quad rack + 4 Mac Studios (pre-installed) | $74,999 | "AI in a Box" — zero setup |

### 15.2 Target Verticals

| Vertical | Pain Point | Value Proposition |
|:---------|:----------|:-----------------|
| **Law Firms** | Attorney-client privilege cannot touch cloud | 2 TB local brain for legal research + document analysis |
| **Biotech / Pharma** | Proprietary molecular data is trade-secret-level | Run AlphaFold / protein models on-premises |
| **Hedge Funds** | Trading algorithms on non-public data | Real-time AI inference without data egress |
| **Government / DoD** | ITAR / classified workloads | Air-gapped AI supercomputer in a desk drawer |
| **VFX / Film Studios** | 8K video AI upscaling, rotoscoping | Local rendering farm with AI augmentation |
| **AI Startups** | Cloud GPU costs eating runway | CapEx alternative: $55K one-time vs. $300K/yr cloud |

### 15.3 Go-To-Market Phases

| Phase | Timeline | Milestone |
|:------|:---------|:---------|
| **Phase 1: Alpha** | Q3 2026 | Single-node prototype validated (SI, thermals, boot chain) |
| **Phase 2: Beta** | Q1 2027 | 4-node Quad prototype; 10 beta units shipped to AI labs |
| **Phase 3: GA** | Q3 2027 | General availability; alignment with M6 LPDDR6 launch |
| **Phase 4: Scale** | 2028 | Octet SKU; UALink exploration; OEM partnerships |

---

## 16. Future Roadmap

### 16.1 M6 Generation (LPDDR6)

When Apple transitions to LPDDR6 (expected M6, late 2026 / early 2027):

- **M6 Max**: 768-bit bus → ~1,027 GB/s
- **M6 Ultra**: 1,536-bit bus → ~2,054 GB/s
- **4-node Sovereign**: 4 × 2,054 = **8.2 TB/s** internal bandwidth

The Sovereign Platform rack hardware requires **zero changes** for M6 — the Mag-Dock baseplates, PEX switch, and retimers are generation-agnostic. Only the DriverKit extension needs update for new SoC identifiers.

### 16.2 UALink Integration

Apple is a member of the UALink (Universal Accelerator Link) consortium. If future Mac hardware includes UALink ports:

- UALink bandwidth: 100+ GB/s point-to-point
- The Sovereign Platform would swap from PCIe-based Mag-Docks to UALink-based docks
- Cluster fabric bandwidth would increase from 126 GB/s to 400+ GB/s
- Tensor parallelism becomes fully viable (not just pipeline parallelism)

### 16.3 Optical Interconnect (Gen 2)

Long-term, the pogo-pin interface can be augmented or replaced with **optical transceivers**:

- Each baseplate embeds a VCSEL laser diode + photodiode pair
- Data travels as light through a glass window in the dock interface
- Eliminates all electrical signal integrity concerns
- Bandwidth potential: 800 Gbps+ (100 GB/s) per dock
- Target: Sovereign Platform Gen 2 (2028–2029)

### 16.4 Integration with Sirsi Nexus Ecosystem

| Sirsi Component | Sovereign Platform Role |
|:---------------|:----------------------|
| **Hypervisor** (ADR-026) | Cluster telemetry, thermal monitoring, model orchestration |
| **Fire Team** (P-004) | Persistent agents run distributed across the 2 TB memory pool |
| **NebuLang** (P-001) | Protocol encoding for inter-node tensor messages |
| **Knowledge Graph** (P-003, P-005) | Sharded KG partitions across nodes for parallel traversal |
| **Direct-to-Metal** (ADR-038) | Sovereign Platform is the physical realization of DtM for Apple Silicon |
| **Tri-Silicon Mesh** (ADR-041) | Sovereign cluster is one "cell" in the broader mesh |

---

## Appendix A: Glossary

| Term | Definition |
|:-----|:----------|
| **BAR** | Base Address Register — PCIe memory window |
| **BERT** | Bit Error Rate Tester — validation instrument |
| **BER** | Bit Error Rate — measure of signal integrity |
| **CDR** | Clock Data Recovery — extracts timing from data stream |
| **CTLE** | Continuous Time Linear Equalizer — compensates for channel loss |
| **DFE** | Decision Feedback Equalizer — cancels ISI (intersymbol interference) |
| **DMA** | Direct Memory Access — data transfer without CPU involvement |
| **GT/s** | Gigatransfers per second — PCIe data rate unit |
| **Halbach Array** | Magnet arrangement that concentrates field on one side |
| **HBM** | High Bandwidth Memory — stacked memory for GPUs |
| **HDI** | High Density Interconnect — advanced PCB technology |
| **ISI** | Intersymbol Interference — signal distortion from adjacent bits |
| **LPDDR** | Low Power Double Data Rate — mobile/Apple memory standard |
| **Mag-Dock** | Magnetic Coherence Docking — the Sovereign Platform's dock interface |
| **Mu-Metal** | Nickel-iron alloy with extreme magnetic permeability |
| **NTB** | Non-Transparent Bridge — PCIe multi-host topology |
| **P2P** | Peer-to-Peer — direct device-to-device communication |
| **Pogo-Pin** | Spring-loaded electrical contact |
| **RDMA** | Remote Direct Memory Access — CPU-bypass network reads/writes |
| **Retimer** | Active signal regeneration IC for high-speed serial links |
| **RoCE** | RDMA over Converged Ethernet |
| **SI** | Signal Integrity — discipline of high-frequency circuit design |
| **TIM** | Thermal Interface Material — heat transfer compound |
| **UMA** | Unified Memory Architecture — shared CPU/GPU memory pool |

---

## Appendix B: Reference Documents

| Document | Path |
|:---------|:-----|
| ADR-044: Sovereign Platform | `docs/ADR-044-SOVEREIGN-PLATFORM.md` |
| ADR-032: Master Blueprint v4 | `docs/SIRSI_MASTER_BLUEPRINT.md` |
| ADR-038: Direct-to-Metal | `docs/ADR-INDEX.md` (proposed) |
| ADR-041: Tri-Silicon Mesh | `docs/ADR-INDEX.md` (proposed) |
| ADR-042: Sovereign Compute | `docs/ADR-INDEX.md` (proposed) |
| Swiss Neo-Deco Style Guide | `docs/SWISS_NEO_DECO_STYLE_GUIDE.md` |
| Patent Portfolio | `docs/SIRSI_MASTER_BLUEPRINT.md §XII` |

---

**Canonical source**: `docs/SOVEREIGN_PLATFORM_ARCHITECTURE.md`  
**Classification**: INTERNAL ONLY (Rule 26 — Documentation Firewall)  
**Patent**: P-006 — Sovereign Platform  
**ADR**: ADR-044
