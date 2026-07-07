/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, AlertTriangle, HelpCircle, Milestone, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import { Facility, Alert } from '../../types';

interface KPIStatsProps {
  facilities: Facility[];
  alerts: Alert[];
}

export default function KPIStats({ facilities, alerts }: KPIStatsProps) {
  const totalClinics = facilities.length;
  
  // Calculate average attendance rate
  const totalDoctors = facilities.reduce((sum, f) => sum + f.doctorCount, 0);
  const presentDoctors = facilities.reduce((sum, f) => sum + f.doctorAttendance, 0);
  const attendanceRate = totalDoctors > 0 ? Math.round((presentDoctors / totalDoctors) * 100) : 0;

  // Calculate Bed occupancy rate
  const totalBeds = facilities.reduce((sum, f) => sum + f.bedsTotal, 0);
  const occupiedBeds = facilities.reduce((sum, f) => sum + f.bedsOccupied, 0);
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Facilities */}
      <Card className="border border-slate-800/80 bg-slate-900/40 p-4.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            Monitored Facilities
          </p>
          <p className="text-2xl font-bold font-sans text-slate-100 mt-1">
            {totalClinics} <span className="text-xs font-normal text-slate-500">PHCs / CHCs</span>
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span>100% telemetry online</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
          <Milestone className="h-5 w-5" />
        </div>
      </Card>

      {/* Doctor Presence */}
      <Card className="border border-slate-800/80 bg-slate-900/40 p-4.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            Doctor Presence Today
          </p>
          <p className="text-2xl font-bold font-sans text-slate-100 mt-1">
            {attendanceRate}%
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
            <span>{presentDoctors} of {totalDoctors} duty doctors present</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
          <Users className="h-5 w-5" />
        </div>
      </Card>

      {/* Bed Occupancy Rate */}
      <Card className="border border-slate-800/80 bg-slate-900/40 p-4.5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            Bed Occupancy Rate
          </p>
          <p className="text-2xl font-bold font-sans text-slate-100 mt-1">
            {bedOccupancyRate}%
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[10px] text-blue-400 font-mono">
            <span>{totalBeds - occupiedBeds} available bed assets</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
          <Milestone className="h-5 w-5 animate-pulse" />
        </div>
      </Card>

      {/* Critical Stock alerts */}
      <Card className={`border p-4.5 flex items-center justify-between transition-colors duration-300 ${
        criticalAlerts > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-slate-800/80 bg-slate-900/40'
      }`}>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
            Active Stock / Operational Alerts
          </p>
          <p className={`text-2xl font-bold font-sans mt-1 ${criticalAlerts > 0 ? 'text-red-400' : 'text-slate-100'}`}>
            {criticalAlerts} <span className="text-xs font-normal text-slate-500">critical</span>
          </p>
          <div className="mt-2 flex items-center space-x-1 text-[10px] font-mono">
            {criticalAlerts > 0 ? (
              <span className="text-red-400 animate-pulse">Needs immediate intervention</span>
            ) : (
              <span className="text-emerald-400">All facility metrics safe</span>
            )}
          </div>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-inner ${
          criticalAlerts > 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/55'
        }`}>
          <AlertTriangle className={`h-5 w-5 ${criticalAlerts > 0 ? 'animate-bounce' : ''}`} />
        </div>
      </Card>
    </div>
  );
}
