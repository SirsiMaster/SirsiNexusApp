use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use sqlx::PgPool;

use crate::error::AppResult;
use crate::audit::{AuditLogger, AuditContext};

/// GDPR Rights under Article 12-22
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GdprRights {
    Access,            // Article 15 - Right of access
    Rectification,     // Article 16 - Right to rectification
    Erasure,           // Article 17 - Right to erasure (right to be forgotten)
    Restriction,       // Article 18 - Right to restriction of processing
    DataPortability,   // Article 20 - Right to data portability
    Object,            // Article 21 - Right to object
    AutomatedDecision, // Article 22 - Automated individual decision-making
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DataProcessingPurpose {
    ServiceDelivery,
    Marketing,
    Analytics,
    Security,
    LegalCompliance,
    PerformanceMonitoring,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentRecord {
    pub id: Uuid,
    pub user_id: Uuid,
    pub purpose: DataProcessingPurpose,
    pub consent_given: bool,
    pub consent_date: DateTime<Utc>,
    pub consent_method: String, // How consent was obtained
    pub withdrawal_date: Option<DateTime<Utc>>,
    pub legal_basis: String, // GDPR Article 6 legal basis
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataSubjectRequest {
    pub id: Uuid,
    pub user_id: Uuid,
    pub request_type: GdprRights,
    pub request_date: DateTime<Utc>,
    pub status: RequestStatus,
    pub description: String,
    pub response_due_date: DateTime<Utc>,
    pub completed_date: Option<DateTime<Utc>>,
    pub response_data: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RequestStatus {
    Received,
    InProgress,
    Completed,
    Rejected,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataRetentionPolicy {
    pub data_type: String,
    pub retention_period_days: i32,
    pub purpose: DataProcessingPurpose,
    pub deletion_method: String,
    pub legal_basis: String,
}

#[derive(Debug)]
pub struct GdprComplianceManager {
    #[allow(dead_code)] // Database pool for future GDPR data operations
    pool: PgPool,
    audit_logger: AuditLogger,
    retention_policies: HashMap<String, DataRetentionPolicy>,
}

impl GdprComplianceManager {
    pub fn new(pool: PgPool, audit_logger: AuditLogger) -> Self {
        let mut manager = Self {
            pool,
            audit_logger,
            retention_policies: HashMap::new(),
        };
        
        manager.initialize_default_policies();
        manager
    }

    fn initialize_default_policies(&mut self) {
        let policies = vec![
            DataRetentionPolicy {
                data_type: "user_authentication".to_string(),
                retention_period_days: 2555, // 7 years for audit purposes
                purpose: DataProcessingPurpose::Security,
                deletion_method: "secure_wipe".to_string(),
                legal_basis: "Article 6(1)(f) - Legitimate interests".to_string(),
            },
            DataRetentionPolicy {
                data_type: "user_profile".to_string(),
                retention_period_days: 1095, // 3 years after account closure
                purpose: DataProcessingPurpose::ServiceDelivery,
                deletion_method: "secure_deletion".to_string(),
                legal_basis: "Article 6(1)(b) - Performance of contract".to_string(),
            },
            DataRetentionPolicy {
                data_type: "system_logs".to_string(),
                retention_period_days: 90,
                purpose: DataProcessingPurpose::PerformanceMonitoring,
                deletion_method: "automated_purge".to_string(),
                legal_basis: "Article 6(1)(f) - Legitimate interests".to_string(),
            },
        ];

        for policy in policies {
            self.retention_policies.insert(policy.data_type.clone(), policy);
        }
    }

    pub async fn record_consent(
        &self,
        user_id: Uuid,
        purpose: DataProcessingPurpose,
        consent_given: bool,
        consent_method: String,
        legal_basis: String,
    ) -> AppResult<ConsentRecord> {
        let consent_record = ConsentRecord {
            id: Uuid::new_v4(),
            user_id,
            purpose: purpose.clone(),
            consent_given,
            consent_date: Utc::now(),
            consent_method: consent_method.clone(),
            withdrawal_date: None,
            legal_basis: legal_basis.clone(),
        };

        // Store in database (would need proper schema)
        // For now, just log the action
        let audit_context = AuditContext {
            user_id: Some(user_id),
            session_id: None,
            ip_address: None,
            user_agent: None,
        };

        self.audit_logger.log_success(
            "gdpr_compliance",
            "consent",
            Some(&consent_record.id.to_string()),
            if consent_given { "consent_given" } else { "consent_withdrawn" },
            serde_json::json!({
                "purpose": purpose,
                "method": consent_method,
                "legal_basis": legal_basis
            }),
            audit_context,
        ).await?;

        Ok(consent_record)
    }

    pub async fn withdraw_consent(
        &self,
        user_id: Uuid,
        purpose: DataProcessingPurpose,
    ) -> AppResult<()> {
        let audit_context = AuditContext {
            user_id: Some(user_id),
            session_id: None,
            ip_address: None,
            user_agent: None,
        };

        self.audit_logger.log_success(
            "gdpr_compliance",
            "consent",
            None,
            "consent_withdrawn",
            serde_json::json!({
                "purpose": purpose,
                "withdrawal_date": Utc::now()
            }),
            audit_context,
        ).await?;

        Ok(())
    }

    pub async fn submit_data_subject_request(
        &self,
        user_id: Uuid,
        request_type: GdprRights,
        description: String,
    ) -> AppResult<DataSubjectRequest> {
        let request = DataSubjectRequest {
            id: Uuid::new_v4(),
            user_id,
            request_type: request_type.clone(),
            request_date: Utc::now(),
            status: RequestStatus::Received,
            description: description.clone(),
            response_due_date: Utc::now() + chrono::Duration::days(30), // GDPR requires response within 1 month
            completed_date: None,
            response_data: None,
        };

        let audit_context = AuditContext {
            user_id: Some(user_id),
            session_id: None,
            ip_address: None,
            user_agent: None,
        };

        self.audit_logger.log_success(
            "gdpr_compliance",
            "data_subject_request",
            Some(&request.id.to_string()),
            "request_submitted",
            serde_json::json!({
                "request_type": request_type,
                "description": description,
                "due_date": request.response_due_date
            }),
            audit_context,
        ).await?;

        Ok(request)
    }

    pub async fn process_access_request(&self, user_id: Uuid) -> AppResult<serde_json::Value> {
        // Collect all personal data for the user
        let personal_data = serde_json::json!({
            "user_profile": self.get_user_profile_data(user_id).await?,
            "authentication_logs": self.get_authentication_logs(user_id).await?,
            "project_data": self.get_user_project_data(user_id).await?,
            "audit_trail": self.get_user_audit_trail(user_id).await?,
            "data_processing_purposes": self.get_user_processing_purposes(user_id).await?,
            "consent_records": self.get_user_consent_records(user_id).await?,
            "retention_information": self.get_retention_information(user_id).await?,
        });

        let audit_context = AuditContext {
            user_id: Some(user_id),
            session_id: None,
            ip_address: None,
            user_agent: None,
        };

        self.audit_logger.log_success(
            "gdpr_compliance",
            "data_access",
            None,
            "personal_data_exported",
            serde_json::json!({
                "data_categories": [
                    "user_profile", "authentication_logs", "project_data", 
                    "audit_trail", "processing_purposes", "consent_records"
                ]
            }),
            audit_context,
        ).await?;

        Ok(personal_data)
    }

    pub async fn process_erasure_request(&self, user_id: Uuid) -> AppResult<ErasureResult> {
        let mut erasure_result = ErasureResult {
            user_id,
            erasure_date: Utc::now(),
            data_types_erased: Vec::new(),
            retained_data: Vec::new(),
            retention_reasons: HashMap::new(),
        };

        // Check what data can be erased vs. what must be retained
        for (data_type, policy) in &self.retention_policies {
            if self.can_erase_data(user_id, data_type).await? {
                self.erase_user_data(user_id, data_type).await?;
                erasure_result.data_types_erased.push(data_type.clone());
            } else {
                erasure_result.retained_data.push(data_type.clone());
                erasure_result.retention_reasons.insert(
                    data_type.clone(),
                    policy.legal_basis.clone(),
                );
            }
        }

        let audit_context = AuditContext {
            user_id: Some(user_id),
            session_id: None,
            ip_address: None,
            user_agent: None,
        };

        self.audit_logger.log_success(
            "gdpr_compliance",
            "data_erasure",
            None,
            "erasure_processed",
            serde_json::json!({
                "erased_types": erasure_result.data_types_erased,
                "retained_types": erasure_result.retained_data,
                "retention_reasons": erasure_result.retention_reasons
            }),
            audit_context,
        ).await?;

        Ok(erasure_result)
    }

    async fn can_erase_data(&self, _user_id: Uuid, data_type: &str) -> AppResult<bool> {
        // Check if data can be erased based on retention policies and legal requirements
        match data_type {
            "user_authentication" => Ok(false), // Must retain for audit/security
            "system_logs" => Ok(false), // Required for security monitoring
            "user_profile" => Ok(true), // Can be erased unless account is active
            _ => Ok(true),
        }
    }

    async fn erase_user_data(&self, user_id: Uuid, data_type: &str) -> AppResult<()> {
        // Implement secure data erasure
        println!("Erasing {} data for user {}", data_type, user_id);
        // In real implementation, this would perform secure deletion
        Ok(())
    }

    // Mock data retrieval methods (would be implemented with real database queries)
    async fn get_user_profile_data(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "User profile data would be here"}))
    }

    async fn get_authentication_logs(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "Authentication logs would be here"}))
    }

    async fn get_user_project_data(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "User project data would be here"}))
    }

    async fn get_user_audit_trail(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "User audit trail would be here"}))
    }

    async fn get_user_processing_purposes(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "Data processing purposes would be here"}))
    }

    async fn get_user_consent_records(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({"message": "Consent records would be here"}))
    }

    async fn get_retention_information(&self, _user_id: Uuid) -> AppResult<serde_json::Value> {
        Ok(serde_json::json!({
            "retention_policies": self.retention_policies
        }))
    }

    pub async fn check_retention_compliance(&self) -> AppResult<RetentionComplianceReport> {
        let mut report = RetentionComplianceReport {
            report_id: Uuid::new_v4(),
            check_date: Utc::now(),
            data_types_checked: Vec::new(),
            overdue_deletions: Vec::new(),
            upcoming_deletions: Vec::new(),
            compliance_score: 100.0,
        };

        // Check each data type for retention compliance
        for (data_type, policy) in &self.retention_policies {
            report.data_types_checked.push(data_type.clone());
            
            // Check for overdue deletions (mock implementation)
            let overdue_count = self.count_overdue_data(data_type, policy.retention_period_days).await?;
            if overdue_count > 0 {
                report.overdue_deletions.push(format!("{}: {} records overdue", data_type, overdue_count));
            }

            // Check for upcoming deletions
            let upcoming_count = self.count_upcoming_deletions(data_type, policy.retention_period_days).await?;
            if upcoming_count > 0 {
                report.upcoming_deletions.push(format!("{}: {} records due in 30 days", data_type, upcoming_count));
            }
        }

        // Calculate compliance score
        if !report.overdue_deletions.is_empty() {
            report.compliance_score = 75.0; // Reduced score for overdue deletions
        }

        Ok(report)
    }

    async fn count_overdue_data(&self, _data_type: &str, _retention_days: i32) -> AppResult<i32> {
        // Mock implementation - would query database for overdue records
        Ok(0)
    }

    async fn count_upcoming_deletions(&self, _data_type: &str, _retention_days: i32) -> AppResult<i32> {
        // Mock implementation - would query database for upcoming deletions
        Ok(5)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErasureResult {
    pub user_id: Uuid,
    pub erasure_date: DateTime<Utc>,
    pub data_types_erased: Vec<String>,
    pub retained_data: Vec<String>,
    pub retention_reasons: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionComplianceReport {
    pub report_id: Uuid,
    pub check_date: DateTime<Utc>,
    pub data_types_checked: Vec<String>,
    pub overdue_deletions: Vec<String>,
    pub upcoming_deletions: Vec<String>,
    pub compliance_score: f64,
}
