"""
SirsiNexus Elite Phase 3 - Advanced Anomaly Detection Engine
===========================================================

Advanced anomaly detection system with multiple algorithms:
- Isolation Forest for performance anomalies
- LSTM Autoencoders for time series anomalies
- One-Class SVM for security anomalies
- Real-time alerting with intelligent routing
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Union, Any
import warnings
warnings.filterwarnings('ignore')

# Core ML libraries
try:
    from sklearn.ensemble import IsolationForest
    from sklearn.svm import OneClassSVM
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    from sklearn.metrics import classification_report, confusion_matrix
    from sklearn.decomposition import PCA
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available. Install with: pip install scikit-learn")

# Deep learning libraries
try:
    import tensorflow as tf
    from tensorflow.keras.models import Model, Sequential
    from tensorflow.keras.layers import Input, LSTM, Dense, RepeatVector, TimeDistributed
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("TensorFlow not available. Install with: pip install tensorflow")

# Statistical libraries
try:
    from scipy import stats
    from scipy.spatial.distance import mahalanobis
    import scipy.signal as signal
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("SciPy not available. Install with: pip install scipy")

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnomalyDetectionEngine:
    """
    Advanced anomaly detection engine for SirsiNexus cloud operations
    with multiple detection algorithms and real-time capabilities.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        """Initialize the anomaly detection engine."""
        self.config = config or {}
        self.models = {}
        self.scalers = {}
        self.thresholds = {}
        self.anomaly_history = []
        self.alerts = []
        
        # Default parameters
        self.default_contamination = 0.1  # Expected anomaly rate
        self.confidence_threshold = 0.95
        self.alert_cooldown = 300  # seconds
        
        logger.info("AnomalyDetectionEngine initialized")
    
    def preprocess_data(self, data: pd.DataFrame, 
                       normalize: bool = True,
                       handle_missing: str = 'interpolate') -> pd.DataFrame:
        """
        Preprocess data for anomaly detection.
        
        Args:
            data: Input DataFrame
            normalize: Whether to normalize features
            handle_missing: How to handle missing values ('drop', 'interpolate', 'forward_fill')
            
        Returns:
            Preprocessed DataFrame
        """
        df = data.copy()
        
        # Handle missing values
        if handle_missing == 'drop':
            df = df.dropna()
        elif handle_missing == 'interpolate':
            df = df.interpolate(method='linear')
        elif handle_missing == 'forward_fill':
            df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Remove infinite values
        df = df.replace([np.inf, -np.inf], np.nan).dropna()
        
        # Normalize if requested
        if normalize:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            scaler = StandardScaler()
            df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
            self.scalers['preprocessing'] = scaler
        
        logger.info(f"Data preprocessed: {len(df)} records, {df.shape[1]} features")
        return df
    
    def isolation_forest_detection(self, data: pd.DataFrame,
                                 contamination: float = 0.1,
                                 n_estimators: int = 100,
                                 feature_cols: Optional[List[str]] = None) -> Dict:
        """
        Detect anomalies using Isolation Forest algorithm.
        
        Args:
            data: Input DataFrame
            contamination: Expected proportion of anomalies
            n_estimators: Number of trees in the forest
            feature_cols: Columns to use for detection
            
        Returns:
            Dictionary containing detection results
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn not available")
        
        # Select features
        if feature_cols is None:
            feature_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        X = data[feature_cols].values
        
        # Fit Isolation Forest
        iso_forest = IsolationForest(
            contamination=contamination,
            n_estimators=n_estimators,
            random_state=42,
            n_jobs=-1
        )
        
        # Predict anomalies (-1 for anomalies, 1 for normal)
        predictions = iso_forest.fit_predict(X)
        anomaly_scores = iso_forest.decision_function(X)
        
        # Convert to boolean anomaly flags
        is_anomaly = predictions == -1
        
        # Calculate anomaly strength (distance from decision boundary)
        anomaly_strength = -anomaly_scores  # Higher values = more anomalous
        
        # Store model
        self.models['isolation_forest'] = iso_forest
        
        # Create results DataFrame
        results_df = data.copy()
        results_df['is_anomaly'] = is_anomaly
        results_df['anomaly_score'] = anomaly_scores
        results_df['anomaly_strength'] = anomaly_strength
        
        # Calculate statistics
        n_anomalies = np.sum(is_anomaly)
        anomaly_rate = n_anomalies / len(data)
        
        results = {
            'data': results_df,
            'model': iso_forest,
            'predictions': predictions,
            'anomaly_scores': anomaly_scores,
            'feature_cols': feature_cols,
            'n_anomalies': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'method': 'isolation_forest'
        }
        
        logger.info(f"Isolation Forest detection completed: {n_anomalies} anomalies ({anomaly_rate:.2%})")
        return results
    
    def lstm_autoencoder_detection(self, data: pd.DataFrame,
                                 feature_cols: Optional[List[str]] = None,
                                 sequence_length: int = 10,
                                 encoding_dim: int = 50,
                                 epochs: int = 50,
                                 threshold_percentile: float = 95) -> Dict:
        """
        Detect anomalies using LSTM Autoencoder for time series data.
        
        Args:
            data: Input DataFrame with time series data
            feature_cols: Columns to use for detection
            sequence_length: Length of input sequences
            encoding_dim: Dimension of encoded representation
            epochs: Training epochs
            threshold_percentile: Percentile for anomaly threshold
            
        Returns:
            Dictionary containing detection results
        """
        if not TENSORFLOW_AVAILABLE:
            raise ImportError("TensorFlow not available")
        
        # Select features
        if feature_cols is None:
            feature_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        # Prepare data
        X = data[feature_cols].values
        
        # Scale data
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Create sequences
        sequences = []
        for i in range(len(X_scaled) - sequence_length + 1):
            sequences.append(X_scaled[i:i + sequence_length])
        
        X_seq = np.array(sequences)
        
        # Build LSTM Autoencoder
        input_dim = X_seq.shape[2]
        
        # Encoder
        encoder_inputs = Input(shape=(sequence_length, input_dim))
        encoded = LSTM(encoding_dim, return_sequences=False)(encoder_inputs)
        
        # Decoder
        decoded = RepeatVector(sequence_length)(encoded)
        decoded = LSTM(input_dim, return_sequences=True)(decoded)
        
        # Autoencoder model
        autoencoder = Model(encoder_inputs, decoded)
        autoencoder.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
        
        # Train model
        early_stopping = EarlyStopping(monitor='loss', patience=10, restore_best_weights=True)
        
        history = autoencoder.fit(
            X_seq, X_seq,
            epochs=epochs,
            batch_size=32,
            validation_split=0.2,
            callbacks=[early_stopping],
            verbose=0
        )
        
        # Calculate reconstruction errors
        X_pred = autoencoder.predict(X_seq, verbose=0)
        reconstruction_errors = np.mean(np.square(X_seq - X_pred), axis=(1, 2))
        
        # Set threshold based on percentile
        threshold = np.percentile(reconstruction_errors, threshold_percentile)
        
        # Identify anomalies
        is_anomaly = reconstruction_errors > threshold
        
        # Extend results to original data length
        anomaly_flags = np.zeros(len(data), dtype=bool)
        error_scores = np.zeros(len(data))
        
        # Map back to original indices
        for i, error in enumerate(reconstruction_errors):
            idx = i + sequence_length - 1  # Map to last element of sequence
            anomaly_flags[idx] = is_anomaly[i]
            error_scores[idx] = error
        
        # Store model and scaler
        self.models['lstm_autoencoder'] = autoencoder
        self.scalers['lstm_autoencoder'] = scaler
        self.thresholds['lstm_autoencoder'] = threshold
        
        # Create results DataFrame
        results_df = data.copy()
        results_df['is_anomaly'] = anomaly_flags
        results_df['reconstruction_error'] = error_scores
        results_df['anomaly_strength'] = np.maximum(0, error_scores - threshold)
        
        # Calculate statistics
        n_anomalies = np.sum(anomaly_flags)
        anomaly_rate = n_anomalies / len(data)
        
        results = {
            'data': results_df,
            'model': autoencoder,
            'scaler': scaler,
            'threshold': threshold,
            'reconstruction_errors': reconstruction_errors,
            'feature_cols': feature_cols,
            'sequence_length': sequence_length,
            'n_anomalies': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'training_history': history.history,
            'method': 'lstm_autoencoder'
        }
        
        logger.info(f"LSTM Autoencoder detection completed: {n_anomalies} anomalies ({anomaly_rate:.2%})")
        return results
    
    def one_class_svm_detection(self, data: pd.DataFrame,
                              feature_cols: Optional[List[str]] = None,
                              nu: float = 0.1,
                              kernel: str = 'rbf',
                              gamma: str = 'scale') -> Dict:
        """
        Detect anomalies using One-Class SVM.
        
        Args:
            data: Input DataFrame
            feature_cols: Columns to use for detection
            nu: Upper bound on fraction of training errors and lower bound on support vectors
            kernel: Kernel type ('linear', 'poly', 'rbf', 'sigmoid')
            gamma: Kernel coefficient
            
        Returns:
            Dictionary containing detection results
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn not available")
        
        # Select features
        if feature_cols is None:
            feature_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        X = data[feature_cols].values
        
        # Scale data
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Fit One-Class SVM
        oc_svm = OneClassSVM(nu=nu, kernel=kernel, gamma=gamma)
        
        # Predict anomalies (-1 for anomalies, 1 for normal)
        predictions = oc_svm.fit_predict(X_scaled)
        decision_scores = oc_svm.decision_function(X_scaled)
        
        # Convert to boolean anomaly flags
        is_anomaly = predictions == -1
        
        # Calculate anomaly strength
        anomaly_strength = -decision_scores  # Higher values = more anomalous
        
        # Store model and scaler
        self.models['one_class_svm'] = oc_svm
        self.scalers['one_class_svm'] = scaler
        
        # Create results DataFrame
        results_df = data.copy()
        results_df['is_anomaly'] = is_anomaly
        results_df['decision_score'] = decision_scores
        results_df['anomaly_strength'] = anomaly_strength
        
        # Calculate statistics
        n_anomalies = np.sum(is_anomaly)
        anomaly_rate = n_anomalies / len(data)
        
        results = {
            'data': results_df,
            'model': oc_svm,
            'scaler': scaler,
            'predictions': predictions,
            'decision_scores': decision_scores,
            'feature_cols': feature_cols,
            'n_anomalies': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'method': 'one_class_svm'
        }
        
        logger.info(f"One-Class SVM detection completed: {n_anomalies} anomalies ({anomaly_rate:.2%})")
        return results
    
    def statistical_anomaly_detection(self, data: pd.DataFrame,
                                    feature_cols: Optional[List[str]] = None,
                                    method: str = 'z_score',
                                    threshold: float = 3.0) -> Dict:
        """
        Detect anomalies using statistical methods.
        
        Args:
            data: Input DataFrame
            feature_cols: Columns to use for detection
            method: Statistical method ('z_score', 'iqr', 'mahalanobis')
            threshold: Threshold for anomaly detection
            
        Returns:
            Dictionary containing detection results
        """
        if not SCIPY_AVAILABLE:
            raise ImportError("SciPy not available")
        
        # Select features
        if feature_cols is None:
            feature_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        
        X = data[feature_cols].values
        
        if method == 'z_score':
            # Z-score based detection
            z_scores = np.abs(stats.zscore(X, axis=0))
            anomaly_scores = np.max(z_scores, axis=1)
            is_anomaly = anomaly_scores > threshold
            
        elif method == 'iqr':
            # Interquartile Range based detection
            Q1 = np.percentile(X, 25, axis=0)
            Q3 = np.percentile(X, 75, axis=0)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - threshold * IQR
            upper_bound = Q3 + threshold * IQR
            
            # Check if any feature is outside bounds
            outlier_mask = (X < lower_bound) | (X > upper_bound)
            is_anomaly = np.any(outlier_mask, axis=1)
            
            # Calculate anomaly scores as maximum deviation
            lower_dev = np.maximum(0, lower_bound - X) / IQR
            upper_dev = np.maximum(0, X - upper_bound) / IQR
            anomaly_scores = np.max(np.maximum(lower_dev, upper_dev), axis=1)
            
        elif method == 'mahalanobis':
            # Mahalanobis distance based detection
            mean = np.mean(X, axis=0)
            cov = np.cov(X.T)
            
            # Handle singular covariance matrix
            try:
                inv_cov = np.linalg.inv(cov)
            except np.linalg.LinAlgError:
                inv_cov = np.linalg.pinv(cov)
            
            # Calculate Mahalanobis distances
            mahal_distances = np.array([
                mahalanobis(x, mean, inv_cov) for x in X
            ])
            
            # Use chi-square distribution for threshold
            chi2_threshold = stats.chi2.ppf(1 - 0.05, len(feature_cols))  # 95% confidence
            is_anomaly = mahal_distances > chi2_threshold
            anomaly_scores = mahal_distances
            
        else:
            raise ValueError(f"Unknown statistical method: {method}")
        
        # Create results DataFrame
        results_df = data.copy()
        results_df['is_anomaly'] = is_anomaly
        results_df['anomaly_score'] = anomaly_scores
        results_df['anomaly_strength'] = anomaly_scores
        
        # Calculate statistics
        n_anomalies = np.sum(is_anomaly)
        anomaly_rate = n_anomalies / len(data)
        
        results = {
            'data': results_df,
            'method_type': method,
            'threshold': threshold,
            'anomaly_scores': anomaly_scores,
            'feature_cols': feature_cols,
            'n_anomalies': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'method': f'statistical_{method}'
        }
        
        logger.info(f"Statistical {method} detection completed: {n_anomalies} anomalies ({anomaly_rate:.2%})")
        return results
    
    def ensemble_anomaly_detection(self, data: pd.DataFrame,
                                 methods: List[str] = ['isolation_forest', 'one_class_svm', 'statistical_z_score'],
                                 weights: Optional[List[float]] = None,
                                 voting_threshold: float = 0.5) -> Dict:
        """
        Combine multiple anomaly detection methods in an ensemble.
        
        Args:
            data: Input DataFrame
            methods: List of methods to combine
            weights: Optional weights for each method
            voting_threshold: Threshold for ensemble voting
            
        Returns:
            Dictionary containing ensemble detection results
        """
        individual_results = {}
        
        # Run individual methods
        for method in methods:
            try:
                if method == 'isolation_forest':
                    individual_results[method] = self.isolation_forest_detection(data)
                elif method == 'one_class_svm':
                    individual_results[method] = self.one_class_svm_detection(data)
                elif method.startswith('statistical_'):
                    stat_method = method.replace('statistical_', '')
                    individual_results[method] = self.statistical_anomaly_detection(data, method=stat_method)
                else:
                    logger.warning(f"Unknown method: {method}")
            except Exception as e:
                logger.error(f"Error running {method}: {str(e)}")
        
        if not individual_results:
            raise ValueError("No methods ran successfully")
        
        # Combine results
        n_samples = len(data)
        n_methods = len(individual_results)
        
        # Create voting matrix
        votes = np.zeros((n_samples, n_methods))
        scores = np.zeros((n_samples, n_methods))
        
        for i, (method, result) in enumerate(individual_results.items()):
            votes[:, i] = result['data']['is_anomaly'].astype(int)
            scores[:, i] = result['data']['anomaly_strength']
        
        # Apply weights if provided
        if weights is None:
            weights = np.ones(n_methods) / n_methods
        else:
            weights = np.array(weights)
            weights = weights / np.sum(weights)
        
        # Weighted voting
        weighted_votes = np.average(votes, axis=1, weights=weights)
        weighted_scores = np.average(scores, axis=1, weights=weights)
        
        # Final anomaly decision
        is_anomaly_ensemble = weighted_votes >= voting_threshold
        
        # Create results DataFrame
        results_df = data.copy()
        results_df['is_anomaly'] = is_anomaly_ensemble
        results_df['ensemble_vote'] = weighted_votes
        results_df['ensemble_score'] = weighted_scores
        results_df['anomaly_strength'] = weighted_scores
        
        # Add individual method results
        for method, result in individual_results.items():
            results_df[f'{method}_anomaly'] = result['data']['is_anomaly']
            results_df[f'{method}_score'] = result['data']['anomaly_strength']
        
        # Calculate statistics
        n_anomalies = np.sum(is_anomaly_ensemble)
        anomaly_rate = n_anomalies / len(data)
        
        results = {
            'data': results_df,
            'individual_results': individual_results,
            'methods': methods,
            'weights': dict(zip(methods, weights)),
            'voting_threshold': voting_threshold,
            'n_anomalies': n_anomalies,
            'anomaly_rate': anomaly_rate,
            'method': 'ensemble'
        }
        
        logger.info(f"Ensemble detection completed: {n_anomalies} anomalies ({anomaly_rate:.2%})")
        return results
    
    def real_time_anomaly_detection(self, new_data: pd.DataFrame,
                                  method: str = 'isolation_forest',
                                  generate_alert: bool = True) -> Dict:
        """
        Perform real-time anomaly detection on new data.
        
        Args:
            new_data: New data to check for anomalies
            method: Detection method to use
            generate_alert: Whether to generate alerts for anomalies
            
        Returns:
            Dictionary containing detection results
        """
        if method not in self.models:
            raise ValueError(f"Model for {method} not found. Train model first.")
        
        model = self.models[method]
        
        if method == 'isolation_forest':
            predictions = model.predict(new_data.select_dtypes(include=[np.number]).values)
            scores = model.decision_function(new_data.select_dtypes(include=[np.number]).values)
            is_anomaly = predictions == -1
            anomaly_strength = -scores
            
        elif method == 'one_class_svm':
            scaler = self.scalers[method]
            X_scaled = scaler.transform(new_data.select_dtypes(include=[np.number]).values)
            predictions = model.predict(X_scaled)
            scores = model.decision_function(X_scaled)
            is_anomaly = predictions == -1
            anomaly_strength = -scores
            
        else:
            raise ValueError(f"Real-time detection not implemented for {method}")
        
        # Create results
        results_df = new_data.copy()
        results_df['is_anomaly'] = is_anomaly
        results_df['anomaly_score'] = scores
        results_df['anomaly_strength'] = anomaly_strength
        
        # Generate alerts if requested
        alerts = []
        if generate_alert and np.any(is_anomaly):
            for idx in np.where(is_anomaly)[0]:
                alert = {
                    'timestamp': datetime.now(),
                    'method': method,
                    'anomaly_strength': anomaly_strength[idx],
                    'data_point': new_data.iloc[idx].to_dict(),
                    'alert_id': f"anomaly_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{idx}"
                }
                alerts.append(alert)
                self.alerts.append(alert)
        
        results = {
            'data': results_df,
            'method': method,
            'n_anomalies': np.sum(is_anomaly),
            'alerts': alerts
        }
        
        return results
    
    def generate_synthetic_anomaly_data(self, n_samples: int = 1000,
                                      n_features: int = 5,
                                      contamination: float = 0.1) -> pd.DataFrame:
        """
        Generate synthetic data with known anomalies for testing.
        
        Args:
            n_samples: Number of samples to generate
            n_features: Number of features
            contamination: Proportion of anomalies
            
        Returns:
            DataFrame with synthetic data and anomaly labels
        """
        np.random.seed(42)
        
        # Generate normal data
        n_normal = int(n_samples * (1 - contamination))
        n_anomalies = n_samples - n_normal
        
        # Normal data (multivariate normal distribution)
        normal_data = np.random.multivariate_normal(
            mean=np.zeros(n_features),
            cov=np.eye(n_features),
            size=n_normal
        )
        
        # Anomalous data (different distribution)
        anomaly_data = np.random.multivariate_normal(
            mean=np.ones(n_features) * 3,  # Shifted mean
            cov=np.eye(n_features) * 2,    # Different variance
            size=n_anomalies
        )
        
        # Combine data
        X = np.vstack([normal_data, anomaly_data])
        y = np.hstack([np.zeros(n_normal), np.ones(n_anomalies)])
        
        # Shuffle
        indices = np.random.permutation(n_samples)
        X = X[indices]
        y = y[indices]
        
        # Create DataFrame
        feature_names = [f'feature_{i}' for i in range(n_features)]
        df = pd.DataFrame(X, columns=feature_names)
        df['true_anomaly'] = y.astype(bool)
        
        # Add timestamp
        df['timestamp'] = pd.date_range(start='2023-01-01', periods=n_samples, freq='H')
        
        # Add some cloud metrics simulation
        df['cpu_usage'] = np.random.normal(50, 15, n_samples) + 20 * y  # Higher for anomalies
        df['memory_usage'] = np.random.normal(60, 20, n_samples) + 15 * y
        df['network_io'] = np.random.normal(30, 10, n_samples) + 25 * y
        df['disk_io'] = np.random.normal(40, 12, n_samples) + 20 * y
        df['response_time'] = np.random.normal(100, 25, n_samples) + 50 * y
        
        # Ensure realistic bounds
        df['cpu_usage'] = np.clip(df['cpu_usage'], 0, 100)
        df['memory_usage'] = np.clip(df['memory_usage'], 0, 100)
        df['network_io'] = np.clip(df['network_io'], 0, 1000)
        df['disk_io'] = np.clip(df['disk_io'], 0, 1000)
        df['response_time'] = np.clip(df['response_time'], 10, 5000)
        
        return df
    
    def evaluate_detection_performance(self, predictions: np.ndarray, 
                                     true_labels: np.ndarray) -> Dict:
        """
        Evaluate anomaly detection performance.
        
        Args:
            predictions: Predicted anomaly labels
            true_labels: True anomaly labels
            
        Returns:
            Dictionary of performance metrics
        """
        # Convert to binary
        predictions = predictions.astype(bool)
        true_labels = true_labels.astype(bool)
        
        # Calculate metrics
        tp = np.sum(predictions & true_labels)
        fp = np.sum(predictions & ~true_labels)
        tn = np.sum(~predictions & ~true_labels)
        fn = np.sum(~predictions & true_labels)
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = (tp + tn) / (tp + fp + tn + fn)
        
        metrics = {
            'true_positives': tp,
            'false_positives': fp,
            'true_negatives': tn,
            'false_negatives': fn,
            'precision': precision,
            'recall': recall,
            'f1_score': f1_score,
            'accuracy': accuracy
        }
        
        return metrics


