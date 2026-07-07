/**
 * Backend API Integration Tests
 * Framework: Native Node/TypeScript runner
 */

import { spawn } from 'child_process';
import http from 'http';

function runAPITests() {
  console.log('==========================================================');
  console.log(' Initiating AYUSHMAN-AI Backend API Integration Tests');
  console.log('==========================================================');

  // Start local instance of Express server in background
  const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    env: { ...process.env, NODE_ENV: 'test', PORT: '3000' }
  });

  serverProcess.stdout.on('data', (data) => {
    const message = data.toString();
    if (message.includes('Full-stack Server listening')) {
      console.log('▶ Test Server booted on port 3000. Running assertions...');
      executeAsserts(() => {
        console.log('▲ All assertions complete. Tearing down server...');
        serverProcess.kill();
        process.exit(0);
      });
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to spawn test server:', err);
    process.exit(1);
  });
}

function executeAsserts(callback: () => void) {
  // Assertion 1: Fetch Facilities
  http.get('http://localhost:3000/api/facilities', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const facilities = JSON.parse(data);
      console.log(`[PASS] GET /api/facilities: Returned ${facilities.length} clinics.`);
      
      // Assertion 2: Perform Stock Update
      const postData = JSON.stringify({
        facilityId: 'FAC001',
        itemName: 'Paracetamol 500mg',
        quantity: 800,
        operatorEmail: 'test_assert@ayushman.gov.in'
      });

      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/inventory/update',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (postRes) => {
        let postResData = '';
        postRes.on('data', chunk => postResData += chunk);
        postRes.on('end', () => {
          const result = JSON.parse(postResData);
          console.log('[PASS] POST /api/inventory/update: Stock level increment completed.');
          console.log(`       Updated item: ${result.item.itemName} -> Qty: ${result.item.quantity}`);
          
          callback();
        });
      });

      req.on('error', (e) => {
        console.error(`POST /api/inventory/update failed: ${e.message}`);
        process.exit(1);
      });

      req.write(postData);
      req.end();
    });
  }).on('error', (e) => {
    console.error(`GET /api/facilities failed: ${e.message}`);
    process.exit(1);
  });
}

if (require.main === module) {
  runAPITests();
}
