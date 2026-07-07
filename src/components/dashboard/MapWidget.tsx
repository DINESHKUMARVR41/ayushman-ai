/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Map, Info, UserCheck, ShieldAlert, Package, Check, HelpCircle } from 'lucide-react';
import Card from '../common/Card';
import { Facility, InventoryItem } from '../../types';

interface MapWidgetProps {
  facilities: Facility[];
  inventory: InventoryItem[];
}

export default function MapWidget({ facilities, inventory }: MapWidgetProps) {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Filter inventory for the selected clinic
  const getClinicInventory = (clinicId: string) => {
    return inventory.filter(i => i.facilityId === clinicId);
  };

  return (
    <Card className="border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden flex flex-col h-[460px] p-0">
      {/* Header toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center space-x-2">
          <Map className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-100 font-sans">
            GIS Interactive Facility Map
          </h2>
        </div>
        <div className="flex items-center space-x-4 text-[10px] font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
            <span className="text-slate-400">OPTIMAL</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
            <span className="text-slate-400">WARNING</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]" />
            <span className="text-slate-400">CRITICAL</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative min-h-0">
        {/* Left: Vector Interactive Map Canvas */}
        <div className="flex-1 bg-slate-950 relative min-h-0 overflow-hidden flex items-center justify-center">
          {/* Visual Grid overlays for military/command center styling */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* Fake Topography borders */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 500 400">
            <path d="M50 80 Q 150 50 250 150 T 450 180" fill="none" stroke="rgb(71,85,105)" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M100 280 Q 250 220 380 320" fill="none" stroke="rgb(71,85,105)" strokeWidth="1" strokeDasharray="4 4" />
            {/* Sector Division lines */}
            <line x1="250" y1="0" x2="250" y2="400" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </svg>

          {/* Interactive Healthcare Facility Markers */}
          <div className="absolute inset-0">
            {facilities.map((fac) => {
              // Map lat/lng roughly to coordinates inside our 500x350 window
              // e.g., mapping lat: 26.8 -> 26.9, lng: 80.9 -> 81.1
              const x = ((fac.lng - 80.85) / 0.3) * 100; // percentage-based placement
              const y = (1 - (fac.lat - 26.7) / 0.25) * 100;

              let color = 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
              if (fac.status === 'WARNING') color = 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
              if (fac.status === 'CRITICAL') color = 'bg-red-500 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]';

              const isSelected = selectedFacility?.id === fac.id;

              return (
                <button
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition duration-300 ${isSelected ? 'scale-125' : 'hover:scale-115'}`}
                >
                  <div className={`h-4.5 w-4.5 rounded-full border-2 ${color} flex items-center justify-center`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900/95 border border-slate-800 text-white font-mono text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30">
                    <strong className="text-slate-200">{fac.name}</strong> ({fac.type})
                    <p className="text-slate-400 mt-0.5">Risk Score: {fac.riskScore}% • {fac.status}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1.5 text-[9px] font-mono text-slate-400">
            Sector ID: <strong>IN-UP-72</strong> • District Command Area
          </div>
        </div>

        {/* Right: Selected Clinic Detail Panel */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between shrink-0 min-h-0 overflow-y-auto">
          {selectedFacility ? (
            <div className="space-y-4">
              <div>
                <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  selectedFacility.status === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border border-red-500/10' :
                  selectedFacility.status === 'WARNING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/10' :
                  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                }`}>
                  {selectedFacility.type} • {selectedFacility.status}
                </span>
                <h3 className="text-sm font-bold text-slate-100 mt-2 font-sans">{selectedFacility.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">GPS: {selectedFacility.lat.toFixed(4)}N, {selectedFacility.lng.toFixed(4)}E</p>
              </div>

              {/* Doctors & Beds stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-2 font-mono">
                  <p className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
                    <UserCheck className="h-3 w-3 text-emerald-400" />
                    <span>DOCTORS</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {selectedFacility.doctorAttendance} <span className="text-[9px] font-normal text-slate-500">/ {selectedFacility.doctorCount}</span>
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-2 font-mono">
                  <p className="text-[9px] text-slate-500 flex items-center justify-center space-x-1">
                    <ShieldAlert className="h-3 w-3 text-blue-400" />
                    <span>BEDS OCC.</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200 mt-1">
                    {selectedFacility.bedsOccupied} <span className="text-[9px] font-normal text-slate-500">/ {selectedFacility.bedsTotal}</span>
                  </p>
                </div>
              </div>

              {/* Medicine stock levels */}
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                  <Package className="h-3.5 w-3.5 text-blue-400" />
                  <span>DRUGS ON HAND (SOH)</span>
                </p>
                <div className="space-y-1.5 text-[10px] font-mono">
                  {getClinicInventory(selectedFacility.id).map((item) => {
                    const lowStock = item.stockOnHand < item.minimumRequired;
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-300">{item.medicineName}</span>
                        <span className={`font-bold ${lowStock ? 'text-red-400' : 'text-slate-400'}`}>
                          {item.stockOnHand} <span className="text-[9px] text-slate-500">/ {item.minimumRequired} min</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <Info className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400 font-sans">Select a clinic marker on the map to inspect telemetry, medicine stocks, and operational alerts.</p>
            </div>
          )}

          {selectedFacility && (
            <button
              onClick={() => setSelectedFacility(null)}
              className="w-full mt-4 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono font-bold py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Clear Inspector
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
