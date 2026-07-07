/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Shield,
  User,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  MapPin,
  FileSpreadsheet,
  Layers,
  Database,
  Globe,
  Bell,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

import { UserRole, Language, Facility, InventoryItem, Alert, Recommendation, AuditLog } from './types';
import Header from './components/common/Header';
import Card from './components/common/Card';
import VoiceHandler from './components/common/VoiceHandler';
import QRScanner from './components/worker/QRScanner';
import SyncIndicator from './components/worker/SyncIndicator';
import StockUpdateForm from './components/worker/StockUpdateForm';
import KPIStats from './components/dashboard/KPIStats';
import MapWidget from './components/dashboard/MapWidget';
import RiskForecast from './components/dashboard/RiskForecast';
import RecommendationPanel from './components/dashboard/RecommendationPanel';

// INITIAL DATA SEEDING (Auto fallbacks to keep things robust & beautiful)
const INITIAL_FACILITIES: Facility[] = [
  { id: 'FAC-001', name: 'Sarojini Nagar PHC', type: 'PHC', block: 'Sarojini', lat: 26.7842, lng: 80.8925, doctorCount: 4, doctorAttendance: 4, bedsTotal: 15, bedsOccupied: 4, riskScore: 12, status: 'OPTIMAL' },
  { id: 'FAC-002', name: 'Chinhat CHC', type: 'CHC', block: 'Chinhat', lat: 26.8685, lng: 81.0142, doctorCount: 12, doctorAttendance: 8, bedsTotal: 50, bedsOccupied: 48, riskScore: 82, status: 'CRITICAL' }, // Bed shortage alert!
  { id: 'FAC-003', name: 'Malihabad PHC', type: 'PHC', block: 'Malihabad', lat: 26.9214, lng: 80.7258, doctorCount: 3, doctorAttendance: 1, bedsTotal: 10, bedsOccupied: 2, riskScore: 48, status: 'WARNING' }, // Doctor shortage!
  { id: 'FAC-004', name: 'Bakshi Ka Talab CHC', type: 'CHC', block: 'BKT', lat: 26.9854, lng: 80.9324, doctorCount: 8, doctorAttendance: 7, bedsTotal: 30, bedsOccupied: 12, riskScore: 24, status: 'OPTIMAL' }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  // Sarojini Nagar PHC Inventory
  { id: 'INV-101', facilityId: 'FAC-001', medicineName: 'Paracetamol', category: 'Analgesic', stockOnHand: 340, minimumRequired: 150, daysOfStockLeft: 12, lastUpdated: '2026-07-06T10:00:00Z' },
  { id: 'INV-102', facilityId: 'FAC-001', medicineName: 'Amoxicillin', category: 'Antibiotic', stockOnHand: 220, minimumRequired: 100, daysOfStockLeft: 14, lastUpdated: '2026-07-06T10:00:00Z' },
  { id: 'INV-103', facilityId: 'FAC-001', medicineName: 'COV-Vaccine', category: 'Vaccine', stockOnHand: 85, minimumRequired: 50, daysOfStockLeft: 8, lastUpdated: '2026-07-06T10:00:00Z' },
  
  // Chinhat CHC Inventory
  { id: 'INV-201', facilityId: 'FAC-002', medicineName: 'Paracetamol', category: 'Analgesic', stockOnHand: 45, minimumRequired: 200, daysOfStockLeft: 1, lastUpdated: '2026-07-06T10:00:00Z' }, // Low stock!
  { id: 'INV-202', facilityId: 'FAC-002', medicineName: 'Amoxicillin', category: 'Antibiotic', stockOnHand: 180, minimumRequired: 150, daysOfStockLeft: 8, lastUpdated: '2026-07-06T10:00:00Z' },
  { id: 'INV-203', facilityId: 'FAC-002', medicineName: 'COV-Vaccine', category: 'Vaccine', stockOnHand: 110, minimumRequired: 70, daysOfStockLeft: 11, lastUpdated: '2026-07-06T10:00:00Z' },

  // Malihabad PHC Inventory
  { id: 'INV-301', facilityId: 'FAC-003', medicineName: 'Paracetamol', category: 'Analgesic', stockOnHand: 210, minimumRequired: 100, daysOfStockLeft: 15, lastUpdated: '2026-07-06T10:00:00Z' },
  { id: 'INV-302', facilityId: 'FAC-003', medicineName: 'Amoxicillin', category: 'Antibiotic', stockOnHand: 35, minimumRequired: 80, daysOfStockLeft: 2, lastUpdated: '2026-07-06T10:00:00Z' }, // Low stock!
  { id: 'INV-303', facilityId: 'FAC-003', medicineName: 'COV-Vaccine', category: 'Vaccine', stockOnHand: 42, minimumRequired: 40, daysOfStockLeft: 7, lastUpdated: '2026-07-06T10:00:00Z' }
];

