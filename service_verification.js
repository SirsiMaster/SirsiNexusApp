#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

console.log('🔍 SirsiNexus Service Verification Started');
console.log('==========================================\n');

const services = [
  { name: 'CockroachDB', host: 'localhost', port: 26257, type: 'tcp' },
  { name: 'Redis', host: 'localhost', port: 6379, type: 'tcp' },
  { name: 'REST API', host: 'localhost', port: 8082, path: '/health', type: 'http' },
  { name: 'WebSocket', host: 'localhost', port: 8081, type: 'tcp' },
  { name: 'Frontend', host: 'localhost', port: 3001, path: '/', type: 'http' },
  { name: 'gRPC', host: 'localhost', port: 50051, type: 'tcp' }
];

async function testHTTP(host, port, path = '/') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.on('timeout', () => {
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function testTCP(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ success: true });
    });
    
    socket.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
    
    socket.connect(port, host);
  });
}

async function verifyServices() {
  const results = [];
  
  for (const service of services) {
    process.stdout.write(`Testing ${service.name.padEnd(15)} `);
    
    let result;
    if (service.type === 'http') {
      result = await testHTTP(service.host, service.port, service.path);
    } else {
      result = await testTCP(service.host, service.port);
    }
    
    if (result.success) {
      console.log('✅ PASS');
      results.push({ ...service, status: 'PASS' });
    } else {
      console.log(`❌ FAIL (${result.error})`);
      results.push({ ...service, status: 'FAIL', error: result.error });
    }
  }
  
  console.log('\n📊 Service Status Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n🔧 Failed Services:');
    results.filter(r => r.status === 'FAIL').forEach(service => {
      console.log(`   - ${service.name}: ${service.error}`);
    });
  }
  
  console.log('\n🚀 Next Steps:');
  if (passed === results.length) {
    console.log('✅ All services operational! Platform ready for use.');
    console.log('🌐 Frontend: http://localhost:3001');
    console.log('🔧 Backend API: http://localhost:8082');
  } else {
    console.log('⚠️  Some services need attention. Check logs and restart failed services.');
  }
}

verifyServices().catch(console.error);
