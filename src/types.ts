/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'WORKER';

export type Language = 'en' | 'hi' | 'ta';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facilityId?: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC';
  block: string;
  lat: number;
  lng: number;
  doctorCount: number;
  doctorAttendance: number; // Present today
  bedsTotal: number;
  bedsOccupied: number;
  riskScore: number; // 0 to 100
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface InventoryItem {
  id: string;
  facilityId: string;
  medicineName: string;
  category: 'Antibiotic' | 'Analgesic' | 'Vaccine' | 'Antiviral' | 'IV Fluid';
  stockOnHand: number;
  minimumRequired: number;
  daysOfStockLeft: number; // calculated
  lastUpdated: string;
}

export interface PatientFlow {
  id: string;
  facilityId: string;
  date: string;
  outpatientCount: number;
  inpatientCount: number;
  emergencyCount: number;
}

export interface Alert {
  id: string;
  facilityId: string;
  facilityName: string;
  type: 'STOCK_OUT' | 'DOCTOR_SHORTAGE' | 'BED_OVERFLOW' | 'PATIENT_SURGE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface Recommendation {
  id: string;
  type: 'REDISTRIBUTE' | 'DISPATCH_DOCTOR' | 'ALLOCATE_BEDS';
  sourceFacilityId?: string;
  sourceFacilityName?: string;
  targetFacilityId: string;
  targetFacilityName: string;
  resourceType: string;
  quantity: number;
  reasoning: string;
  confidenceScore: number; // percentage
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface PredictionData {
  date: string;
  actualStock?: number;
  forecastedStock: number;
  actualPatients?: number;
  forecastedPatients: number;
  confidenceIntervalUpper: number;
  confidenceIntervalLower: number;
}
