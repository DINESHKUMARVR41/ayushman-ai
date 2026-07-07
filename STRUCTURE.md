# AYUSHMAN-AI: Directory & Folder Structure Roadmap

This document outlines the complete, production-ready directory structure for **AYUSHMAN-AI: AI-Powered District Health Command Center**. Every file and folder is aligned with Clean Architecture, SOLID principles, and enterprise-grade scalability.

```text
ayushman-ai/
├── .env.example                      # Global environment variable configurations
├── .gitignore                        # Global ignore files for Node, Python, and Flutter
├── index.html                        # React Single Page Entrypoint
├── metadata.json                     # AI Studio metadata
├── package.json                      # Full-stack monorepo package configuration
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite compilation & HMR configuration
│
├── server.ts                         # Custom Full-Stack Express Server (API and Vite hosting)
│
├── src/                              # React District Dashboard & Frontline Worker Portal
│   ├── main.tsx                      # Frontend Entrypoint
│   ├── index.css                     # Global styles with Tailwind CSS @import
│   ├── types.ts                      # Shared TypeScript Interfaces, Enums, and Types
│   │
│   ├── components/                   # Modular, Reusable Tailwind CSS Components
│   │   ├── common/                   # Shared UI (Buttons, Modals, Cards, Loaders)
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/                # Admin Command Center Panels
│   │   │   ├── MapWidget.tsx         # Google Maps / SVG Heatmap visualization
│   │   │   ├── KPIStats.tsx          # Real-time summary figures (Beds, Stock, Alert count)
│   │   │   ├── RiskForecast.tsx      # Time-series analytics with AI prediction overlays
│   │   │   ├── InventoryTracker.tsx  # Dynamic stock monitoring and reallocation controls
│   │   │   ├── FacilityList.tsx      # Detailed tabular view of PHCs and CHCs
│   │   │   └── RecommendationPanel.tsx # LLM-based actionable suggestions
│   │   ├── worker/                   # Portal for simulated frontline offline tasks
│   │   │   ├── StockUpdateForm.tsx
│   │   │   ├── VoiceInputHandler.tsx
│   │   │   └── SyncManager.tsx
│   │   └── ui/                       # Accessible interactive controls (MUI / Radix-like)
│   │
│   └── lib/                          # Client-side configuration and helpers
│       ├── firebase.ts               # Firebase Client initialization (Firestore & Auth)
│       └── utils.ts                  # Classnames merger and common helpers
│
├── flutter_app/                      # Cross-Platform Flutter Client App (Clean Architecture)
│   ├── android/                      # Native Android configuration files
│   ├── ios/                          # Native iOS configuration files
│   ├── assets/                       # Local assets, icons, fonts, and localization files
│   │   └── lang/                     # Multilingual Translation Files
│   │       ├── en.json               # English Translations
│   │       ├── hi.json               # Hindi (हिन्दी) Translations
│   │       └── ta.json               # Tamil (தமிழ்) Translations
│   │
│   └── lib/                          # Flutter Source Code
│       ├── main.dart                 # Flutter App Entrypoint
│       │
│       ├── core/                     # Shared system frameworks and configurations
│       │   ├── theme/                # Material Design 3 color schemes and typography
│       │   ├── network/              # REST Client, WebSocket client, FCM setups
│       │   ├── database/             # SQLite / Drift offline database local cache
│       │   └── error/                # Exception definitions and custom failures
│       │
│       ├── data/                     # Data Access Layer (Repositories, Models, DataSources)
│       │   ├── datasources/          # Data fetchers
│       │   │   ├── local_datasource.dart   # Local SQLite database provider
│       │   │   └── remote_datasource.dart  # Remote REST/Firestore provider
│       │   ├── models/               # Model classes with JSON serialization/deserialization
│       │   │   ├── facility_model.dart
│       │   │   ├── inventory_model.dart
│       │   │   └── attendance_model.dart
│       │   └── repositories/         # Repository Implementations
│       │       └── health_repository_impl.dart
│       │
│       ├── domain/                   # Business Logic Layer (Entities, Repositories definitions, Use Cases)
│       │   ├── entities/             # Plain Dart Domain Entities
│       │   │   ├── facility.dart
│       │   │   ├── inventory.dart
│       │   │   └── attendance.dart
│       │   ├── repositories/         # Abstract Interfaces
│       │   │   └── health_repository.dart
│       │   └── usecases/             # Executable Business Interactors (SOLID UseCases)
│       │       ├── get_facilities.dart
│       │       ├── update_inventory.dart
│       │       └── sync_offline_data.dart
│       │
│       └── presentation/             # Presentation Layer (UI Screens & Riverpod States)
│           ├── providers/            # Riverpod State Notifier Providers
│           │   ├── inventory_provider.dart
│           │   ├── sync_provider.dart
│           │   └── auth_provider.dart
│           └── screens/              # Material 3 Responsive UI Screens
│               ├── login_screen.dart
│               ├── worker_dashboard.dart
│               ├── medicine_stock_screen.dart
│               └── qr_scanner_screen.dart
│
├── ml_service/                       # Python FastAPI Machine Learning Predictive Engine
│   ├── Dockerfile                    # Containerization for ML microservice
│   ├── main.py                       # FastAPI application router and app hooks
│   ├── requirements.txt              # ML library dependencies (Prophet, scikit-learn, FastAPI)
│   │
│   ├── models/                       # Pre-trained serialize/deserialize weights & configurations
│   │   ├── prophet_forecaster.py     # Prophet time-series predictor for stocks & patient counts
│   │   ├── isolation_forest.py       # Anomaly detection for resource abuse/sudden spikes
│   │   └── risk_scorer.py            # Decision Matrix / XGBoost scoring for facility triage
│   │
│   └── api/                          # FastAPI route controllers and data schema validators
│       ├── routes.py                 # Core forecasting & anomaly endpoints
│       └── schemas.py                # Pydantic data models for request/response validation
│
└── firebase/                         # Firebase Deployment & Rules Config
    ├── firestore.rules               # Enterprise-grade secure access rules
    ├── firebase-blueprint.json       # Blueprint schemas for initial collection setup
    └── firebase.json                 # Firebase configuration map
```
