# AYUSHMAN-AI: System Architecture Diagram & Data Flow

This document details the multi-tier architectural framework of **AYUSHMAN-AI: AI-Powered District Health Command Center**, designed to operate in high-scale, low-bandwidth, and offline-first situations.

## Architecture Overview

```text
               ┌────────────────────────────────────────────────────────┐
               │              AYUSHMAN-AI FRONT-END CLIENTS             │
               └───────────────────┬────────────────────────┬───────────┘
                                   │                        │
         [REST / WebSockets]       │                        │ [Direct Cloud Firestore Sync]
         (JSON / Secure Tokens)    │                        │ (Online Mode Real-time)
                                   ▼                        ▼
  ┌─────────────────────────────────┐              ┌───────────────────────────┐
  │      REACT WEB DASHBOARD        │              │  FLUTTER MOBILE CLIENTS   │
  │  (District Admin Command Panel) │              │   (Frontline Workers App) │
  └────────────────┬────────────────┘              └────────────┬──────────────┘
                   │                                            │ (SQLCipher Cache)
                   │                                            ▼
                   │                               ┌───────────────────────────┐
                   │                               │   OFFLINE SQLite CACHE    │
                   │                               │  (Auto-sync when Online)  │
                   │                               └───────────────────────────┘
                   ▼
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                      REST API GATEWAY & APP SERVICE                        │
  │               (Node.js / Express + TypeScript Server)                      │
  └────────┬─────────────────────────────┬──────────────────────────────┬──────┘
           │                             │                              │
           │ [Admin/Auth Checks]         │ [Proxy Prediction Queries]   │ [SDK API Calls]
           ▼                             ▼                              ▼
┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
│    FIREBASE AUTH   │         │ FASTAPI ML ENGINE  │         │   GEMINI AI API    │
│  (Secure Identity) │         │ (Prophet & Forest) │         │ (Decision Support) │
└────────────────────┘         └────────────────────┘         └────────────────────┘
                                         │                              │
                                         └───────────────┬──────────────┘
                                                         ▼
                                       ┌───────────────────────────────────┐
                                       │   CLOUD FIRESTORE DB (NoSQL)      │
                                       │ (Realtime Sync & Cloud Functions) │
                                       └───────────────────────────────────┘
```

## Architectural Components

### 1. Presentation & Client-Side Layer
*   **React Command Center (Web)**: Single-Page Application (SPA) designed with Material UI/Tailwind styling. This handles live updates from Firestore, displays heatmaps, tracks bed allocations, and provides an interface for administrative stock redistribution.
*   **Flutter Offline-First Client (Mobile)**: Multi-platform operational tool for PHC (Primary Health Center) workers. Utilizes standard repository patterns combined with Drift (SQLite) to queue updates locally, ensuring zero data loss during network dropouts. Integrates localized text-to-speech, multilingual audio input, and rapid QR code medicine scan pipelines.

### 2. Application Services & Middleware
*   **Gateway Controller (Express Node.js)**: Runs central security controls (Rate Limiters, Role-Based Access controls), signs telemetry/audit logs, aggregates reports, and coordinates API relays.
*   **Firebase Authentication Engine**: Implements standard OpenID Connect (OIDC) identity flows, ensuring roles (Admin vs. Field Operator) are cryptographically enforced in all read/write paths.

### 3. Core ML Predictive Service
*   **FastAPI Pipeline (Python)**:
    *   **Prophet / LSTM Forecaster**: Evaluates historical trends to predict medicine outages 14 days in advance and models patient influx.
    *   **Isolation Forest Model**: Continuously scans incoming operational streams for reporting anomalies, attendance patterns, and stock usage spikes.
    *   **Triage Matrix Engine**: Performs risk-scoring calculations and exposes endpoints for optimization algorithms.
*   **Google Gemini API integrations**: Generates natural language insights, localized diagnostic support, and contextual stock redistribution commands.

### 4. Live Storage & Synchronization
*   **Cloud Firestore Database**: NoSQL structure built with reactive triggers. Provides real-time event listeners to push instant anomaly notifications down to client interfaces.
