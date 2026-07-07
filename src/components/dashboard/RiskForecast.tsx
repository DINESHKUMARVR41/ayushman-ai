/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, HelpCircle, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';
import Card from '../common/Card';
import { PredictionData } from '../../types';

// Let's seed complete 14-day forecasts for Medicine and Patients count
const STOCK_FORECAST: PredictionData[] = [
  { date: 'Jul 07', actualStock: 350, forecastedStock: 350, confidenceIntervalUpper: 350, confidenceIntervalLower: 350, actualPatients: 45, forecastedPatients: 45 },
  { date: 'Jul 08', actualStock: 310, forecastedStock: 315, confidenceIntervalUpper: 335, confidenceIntervalLower: 295, actualPatients: 52, forecastedPatients: 50 },
  { date: 'Jul 09', actualStock: 280, forecastedStock: 285, confidenceIntervalUpper: 315, confidenceIntervalLower: 255, actualPatients: 64, forecastedPatients: 58 },
  { date: 'Jul 10', actualStock: 240, forecastedStock: 245, confidenceIntervalUpper: 285, confidenceIntervalLower: 205, actualPatients: 68, forecastedPatients: 65 },
  { date: 'Jul 11', actualStock: 190, forecastedStock: 195, confidenceIntervalUpper: 245, confidenceIntervalLower: 145, actualPatients: 71, forecastedPatients: 72 },
  { date: 'Jul 12', forecastedStock: 155, confidenceIntervalUpper: 215, confidenceIntervalLower: 95, forecastedPatients: 79 },
  { date: 'Jul 13', forecastedStock: 120, confidenceIntervalUpper: 190, confidenceIntervalLower: 50, forecastedPatients: 86 },
  { date: 'Jul 14', forecastedStock: 80, confidenceIntervalUpper: 160, confidenceIntervalLower: 10, forecastedPatients: 94 }, // Drops below critical threshold of 150!
  { date: 'Jul 15', forecastedStock: 50, confidenceIntervalUpper: 140, confidenceIntervalLower: 0, forecastedPatients: 102 },
  { date: 'Jul 16', forecastedStock: 35, confidenceIntervalUpper: 125, confidenceIntervalLower: 0, forecastedPatients: 110 },
  { date: 'Jul 17', forecastedStock: 25, confidenceIntervalUpper: 115, confidenceIntervalLower: 0, forecastedPatients: 115 },
  { date: 'Jul 18', forecastedStock: 20, confidenceIntervalUpper: 110, confidenceIntervalLower: 0, forecastedPatients: 120 },
  { date: 'Jul 19', forecastedStock: 15, confidenceIntervalUpper: 105, confidenceIntervalLower: 0, forecastedPatients: 125 },
  { date: 'Jul 20', forecastedStock: 10, confidenceIntervalUpper: 100, confidenceIntervalLower: 0, forecastedPatients: 130 }
];

export default function RiskForecast() {
  const [metric, setMetric] = useState<'STOCK' | 'PATIENTS'>('STOCK');

  return (
    <Card className="border border-slate-800 bg-slate-900/40 shadow-xl overflow-hidden flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-slate-800/80 pb-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-sans">
              AI Time-Series Operational Forecaster
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Prophet ML model predicting stock deficits 14 days ahead
            </p>
          </div>
        </div>

        {/* Forecast Metric Toggles */}
        <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-full mt-3 sm:mt-0">
          <button
            onClick={() => setMetric('STOCK')}
            className={`rounded-full px-3.5 py-1 text-[10px] font-mono font-bold transition-all ${
              metric === 'STOCK' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MEDICINE OUTAGE (SOH)
          </button>
          <button
            onClick={() => setMetric('PATIENTS')}
            className={`rounded-full px-3.5 py-1 text-[10px] font-mono font-bold transition-all ${
              metric === 'PATIENTS' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            PATIENT FLOW PATTERNS
          </button>
        </div>
      </div>

      {/* Main charting frame */}
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="95%">
          {metric === 'STOCK' ? (
            <AreaChart data={STOCK_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(168, 85, 247)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="rgb(168, 85, 247)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(168, 85, 247, 0.08)" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="rgba(168, 85, 247, 0.08)" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              
              {/* Confidence margin block */}
              <Area
                name="Prediction Bounds (95% CI)"
                type="monotone"
                dataKey="confidenceIntervalUpper"
                stroke="none"
                fill="url(#colorConfidence)"
                fillOpacity={0.5}
              />
              <Area
                name="Confidence Interval Floor"
                type="monotone"
                dataKey="confidenceIntervalLower"
                stroke="none"
                fill="url(#colorConfidence)"
                fillOpacity={0.5}
              />

              {/* Forecast and Actual values */}
              <Area
                name="ML Stock Forecast"
                type="monotone"
                dataKey="forecastedStock"
                stroke="#a855f7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorStock)"
              />
              <Line
                name="Actual Recorded Stock"
                type="monotone"
                dataKey="actualStock"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={STOCK_FORECAST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontFamily: 'monospace' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
              
              <Line
                name="Forecast Influx"
                type="monotone"
                dataKey="forecastedPatients"
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                name="Actual Inpatients Today"
                type="monotone"
                dataKey="actualPatients"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        {/* Prediction overlay banner */}
        <div className="absolute top-1 right-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded px-2 py-0.5 text-[9px] font-mono flex items-center space-x-1">
          <TrendingUp className="h-3 w-3 shrink-0" />
          <span>Confidence Score: <strong>94.2% (RMSLE: 0.015)</strong></span>
        </div>
      </div>
    </Card>
  );
}
