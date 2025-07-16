"""
SirsiNexus Elite Phase 3 - Advanced Time Series Forecasting Engine
=================================================================

Advanced forecasting capabilities with multiple models:
- Prophet for seasonal cost patterns
- ARIMA for resource utilization trends  
- Gaussian processes for uncertainty quantification
- Multi-variate forecasting for complex scenarios
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Union
import warnings
warnings.filterwarnings('ignore')

# Core forecasting libraries
try:
    from prophet import Prophet
    from prophet.plot import add_changepoints_to_plot
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("Prophet not available. Install with: pip install prophet")

try:
    from statsmodels.tsa.arima.model import ARIMA
    from statsmodels.tsa.seasonal import seasonal_decompose
    from statsmodels.tsa.stattools import adfuller
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
    print("Statsmodels not available. Install with: pip install statsmodels")

try:
    from sklearn.gaussian_process import GaussianProcessRegressor
    from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ExpSineSquared
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available. Install with: pip install scikit-learn")

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TimeSeriesForecastingEngine:
    """
    Advanced time series forecasting engine with multiple algorithms
    and uncertainty quantification for SirsiNexus cloud operations.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the forecasting engine with configuration."""
        self.config = config or {}
        self.models = {}
        self.scalers = {}
        self.forecasts = {}
        self.metrics = {}
        
        # Default forecasting parameters
        self.default_forecast_horizon = 30  # days
        self.confidence_intervals = [0.8, 0.95]  # 80% and 95% CI
        
        logger.info("TimeSeriesForecastingEngine initialized")
    
    def preprocess_data(self, data: pd.DataFrame, 
                       date_col: str = 'ds', 
                       target_col: str = 'y') -> pd.DataFrame:
        """
        Preprocess time series data for forecasting.
        
        Args:
            data: DataFrame with time series data
            date_col: Name of the date column
            target_col: Name of the target variable column
            
        Returns:
            Preprocessed DataFrame
        """
        df = data.copy()
        
        # Convert date column to datetime
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Sort by date
        df = df.sort_values(date_col).reset_index(drop=True)
        
        # Remove duplicates
        df = df.drop_duplicates(subset=[date_col])
        
        # Fill missing values with forward fill
        df[target_col] = df[target_col].fillna(method='ffill')
        
        # Remove outliers (values > 3 standard deviations)
        mean_val = df[target_col].mean()
        std_val = df[target_col].std()
        df = df[abs(df[target_col] - mean_val) <= 3 * std_val]
        
        logger.info(f"Data preprocessed: {len(df)} records, date range: {df[date_col].min()} to {df[date_col].max()}")
        
        return df
    
    def prophet_forecast(self, data: pd.DataFrame, 
                        periods: int = 30,
                        include_holidays: bool = True,
                        yearly_seasonality: bool = True,
                        weekly_seasonality: bool = True,
                        daily_seasonality: bool = False) -> Dict:
        """
        Generate forecasts using Facebook Prophet.
        
        Args:
            data: DataFrame with 'ds' (date) and 'y' (target) columns
            periods: Number of periods to forecast
            include_holidays: Whether to include holiday effects
            yearly_seasonality: Include yearly seasonality
            weekly_seasonality: Include weekly seasonality
            daily_seasonality: Include daily seasonality
            
        Returns:
            Dictionary containing forecast results
        """
        if not PROPHET_AVAILABLE:
            raise ImportError("Prophet not available. Install with: pip install prophet")
        
        # Initialize Prophet model
        model = Prophet(
            yearly_seasonality=yearly_seasonality,
            weekly_seasonality=weekly_seasonality,
            daily_seasonality=daily_seasonality,
            uncertainty_samples=1000,
            interval_width=0.95
        )
        
        # Add country holidays if requested
        if include_holidays:
            model.add_country_holidays(country_name='US')
        
        # Fit the model
        model.fit(data)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods)
        
        # Generate forecast
        forecast = model.predict(future)
        
        # Store model for reuse
        self.models['prophet'] = model
        
        # Calculate metrics on historical data
        historical_forecast = forecast[forecast['ds'] <= data['ds'].max()]
        actual_values = data['y'].values
        predicted_values = historical_forecast['yhat'].values[:len(actual_values)]
        
        metrics = {
            'mae': mean_absolute_error(actual_values, predicted_values),
            'mse': mean_squared_error(actual_values, predicted_values),
            'rmse': np.sqrt(mean_squared_error(actual_values, predicted_values)),
            'mape': np.mean(np.abs((actual_values - predicted_values) / actual_values)) * 100
        }
        
        # Extract forecast results
        forecast_data = forecast.tail(periods)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].copy()
        
        results = {
            'forecast': forecast_data,
            'full_forecast': forecast,
            'model': model,
            'metrics': metrics,
            'method': 'prophet'
        }
        
        self.forecasts['prophet'] = results
        self.metrics['prophet'] = metrics
        
        logger.info(f"Prophet forecast completed: {periods} periods, MAE: {metrics['mae']:.4f}")
        
        return results
    
    def arima_forecast(self, data: pd.DataFrame, 
                      periods: int = 30,
                      auto_arima: bool = True,
                      order: Optional[Tuple[int, int, int]] = None) -> Dict:
        """
        Generate forecasts using ARIMA model.
        
        Args:
            data: DataFrame with time series data
            periods: Number of periods to forecast
            auto_arima: Whether to automatically determine ARIMA parameters
            order: Manual ARIMA order (p, d, q)
            
        Returns:
            Dictionary containing forecast results
        """
        if not STATSMODELS_AVAILABLE:
            raise ImportError("Statsmodels not available. Install with: pip install statsmodels")
        
        # Extract time series values
        ts_data = data['y'].values
        
        # Check stationarity
        adf_result = adfuller(ts_data)
        is_stationary = adf_result[1] <= 0.05
        
        if not is_stationary:
            logger.info("Data is not stationary, differencing will be applied")
        
        # Determine ARIMA order
        if auto_arima:
            # Simple auto ARIMA - try different combinations
            best_aic = float('inf')
            best_order = None
            best_model = None
            
            for p in range(3):
                for d in range(2):
                    for q in range(3):
                        try:
                            model = ARIMA(ts_data, order=(p, d, q))
                            fitted_model = model.fit()
                            if fitted_model.aic < best_aic:
                                best_aic = fitted_model.aic
                                best_order = (p, d, q)
                                best_model = fitted_model
                        except:
                            continue
            
            if best_model is None:
                raise ValueError("Could not fit ARIMA model")
            
            order = best_order
            fitted_model = best_model
        else:
            if order is None:
                order = (1, 1, 1)  # Default order
            
            model = ARIMA(ts_data, order=order)
            fitted_model = model.fit()
        
        # Generate forecast
        forecast_result = fitted_model.forecast(steps=periods)
        conf_int = fitted_model.get_forecast(steps=periods).conf_int()
        
        # Create forecast dates
        last_date = data['ds'].max()
        forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=periods, freq='D')
        
        # Create forecast dataframe
        forecast_df = pd.DataFrame({
            'ds': forecast_dates,
            'yhat': forecast_result,
            'yhat_lower': conf_int.iloc[:, 0],
            'yhat_upper': conf_int.iloc[:, 1]
        })
        
        # Calculate metrics
        fitted_values = fitted_model.fittedvalues
        actual_values = ts_data[len(ts_data) - len(fitted_values):]
        
        metrics = {
            'mae': mean_absolute_error(actual_values, fitted_values),
            'mse': mean_squared_error(actual_values, fitted_values),
            'rmse': np.sqrt(mean_squared_error(actual_values, fitted_values)),
            'aic': fitted_model.aic,
            'bic': fitted_model.bic
        }
        
        results = {
            'forecast': forecast_df,
            'model': fitted_model,
            'order': order,
            'metrics': metrics,
            'method': 'arima'
        }
        
        self.forecasts['arima'] = results
        self.metrics['arima'] = metrics
        
        logger.info(f"ARIMA forecast completed: Order {order}, AIC: {metrics['aic']:.4f}")
        
        return results
    
    def gaussian_process_forecast(self, data: pd.DataFrame, 
                                 periods: int = 30,
                                 kernel: str = 'rbf',
                                 n_restarts: int = 10) -> Dict:
        """
        Generate forecasts using Gaussian Process regression.
        
        Args:
            data: DataFrame with time series data
            periods: Number of periods to forecast
            kernel: Kernel type ('rbf', 'periodic', 'combined')
            n_restarts: Number of restarts for optimization
            
        Returns:
            Dictionary containing forecast results
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn not available. Install with: pip install scikit-learn")
        
        # Prepare data
        X = np.arange(len(data)).reshape(-1, 1)
        y = data['y'].values
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Define kernel
        if kernel == 'rbf':
            gp_kernel = RBF(length_scale=1.0) + WhiteKernel(noise_level=0.1)
        elif kernel == 'periodic':
            gp_kernel = ExpSineSquared(length_scale=1.0, periodicity=7.0) + WhiteKernel(noise_level=0.1)
        elif kernel == 'combined':
            gp_kernel = (RBF(length_scale=1.0) + 
                        ExpSineSquared(length_scale=1.0, periodicity=7.0) + 
                        WhiteKernel(noise_level=0.1))
        else:
            raise ValueError(f"Unknown kernel: {kernel}")
        
        # Fit Gaussian Process
        gp = GaussianProcessRegressor(
            kernel=gp_kernel,
            n_restarts_optimizer=n_restarts,
            normalize_y=True
        )
        gp.fit(X_scaled, y)
        
        # Generate forecast
        X_future = np.arange(len(data), len(data) + periods).reshape(-1, 1)
        X_future_scaled = scaler.transform(X_future)
        
        y_pred, y_std = gp.predict(X_future_scaled, return_std=True)
        
        # Create forecast dates
        last_date = data['ds'].max()
        forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=periods, freq='D')
        
        # Create forecast dataframe with confidence intervals
        forecast_df = pd.DataFrame({
            'ds': forecast_dates,
            'yhat': y_pred,
            'yhat_lower': y_pred - 1.96 * y_std,  # 95% CI
            'yhat_upper': y_pred + 1.96 * y_std
        })
        
        # Calculate metrics
        y_pred_train, y_std_train = gp.predict(X_scaled, return_std=True)
        
        metrics = {
            'mae': mean_absolute_error(y, y_pred_train),
            'mse': mean_squared_error(y, y_pred_train),
            'rmse': np.sqrt(mean_squared_error(y, y_pred_train)),
            'log_likelihood': gp.log_marginal_likelihood(),
            'mean_prediction_std': np.mean(y_std)
        }
        
        results = {
            'forecast': forecast_df,
            'model': gp,
            'scaler': scaler,
            'kernel': kernel,
            'metrics': metrics,
            'method': 'gaussian_process'
        }
        
        self.forecasts['gaussian_process'] = results
        self.metrics['gaussian_process'] = metrics
        
        logger.info(f"Gaussian Process forecast completed: Kernel {kernel}, MAE: {metrics['mae']:.4f}")
        
        return results
    
    def ensemble_forecast(self, data: pd.DataFrame, 
                         periods: int = 30,
                         methods: List[str] = ['prophet', 'arima', 'gaussian_process'],
                         weights: Optional[List[float]] = None) -> Dict:
        """
        Generate ensemble forecasts combining multiple methods.
        
        Args:
            data: DataFrame with time series data
            periods: Number of periods to forecast
            methods: List of methods to include in ensemble
            weights: Optional weights for each method
            
        Returns:
            Dictionary containing ensemble forecast results
        """
        forecasts = {}
        
        # Generate forecasts for each method
        for method in methods:
            try:
                if method == 'prophet' and PROPHET_AVAILABLE:
                    forecasts[method] = self.prophet_forecast(data, periods)
                elif method == 'arima' and STATSMODELS_AVAILABLE:
                    forecasts[method] = self.arima_forecast(data, periods)
                elif method == 'gaussian_process' and SKLEARN_AVAILABLE:
                    forecasts[method] = self.gaussian_process_forecast(data, periods)
                else:
                    logger.warning(f"Method {method} not available or not implemented")
            except Exception as e:
                logger.error(f"Error generating forecast for {method}: {str(e)}")
        
        if not forecasts:
            raise ValueError("No forecasts generated successfully")
        
        # Calculate weights if not provided
        if weights is None:
            # Weight by inverse MAE (better models get higher weights)
            maes = [self.metrics[method]['mae'] for method in forecasts.keys()]
            weights = [1/mae for mae in maes]
            weights = np.array(weights) / np.sum(weights)
        else:
            weights = np.array(weights)
            weights = weights / np.sum(weights)
        
        # Combine forecasts
        ensemble_forecast = None
        ensemble_lower = None
        ensemble_upper = None
        
        for i, method in enumerate(forecasts.keys()):
            forecast_data = forecasts[method]['forecast']
            
            if ensemble_forecast is None:
                ensemble_forecast = weights[i] * forecast_data['yhat']
                ensemble_lower = weights[i] * forecast_data['yhat_lower']
                ensemble_upper = weights[i] * forecast_data['yhat_upper']
            else:
                ensemble_forecast += weights[i] * forecast_data['yhat']
                ensemble_lower += weights[i] * forecast_data['yhat_lower']
                ensemble_upper += weights[i] * forecast_data['yhat_upper']
        
        # Create ensemble forecast dataframe
        last_date = data['ds'].max()
        forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=periods, freq='D')
        
        ensemble_df = pd.DataFrame({
            'ds': forecast_dates,
            'yhat': ensemble_forecast,
            'yhat_lower': ensemble_lower,
            'yhat_upper': ensemble_upper
        })
        
        # Calculate ensemble metrics (weighted average)
        ensemble_metrics = {}
        for metric in ['mae', 'mse', 'rmse']:
            if all(metric in self.metrics[method] for method in forecasts.keys()):
                ensemble_metrics[metric] = np.average(
                    [self.metrics[method][metric] for method in forecasts.keys()],
                    weights=weights
                )
        
        results = {
            'forecast': ensemble_df,
            'individual_forecasts': forecasts,
            'weights': dict(zip(forecasts.keys(), weights)),
            'metrics': ensemble_metrics,
            'method': 'ensemble'
        }
        
        self.forecasts['ensemble'] = results
        self.metrics['ensemble'] = ensemble_metrics
        
        logger.info(f"Ensemble forecast completed: {len(forecasts)} methods, weights: {dict(zip(forecasts.keys(), weights))}")
        
        return results
    
    def multivariate_forecast(self, data: pd.DataFrame, 
                            target_col: str = 'y',
                            feature_cols: List[str] = None,
                            periods: int = 30) -> Dict:
        """
        Generate multivariate forecasts using external features.
        
        Args:
            data: DataFrame with time series data and features
            target_col: Name of the target column
            feature_cols: List of feature column names
            periods: Number of periods to forecast
            
        Returns:
            Dictionary containing multivariate forecast results
        """
        if feature_cols is None:
            feature_cols = [col for col in data.columns if col not in ['ds', target_col]]
        
        # Prepare features
        X = data[feature_cols].values
        y = data[target_col].values
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Use Gaussian Process for multivariate forecasting
        kernel = RBF(length_scale=np.ones(X_scaled.shape[1])) + WhiteKernel(noise_level=0.1)
        gp = GaussianProcessRegressor(kernel=kernel, normalize_y=True)
        gp.fit(X_scaled, y)
        
        # For forecasting, we need to predict future feature values
        # This is a simplified approach - in practice, you'd need separate models for features
        X_future = np.tile(X_scaled[-1], (periods, 1))  # Repeat last observation
        
        # Generate forecast
        y_pred, y_std = gp.predict(X_future, return_std=True)
        
        # Create forecast dates
        last_date = data['ds'].max()
        forecast_dates = pd.date_range(start=last_date + timedelta(days=1), periods=periods, freq='D')
        
        # Create forecast dataframe
        forecast_df = pd.DataFrame({
            'ds': forecast_dates,
            'yhat': y_pred,
            'yhat_lower': y_pred - 1.96 * y_std,
            'yhat_upper': y_pred + 1.96 * y_std
        })
        
        # Calculate metrics
        y_pred_train, _ = gp.predict(X_scaled, return_std=True)
        
        metrics = {
            'mae': mean_absolute_error(y, y_pred_train),
            'mse': mean_squared_error(y, y_pred_train),
            'rmse': np.sqrt(mean_squared_error(y, y_pred_train)),
            'log_likelihood': gp.log_marginal_likelihood()
        }
        
        results = {
            'forecast': forecast_df,
            'model': gp,
            'scaler': scaler,
            'feature_cols': feature_cols,
            'metrics': metrics,
            'method': 'multivariate'
        }
        
        logger.info(f"Multivariate forecast completed: {len(feature_cols)} features, MAE: {metrics['mae']:.4f}")
        
        return results
    
    def generate_synthetic_data(self, days: int = 365) -> pd.DataFrame:
        """
        Generate synthetic time series data for testing.
        
        Args:
            days: Number of days to generate
            
        Returns:
            DataFrame with synthetic time series data
        """
        # Generate date range
        dates = pd.date_range(start='2023-01-01', periods=days, freq='D')
        
        # Generate synthetic data with trend, seasonality, and noise
        t = np.arange(days)
        trend = 0.1 * t
        seasonal = 10 * np.sin(2 * np.pi * t / 365.25)  # Yearly
        weekly = 5 * np.sin(2 * np.pi * t / 7)  # Weekly
        noise = np.random.normal(0, 2, days)
        
        values = 100 + trend + seasonal + weekly + noise
        
        # Ensure positive values
        values = np.maximum(values, 1)
        
        # Create additional features
        features = pd.DataFrame({
            'ds': dates,
            'y': values,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'quarter': dates.quarter,
            'is_weekend': dates.dayofweek.isin([5, 6]).astype(int),
            'cpu_usage': np.random.normal(50, 15, days),
            'memory_usage': np.random.normal(60, 20, days),
            'network_io': np.random.normal(30, 10, days)
        })
        
        return features
    
    def evaluate_forecast_accuracy(self, actual: pd.Series, predicted: pd.Series) -> Dict:
        """
        Evaluate forecast accuracy with multiple metrics.
        
        Args:
            actual: Actual values
            predicted: Predicted values
            
        Returns:
            Dictionary of accuracy metrics
        """
        metrics = {
            'mae': mean_absolute_error(actual, predicted),
            'mse': mean_squared_error(actual, predicted),
            'rmse': np.sqrt(mean_squared_error(actual, predicted)),
            'mape': np.mean(np.abs((actual - predicted) / actual)) * 100,
            'smape': np.mean(2 * np.abs(actual - predicted) / (np.abs(actual) + np.abs(predicted))) * 100,
            'correlation': np.corrcoef(actual, predicted)[0, 1]
        }
        
        return metrics


