# ⚡ **QUICK DEPLOY REFERENCE**

## **🎯 UNDERSTANDING THE "HANG"**

**IMPORTANT**: `sirsi-nexus start` is **SUPPOSED** to "hang" - it's a server!

```bash
# This command starts a server that runs forever:
./target/debug/sirsi-nexus start
# ▲ This will "hang" (run continuously) until you press Ctrl+C
```

## **🚀 DEPLOYMENT PATTERNS**

### **Pattern 1: Foreground (Development)**
```bash
# Terminal 1: Start backend (will "hang" - this is normal!)
./target/debug/sirsi-nexus start

# Terminal 2: Start frontend 
cd ui && npm start

# Access: http://localhost:3000
# Stop: Press Ctrl+C in each terminal
```

### **Pattern 2: Background (Testing)**
```bash
# Start backend in background
./target/debug/sirsi-nexus start &
BACKEND_PID=$!

# Start frontend in background  
cd ui && npm start &
FRONTEND_PID=$!

# Test the system
curl http://localhost:8080/health
curl http://localhost:3000

# Stop when done
kill $BACKEND_PID $FRONTEND_PID
```

### **Pattern 3: Docker (Production)**
```bash
# Start everything with Docker
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs

# Stop everything
docker-compose down
```

## **🔍 VERIFICATION COMMANDS**

```bash
# Check if services are running
lsof -i :8080  # REST API
lsof -i :3000  # Frontend  
lsof -i :50051 # gRPC Agent

# Test endpoints
curl http://localhost:8080/health    # Backend health
curl http://localhost:3000          # Frontend
curl http://localhost:26257/health  # Database

# View platform status
ps aux | grep sirsi-nexus
```

## **🛑 HOW TO STOP**

```bash
# If running in foreground: Press Ctrl+C
# If running in background: 
pkill -f sirsi-nexus

# For Docker:
docker-compose down
```

## **✅ SUCCESS INDICATORS**

When deployment works, you'll see:
- ✅ All 5 services start successfully
- ✅ Ports 8080, 3000, 50051 are listening
- ✅ Frontend loads at http://localhost:3000
- ✅ Backend responds to http://localhost:8080/health
- ✅ Process "hangs" (stays running) - this is correct!

## **❌ COMMON ISSUES**

**"Address already in use"**
```bash
# Fix: Kill existing processes
pkill -f sirsi-nexus
lsof -ti:8080 | xargs kill
```

**"Command hangs"**
- This is **NORMAL** for servers!
- Use Ctrl+C to stop, or run in background with `&`
