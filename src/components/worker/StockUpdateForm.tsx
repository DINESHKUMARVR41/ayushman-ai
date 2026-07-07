/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, Users, ShieldAlert, Sparkles, CheckCircle2, Save, MapPin } from 'lucide-react';
import Card from '../common/Card';
import { Language, Facility, InventoryItem } from '../../types';

interface StockUpdateFormProps {
  currentLang: Language;
  facilities: Facility[];
  inventory: InventoryItem[];
  onFormSubmit: (data: {
    facilityId: string;
    doctorAttendance: number;
    bedsOccupied: number;
    inventoryChanges: { [medName: string]: number };
  }) => void;
  voiceInputTrigger: { field: string; value: string | number } | null;
}

export default function StockUpdateForm({
  currentLang,
  facilities,
  inventory,
  onFormSubmit,
  voiceInputTrigger
}: StockUpdateFormProps) {
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [doctorAttendance, setDoctorAttendance] = useState(0);
  const [bedsOccupied, setBedsOccupied] = useState(0);
  const [paracetamolStock, setParacetamolStock] = useState(0);
  const [amoxicillinStock, setAmoxicillinStock] = useState(0);
  const [vaccineStock, setVaccineStock] = useState(0);
  
  const [feedback, setFeedback] = useState<string | null>(null);

  // Set default form values when facility changes or inventory changes
  useEffect(() => {
    if (facilities.length > 0 && !selectedFacilityId) {
      setSelectedFacilityId(facilities[0].id);
    }
  }, [facilities]);

  useEffect(() => {
    if (selectedFacilityId) {
      const selectedFac = facilities.find(f => f.id === selectedFacilityId);
      if (selectedFac) {
        setDoctorAttendance(selectedFac.doctorAttendance);
        setBedsOccupied(selectedFac.bedsOccupied);
      }

      const facInventory = inventory.filter(i => i.facilityId === selectedFacilityId);
      const para = facInventory.find(i => i.medicineName === 'Paracetamol');
      const amox = facInventory.find(i => i.medicineName === 'Amoxicillin');
      const vac = facInventory.find(i => i.medicineName === 'COV-Vaccine' || i.medicineName === 'Vaccine');

      setParacetamolStock(para ? para.stockOnHand : 120);
      setAmoxicillinStock(amox ? amox.stockOnHand : 80);
      setVaccineStock(vac ? vac.stockOnHand : 40);
    }
  }, [selectedFacilityId, inventory, facilities]);

  // Handle voice updates automatically
  useEffect(() => {
    if (voiceInputTrigger) {
      const { field, value } = voiceInputTrigger;
      if (field === 'paracetamol') setParacetamolStock(Number(value));
      if (field === 'amoxicillin') setAmoxicillinStock(Number(value));
      if (field === 'bedsOccupied') setBedsOccupied(Number(value));
      if (field === 'doctorAttendance') setDoctorAttendance(Number(value));

      setFeedback(`Voice update applied to ${field}`);
      const t = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [voiceInputTrigger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmit({
      facilityId: selectedFacilityId,
      doctorAttendance,
      bedsOccupied,
      inventoryChanges: {
        'Paracetamol': paracetamolStock,
        'Amoxicillin': amoxicillinStock,
        'Vaccine': vaccineStock
      }
    });

    setFeedback('Operational report logged successfully!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const selectedFac = facilities.find(f => f.id === selectedFacilityId);

  return (
    <Card className="border border-slate-800 bg-slate-900/40 shadow-xl">
      <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-50 font-sans">
              {currentLang === 'en' ? 'Daily Operational Logging Form' : currentLang === 'hi' ? 'दैनिक परिचालन लॉगिंग फॉर्म' : 'தினசரி செயல்பாட்டு பதிவு படிவம்'}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              PHC / CHC facility status indicators
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-2.5 px-4 font-sans animate-pulse">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Facility Dropdown Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-1.5 flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-blue-400" />
              <span>Select Facility</span>
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.type} - {fac.block} Block)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end">
            {selectedFac && (
              <div className="w-full grid grid-cols-3 gap-2 text-center bg-slate-950 border border-slate-800 rounded-xl p-2 font-mono text-[10px]">
                <div>
                  <p className="text-slate-500">TYPE</p>
                  <p className="text-blue-400 font-bold">{selectedFac.type}</p>
                </div>
                <div>
                  <p className="text-slate-500">RISK SCORE</p>
                  <p className={`font-bold ${selectedFac.riskScore > 60 ? 'text-red-400' : selectedFac.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedFac.riskScore}%</p>
                </div>
                <div>
                  <p className="text-slate-500">STATUS</p>
                  <p className={`font-bold ${selectedFac.status === 'CRITICAL' ? 'text-red-400' : selectedFac.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedFac.status}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance and Bed Occupancy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctor Attendance */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-2 flex items-center space-x-1">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>Doctor Attendance</span>
            </label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                min="0"
                max={selectedFac ? selectedFac.doctorCount : 10}
                value={doctorAttendance}
                onChange={(e) => setDoctorAttendance(Number(e.target.value))}
                className="w-24 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">
                Allocated total: <strong className="text-slate-200">{selectedFac ? selectedFac.doctorCount : 5}</strong>
              </span>
            </div>
          </div>

          {/* Bed Occupancy */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
            <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-2 flex items-center space-x-1">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
              <span>Bed Occupancy</span>
            </label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                min="0"
                max={selectedFac ? selectedFac.bedsTotal : 100}
                value={bedsOccupied}
                onChange={(e) => setBedsOccupied(Number(e.target.value))}
                className="w-24 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">
                Total Beds: <strong className="text-slate-200">{selectedFac ? selectedFac.bedsTotal : 30}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Medicine Inventory Stocks */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
          <label className="block text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mb-3 flex items-center space-x-1.5 border-b border-slate-800/60 pb-1.5">
            <ClipboardList className="h-4 w-4 text-emerald-400" />
            <span>Medicine Inventory Stocks (SOH)</span>
          </label>
          
          <div className="space-y-4">
            {/* Paracetamol */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Paracetamol (500mg Tablets)</p>
                <p className="text-[10px] text-slate-500 font-mono">Minimum Required: 150 Units</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  value={paracetamolStock}
                  onChange={(e) => setParacetamolStock(Number(e.target.value))}
                  className={`w-28 rounded-xl bg-slate-950 border px-3.5 py-1.5 text-xs font-mono text-right focus:outline-none focus:border-blue-500 ${
                    paracetamolStock < 150 ? 'border-red-500/40 text-red-400' : 'border-slate-800 text-slate-200'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  paracetamolStock < 150 ? 'bg-red-500/15 text-red-400 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                }`}>
                  {paracetamolStock < 150 ? 'LOW STOCK' : 'OPTIMAL'}
                </span>
              </div>
            </div>

            {/* Amoxicillin */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">Amoxicillin (250mg Capsules)</p>
                <p className="text-[10px] text-slate-500 font-mono">Minimum Required: 100 Units</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  value={amoxicillinStock}
                  onChange={(e) => setAmoxicillinStock(Number(e.target.value))}
                  className={`w-28 rounded-xl bg-slate-950 border px-3.5 py-1.5 text-xs font-mono text-right focus:outline-none focus:border-blue-500 ${
                    amoxicillinStock < 100 ? 'border-red-500/40 text-red-400' : 'border-slate-800 text-slate-200'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  amoxicillinStock < 100 ? 'bg-red-500/15 text-red-400 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                }`}>
                  {amoxicillinStock < 100 ? 'LOW STOCK' : 'OPTIMAL'}
                </span>
              </div>
            </div>

            {/* Vaccines */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">COV-Vaccine (Vials)</p>
                <p className="text-[10px] text-slate-500 font-mono">Minimum Required: 50 Units</p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="0"
                  value={vaccineStock}
                  onChange={(e) => setVaccineStock(Number(e.target.value))}
                  className={`w-28 rounded-xl bg-slate-950 border px-3.5 py-1.5 text-xs font-mono text-right focus:outline-none focus:border-blue-500 ${
                    vaccineStock < 50 ? 'border-red-500/40 text-red-400' : 'border-slate-800 text-slate-200'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  vaccineStock < 50 ? 'bg-red-500/15 text-red-400 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                }`}>
                  {vaccineStock < 50 ? 'LOW STOCK' : 'OPTIMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-950/20"
        >
          <Save className="h-4.5 w-4.5" />
          <span>{currentLang === 'en' ? 'Submit Operational Log' : currentLang === 'hi' ? 'परिचालन लॉग सबमिट करें' : 'செயல்பாட்டுப் பதிவைச் சமர்ப்பிக்கவும்'}</span>
        </button>
      </form>
    </Card>
  );
}