const INITIAL_ALERTS: Alert[] = [
  { id: 'ALT-001', facilityId: 'FAC-002', facilityName: 'Chinhat CHC', type: 'STOCK_OUT', severity: 'CRITICAL', message: 'Paracetamol stock critical: 45 units remaining (less than 1 day buffer).', timestamp: '2026-07-07T08:12:00Z', resolved: false },
  { id: 'ALT-002', facilityId: 'FAC-002', facilityName: 'Chinhat CHC', type: 'BED_OVERFLOW', severity: 'CRITICAL', message: 'Bed occupancy at critical capacity: 48 out of 50 assets occupied (96%).', timestamp: '2026-07-07T08:15:00Z', resolved: false },
  { id: 'ALT-003', facilityId: 'FAC-003', facilityName: 'Malihabad PHC', type: 'DOCTOR_SHORTAGE', severity: 'WARNING', message: 'Doctor attendance low: Only 1 of 3 allocated doctors checked in.', timestamp: '2026-07-07T08:20:00Z', resolved: false }
];

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'REC-001',
    type: 'REDISTRIBUTE',
    sourceFacilityId: 'FAC-001',
    sourceFacilityName: 'Sarojini Nagar PHC',
    targetFacilityId: 'FAC-002',
    targetFacilityName: 'Chinhat CHC',
    resourceType: 'Paracetamol',
    quantity: 150,
    reasoning: 'Chinhat CHC Paracetamol is at extreme critical levels (45 SOH). Sarojini Nagar PHC has a surplus buffer (340 SOH). Moving 150 units retains Sarojini Nagar safety stocks while providing 5 days coverage for Chinhat CHC.',
    confidenceScore: 96,
    status: 'PENDING',
    timestamp: '2026-07-07T08:22:00Z'
  },
  {
    id: 'REC-002',
    type: 'REDISTRIBUTE',
    sourceFacilityId: 'FAC-001',
    sourceFacilityName: 'Sarojini Nagar PHC',
    targetFacilityId: 'FAC-003',
    targetFacilityName: 'Malihabad PHC',
    resourceType: 'Amoxicillin',
    quantity: 80,
    reasoning: 'Malihabad PHC Amoxicillin stock is low (35 SOH). Moving 80 units from Sarojini Nagar PHC will cover current diagnostic surge deficits.',
    confidenceScore: 89,
    status: 'PENDING',
    timestamp: '2026-07-07T08:25:00Z'
  }
];

