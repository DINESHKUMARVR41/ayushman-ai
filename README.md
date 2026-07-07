# 🏥 AYUSHMAN-AI (आयुष्मान-AI)
### Cross-Platform Offline-First Clinical Log & Generative Redistribution Network

> **Google AI Studio Build Hackathon MVP Submission**  
> *Empowering remote Primary Health Centers (PHCs) with offline-first synchronization, ambient AI voice logging, and generative regional asset-matching pipelines.*

---

## 🌟 Executive Vision & Key Features

AYUSHMAN-AI addresses severe drug outages, vaccine storage failures, and staff deficits in rural healthcare grids. By bridging the digital gap in poor connectivity zones, this system ensures that remote clinics are never left stranded.

1. **Hands-Free AI Voice Logging (Express + Gemini API)**: Medical workers speak naturally to report inventory status. The server extracts intent, items, and quantities using Gemini models (with smart regex fallbacks if offline).
2. **Offline-First Synchronization (Flutter + SQLite)**: Clinicians in no-signal terrain log patient flows and barcode-scanned medicine kits. The system queues transactions in a secure local database, auto-syncing when web connections resume.
3. **Interactive GIS Dashboard (React + Tailwind + Lucide)**: Regional health ministers monitor live heatmaps of critical stocks, occupancies, and medical attendance across scattered regional centers.
4. **Generative Supply Redistribution (Gemini AI)**: Instead of passive warnings, the engine actively pairs centers with surpluses (e.g., vaccine stockpiles) to struggling centers in critical stockouts, providing transfer orders with explanation logs.
5. **Predictive Outage Forecasting (FastAPI + Holt-Winters)**: A time-series forecasting model predicts drug depletions 7 days in advance, alerting authorities *before* stockouts happen.

---

## 🧱 Technical System Architecture

```text
                                  +---------------------------------------+
                                  |      AYUSHMAN-AI WEB PORTAL           |
                                  | (React + Tailwind CSS + Recharts GIS) |
                                  +-------------------+-------------------+
                                                      | (REST / REST API)
                                                      v
  +-----------------------+       +-------------------+-------------------+
  |  CLINICIAN FLUTTER    |       |      EXPRESS FULL-STACK SERVER        |
  |  (Offline-First App)  | ----> |      (Vite Dev + Production Asset)    |
  |  [Sqflite + SQLite]   |       +----------+-----------------+----------+
  +-----------------------+                  |                 |
                                             |                 | (Gemini SDK API)
                                             v                 v
                                  +----------+--------+   +----+------------------+
                                  | PYTHON ML SERVICE |   |  GOOGLE GEMINI 2.5    |
                                  | (FastAPI Forecasting) | |  (Recommendation Engine|
                                  +-------------------+   +-----------------------+
```

### Module Directories
- `/src/` - Production React dashboard components, interactive map displays, and Recharts forecasts.
- `/server.ts` - Production-ready Express full-stack backend serving API routes and bundling Vite assets.
- `/flutter_app/` - Production-grade Dart codebase containing local-first SQLite queues and visual scanner interfaces.
- `/ml_service/` - FastAPI service utilizing triple exponential smoothing algorithms for depletion forecast calculations.
- `/firebase/` - Secure Firestore database configuration, rules, and blueprints.
- `/tests/` - Native unit testing frameworks for Python forecasting algorithms and TypeScript backend end-points.

---

## 🔌 API Specifications (Module 14)

### 1. Stock Status Update
*Updates current stock-on-hand for specified medication and dynamically generates alerts on buffer violations.*
- **Endpoint**: `POST /api/inventory/update`
- **Payload**:
```json
{
  "facilityId": "FAC001",
  "itemName": "Paracetamol 500mg",
  "category": "Essential Medicine",
  "quantity": 120,
  "unit": "Tablets",
  "operatorEmail": "clinician.rampur@ayushman.gov.in"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "item": {
    "id": "INV001",
    "facilityId": "FAC001",
    "itemName": "Paracetamol 500mg",
    "quantity": 120,
    "minRequired": 500,
    "lastUpdated": "2026-07-07T01:19:53Z"
  }
}
```

---

### 2. Hands-Free Voice Logger
*Processes spoken health logs using Google Gemini 2.5 Flash models to infer structured update fields.*
- **Endpoint**: `POST /api/voice`
- **Payload**:
```json
{
  "transcript": "We just recorded 50 vials of anti-rabies vaccine here at Rampur center",
  "facilityId": "FAC001"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "speechOutput": "Voice report received: updating Anti-Rabies Vaccines to 50 Vials at PHC Rampur.",
  "actionPayload": {
    "action": "UPDATE",
    "item": "Anti-Rabies Vaccines",
    "quantity": 50,
    "category": "Vaccine",
    "unit": "Vials"
  }
}
```

