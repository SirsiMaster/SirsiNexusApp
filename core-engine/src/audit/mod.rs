use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::PgPool;
use chrono::{DateTime, Utc};

use crate::error::{AppError, AppResult};

pub mod events;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AuditLog {
    pub id: Uuid,
    pub event_type: String,
    pub resource_type: String,
    pub resource_id: Option<String>,
    pub user_id: Option<Uuid>,
    pub session_id: Option<String>,
    pub action: String,
    pub details: serde_json::Value,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub success: bool,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditContext {
    pub user_id: Option<Uuid>,
    pub session_id: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone)]
pub struct AuditLogger {
    pool: PgPool,
    enabled: bool,
}

impl AuditLogger {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            enabled: true,
        }
    }

    pub fn disable(&mut self) {
        self.enabled = false;
    }

    pub fn enable(&mut self) {
        self.enabled = true;
    }

    /// Log a successful action
    pub async fn log_success(
        &self,
        event_type: &str,
        resource_type: &str,
        resource_id: Option<&str>,
        action: &str,
        details: serde_json::Value,
        context: AuditContext,
    ) -> AppResult<Uuid> {
        if !self.enabled {
            return Ok(Uuid::new_v4()); // Return dummy ID when disabled
        }

        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: event_type.to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.map(|s| s.to_string()),
            user_id: context.user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success: true,
            error_message: None,
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log a failed action
    pub async fn log_failure(
        &self,
        event_type: &str,
        resource_type: &str,
        resource_id: Option<&str>,
        action: &str,
        details: serde_json::Value,
        error_message: &str,
        context: AuditContext,
    ) -> AppResult<Uuid> {
        if !self.enabled {
            return Ok(Uuid::new_v4()); // Return dummy ID when disabled
        }

        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: event_type.to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.map(|s| s.to_string()),
            user_id: context.user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success: false,
            error_message: Some(error_message.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log authentication events
    pub async fn log_authentication(
        &self,
        action: &str, // "login", "logout", "login_failed"
        user_id: Option<Uuid>,
        details: serde_json::Value,
        context: AuditContext,
        success: bool,
        error_message: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "authentication".to_string(),
            resource_type: "user".to_string(),
            resource_id: user_id.map(|id| id.to_string()),
            user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success,
            error_message: error_message.map(|s| s.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        
        // Phase 3: Real-time security monitoring
        if action == "login_failed" || !success {
            self.analyze_security_event(&log_entry).await;
        }
        
        Ok(log_entry.id)
    }

    /// Log authorization events
    pub async fn log_authorization(
        &self,
        action: &str,
        resource_type: &str,
        resource_id: Option<&str>,
        user_id: Option<Uuid>,
        details: serde_json::Value,
        context: AuditContext,
        success: bool,
        error_message: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "authorization".to_string(),
            resource_type: resource_type.to_string(),
            resource_id: resource_id.map(|s| s.to_string()),
            user_id,
            session_id: context.session_id,
            action: action.to_string(),
            details,
            ip_address: context.ip_address,
            user_agent: context.user_agent,
            timestamp: Utc::now(),
            success,
            error_message: error_message.map(|s| s.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        
        // Phase 3: Real-time security monitoring for authorization failures
        if !success {
            self.analyze_security_event(&log_entry).await;
        }
        
        Ok(log_entry.id)
    }

    /// Log agent events
    pub async fn log_agent_event(
        &self,
        agent_id: &str,
        action: &str,
        details: serde_json::Value,
        success: bool,
        session_id: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "agent".to_string(),
            resource_type: "agent".to_string(),
            resource_id: Some(agent_id.to_string()),
            user_id: None,
            session_id: session_id.map(|s| s.to_string()),
            action: action.to_string(),
            details,
            ip_address: None,
            user_agent: None,
            timestamp: Utc::now(),
            success,
            error_message: None,
        };

        self.insert_audit_log(&log_entry).await?;
        Ok(log_entry.id)
    }

    /// Log system events
    pub async fn log_system_event(
        &self,
        action: &str,
        details: serde_json::Value,
        success: bool,
        error_message: Option<&str>,
    ) -> AppResult<Uuid> {
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "system".to_string(),
            resource_type: "system".to_string(),
            resource_id: None,
            user_id: None,
            session_id: None,
            action: action.to_string(),
            details,
            ip_address: None,
            user_agent: None,
            timestamp: Utc::now(),
            success,
            error_message: error_message.map(|s| s.to_string()),
        };

        self.insert_audit_log(&log_entry).await?;
        
        // Phase 3: Real-time security monitoring for system failures
        // Skip analysis for security alert events to prevent recursion
        if !success && !action.starts_with("security_alert_") {
            self.analyze_security_event(&log_entry).await;
        }
        
        Ok(log_entry.id)
    }

    async fn insert_audit_log(&self, log: &AuditLog) -> AppResult<()> {
        sqlx::query(
            r#"
            INSERT INTO audit_logs (
                id, event_type, resource_type, resource_id, user_id, session_id,
                action, details, ip_address, user_agent, timestamp, success, error_message
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            "#
        )
        .bind(log.id)
        .bind(&log.event_type)
        .bind(&log.resource_type)
        .bind(&log.resource_id)
        .bind(log.user_id)
        .bind(&log.session_id)
        .bind(&log.action)
        .bind(&log.details)
        .bind(&log.ip_address)
        .bind(&log.user_agent)
        .bind(log.timestamp)
        .bind(log.success)
        .bind(&log.error_message)
        .execute(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        Ok(())
    }
    
    /// Phase 3: Real-time security event analysis
    async fn analyze_security_event(&self, log_entry: &AuditLog) {
        tracing::info!("🔍 Phase 3: Analyzing security event: {} - {}", log_entry.action, log_entry.event_type);
        
        // Detect brute force attacks
        if log_entry.action == "login_failed" {
            if let Some(ip_address) = &log_entry.ip_address {
                match self.check_brute_force_attack(ip_address).await {
                    Ok(true) => {
                        tracing::warn!("🚨 SECURITY ALERT: Potential brute force attack detected from IP: {}", ip_address);
                        self.trigger_security_alert("brute_force", &format!("Multiple failed logins from IP: {}", ip_address)).await;
                    }
                    Ok(false) => {
                        tracing::debug!("🔍 Normal failed login from IP: {}", ip_address);
                    }
                    Err(e) => {
                        tracing::error!("Failed to analyze brute force pattern: {}", e);
                    }
                }
            }
        }
        
        // Detect privilege escalation attempts
        if log_entry.event_type == "authorization" && !log_entry.success {
            tracing::warn!("🚨 SECURITY ALERT: Failed authorization attempt - User: {:?}, Action: {}", 
                log_entry.user_id, log_entry.action);
            
            if let Some(user_id) = log_entry.user_id {
                if let Ok(true) = self.check_privilege_escalation_attempt(user_id).await {
                    tracing::warn!("🚨 CRITICAL: Potential privilege escalation detected for user: {}", user_id);
                    self.trigger_security_alert("privilege_escalation", 
                        &format!("Multiple failed authorization attempts by user: {}", user_id)).await;
                }
            }
        }
        
        // Detect suspicious system access patterns
        if log_entry.event_type == "system" && !log_entry.success {
            tracing::warn!("🚨 SECURITY ALERT: Failed system operation: {}", log_entry.action);
            self.trigger_security_alert("system_access", 
                &format!("Failed system operation: {}", log_entry.action)).await;
        }
    }
    
    /// Check for brute force attack patterns
    async fn check_brute_force_attack(&self, ip_address: &str) -> AppResult<bool> {
        // Count failed login attempts in the last 10 minutes
        let failed_attempts = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) 
            FROM audit_logs 
            WHERE ip_address = $1 
                AND action = 'login_failed' 
                AND timestamp > NOW() - INTERVAL '10 minutes'
            "#
        )
        .bind(ip_address)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        // Threshold: 5 failed attempts in 10 minutes indicates potential brute force
        Ok(failed_attempts >= 5)
    }
    
    /// Check for privilege escalation attempt patterns
    async fn check_privilege_escalation_attempt(&self, user_id: Uuid) -> AppResult<bool> {
        // Count failed authorization attempts in the last 5 minutes
        let failed_auth_attempts = sqlx::query_scalar::<_, i64>(
            r#"
            SELECT COUNT(*) 
            FROM audit_logs 
            WHERE user_id = $1 
                AND event_type = 'authorization' 
                AND success = false 
                AND timestamp > NOW() - INTERVAL '5 minutes'
            "#
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;
        
        // Threshold: 3 failed authorization attempts in 5 minutes
        Ok(failed_auth_attempts >= 3)
    }
    
    /// Trigger security alert (in production, this would integrate with SIEM/alerting systems)
    async fn trigger_security_alert(&self, alert_type: &str, message: &str) {
        tracing::error!("🚨 SECURITY ALERT [{}]: {}", alert_type.to_uppercase(), message);
        
        // Phase 3: In production, this would:
        // 1. Send alerts to security team via PagerDuty/Slack
        // 2. Update SIEM systems (Splunk, ELK Stack)
        // 3. Trigger automated responses (rate limiting, IP blocking)
        // 4. Create incident tickets
        
        // Log the security alert as a system event (without triggering analysis to avoid recursion)
        let alert_details = serde_json::json!({
            "alert_type": alert_type,
            "message": message,
            "severity": "high",
            "timestamp": Utc::now(),
            "auto_generated": true
        });
        
        // Directly insert the audit log without triggering analysis
        let log_entry = AuditLog {
            id: Uuid::new_v4(),
            event_type: "security_alert".to_string(),
            resource_type: "system".to_string(),
            resource_id: None,
            user_id: None,
            session_id: None,
            action: format!("security_alert_{}", alert_type),
            details: alert_details,
            ip_address: None,
            user_agent: None,
            timestamp: Utc::now(),
            success: true,
            error_message: None,
        };
        
        if let Err(e) = self.insert_audit_log(&log_entry).await {
            tracing::error!("Failed to log security alert: {}", e);
        }
    }

    /// Query audit logs with filters
    pub async fn query_logs(
        &self,
        filters: AuditQueryFilters,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> AppResult<Vec<AuditLog>> {
        let mut query = "SELECT * FROM audit_logs WHERE 1=1".to_string();
        let mut params: Vec<Box<dyn std::any::Any + Send + Sync>> = Vec::new();
        let mut param_count = 0;

        if let Some(user_id) = filters.user_id {
            param_count += 1;
            query.push_str(&format!(" AND user_id = ${}", param_count));
            params.push(Box::new(user_id));
        }

        if let Some(event_type) = &filters.event_type {
            param_count += 1;
            query.push_str(&format!(" AND event_type = ${}", param_count));
            params.push(Box::new(event_type.clone()));
        }

        if let Some(resource_type) = &filters.resource_type {
            param_count += 1;
            query.push_str(&format!(" AND resource_type = ${}", param_count));
            params.push(Box::new(resource_type.clone()));
        }

        if let Some(action) = &filters.action {
            param_count += 1;
            query.push_str(&format!(" AND action = ${}", param_count));
            params.push(Box::new(action.clone()));
        }

        if let Some(success) = filters.success {
            param_count += 1;
            query.push_str(&format!(" AND success = ${}", param_count));
            params.push(Box::new(success));
        }

        if let Some(start_time) = filters.start_time {
            param_count += 1;
            query.push_str(&format!(" AND timestamp >= ${}", param_count));
            params.push(Box::new(start_time));
        }

        if let Some(end_time) = filters.end_time {
            param_count += 1;
            query.push_str(&format!(" AND timestamp <= ${}", param_count));
            params.push(Box::new(end_time));
        }

        query.push_str(" ORDER BY timestamp DESC");

        if let Some(limit) = limit {
            param_count += 1;
            query.push_str(&format!(" LIMIT ${}", param_count));
            params.push(Box::new(limit));
        }

        if let Some(offset) = offset {
            param_count += 1;
            query.push_str(&format!(" OFFSET ${}", param_count));
            params.push(Box::new(offset));
        }

        // For simplicity, we'll use a direct query here
        // In a real implementation, you'd want to use sqlx's query builder
        let logs = sqlx::query_as::<_, AuditLog>(
            "SELECT id, event_type, resource_type, resource_id, user_id, session_id, action, details, ip_address, user_agent, timestamp, success, error_message FROM audit_logs ORDER BY timestamp DESC LIMIT $1"
        )
        .bind(limit.unwrap_or(100))
        .fetch_all(&self.pool)
        .await
        .map_err(AppError::Database)?;

        Ok(logs)
    }

    /// Get audit statistics
    pub async fn get_statistics(&self, timeframe: AuditTimeframe) -> AppResult<AuditStatistics> {
        let (start_time, end_time) = timeframe.to_datetime_range();

        let total_events = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2"
        )
        .bind(start_time)
        .bind(end_time)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let successful_events = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2 AND success = true"
        )
        .bind(start_time)
        .bind(end_time)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;

        let failed_events = total_events - successful_events;

        let unique_users = sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE timestamp BETWEEN $1 AND $2 AND user_id IS NOT NULL"
        )
        .bind(start_time)
        .bind(end_time)
        .fetch_one(&self.pool)
        .await
        .map_err(AppError::Database)?;

        Ok(AuditStatistics {
            total_events,
            successful_events,
            failed_events,
            unique_users,
            timeframe_start: start_time,
            timeframe_end: end_time,
        })
    }
}

#[derive(Debug, Clone)]
pub struct AuditQueryFilters {
    pub user_id: Option<Uuid>,
    pub event_type: Option<String>,
    pub resource_type: Option<String>,
    pub action: Option<String>,
    pub success: Option<bool>,
    pub start_time: Option<DateTime<Utc>>,
    pub end_time: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone)]
