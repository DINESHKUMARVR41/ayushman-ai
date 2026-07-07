"""
AYUSHMAN-AI FastAPI Forecasting Microservice
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from model import SupplyForecastModel

app = FastAPI(
    title="AYUSHMAN-AI Machine Learning Forecasting Microservice",
    description="Time series models (Holt-Winters) predicting critical drug outages and stock depletions",
    version="1.0.0"
)

# Initialize model
forecaster = SupplyForecastModel()

class ForecastRequest(BaseModel):
    facility_id: str = Field(..., description="ID of the healthcare facility")
    item_id: str = Field(..., description="ID of the item inside inventory")
    item_name: str = Field(..., description="E.g., Paracetamol 500mg, Amoxicillin")
    history: List[float] = Field(..., description="Daily historical stock values list")
    steps: int = Field(default=7, description="Number of future days to forecast")

class DayForecast(BaseModel):
    day: int
    predicted_quantity: float
    confidence_lower: float
    confidence_upper: float

class ForecastResponse(BaseModel):
    facility_id: str
    item_name: str
    predictions: List[DayForecast]
    depletion_warning: bool
    estimated_outage_days: int

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ayushman-ai-ml-forecast"}

@app.post("/predict", response_model=ForecastResponse)
def predict_stock(req: ForecastRequest):
    if not req.history:
        raise HTTPException(status_code=400, detail="Historical stock list cannot be empty.")
    
    try:
        forecast_vals, conf_intervals = forecaster.fit_predict_holt_winters(req.history, req.steps)
        
        predictions = []
        depletion_warning = False
        estimated_outage_days = -1

        for idx, (val, ci) in enumerate(zip(forecast_vals, conf_intervals)):
            predictions.append(DayForecast(
                day=idx + 1,
                predicted_quantity=round(val, 2),
                confidence_lower=round(ci[0], 2),
                confidence_upper=round(ci[1], 2)
            ))
            
            # Check for critical outages (quantity drops below 50 units or 10% of start quantity)
            start_qty = req.history[-1]
            outage_threshold = min(50.0, start_qty * 0.1)
            if val <= outage_threshold and estimated_outage_days == -1:
                estimated_outage_days = idx + 1
                depletion_warning = True

        return ForecastResponse(
          facility_id=req.facility_id,
          item_name=req.item_name,
          predictions=predictions,
          depletion_warning=depletion_warning,
          estimated_outage_days=estimated_outage_days
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction internal error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
