"""
Unit Tests for AYUSHMAN-AI Time Series Demand Forecasting Model
"""

import unittest
import sys
import os

# Append ml_service to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../ml_service')))

from model import SupplyForecastModel

class TestSupplyForecastModel(unittest.TestCase):
    def setUp(self):
        self.model = SupplyForecastModel()
        # Pre-seed daily series of 14 points (2 full weeks)
        self.weekly_data = [100.0, 95.0, 90.0, 85.0, 110.0, 120.0, 105.0,
                             98.0, 92.0, 88.0, 83.0, 108.0, 118.0, 102.0]

    def test_forecast_values_bound(self):
        """Verify that forecasts never predict negative stock values."""
        steps = 7
        forecast, intervals = self.model.fit_predict_holt_winters(self.weekly_data, steps)
        
        self.assertEqual(len(forecast), steps)
        self.assertEqual(len(intervals), steps)
        
        for val in forecast:
            self.assertGreaterEqual(val, 0.0)

    def test_confidence_intervals(self):
        """Verify confidence intervals surround prediction values cleanly."""
        forecast, intervals = self.model.fit_predict_holt_winters(self.weekly_data, 5)
        
        for idx, val in enumerate(forecast):
            ci = intervals[idx]
            self.assertLessEqual(ci[0], val)
            self.assertGreaterEqual(ci[1], val)

    def test_linear_fallback_short_history(self):
        """Verify that linear trend fallback engages successfully on short data."""
        short_data = [50.0, 48.0, 46.0]
        forecast, intervals = self.model.fit_predict_holt_winters(short_data, 3)
        
        self.assertEqual(len(forecast), 3)
        self.assertLess(forecast[0], short_data[-1]) # descending trend check
        
if __name__ == '__main__':
    unittest.main()
