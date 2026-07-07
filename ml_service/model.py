"""
AYUSHMAN-AI Time Series Demand Forecasting Engine
Model: SARIMAX / Triple Exponential Smoothing (Holt-Winters)
"""

import numpy as np
import pandas as pd
from typing import List, Tuple, Dict

class SupplyForecastModel:
    def __init__(self):
        # Default smoothing constants
        self.alpha = 0.3  # level smoothing
        self.beta = 0.2   # trend smoothing
        self.gamma = 0.4  # seasonal smoothing
        self.season_length = 7  # weekly seasonal patterns

    def fit_predict_holt_winters(self, historical_series: List[float], steps: int) -> Tuple[List[float], List[List[float]]]:
        """
        Fits Holt-Winters exponential smoothing on historical daily medical stock counts
        and forecasts stock levels over the requested future steps with 95% confidence intervals.
        """
        n = len(historical_series)
        if n < self.season_length * 2:
            # Fallback to simple linear regression if history is insufficient
            return self._linear_fallback(historical_series, steps)

        # Initialize seasonal components
        seasonals = self._init_seasonal_components(historical_series)
        
        # Initial level and trend estimates
        level = sum(historical_series[:self.season_length]) / self.season_length
        trend = (sum(historical_series[self.season_length:self.season_length*2]) - sum(historical_series[:self.season_length])) / (self.season_length ** 2)

        levels = [level]
        trends = [trend]
        
        # Fit phase
        for i in range(n):
            val = historical_series[i]
            last_level = level
            
            # Holt-Winters updates
            level = self.alpha * (val - seasonals[i % self.season_length]) + (1 - self.alpha) * (level + trend)
            trend = self.beta * (level - last_level) + (1 - self.beta) * trend
            seasonals[i % self.season_length] = self.gamma * (val - level) + (1 - self.gamma) * seasonals[i % self.season_length]
            
            levels.append(level)
            trends.append(trend)

        # Forecast phase
        forecast_values = []
        confidence_intervals = []
        
        # Calculate residuals variance to scale confidence bounds
        residuals = []
        for i in range(n):
            fitted = levels[i] + trends[i] + seasonals[i % self.season_length]
            residuals.append(historical_series[i] - fitted)
        std_error = np.std(residuals) if len(residuals) > 0 else (level * 0.1)

        for m in range(1, steps + 1):
            f_val = level + m * trend + seasonals[(n + m - 1) % self.season_length]
            # Ensure stock does not fall below zero
            f_val = max(0.0, float(f_val))
            forecast_values.append(f_val)
            
            # Confidence interval scaling with step uncertainty multiplier
            uncertainty = std_error * np.sqrt(m)
            lower_bound = max(0.0, float(f_val - 1.96 * uncertainty))
            upper_bound = float(f_val + 1.96 * uncertainty)
            confidence_intervals.append([lower_bound, upper_bound])

        return forecast_values, confidence_intervals

    def _init_seasonal_components(self, series: List[float]) -> List[float]:
        """Calculates seasonal averages for the baseline indices."""
        seasonals = []
        for i in range(self.season_length):
            # average of values at the same weekday index
            sum_val = 0.0
            count = 0
            for j in range(i, len(series), self.season_length):
                sum_val += series[j]
                count += 1
            seasonals.append(sum_val / count if count > 0 else series[i])
        return seasonals

    def _linear_fallback(self, series: List[float], steps: int) -> Tuple[List[float], List[List[float]]]:
        """Simple linear trend fallback for short datasets."""
        n = len(series)
        x = np.arange(n)
        y = np.array(series)
        
        if n > 1:
            slope, intercept = np.polyfit(x, y, 1)
        else:
            slope = 0.0
            intercept = series[0] if n == 1 else 100.0

        forecast_values = []
        confidence_intervals = []
        std_dev = np.std(series) if n > 1 else 10.0
        
        for m in range(1, steps + 1):
            f_val = max(0.0, float(slope * (n + m - 1) + intercept))
            forecast_values.append(f_val)
            lower_bound = max(0.0, float(f_val - 1.96 * std_dev * np.sqrt(m)))
            upper_bound = float(f_val + 1.96 * std_dev * np.sqrt(m))
            confidence_intervals.append([lower_bound, upper_bound])
            
        return forecast_values, confidence_intervals