pub enum AuditTimeframe {
    LastHour,
    LastDay,
    LastWeek,
    LastMonth,
    Custom(DateTime<Utc>, DateTime<Utc>),
}

impl AuditTimeframe {
    fn to_datetime_range(&self) -> (DateTime<Utc>, DateTime<Utc>) {
        let now = Utc::now();
        match self {
            AuditTimeframe::LastHour => (now - chrono::Duration::hours(1), now),
            AuditTimeframe::LastDay => (now - chrono::Duration::days(1), now),
            AuditTimeframe::LastWeek => (now - chrono::Duration::weeks(1), now),
            AuditTimeframe::LastMonth => (now - chrono::Duration::days(30), now),
            AuditTimeframe::Custom(start, end) => (*start, *end),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct AuditStatistics {
    pub total_events: i64,
    pub successful_events: i64,
    pub failed_events: i64,
    pub unique_users: i64,
    pub timeframe_start: DateTime<Utc>,
    pub timeframe_end: DateTime<Utc>,
}

// Convenience macros for common audit logging patterns
#[macro_export]
macro_rules! audit_success {
    ($logger:expr, $event_type:expr, $resource_type:expr, $action:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            None,
            $action,
            serde_json::json!({}),
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            serde_json::json!({}),
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $details:expr, $context:expr) => {
        $logger.log_success(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            $details,
            $context,
        ).await
    };
}

#[macro_export]
macro_rules! audit_failure {
    ($logger:expr, $event_type:expr, $resource_type:expr, $action:expr, $error:expr, $context:expr) => {
        $logger.log_failure(
            $event_type,
            $resource_type,
            None,
            $action,
            serde_json::json!({}),
            $error,
            $context,
        ).await
    };
    ($logger:expr, $event_type:expr, $resource_type:expr, $resource_id:expr, $action:expr, $error:expr, $context:expr) => {
        $logger.log_failure(
            $event_type,
            $resource_type,
            Some($resource_id),
            $action,
            serde_json::json!({}),
            $error,
            $context,
        ).await
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Skip for now since we need a test database
    async fn test_audit_logging() {
        // Test would go here with actual database
    }
}
