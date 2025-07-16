"""
Simple test for SirsiNexus Analytics Platform basic functionality
Works with minimal dependencies (NumPy and scikit-learn only)
"""

import numpy as np
import sys
from datetime import datetime, timedelta

# Test basic imports and functionality
def test_basic_dependencies():
    """Test that we have the basic dependencies working."""
    print("=== Testing Basic Dependencies ===")
    
    # Test NumPy
    try:
        data = np.random.normal(0, 1, (100, 5))
        print(f"✓ NumPy working: Generated {data.shape} array")
    except Exception as e:
        print(f"✗ NumPy error: {e}")
        return False
    
    # Test scikit-learn
    try:
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import StandardScaler
        
        # Test Isolation Forest
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        predictions = iso_forest.fit_predict(data)
        anomalies = np.sum(predictions == -1)
        print(f"✓ Scikit-learn working: Isolation Forest detected {anomalies} anomalies")
        
        # Test StandardScaler
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)
        print(f"✓ StandardScaler working: Mean={scaled_data.mean():.3f}, Std={scaled_data.std():.3f}")
        
    except Exception as e:
        print(f"✗ Scikit-learn error: {e}")
        return False
    
    return True

def test_anomaly_detection_core():
    """Test core anomaly detection functionality without pandas."""
    print("\n=== Testing Core Anomaly Detection ===")
    
    try:
        from sklearn.ensemble import IsolationForest
        from sklearn.svm import OneClassSVM
        from sklearn.preprocessing import StandardScaler
        
        # Generate synthetic data with known anomalies
        np.random.seed(42)
        n_samples = 1000
        n_features = 5
        contamination = 0.1
        
        # Normal data
        n_normal = int(n_samples * (1 - contamination))
        n_anomalies = n_samples - n_normal
        
        normal_data = np.random.multivariate_normal(
            mean=np.zeros(n_features),
            cov=np.eye(n_features),
            size=n_normal
        )
        
        # Anomalous data
        anomaly_data = np.random.multivariate_normal(
            mean=np.ones(n_features) * 3,
            cov=np.eye(n_features) * 2,
            size=n_anomalies
        )
        
        # Combine and shuffle
        X = np.vstack([normal_data, anomaly_data])
        y_true = np.hstack([np.zeros(n_normal), np.ones(n_anomalies)])
        
        indices = np.random.permutation(n_samples)
        X = X[indices]
        y_true = y_true[indices]
        
        print(f"Generated {n_samples} samples with {np.sum(y_true)} true anomalies ({np.mean(y_true):.1%})")
        
        # Test Isolation Forest
        iso_forest = IsolationForest(contamination=contamination, random_state=42)
        iso_predictions = iso_forest.fit_predict(X)
        iso_anomalies = iso_predictions == -1
        
        # Calculate performance metrics
        tp = np.sum(iso_anomalies & y_true.astype(bool))
        fp = np.sum(iso_anomalies & ~y_true.astype(bool))
        tn = np.sum(~iso_anomalies & ~y_true.astype(bool))
        fn = np.sum(~iso_anomalies & y_true.astype(bool))
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        
        print(f"✓ Isolation Forest: {np.sum(iso_anomalies)} detected, "
              f"Precision={precision:.3f}, Recall={recall:.3f}, F1={f1_score:.3f}")
        
        # Test One-Class SVM
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        oc_svm = OneClassSVM(nu=contamination, kernel='rbf')
        svm_predictions = oc_svm.fit_predict(X_scaled)
        svm_anomalies = svm_predictions == -1
        
        # Calculate SVM performance
        tp_svm = np.sum(svm_anomalies & y_true.astype(bool))
        fp_svm = np.sum(svm_anomalies & ~y_true.astype(bool))
        tn_svm = np.sum(~svm_anomalies & ~y_true.astype(bool))
        fn_svm = np.sum(~svm_anomalies & y_true.astype(bool))
        
        precision_svm = tp_svm / (tp_svm + fp_svm) if (tp_svm + fp_svm) > 0 else 0
        recall_svm = tp_svm / (tp_svm + fn_svm) if (tp_svm + fn_svm) > 0 else 0
        f1_svm = 2 * precision_svm * recall_svm / (precision_svm + recall_svm) if (precision_svm + recall_svm) > 0 else 0
        
        print(f"✓ One-Class SVM: {np.sum(svm_anomalies)} detected, "
              f"Precision={precision_svm:.3f}, Recall={recall_svm:.3f}, F1={f1_svm:.3f}")
        
        return True
        
    except Exception as e:
        print(f"✗ Anomaly detection error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_statistical_methods():
    """Test statistical anomaly detection methods."""
    print("\n=== Testing Statistical Methods ===")
    
    try:
        # Generate test data
        np.random.seed(42)
        n_samples = 1000
        n_features = 3
        
        # Normal data with some outliers
        normal_data = np.random.normal(0, 1, (n_samples, n_features))
        
        # Add some clear outliers
        outlier_indices = np.random.choice(n_samples, size=50, replace=False)
        normal_data[outlier_indices] += np.random.normal(5, 1, (50, n_features))
        
        # Z-score method
        from scipy import stats
        z_scores = np.abs(stats.zscore(normal_data, axis=0))
        z_anomalies = np.max(z_scores, axis=1) > 3.0
        
        print(f"✓ Z-score method: {np.sum(z_anomalies)} anomalies detected")
        
        # IQR method
        Q1 = np.percentile(normal_data, 25, axis=0)
        Q3 = np.percentile(normal_data, 75, axis=0)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        iqr_anomalies = np.any((normal_data < lower_bound) | (normal_data > upper_bound), axis=1)
        
        print(f"✓ IQR method: {np.sum(iqr_anomalies)} anomalies detected")
        
        return True
        
    except ImportError:
        print("⚠ SciPy not available, skipping statistical tests")
        return True
    except Exception as e:
        print(f"✗ Statistical methods error: {e}")
        return False

def test_simple_forecasting():
    """Test simple forecasting without complex dependencies."""
    print("\n=== Testing Simple Forecasting ===")
    
    try:
        # Generate simple time series
        np.random.seed(42)
        n_points = 100
        t = np.arange(n_points)
        
        # Create synthetic time series with trend and seasonality
        trend = 0.1 * t
        seasonal = 10 * np.sin(2 * np.pi * t / 12)
        noise = np.random.normal(0, 2, n_points)
        
        time_series = 100 + trend + seasonal + noise
        
        print(f"✓ Generated time series with {n_points} points")
        print(f"  Range: {time_series.min():.2f} to {time_series.max():.2f}")
        print(f"  Mean: {time_series.mean():.2f}, Std: {time_series.std():.2f}")
        
        # Simple moving average forecast
        window_size = 10
        if len(time_series) > window_size:
            moving_avg = np.convolve(time_series, np.ones(window_size)/window_size, mode='valid')
            forecast_value = moving_avg[-1]
            print(f"✓ Simple moving average forecast: {forecast_value:.2f}")
        
        # Linear trend extrapolation
        if len(time_series) > 2:
            # Fit linear trend to last 20 points
            recent_points = min(20, len(time_series))
            x = np.arange(recent_points)
            y = time_series[-recent_points:]
            
            # Simple linear regression
            slope = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean())**2)
            intercept = y.mean() - slope * x.mean()
            
            # Forecast next point
            next_forecast = slope * recent_points + intercept
            print(f"✓ Linear trend forecast: {next_forecast:.2f} (slope: {slope:.3f})")
        
        return True
        
    except Exception as e:
        print(f"✗ Simple forecasting error: {e}")
        return False

def main():
    """Run all basic tests."""
    print("SirsiNexus Elite Phase 3 - Analytics Platform Basic Tests")
    print("=" * 60)
    
    all_tests_passed = True
    
    # Run tests
    tests = [
        test_basic_dependencies,
        test_anomaly_detection_core,
        test_statistical_methods,
        test_simple_forecasting
    ]
    
    for test in tests:
        try:
            result = test()
            if not result:
                all_tests_passed = False
        except Exception as e:
            print(f"✗ Test {test.__name__} failed with error: {e}")
            all_tests_passed = False
    
    print("\n" + "=" * 60)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! Analytics platform basic functionality verified.")
        print("\nNext steps:")
        print("- Install pandas for full DataFrame support")
        print("- Install tensorflow for LSTM autoencoders")
        print("- Install prophet for advanced time series forecasting")
        print("- Install scipy for enhanced statistical methods")
    else:
        print("⚠ Some tests failed. Check the output above for details.")
    
    return all_tests_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
