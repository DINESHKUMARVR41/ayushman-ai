/**
 * AYUSHMAN-AI Backend Server
 * Express + Vite Integration
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// In-Memory Database State (Pre-seeded with rich regional clinic data)
let facilities = [
  { id: 'FAC001', name: 'PHC Rampur', type: 'PHC', district: 'Bilaspur', location: { lat: 22.0833, lng: 82.1500 }, totalBeds: 24, allocatedDoctors: 3 },
  { id: 'FAC002', name: 'CHC Bilaspur', type: 'CHC', district: 'Bilaspur', location: { lat: 22.1500, lng: 82.1833 }, totalBeds: 80, allocatedDoctors: 12 },
  { id: 'FAC003', name: 'PHC Kota', type: 'PHC', district: 'Bilaspur', location: { lat: 22.3000, lng: 82.0300 }, totalBeds: 15, allocatedDoctors: 2 },
  { id: 'FAC004', name: 'PHC Ratanpur', type: 'PHC', district: 'Bilaspur', location: { lat: 22.2833, lng: 82.1667 }, totalBeds: 20, allocatedDoctors: 4 },
  { id: 'FAC005', name: 'CHC Takhatpur', type: 'CHC', district: 'Bilaspur', location: { lat: 22.1167, lng: 81.9833 }, totalBeds: 50, allocatedDoctors: 8 }
];

let inventory = [
  // PHC Rampur stock (Severe shortage of Paracetamol & Amoxicillin)
  { id: 'INV001', facilityId: 'FAC001', itemName: 'Paracetamol 500mg', category: 'Essential Medicine', quantity: 45, minRequired: 500, unit: 'Tablets', lastUpdated: new Date().toISOString() },
  { id: 'INV002', facilityId: 'FAC001', itemName: 'Amoxicillin 250mg', category: 'Essential Medicine', quantity: 20, minRequired: 300, unit: 'Tablets', lastUpdated: new Date().toISOString() },
  { id: 'INV003', facilityId: 'FAC001', itemName: 'COVID-19 Rapid Kits', category: 'Surgical Kit', quantity: 180, minRequired: 150, unit: 'Kits', lastUpdated: new Date().toISOString() },
  { id: 'INV004', facilityId: 'FAC001', itemName: 'Anti-Rabies Vaccines', category: 'Vaccine', quantity: 5, minRequired: 20, unit: 'Vials', lastUpdated: new Date().toISOString() },

  // CHC Bilaspur stock (Surplus of Paracetamol & Vaccines)
  { id: 'INV005', facilityId: 'FAC002', itemName: 'Paracetamol 500mg', category: 'Essential Medicine', quantity: 4500, minRequired: 1000, unit: 'Tablets', lastUpdated: new Date().toISOString() },
  { id: 'INV006', facilityId: 'FAC002', itemName: 'Amoxicillin 250mg', category: 'Essential Medicine', quantity: 1200, minRequired: 500, unit: 'Tablets', lastUpdated: new Date().toISOString() },
  { id: 'INV007', facilityId: 'FAC002', itemName: 'COVID-19 Rapid Kits', category: 'Surgical Kit', quantity: 800, minRequired: 400, unit: 'Kits', lastUpdated: new Date().toISOString() },
  { id: 'INV008', facilityId: 'FAC002', itemName: 'Anti-Rabies Vaccines', category: 'Vaccine', quantity: 120, minRequired: 50, unit: 'Vials', lastUpdated: new Date().toISOString() },

  // PHC Kota stock
  { id: 'INV009', facilityId: 'FAC003', itemName: 'Paracetamol 500mg', category: 'Essential Medicine', quantity: 600, minRequired: 300, unit: 'Tablets', lastUpdated: new Date().toISOString() },
  { id: 'INV010', facilityId: 'FAC003', itemName: 'Anti-Rabies Vaccines', category: 'Vaccine', quantity: 3, minRequired: 15, unit: 'Vials', lastUpdated: new Date().toISOString() }
];

let alerts = [
  { id: 'ALT001', facilityId: 'FAC001', type: 'STOCK_OUT', severity: 'CRITICAL', message: 'Paracetamol 500mg stock critically low (45 tabs remaining, min required: 500). Outage expected within 12 hours.', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'ALT002', facilityId: 'FAC001', type: 'STOCK_OUT', severity: 'CRITICAL', message: 'Amoxicillin 250mg stock depleted to 20 tablets. Immediate dispatch recommended.', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'ALT003', facilityId: 'FAC003', type: 'STAFF_DEFICIT', severity: 'WARNING', message: 'PHC Kota reporting high outpatient surge. On-duty physician absent due to medical leave.', status: 'ACTIVE', createdAt: new Date().toISOString() }
];

let recommendations = [
  {
    id: 'REC001',
    sourceFacilityId: 'FAC002', // CHC Bilaspur (Surplus)
    targetFacilityId: 'FAC001', // PHC Rampur (Shortage)
    itemType: 'MEDICINE',
    itemName: 'Paracetamol 500mg',
    amount: 1500,
    reasoning: 'CHC Bilaspur holds a 4,500 tab surplus, while PHC Rampur is at critical threshold (45 tabs) experiencing high malaria/influenza reporting rates.',
    status: 'PENDING',
    impactScore: 94,
    createdAt: new Date().toISOString()
  },
  {
    id: 'REC002',
    sourceFacilityId: 'FAC002',
    targetFacilityId: 'FAC001',
    itemType: 'MEDICINE',
    itemName: 'Amoxicillin 250mg',
    amount: 500,
    reasoning: 'Urgent transfer to restock PHC Rampur pediatric and primary outpatient prescription buffers.',
    status: 'PENDING',
    impactScore: 89,
    createdAt: new Date().toISOString()
  },
  {
    id: 'REC003',
    sourceFacilityId: 'FAC002',
    targetFacilityId: 'FAC003',
    itemType: 'STAFF',
    itemName: 'Support Doctor (General Duty)',
    amount: 1,
    reasoning: 'Reallocate 1 Doctor from CHC Bilaspur (12 active) to PHC Kota to alleviate severe patient surge handling stress.',
    status: 'PENDING',
    impactScore: 78,
    createdAt: new Date().toISOString()
  }
];

let auditLogs: any[] = [
  { id: 'LOG001', operatorEmail: 'system@ayushman.gov.in', operatorRole: 'ADMIN', action: 'SYSTEM_BOOT', targetId: 'SYS', payloadBefore: {}, payloadAfter: { state: 'ONLINE' }, timestamp: new Date().toISOString() }
];

// Lazy Initialization of Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
        console.log('Gemini AI Client initialized successfully.');
      } catch (e) {
        console.error('Error initializing GoogleGenAI:', e);
      }
    } else {
      console.warn('GEMINI_API_KEY env variable is absent. Using smart fallback processing.');
    }
  }
  return aiClient;
}

// REST APIs
app.get('/api/facilities', (req, res) => {
  res.json(facilities);
});

app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory/update', (req, res) => {
  const { facilityId, itemName, category, quantity, unit, operatorEmail, operatorRole } = req.body;
  if (!facilityId || !itemName || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: facilityId, itemName, quantity.' });
  }

  // Find or create item
  let item = inventory.find(i => i.facilityId === facilityId && i.itemName.toLowerCase() === itemName.toLowerCase());
  let beforeState = item ? { ...item } : {};

  if (item) {
    item.quantity = Number(quantity);
    item.lastUpdated = new Date().toISOString();
  } else {
    const newId = `INV${String(inventory.length + 1).padStart(3, '0')}`;
    item = {
      id: newId,
      facilityId,
      itemName,
      category: category || 'Essential Medicine',
      quantity: Number(quantity),
      minRequired: 100, // default
      unit: unit || 'Units',
      lastUpdated: new Date().toISOString()
    };
    inventory.push(item);
  }

  // Track in alerts
  if (item.quantity < item.minRequired) {
    const alreadyAlerted = alerts.some(a => a.facilityId === facilityId && a.message.includes(itemName) && a.status === 'ACTIVE');
    if (!alreadyAlerted) {
      alerts.push({
        id: `ALT${String(alerts.length + 1).padStart(3, '0')}`,
        facilityId,
        type: 'STOCK_OUT',
        severity: 'CRITICAL',
        message: `${itemName} stock critically low (${item.quantity} ${item.unit} remaining, min required: ${item.minRequired}).`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
    }
  } else {
    // Resolve active stock alerts for this item
    alerts = alerts.map(a => {
      if (a.facilityId === facilityId && a.message.includes(itemName) && a.status === 'ACTIVE') {
        return { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() };
      }
      return a;
    });
  }

  // Record Audit Log
  const logId = `LOG${String(auditLogs.length + 1).padStart(3, '0')}`;
  auditLogs.push({
    id: logId,
    operatorEmail: operatorEmail || 'worker@ayushman.gov.in',
    operatorRole: operatorRole || 'WORKER',
    action: 'UPDATE_STOCK',
    targetId: item.id,
    payloadBefore: beforeState,
    payloadAfter: { ...item },
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, item, logs: auditLogs[auditLogs.length - 1] });
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.get('/api/recommendations', (req, res) => {
  res.json(recommendations);
});

// Approve or reject redistribution actions
app.post('/api/recommendations/action', (req, res) => {
  const { recommendationId, action, operatorEmail, operatorRole } = req.body;
  if (!recommendationId || !action) {
    return res.status(400).json({ error: 'Missing parameters: recommendationId, action.' });
  }

  const rec = recommendations.find(r => r.id === recommendationId);
  if (!rec) {
    return res.status(404).json({ error: 'Recommendation not found.' });
  }

  if (rec.status !== 'PENDING') {
    return res.status(400).json({ error: `Recommendation already ${rec.status}.` });
  }

  rec.status = action; // APPROVED or REJECTED

  // Execute redistribution on Approve
  if (action === 'APPROVED') {
    if (rec.itemType === 'MEDICINE') {
      const sourceItem = inventory.find(i => i.facilityId === rec.sourceFacilityId && i.itemName.toLowerCase() === rec.itemName.toLowerCase());
      const targetItem = inventory.find(i => i.facilityId === rec.targetFacilityId && i.itemName.toLowerCase() === rec.itemName.toLowerCase());

      if (sourceItem) {
        sourceItem.quantity = Math.max(0, sourceItem.quantity - rec.amount);
        sourceItem.lastUpdated = new Date().toISOString();
      }

      if (targetItem) {
        targetItem.quantity += rec.amount;
        targetItem.lastUpdated = new Date().toISOString();
      } else {
        // Create matching item in target facility
        inventory.push({
          id: `INV${String(inventory.length + 1).padStart(3, '0')}`,
          facilityId: rec.targetFacilityId,
          itemName: rec.itemName,
          category: 'Essential Medicine',
          quantity: rec.amount,
          minRequired: 200,
          unit: 'Tablets',
          lastUpdated: new Date().toISOString()
        });
      }

      // Resolve critical alerts
      alerts = alerts.map(a => {
        if (a.facilityId === rec.targetFacilityId && a.message.toLowerCase().includes(rec.itemName.toLowerCase())) {
          return { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() };
        }
        return a;
      });
    } else if (rec.itemType === 'STAFF') {
      const sourceFac = facilities.find(f => f.id === rec.sourceFacilityId);
      const targetFac = facilities.find(f => f.id === rec.targetFacilityId);

      if (sourceFac) sourceFac.allocatedDoctors = Math.max(0, sourceFac.allocatedDoctors - rec.amount);
      if (targetFac) targetFac.allocatedDoctors += rec.amount;
    }
  }

  // Add Audit Log
  const logId = `LOG${String(auditLogs.length + 1).padStart(3, '0')}`;
  auditLogs.push({
    id: logId,
    operatorEmail: operatorEmail || 'admin@ayushman.gov.in',
    operatorRole: operatorRole || 'ADMIN',
    action: action === 'APPROVED' ? 'APPROVED_REDISTRIBUTION' : 'REJECTED_REDISTRIBUTION',
    targetId: recommendationId,
    payloadBefore: { status: 'PENDING' },
    payloadAfter: { status: action },
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, recommendation: rec, inventory, facilities });
});

app.get('/api/logs', (req, res) => {
  res.json(auditLogs);
});

// Client-side local queues uploaded offline sync proxy
app.post('/api/sync', (req, res) => {
  const { queue } = req.body;
  if (!queue || !Array.isArray(queue)) {
    return res.status(400).json({ error: 'Queue must be an array of logged offline items.' });
  }

  const results: any[] = [];
  queue.forEach((log: any) => {
    // Process local log payload
    const { facilityId, itemName, category, quantity, unit, operatorEmail, timestamp } = log;
    
    let item = inventory.find(i => i.facilityId === facilityId && i.itemName.toLowerCase() === itemName.toLowerCase());
    if (item) {
      item.quantity = Number(quantity);
      item.lastUpdated = timestamp || new Date().toISOString();
    } else {
      item = {
        id: `INV${String(inventory.length + 1).padStart(3, '0')}`,
        facilityId,
        itemName,
        category: category || 'Essential Medicine',
        quantity: Number(quantity),
        minRequired: 150,
        unit: unit || 'Units',
        lastUpdated: timestamp || new Date().toISOString()
      };
      inventory.push(item);
    }
    results.push(item);

    // Audit logs entry
    auditLogs.push({
      id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
      operatorEmail: operatorEmail || 'offline_sync@ayushman.gov.in',
      operatorRole: 'WORKER',
      action: 'SYNC_OFFLINE_LOG',
      targetId: item.id,
      payloadBefore: {},
      payloadAfter: { ...item },
      timestamp: timestamp || new Date().toISOString()
    });
  });

  res.json({ success: true, processedCount: queue.length, updatedInventory: inventory });
});

// Speech transcript NLP voice processing endpoint powered by Gemini AI with robust regex fallbacks
app.post('/api/voice', async (req: Request, res: Response) => {
  const { transcript, facilityId, operatorEmail } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript to process.' });
  }

  const activeFacilityId = facilityId || 'FAC001';
  let processedAction: any = null;
  let responseText = '';

  const ai = getAI();

  if (ai) {
    try {
      const prompt = `
      You are AYUSHMAN-AI regional medical supply bot. 
      Analyze this speech transcript spoken by a health worker in a primary health center: "${transcript}".
      Extract the inventory action requested by the user.
      Output ONLY a clean JSON object without markdown fences, conforming to this structure:
      {
        "action": "UPDATE" | "INSPECT" | "HELP" | "UNKNOWN",
        "item": "Extracted item name (e.g. Paracetamol, COVID Kits)",
        "quantity": Extracted quantity number (or null if not found),
        "category": "Essential Medicine" | "Vaccine" | "Surgical Kit" (if inferable, otherwise "Essential Medicine"),
        "unit": "Tablets" | "Vials" | "Kits" | "Units" (best estimate),
        "comment": "Brief conversational confirmation sentence responding back to the worker in professional and encouraging tones"
      }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text?.trim() || '';
      // Remove any json markdown decorators
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      processedAction = JSON.parse(cleanJson);
      responseText = processedAction.comment || `Understood. Processing request for ${processedAction.item}.`;
    } catch (e) {
      console.error('Error calling Gemini model. Dropping back to regex pattern match:', e);
    }
  }

  // Smart Regex Fallback if Gemini key is missing or failed
  if (!processedAction) {
    const textLower = transcript.toLowerCase();
    let qtyMatch = textLower.match(/\b\d+\b/);
    let qty = qtyMatch ? parseInt(qtyMatch[0]) : null;

    let item = 'Unknown Item';
    let category = 'Essential Medicine';
    let unit = 'Units';

    if (textLower.includes('paracetamol')) {
      item = 'Paracetamol 500mg';
      unit = 'Tablets';
    } else if (textLower.includes('amoxicillin')) {
      item = 'Amoxicillin 250mg';
      unit = 'Tablets';
    } else if (textLower.includes('vaccine') || textLower.includes('rabies') || textLower.includes('anti-rabies')) {
      item = 'Anti-Rabies Vaccines';
      category = 'Vaccine';
      unit = 'Vials';
    } else if (textLower.includes('covid') || textLower.includes('rapid kit')) {
      item = 'COVID-19 Rapid Kits';
      category = 'Surgical Kit';
      unit = 'Kits';
    }

    if (textLower.includes('update') || textLower.includes('set') || textLower.includes('log') || qty !== null) {
      processedAction = {
        action: 'UPDATE',
        item,
        quantity: qty,
        category,
        unit,
        comment: `Local voice log registered: updating ${item} to ${qty} ${unit} at current center.`
      };
    } else {
      processedAction = {
        action: 'INSPECT',
        item,
        quantity: null,
        category,
        unit,
        comment: `Inspecting active dashboard for ${item} stock metrics.`
      };
    }
    responseText = processedAction.comment;
  }

  // If the command is an inventory update, execute it directly in DB
  if (processedAction.action === 'UPDATE' && processedAction.item !== 'Unknown Item' && processedAction.quantity !== null) {
    let targetItem = inventory.find(i => i.facilityId === activeFacilityId && i.itemName.toLowerCase() === processedAction.item.toLowerCase());
    let beforeState = targetItem ? { ...targetItem } : {};

    if (targetItem) {
      targetItem.quantity = processedAction.quantity;
      targetItem.lastUpdated = new Date().toISOString();
    } else {
      targetItem = {
        id: `INV${String(inventory.length + 1).padStart(3, '0')}`,
        facilityId: activeFacilityId,
        itemName: processedAction.item,
        category: processedAction.category,
        quantity: processedAction.quantity,
        minRequired: 200,
        unit: processedAction.unit,
        lastUpdated: new Date().toISOString()
      };
      inventory.push(targetItem);
    }

    // Dynamic alert generation check
    if (targetItem.quantity < targetItem.minRequired) {
      const alreadyAlerted = alerts.some(a => a.facilityId === activeFacilityId && a.message.includes(processedAction.item) && a.status === 'ACTIVE');
      if (!alreadyAlerted) {
        alerts.push({
          id: `ALT${String(alerts.length + 1).padStart(3, '0')}`,
          facilityId: activeFacilityId,
          type: 'STOCK_OUT',
          severity: 'CRITICAL',
          message: `Voice reported alert: ${processedAction.item} is low at ${targetItem.quantity} ${targetItem.unit}.`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      alerts = alerts.map(a => {
        if (a.facilityId === activeFacilityId && a.message.includes(processedAction.item) && a.status === 'ACTIVE') {
          return { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() };
        }
        return a;
      });
    }

    // Add audit log
    auditLogs.push({
      id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
      operatorEmail: operatorEmail || 'voice_assistant@ayushman.gov.in',
      operatorRole: 'WORKER',
      action: 'UPDATE_STOCK_VOICE',
      targetId: targetItem.id,
      payloadBefore: beforeState,
      payloadAfter: { ...targetItem },
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    speechOutput: responseText,
    actionPayload: processedAction,
    updatedInventory: inventory,
    alerts
  });
});

// Vite Middleware for Development + SPA static serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Dev Mode: Mounted Vite Middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Prod Mode: Serving built client static assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AYUSHMAN-AI] Full-stack Server listening on port ${PORT}`);
  });
}

startServer();