def demo_forecasting_engine():
    """Demonstrate the forecasting engine capabilities."""
    print("=== SirsiNexus Elite Phase 3 - Time Series Forecasting Demo ===\n")
    
    # Initialize engine
    engine = TimeSeriesForecastingEngine()
    
    # Generate synthetic data
    print("1. Generating synthetic cloud cost data...")
    data = engine.generate_synthetic_data(days=365)
    
    # Split data for validation
    train_data = data[:-30]  # All but last 30 days
    test_data = data[-30:]   # Last 30 days
    
    print(f"   - Training data: {len(train_data)} days")
    print(f"   - Test data: {len(test_data)} days")
    print(f"   - Cost range: ${train_data['y'].min():.2f} - ${train_data['y'].max():.2f}")
    
    # Preprocess data
    train_data = engine.preprocess_data(train_data)
    
    # Test different forecasting methods
    methods_to_test = []
    
    if PROPHET_AVAILABLE:
        methods_to_test.append('prophet')
    if STATSMODELS_AVAILABLE:
        methods_to_test.append('arima')
    if SKLEARN_AVAILABLE:
        methods_to_test.append('gaussian_process')
    
    print(f"\n2. Testing forecasting methods: {methods_to_test}")
    
    results = {}
    
    # Test Prophet
    if 'prophet' in methods_to_test:
        print("\n   2.1. Prophet Forecasting...")
        try:
            prophet_result = engine.prophet_forecast(train_data, periods=30)
            results['prophet'] = prophet_result
            print(f"        - MAE: ${prophet_result['metrics']['mae']:.2f}")
            print(f"        - MAPE: {prophet_result['metrics']['mape']:.2f}%")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test ARIMA
    if 'arima' in methods_to_test:
        print("\n   2.2. ARIMA Forecasting...")
        try:
            arima_result = engine.arima_forecast(train_data, periods=30)
            results['arima'] = arima_result
            print(f"        - Order: {arima_result['order']}")
            print(f"        - MAE: ${arima_result['metrics']['mae']:.2f}")
            print(f"        - AIC: {arima_result['metrics']['aic']:.2f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Gaussian Process
    if 'gaussian_process' in methods_to_test:
        print("\n   2.3. Gaussian Process Forecasting...")
        try:
            gp_result = engine.gaussian_process_forecast(train_data, periods=30)
            results['gaussian_process'] = gp_result
            print(f"        - Kernel: {gp_result['kernel']}")
            print(f"        - MAE: ${gp_result['metrics']['mae']:.2f}")
            print(f"        - Log Likelihood: {gp_result['metrics']['log_likelihood']:.2f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Ensemble
    if len(results) > 1:
        print("\n   2.4. Ensemble Forecasting...")
        try:
            ensemble_result = engine.ensemble_forecast(train_data, periods=30, methods=list(results.keys()))
            results['ensemble'] = ensemble_result
            print(f"        - Methods: {list(ensemble_result['weights'].keys())}")
            print(f"        - Weights: {ensemble_result['weights']}")
            print(f"        - MAE: ${ensemble_result['metrics']['mae']:.2f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Multivariate
    if SKLEARN_AVAILABLE:
        print("\n   2.5. Multivariate Forecasting...")
        try:
            mv_result = engine.multivariate_forecast(
                train_data, 
                target_col='y',
                feature_cols=['cpu_usage', 'memory_usage', 'network_io', 'day_of_week'],
                periods=30
            )
            results['multivariate'] = mv_result
            print(f"        - Features: {mv_result['feature_cols']}")
            print(f"        - MAE: ${mv_result['metrics']['mae']:.2f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Evaluate against test data
    print("\n3. Evaluating forecast accuracy...")
    actual_values = test_data['y'].values
    
    for method, result in results.items():
        try:
            predicted_values = result['forecast']['yhat'].values
            accuracy = engine.evaluate_forecast_accuracy(actual_values, predicted_values)
            print(f"   {method}:")
            print(f"     - MAE: ${accuracy['mae']:.2f}")
            print(f"     - MAPE: {accuracy['mape']:.2f}%")
            print(f"     - Correlation: {accuracy['correlation']:.4f}")
        except Exception as e:
            print(f"   {method}: Error - {str(e)}")
    
    # Show forecasts summary
    print("\n4. Forecast Summary:")
    for method, result in results.items():
        forecast_df = result['forecast']
        avg_forecast = forecast_df['yhat'].mean()
        forecast_range = forecast_df['yhat'].max() - forecast_df['yhat'].min()
        print(f"   {method}:")
        print(f"     - Average forecast: ${avg_forecast:.2f}")
        print(f"     - Forecast range: ${forecast_range:.2f}")
        print(f"     - Confidence interval width: ${(forecast_df['yhat_upper'] - forecast_df['yhat_lower']).mean():.2f}")
    
    print("\n=== Forecasting Engine Demo Complete ===")
    return results


if __name__ == "__main__":
    # Run demonstration
    try:
        demo_results = demo_forecasting_engine()
        print("\nDemo completed successfully!")
    except Exception as e:
        print(f"Demo failed: {str(e)}")
        import traceback
        traceback.print_exc()