def demo_anomaly_detection():
    """Demonstrate the anomaly detection engine capabilities."""
    print("=== SirsiNexus Elite Phase 3 - Anomaly Detection Demo ===\n")
    
    # Initialize engine
    engine = AnomalyDetectionEngine()
    
    # Generate synthetic data with known anomalies
    print("1. Generating synthetic cloud monitoring data with anomalies...")
    data = engine.generate_synthetic_anomaly_data(n_samples=1000, contamination=0.05)
    
    print(f"   - Total samples: {len(data)}")
    print(f"   - True anomalies: {data['true_anomaly'].sum()}")
    print(f"   - Anomaly rate: {data['true_anomaly'].mean():.1%}")
    
    # Features for detection
    feature_cols = ['cpu_usage', 'memory_usage', 'network_io', 'disk_io', 'response_time']
    
    # Test different detection methods
    methods_to_test = []
    
    if SKLEARN_AVAILABLE:
        methods_to_test.extend(['isolation_forest', 'one_class_svm', 'statistical'])
    if TENSORFLOW_AVAILABLE:
        methods_to_test.append('lstm_autoencoder')
    
    print(f"\n2. Testing anomaly detection methods: {methods_to_test}")
    
    results = {}
    
    # Test Isolation Forest
    if 'isolation_forest' in methods_to_test:
        print("\n   2.1. Isolation Forest Detection...")
        try:
            iso_result = engine.isolation_forest_detection(data, feature_cols=feature_cols)
            results['isolation_forest'] = iso_result
            
            # Evaluate performance
            performance = engine.evaluate_detection_performance(
                iso_result['data']['is_anomaly'].values,
                data['true_anomaly'].values
            )
            print(f"        - Detected anomalies: {iso_result['n_anomalies']}")
            print(f"        - Precision: {performance['precision']:.3f}")
            print(f"        - Recall: {performance['recall']:.3f}")
            print(f"        - F1-score: {performance['f1_score']:.3f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test One-Class SVM
    if 'one_class_svm' in methods_to_test:
        print("\n   2.2. One-Class SVM Detection...")
        try:
            svm_result = engine.one_class_svm_detection(data, feature_cols=feature_cols)
            results['one_class_svm'] = svm_result
            
            # Evaluate performance
            performance = engine.evaluate_detection_performance(
                svm_result['data']['is_anomaly'].values,
                data['true_anomaly'].values
            )
            print(f"        - Detected anomalies: {svm_result['n_anomalies']}")
            print(f"        - Precision: {performance['precision']:.3f}")
            print(f"        - Recall: {performance['recall']:.3f}")
            print(f"        - F1-score: {performance['f1_score']:.3f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Statistical Methods
    if 'statistical' in methods_to_test:
        print("\n   2.3. Statistical Anomaly Detection...")
        for stat_method in ['z_score', 'iqr']:
            try:
                stat_result = engine.statistical_anomaly_detection(
                    data, feature_cols=feature_cols, method=stat_method
                )
                results[f'statistical_{stat_method}'] = stat_result
                
                # Evaluate performance
                performance = engine.evaluate_detection_performance(
                    stat_result['data']['is_anomaly'].values,
                    data['true_anomaly'].values
                )
                print(f"        - {stat_method.upper()}: {stat_result['n_anomalies']} anomalies")
                print(f"          Precision: {performance['precision']:.3f}, "
                      f"Recall: {performance['recall']:.3f}, "
                      f"F1: {performance['f1_score']:.3f}")
            except Exception as e:
                print(f"        - {stat_method} Error: {str(e)}")
    
    # Test LSTM Autoencoder (if TensorFlow available)
    if 'lstm_autoencoder' in methods_to_test:
        print("\n   2.4. LSTM Autoencoder Detection...")
        try:
            # Sort data by timestamp for time series
            data_sorted = data.sort_values('timestamp').reset_index(drop=True)
            
            lstm_result = engine.lstm_autoencoder_detection(
                data_sorted, 
                feature_cols=feature_cols,
                sequence_length=10,
                epochs=20  # Reduced for demo
            )
            results['lstm_autoencoder'] = lstm_result
            
            # Evaluate performance
            performance = engine.evaluate_detection_performance(
                lstm_result['data']['is_anomaly'].values,
                data_sorted['true_anomaly'].values
            )
            print(f"        - Detected anomalies: {lstm_result['n_anomalies']}")
            print(f"        - Precision: {performance['precision']:.3f}")
            print(f"        - Recall: {performance['recall']:.3f}")
            print(f"        - F1-score: {performance['f1_score']:.3f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Ensemble Detection
    if len(results) > 1:
        print("\n   2.5. Ensemble Detection...")
        try:
            ensemble_methods = [method for method in results.keys() 
                              if not method.startswith('lstm')]  # Exclude LSTM for ensemble
            
            ensemble_result = engine.ensemble_anomaly_detection(
                data, 
                methods=ensemble_methods,
                voting_threshold=0.5
            )
            results['ensemble'] = ensemble_result
            
            # Evaluate performance
            performance = engine.evaluate_detection_performance(
                ensemble_result['data']['is_anomaly'].values,
                data['true_anomaly'].values
            )
            print(f"        - Methods: {ensemble_methods}")
            print(f"        - Weights: {ensemble_result['weights']}")
            print(f"        - Detected anomalies: {ensemble_result['n_anomalies']}")
            print(f"        - Precision: {performance['precision']:.3f}")
            print(f"        - Recall: {performance['recall']:.3f}")
            print(f"        - F1-score: {performance['f1_score']:.3f}")
        except Exception as e:
            print(f"        - Error: {str(e)}")
    
    # Test Real-time Detection
    print("\n3. Real-time Anomaly Detection...")
    if 'isolation_forest' in results:
        try:
            # Generate new data points
            new_data = engine.generate_synthetic_anomaly_data(n_samples=10, contamination=0.3)
            
            rt_result = engine.real_time_anomaly_detection(
                new_data[feature_cols], 
                method='isolation_forest'
            )
            
            print(f"   - New data points: {len(new_data)}")
            print(f"   - Detected anomalies: {rt_result['n_anomalies']}")
            print(f"   - Alerts generated: {len(rt_result['alerts'])}")
            
            for alert in rt_result['alerts']:
                print(f"     * Alert {alert['alert_id']}: Strength {alert['anomaly_strength']:.3f}")
                
        except Exception as e:
            print(f"   - Error: {str(e)}")
    
    # Performance summary
    print("\n4. Performance Summary:")
    for method, result in results.items():
        if 'data' in result:
            performance = engine.evaluate_detection_performance(
                result['data']['is_anomaly'].values,
                data['true_anomaly'].values
            )
            print(f"   {method}:")
            print(f"     - F1-score: {performance['f1_score']:.3f}")
            print(f"     - Precision: {performance['precision']:.3f}")
            print(f"     - Recall: {performance['recall']:.3f}")
            print(f"     - Detected: {result['n_anomalies']} / {data['true_anomaly'].sum()} true anomalies")
    
    print("\n=== Anomaly Detection Demo Complete ===")
    return results


if __name__ == "__main__":
    # Run demonstration
    try:
        demo_results = demo_anomaly_detection()
        print("\nDemo completed successfully!")
    except Exception as e:
        print(f"Demo failed: {str(e)}")
        import traceback
        traceback.print_exc()