---

### 3. Generative Asset Reallocation Action
*Executes the transfer of critical drugs or staff reassignments between facilities, logging the change in audit trails.*
- **Endpoint**: `POST /api/recommendations/action`
- **Payload**:
```json
{
  "recommendationId": "REC001",
  "action": "APPROVED",
  "operatorEmail": "admin@ayushman.gov.in"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "recommendation": {
    "id": "REC001",
    "status": "APPROVED",
    "impactScore": 94
  }
}
```

---

### 4. Offline Queue Sync Proxy
*Saves batch queues logged offline in rural health center local SQLite files.*
- **Endpoint**: `POST /api/sync`
- **Payload**:
```json
{
  "queue": [
    {
      "facilityId": "FAC001",
      "itemName": "Paracetamol 500mg",
      "quantity": 400,
      "timestamp": "2026-07-07T01:12:00Z"
    }
  ]
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "processedCount": 1
}
```

---

## 📊 ML Forecasting Engine Formulation

Our ML forecasting engine operates on a **Holt-Winters Triple Exponential Smoothing** approach with multiplicative seasonal parameters:

$$\hat{y}_{t+h\mid t} = (\ell_t + h b_t) s_{t+h-m(k+1)}$$

Where:
- $\ell_t$ is the level smoothing equation.
- $b_t$ is the trend smoothing factor.
- $s_t$ represents the cyclical seasonal index (e.g., weekly cycles for hospital admission surges).

We establish **confidence bounds** using the cumulative standard error of regression residuals scaled across forecast horizons ($h$):

$$\text{Confidence Interval} = \hat{y}_{t+h} \pm z_{1-\alpha/2} \cdot \sigma_e \sqrt{h}$$

This allows regional health boards to spot stock depletion trends up to 7 days in advance.

---

## 🚀 Presentation & Live Demo Guide (Module 15)

Follow this step-by-step walkthrough script for a 3-minute hackathon pitch:

### Phase 1: The Offline Clinician Experience
1. **The Scenario**: "Imagine you are a medical worker at PHC Rampur, with absolutely zero network connectivity."
2. **Action**: Open the offline client simulation panel. Toggle the Connection status to **OFFLINE** (the interface turns amber to indicate offline SQLite caching is active).
3. **Voice Update**: Press the **AI Voice Assistant** mic button. In the simulated voice prompt, say:
   - *"Log 22 vials of rabies vaccine."*
   - Note how the local SQLite transaction logs queue instantly.
4. **Barcode Sweep**: Navigate to the **Barcode Scanner**. Tap *Trigger Laser Scan Simulation*. Notice how the scanner sweep turns green, registers the new medicine batch, and appends it to the SQLite queue.
5. **Reconnection**: Toggle the connection switch to **ONLINE**. The connection logs stream automatically and dispatch the queued updates to the central cloud dashboard.

### Phase 2: Regional Command Center Analytics
1. **State Observation**: Point out the live GIS map. PHC Rampur is flashing red due to a critical medicine shortage.
2. **Examine Forecasts**: Scroll down to the **Demand Forecasting Panel**. Point to the Holt-Winters predictive area charts predicting exactly when stock will drop to zero.
3. **Approve Action**: View the **AI Redistribution Panel**. Gemini AI has automatically paired the Rampur stockout with CHC Bilaspur's surplus:
   - *Recommendation: Transfer 1,500 tablets of Paracetamol from Bilaspur to Rampur (Predicted impact: 94% improvement).*
4. **The Resolution**: Tap **Approve Transfer**. Watch the map update in real-time, changing PHC Rampur's indicator from critical red to stable green as stocks are reallocated!

---

## 🛠️ Local Developer Commands

### 1. Run the Full-Stack Application
```bash
# Install core dependencies
npm install

# Boot development portal and Express API proxy
npm run dev
```

### 2. Run the Machine Learning Microservice
```bash
cd ml_service
pip install -r requirements.txt
python main.py
```

### 3. Run Automated Quality Controls & Linting
```bash
# Execute TypeScript syntax validation
npm run lint

# Run Express backend tests
npx tsx tests/api_test.ts

# Run Python forecasting unit tests
python tests/model_test.py
```
