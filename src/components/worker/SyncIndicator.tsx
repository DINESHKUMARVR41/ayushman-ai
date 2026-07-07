/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Wifi, WifiOff, CloudLightning, RefreshCw, Layers, Database } from 'lucide-react';
import Card from '../common/Card';
import { Language } from '../../types';

interface SyncIndicatorProps {
  currentLang: Language;
  isOnline: boolean;
  onToggleOnline: (online: boolean) => void;
  pendingCount: number;
  onFlushSync: () => void;
  syncHistory: string[];
}

export default function SyncIndicator({
  currentLang,
  isOnline,
  onToggleOnline,
  pendingCount,
  onFlushSync,
  syncHistory
}: SyncIndicatorProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSyncClick = () => {
    setSyncing(true);
    setTimeout(() => {
      onFlushSync();
      setSyncing(false);
    }, 1500);
  };

  return (
    <Card className="border border-slate-800/70 bg-slate-950/40 shadow-lg relative overflow-hidden">
      {/* Background visual details */}
      <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
        <Database className="h-28 w-28 text-emerald-400" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Layers className="h-4.5 w-4.5 text-emerald-400" />
          <h3 className="text-sm font-semibold tracking-wide text-slate-100 font-sans">
            {currentLang === 'en' ? 'Offline-First Queue Sync' : currentLang === 'hi' ? 'ऑफलाइन-फर्स्ट कतार सिंक' : 'ஆஃப்லைன்-முன்னணி வரிசை ஒத்திசைவு'}
          </h3>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
          SQLite Cache Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Connection Toggle & Queue Details */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border border-slate-800 bg-slate-900/40 rounded-xl p-3.5 mb-3">
              <div className="flex items-center space-x-2.5">
                {isOnline ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wifi className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                    <WifiOff className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    {isOnline ? 'Network Connection: ONLINE' : 'Network Connection: OFFLINE'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {isOnline ? 'Updates sync instantly to Cloud Firestore' : 'Updates saved to local SQLite db queue'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggleOnline(!isOnline)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                  isOnline
                    ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-400">Pending offline transactions queue:</span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${pendingCount > 0 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                {pendingCount} records
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncClick}
            disabled={pendingCount === 0 || syncing || !isOnline}
            className="w-full flex items-center justify-center space-x-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold py-2.5 rounded-xl transition shadow-md shadow-emerald-950/20 disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing SQLite Cache...' : 'Flush & Sync Local Queue'}</span>
          </button>
        </div>

        {/* Sync / Update History logs */}
        <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-3 flex flex-col h-40">
          <p className="text-[11px] text-slate-400 font-mono mb-2 flex items-center space-x-1 border-b border-slate-800/80 pb-1.5 shrink-0">
            <CloudLightning className="h-3 w-3 text-emerald-400" />
            <span>LOCAL LOG STREAM</span>
          </p>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[10px] font-mono scrollbar-thin scrollbar-thumb-slate-800">
            {syncHistory.length === 0 ? (
              <p className="text-slate-500 italic p-2 text-center">No queue events logged.</p>
            ) : (
              syncHistory.map((log, index) => (
                <div key={index} className="text-slate-300 border-l border-slate-800 pl-2 py-0.5 leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