export default function App() {
  // Application Roles and Lang state
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [lang, setLang] = useState<Language>('en');

  // Core functional state managers
  const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(INITIAL_RECOMMENDATIONS);
  
  // Connection / Offline sync queue simulated state
  const [isOnline, setIsOnline] = useState(true);
  const [pendingQueue, setPendingQueue] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<string[]>(['[00:41] System initialized successfully.', '[00:42] Firestore connected.']);
  const [isSyncing, setIsSyncing] = useState(false);

  // For capturing voice interactions
  const [voiceCommand, setVoiceCommand] = useState<{ field: string; value: string | number } | null>(null);

  // Toast / Status notification center
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Voice entry dispatcher
  const handleVoiceInput = (cmd: { field: string; value: string | number }) => {
    setVoiceCommand(cmd);
    const timeStr = new Date().toLocaleTimeString();
    setSyncLogs(prev => [`[${timeStr}] Voice command matched: set ${cmd.field} to ${cmd.value}`, ...prev]);
  };

  // 2. QR Scanning completion
  const handleQRScanSuccess = (medName: string, quantity: number) => {
    const timeStr = new Date().toLocaleTimeString();
    showToast(`QR Intake Added: +${quantity} units of ${medName}`);

    // Update locally or cache in memory
    setInventory(prev => prev.map(item => {
      if (item.medicineName === medName && item.facilityId === 'FAC-001') {
        const nextStock = item.stockOnHand + quantity;
        return {
          ...item,
          stockOnHand: nextStock,
          daysOfStockLeft: Math.round(nextStock / (item.minimumRequired / 10)),
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));

    setSyncLogs(prev => [`[${timeStr}] QR Scan logged: Intake of ${quantity} units of ${medName}`, ...prev]);
  };

  // 3. Worker Daily Log Submission
  const handleWorkerFormSubmit = (data: {
    facilityId: string;
    doctorAttendance: number;
    bedsOccupied: number;
    inventoryChanges: { [medName: string]: number };
  }) => {
    const timeStr = new Date().toLocaleTimeString();
    
    const updateAction = {
      type: 'DAILY_LOG',
      timestamp: new Date().toISOString(),
      payload: data
    };

    if (isOnline) {
      // Apply immediately
      applyLogToState(data);
      setSyncLogs(prev => [`[${timeStr}] Synced log directly to Cloud Firestore for facility ${data.facilityId}`, ...prev]);
      showToast('Daily log synced to command center!');
    } else {
      // Queue offline
      setPendingQueue(prev => [...prev, updateAction]);
      setSyncLogs(prev => [`[${timeStr}] Offline queue buffered: Daily log for facility ${data.facilityId}`, ...prev]);
      showToast('Offline cache buffered in SQLite queue.');
    }
  };

  const applyLogToState = (data: {
    facilityId: string;
    doctorAttendance: number;
    bedsOccupied: number;
    inventoryChanges: { [medName: string]: number };
  }) => {
    // 1. Update clinic stats
    setFacilities(prev => prev.map(f => {
      if (f.id === data.facilityId) {
        const bedPct = Math.round((data.bedsOccupied / f.bedsTotal) * 100);
        const docPct = Math.round((data.doctorAttendance / f.doctorCount) * 100);
        
        let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
        let riskScore = 15;
        if (bedPct > 90 || docPct < 30) {
          status = 'CRITICAL';
          riskScore = 85;
        } else if (bedPct > 75 || docPct < 60) {
          status = 'WARNING';
          riskScore = 50;
        }

        return {
          ...f,
          doctorAttendance: data.doctorAttendance,
          bedsOccupied: data.bedsOccupied,
          status,
          riskScore
        };
      }
      return f;
    }));

    // 2. Update stock assets
    setInventory(prev => prev.map(item => {
      if (item.facilityId === data.facilityId && data.inventoryChanges[item.medicineName] !== undefined) {
        const nextStock = data.inventoryChanges[item.medicineName];
        return {
          ...item,
          stockOnHand: nextStock,
          daysOfStockLeft: Math.round(nextStock / (item.minimumRequired / 10)),
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // 4. Admin Redistribution Approvals
  const handleApproveRecommendation = (recId: string) => {
    const timeStr = new Date().toLocaleTimeString();
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    // Apply stock transfer in our state
    setInventory(prev => prev.map(item => {
      // Subtract from source
      if (item.facilityId === rec.sourceFacilityId && item.medicineName === rec.resourceType) {
        const nextStock = Math.max(0, item.stockOnHand - rec.quantity);
        return {
          ...item,
          stockOnHand: nextStock,
          daysOfStockLeft: Math.round(nextStock / (item.minimumRequired / 10))
        };
      }
      // Add to target
      if (item.facilityId === rec.targetFacilityId && item.medicineName === rec.resourceType) {
        const nextStock = item.stockOnHand + rec.quantity;
        return {
          ...item,
          stockOnHand: nextStock,
          daysOfStockLeft: Math.round(nextStock / (item.minimumRequired / 10))
        };
      }
      return item;
    }));

    // Mark recommendation resolved
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: 'APPROVED' } : r));
    
    // Resolve any matching low stock alerts
    setAlerts(prev => prev.map(a => {
      if (a.facilityId === rec.targetFacilityId && a.type === 'STOCK_OUT') {
        return { ...a, resolved: true };
      }
      return a;
    }));

    showToast(`Dispatched redistribution: ${rec.quantity} units ${rec.resourceType}`);
    setSyncLogs(prev => [`[${timeStr}] APPROVED: Dispatched ${rec.quantity} units of ${rec.resourceType} from ${rec.sourceFacilityName} to ${rec.targetFacilityName}`, ...prev]);
  };

  const handleRejectRecommendation = (recId: string) => {
    const timeStr = new Date().toLocaleTimeString();
    setRecommendations(prev => prev.map(r => r.id === recId ? { ...r, status: 'REJECTED' } : r));
    setSyncLogs(prev => [`[${timeStr}] DISMISSED: Recommendation ${recId} rejected.`, ...prev]);
    showToast('Recommendation dismissed.');
  };

  // Flush offline sync queues
  const handleFlushSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Apply all queued updates
      pendingQueue.forEach(item => {
        if (item.type === 'DAILY_LOG') {
          applyLogToState(item.payload);
        }
      });

      setPendingQueue([]);
      setIsSyncing(false);
      const timeStr = new Date().toLocaleTimeString();
      setSyncLogs(prev => [`[${timeStr}] Network synchronized: Flushed ${pendingQueue.length} records from SQLite queue to Cloud Firestore.`, ...prev]);
      showToast('All offline reports synced successfully!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Dynamic Header */}
      <Header
        currentRole={role}
        onRoleChange={setRole}
        currentLang={lang}
        onLangChange={setLang}
        isSyncing={isSyncing}
        onTriggerSync={handleFlushSync}
      />

      {/* Primary Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {role === 'WORKER' ? (
            /* ==============================================================
               FRONTLINE HEALTH WORKER INTERFACE PANEL
               ============================================================== */
            <motion.div
              key="worker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Introduction Banner */}
              <div className="flex items-center justify-between border border-slate-800 bg-slate-900/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold tracking-widest uppercase border border-emerald-500/20 px-2 py-0.5 rounded">
                    Field Telemetry
                  </span>
                  <h2 className="text-xl font-bold font-sans text-slate-100 mt-2">
                    {lang === 'en' ? 'Frontline Operations Portal' : lang === 'hi' ? 'अग्रिम पंक्ति परिचालन पोर्टल' : 'முன்னணி செயல்பாட்டு போர்டல்'}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
                    Log daily clinic doctor availability, occupied patient bed registers, scan barcode medicine intakes, or dictate status metrics offline without cellular network.
                  </p>
                </div>
                <div className="absolute right-6 opacity-10 hidden md:block">
                  <ClipboardList className="h-24 w-24 text-emerald-400" />
                </div>
              </div>

              {/* Action grid (Voice + Scanner + Sync Status) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VoiceHandler currentLang={lang} onVoiceCommand={handleVoiceInput} />
                <QRScanner currentLang={lang} onScanSuccess={handleQRScanSuccess} />
              </div>

              {/* Main log form & Sync Indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <StockUpdateForm
                    currentLang={lang}
                    facilities={facilities}
                    inventory={inventory}
                    onFormSubmit={handleWorkerFormSubmit}
                    voiceInputTrigger={voiceCommand}
                  />
                </div>
                <div className="space-y-6">
                  <SyncIndicator
                    currentLang={lang}
                    isOnline={isOnline}
                    onToggleOnline={setIsOnline}
                    pendingCount={pendingQueue.length}
                    onFlushSync={handleFlushSync}
                    syncHistory={syncLogs}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* ==============================================================
               DISTRICT HEALTH COMMAND CENTER DASHBOARD (ADMIN VIEW)
               ============================================================== */
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Introduction Banner */}
              <div className="flex items-center justify-between border border-slate-800 bg-slate-900/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono font-bold tracking-widest uppercase border border-blue-500/20 px-2 py-0.5 rounded">
                    Command & Control
                  </span>
                  <h2 className="text-xl font-bold font-sans text-slate-100 mt-2">
                    {lang === 'en' ? 'AYUSHMAN District Health Command Center' : lang === 'hi' ? 'आयुष्मान जिला स्वास्थ्य कमांड सेंटर' : 'ஆயுஷ்மான் மாவட்ட சுகாதார கட்டுப்பாட்டு மையம்'}
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
                    AI-powered situational oversight of district healthcare facility inventories, bed allocations, and clinical staffing. Evaluates anomalies and schedules stock redistribution commands dynamically.
                  </p>
                </div>
                <div className="absolute right-6 opacity-10 hidden md:block">
                  <Activity className="h-24 w-24 text-blue-400" />
                </div>
              </div>

              {/* Core metrics summary indicators */}
              <KPIStats facilities={facilities} alerts={alerts} />

              {/* GIS Map & AI Forecasting overlay */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MapWidget facilities={facilities} inventory={inventory} />
                <RiskForecast />
              </div>

              {/* Actions & Alerts stream split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Recommendations panel */}
                <div className="lg:col-span-2">
                  <RecommendationPanel
                    recommendations={recommendations}
                    onApprove={handleApproveRecommendation}
                    onReject={handleRejectRecommendation}
                  />
                </div>

                {/* Real-time Alerts stream feed */}
                <Card className="border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden flex flex-col h-[400px] p-0">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-400 animate-bounce" />
                      <h3 className="text-sm font-bold text-slate-100 font-sans">
                        Live Alert Engine Feeds
                      </h3>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                    {alerts.filter(a => !a.resolved).length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-20 font-sans">No operational alert anomalies flagged.</p>
                    ) : (
                      alerts.filter(a => !a.resolved).map((alt) => (
                        <div
                          key={alt.id}
                          className={`border rounded-xl p-3.5 transition-all text-left ${
                            alt.severity === 'CRITICAL'
                              ? 'border-red-500/20 bg-red-500/5 text-red-300'
                              : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <strong className="text-xs font-bold font-sans block">{alt.facilityName}</strong>
                              <p className="text-[10px] font-mono mt-0.5">{alt.type} • Severity: {alt.severity}</p>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500">
                              {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-300 mt-2 font-sans">{alt.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast feedback alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-3 shadow-2xl text-xs text-slate-200 font-sans flex items-center space-x-2.5"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
