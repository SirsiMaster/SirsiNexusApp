"""
SirsiNexus Analytics Platform

Advanced analytics and machine learning platform for cloud infrastructure optimization.
"""

__version__ = "0.7.9-alpha"
__author__ = "SirsiNexus Team"
__description__ = "AI-powered analytics platform for cloud infrastructure optimization"

# Module exports
from .src.anomaly.anomaly_detection import AnomalyDetector
from .src.forecasting.time_series_forecasting import TimeSeriesForecaster

__all__ = [
    "AnomalyDetector",
    "TimeSeriesForecaster",
]
