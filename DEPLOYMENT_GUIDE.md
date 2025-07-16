# 🚀 **SIRSINEXUS DEPLOYMENT GUIDE**

## **📋 DEPLOYMENT OPTIONS**

### **Option 1: Single Binary Deployment (Recommended)**
```bash
# Start the entire platform with one command
./target/debug/sirsi-nexus start

# What this does:
# ✅ Starts ALL 5 services in one process
# ✅ REST API (port 8080)
# ✅ WebSocket (port 8081) 
# ✅ gRPC Agent (port 50051)
# ✅ Analytics Engine
# ✅ Security Engine
```

### **Option 2: Docker Deployment (Production)**
```bash
# Build and start entire stack
docker-compose up -d

# What this does:
# ✅ Core Engine (Rust) - sirsi-nexus binary
# ✅ Frontend (Next.js) - React UI
# ✅ Analytics Platform (Python)
# ✅ CockroachDB Database
# ✅ Redis Cache
# ✅ Nginx Reverse Proxy
# ✅ Prometheus + Grafana Monitoring
```

### **Option 3: Development Mode**
```bash
# Frontend (Terminal 1)
cd ui && npm run dev

# Backend (Terminal 2) 
./target/debug/sirsi-nexus start --dev

# Database (Terminal 3)
cockroach start-single-node --insecure
```

---

## **🔧 HOW SERVICES COMMUNICATE**

```
┌─────────────────────────────────────────────────────┐
│                  USER BROWSER                       │
│              http://localhost:3000                  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               FRONTEND (Next.js)                    │
│                Port 3000                            │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP API Calls
┌─────────────────▼───────────────────────────────────┐
│            SIRSI-NEXUS PLATFORM                     │
│          ┌─────────────────────────────┐            │
│          │     REST API SERVICE        │            │
│          │       Port 8080             │◄───────────┤ HTTP API
│          └─────────────────────────────┘            │
│          ┌─────────────────────────────┐            │
│          │   WEBSOCKET SERVICE         │            │
│          │       Port 8081             │◄───────────┤ Real-time
│          └─────────────────────────────┘            │
│          ┌─────────────────────────────┐            │
│          │     gRPC AGENT              │            │
│          │       Port 50051            │◄───────────┤ Agent Ops
│          └─────────────────────────────┘            │
│          ┌─────────────────────────────┐            │
│          │   ANALYTICS ENGINE          │            │
│          └─────────────────────────────┘            │
│          ┌─────────────────────────────┐            │
│          │   SECURITY ENGINE           │            │
│          └─────────────────────────────┘            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                DATABASE LAYER                       │
│   ┌─────────────────┐  ┌─────────────────────────┐  │
│   │   CockroachDB   │  │        Redis            │  │
│   │   Port 26257    │  │      Port 6379          │  │
│   │   (Main Data)   │  │   (Agent Context)       │  │
│   └─────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## **🎛️ WHAT EACH SERVICE DOES**

### **REST API Service (Port 8080)**
- Handles web requests from frontend
- Authentication, projects, resources
- Health checks: `curl http://localhost:8080/health`

### **WebSocket Service (Port 8081)**  
- Real-time updates to frontend
- Live infrastructure monitoring
- Agent status updates

### **gRPC Agent Service (Port 50051)**
- Cloud provider operations (AWS, Azure, GCP)
- Agent orchestration and management
- Infrastructure automation

### **Analytics Engine**
- Cost analysis and optimization
- Performance monitoring
- Usage analytics

### **Security Engine**
- Authentication and authorization
- Audit logging
- Compliance monitoring

---

## **🚀 SIMPLE DEPLOYMENT PROCESS**

### **For Development:**
```bash
# 1. Start database services
docker-compose up -d cockroachdb redis

# 2. Start the platform
./target/debug/sirsi-nexus start

# 3. Start frontend (in another terminal)
cd ui && npm start

# 4. Access at http://localhost:3000
```

### **For Production:**
```bash
# 1. Build everything
docker-compose -f docker-compose.prod.yml build

# 2. Start everything
docker-compose -f docker-compose.prod.yml up -d

# 3. Access at http://localhost (via Nginx)
```

---

## **🔍 HEALTH CHECKS**

```bash
# Check platform health
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000

# Check database
curl http://localhost:8081/health

# Check Redis
redis-cli ping
```

---

## **❓ WHY TWO BINARIES?**

**Historical Evolution:**
1. **Started with**: `sirsi-core` (single gRPC service)
2. **Evolved to**: `sirsi-nexus` (unified platform with all services)
3. **Current**: Use `sirsi-nexus` for everything
4. **Legacy**: `sirsi-core` still exists but not recommended

**Recommendation**: Always use `sirsi-nexus start` for the full platform.
