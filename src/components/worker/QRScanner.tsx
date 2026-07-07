/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { QrCode, Sparkles, Check, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import { Language } from '../../types';

interface QRScannerProps {
  currentLang: Language;
  onScanSuccess: (medicineName: string, quantity: number) => void;
}

const MEDICINES_TO_SCAN = [
  { code: 'PAR-500-MG', name: 'Paracetamol', qty: 100, category: 'Analgesic' },
  { code: 'AMX-250-MG', name: 'Amoxicillin', qty: 50, category: 'Antibiotic' },
  { code: 'VAC-COV-10', name: 'COV-Vaccine', qty: 20, category: 'Vaccine' }
];

export default function QRScanner({ currentLang, onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedMed, setScannedMed] = useState<typeof MEDICINES_TO_SCAN[0] | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS'>('IDLE');

  const startScanSimulate = (med: typeof MEDICINES_TO_SCAN[0]) => {
    setIsScanning(true);
    setScanStatus('SCANNING');
    setScannedMed(med);

    setTimeout(() => {
      setScanStatus('SUCCESS');
      onScanSuccess(med.name, med.qty);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanStatus('IDLE');
        setScannedMed(null);
      }, 1500);
    }, 1800);
  };

  return (
    <Card className="border border-slate-800/70 bg-slate-950/40 shadow-lg relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <QrCode className="h-4.5 w-4.5 text-blue-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
            {currentLang === 'en' ? 'QR Medicine Scanner' : currentLang === 'hi' ? 'क्यूआर मेडिसिन स्कैनर' : 'QR மருந்து ஸ்கேனர்'}
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
          Simulated QR Reader
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side: QR viewfinder simulation */}
        <div className="relative border border-slate-800 bg-slate-900/50 rounded-xl h-44 flex flex-col items-center justify-center overflow-hidden">
          {scanStatus === 'SCANNING' && (
            <>
              {/* Pulsing scanning red line */}
              <div className="absolute left-0 right-0 h-0.5 bg-red-500 animate-bounce top-1/2 z-20 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              {/* Corner guidelines */}
              <div className="absolute top-8 left-8 h-6 w-6 border-t-2 border-l-2 border-blue-400" />
              <div className="absolute top-8 right-8 h-6 w-6 border-t-2 border-r-2 border-blue-400" />
              <div className="absolute bottom-8 left-8 h-6 w-6 border-b-2 border-l-2 border-blue-400" />
              <div className="absolute bottom-8 right-8 h-6 w-6 border-b-2 border-r-2 border-blue-400" />
              
              <div className="z-10 flex flex-col items-center justify-center">
                <QrCode className="h-10 w-10 text-blue-400 animate-pulse" />
                <p className="text-[11px] text-blue-400 font-mono mt-2 animate-pulse">Scanning: {scannedMed?.code}</p>
              </div>
            </>
          )}

          {scanStatus === 'SUCCESS' && (
            <div className="z-10 flex flex-col items-center justify-center text-emerald-400">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2">
                <Check className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold font-sans">SCAN SUCCESSFUL!</p>
              <p className="text-[10px] text-emerald-400/80 font-mono">+{scannedMed?.qty} Units of {scannedMed?.name}</p>
            </div>
          )}

          {scanStatus === 'IDLE' && (
            <div className="text-center p-4">
              <QrCode className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-sans">Select a box below to simulate scanning QR bar code on shipment packages.</p>
            </div>
          )}
        </div>

        {/* Right Side: Available drug shipments */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-mono mb-2">
              {currentLang === 'en' ? 'Shipments to intake:' : currentLang === 'hi' ? 'प्राप्त होने वाले शिपमेंट:' : 'உள்வரும் ஏற்றுமதிப் பொருட்கள்:'}
            </p>
            <div className="space-y-2">
              {MEDICINES_TO_SCAN.map((med) => (
                <button
                  key={med.code}
                  disabled={isScanning}
                  onClick={() => startScanSimulate(med)}
                  className="w-full flex items-center justify-between border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 rounded-lg p-2.5 transition text-left disabled:opacity-50"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200">{med.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">CODE: {med.code} • {med.category}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                    <Sparkles className="h-3 w-3" />
                    <span>+{med.qty} Units</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
