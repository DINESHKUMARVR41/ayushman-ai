/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Lightbulb, Check, X, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';
import Card from '../common/Card';
import { Recommendation } from '../../types';

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onApprove: (recId: string) => void;
  onReject: (recId: string) => void;
}

export default function RecommendationPanel({
  recommendations,
  onApprove,
  onReject
}: RecommendationPanelProps) {
  const [loadingMap, setLoadingMap] = useState<{ [id: string]: boolean }>({});

  const handleApproveClick = (recId: string) => {
    setLoadingMap(prev => ({ ...prev, [recId]: true }));
    setTimeout(() => {
      onApprove(recId);
      setLoadingMap(prev => ({ ...prev, [recId]: false }));
    }, 1200);
  };

  const pendingRecs = recommendations.filter(r => r.status === 'PENDING');
  const completedRecs = recommendations.filter(r => r.status !== 'PENDING');

  return (
    <Card className="border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden flex flex-col h-[400px] p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Lightbulb className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              AI Actionable Recommendations
            </h2>
          </div>
        </div>
        <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full">
          Gemini Agent v2.4
        </span>
      </div>

      {/* Recommendations Body Scroll */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-800 pr-3">
        {pendingRecs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 italic py-16">
            <Check className="h-8 w-8 text-emerald-400 border border-emerald-500/20 rounded-full p-1 bg-emerald-500/5 mb-2" />
            <p className="text-xs font-sans">All operational recommendations processed.</p>
          </div>
        ) : (
          pendingRecs.map((rec) => {
            const isLoading = loadingMap[rec.id];

            return (
              <div
                key={rec.id}
                className="border border-slate-800 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-4.5 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/10">
                      {rec.type === 'REDISTRIBUTE' ? 'RESOURCE REDISTRIBUTION' : 'STAFF REALLOCATION'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 mt-2 font-sans leading-snug">
                      Move <strong className="text-emerald-400">{rec.quantity} Units</strong> of <strong className="text-emerald-400">{rec.resourceType}</strong>
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      From {rec.sourceFacilityName} ➔ {rec.targetFacilityName}
                    </p>
                  </div>

                  {/* Confidence impact metric */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Utility score</div>
                    <div className="text-xs font-bold font-mono text-yellow-400 flex items-center justify-end space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>{rec.confidenceScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-[11px] leading-relaxed text-slate-300 font-sans italic">
                  "{rec.reasoning}"
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-end space-x-2 border-t border-slate-900 pt-3">
                  <button
                    disabled={isLoading}
                    onClick={() => onReject(rec.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 text-[10px] text-slate-400 font-mono font-bold transition disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Dismiss</span>
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={() => handleApproveClick(rec.id)}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold shadow-md shadow-emerald-950/20 transition disabled:opacity-40"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve & Execute</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* History / Completed Logs Section */}
        {completedRecs.length > 0 && (
          <div className="mt-6 border-t border-slate-800/60 pt-4 shrink-0">
            <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
              Action History (Audit Trail)
            </h4>
            <div className="space-y-2">
              {completedRecs.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between bg-slate-900/30 border border-slate-800/40 rounded-xl p-3 text-[10px] font-mono"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-300 truncate">
                      {rec.resourceType} Redistribution
                    </p>
                    <p className="text-slate-500 truncate">
                      {rec.sourceFacilityName} ➔ {rec.targetFacilityName}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    rec.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
