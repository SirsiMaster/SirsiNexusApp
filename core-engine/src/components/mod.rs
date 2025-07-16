// GUI Components Module for SirsiNexus Dashboard
// Provides reusable components for the web-based management interface

pub mod success_metrics_checklist;

pub use success_metrics_checklist::{
    SuccessMetrics, 
    SystemHealthMetrics, 
    PhaseCompletionMetrics,
    PerformanceMetrics,
    OperationalMetrics,
    ComplianceMetrics,
    MetricStatus,
    DashboardSummary,
    get_success_metrics,
    get_dashboard_summary,
};
