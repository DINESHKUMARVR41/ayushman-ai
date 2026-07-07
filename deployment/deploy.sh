#!/bin/bash
# AYUSHMAN-AI Multi-Service Deployment Orchestrator
# Targets: Google Cloud Run (Containerized Microservices)

set -e

# Configuration
PROJECT_ID="ayushman-ai-prod"
REGION="asia-southeast1"
APP_SERVICE="ayushman-ai-fullstack"
ML_SERVICE="ayushman-ai-ml"
GEMINI_SECRET_NAME="GEMINI_API_KEY"

echo "=========================================================="
echo " Starting AYUSHMAN-AI Cloud Run Deployment Sequence"
echo "=========================================================="

# Ensure GCloud SDK is authenticated
if ! command -v gcloud &> /dev/null; then
    echo "Error: Google Cloud SDK (gcloud) is not installed."
    exit 1
fi

echo "Step 1: Setting default project scope to $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

echo "Step 2: Activating required Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com

echo "Step 3: Building & Deploying Python ML Forecasting Microservice..."
cd ml_service
gcloud builds submit --tag "gcr.io/$PROJECT_ID/$ML_SERVICE:latest"
gcloud run deploy "$ML_SERVICE" \
    --image "gcr.io/$PROJECT_ID/$ML_SERVICE:latest" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 8000
    
# Capture deployed ML URL
ML_URL=$(gcloud run services describe "$ML_SERVICE" --platform managed --region "$REGION" --format 'value(status.url)')
echo "ML service deployed successfully at: $ML_URL"
cd ..

echo "Step 4: Building & Deploying React/Express Fullstack Portal..."
gcloud builds submit --tag "gcr.io/$PROJECT_ID/$APP_SERVICE:latest"
gcloud run deploy "$APP_SERVICE" \
    --image "gcr.io/$PROJECT_ID/$APP_SERVICE:latest" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --port 3000 \
    --set-env-vars "NODE_ENV=production,ML_SERVICE_URL=$ML_URL" \
    --set-secrets "GEMINI_API_KEY=${GEMINI_SECRET_NAME}:latest"

FULLSTACK_URL=$(gcloud run services describe "$APP_SERVICE" --platform managed --region "$REGION" --format 'value(status.url)')

echo "=========================================================="
echo " AYUSHMAN-AI CLOUD DEPLOYMENT COMPLETED!"
echo "=========================================================="
echo "  - Fullstack Dashboard: $FULLSTACK_URL"
echo "  - Forecasting Engine: $ML_URL"
echo "=========================================================="
