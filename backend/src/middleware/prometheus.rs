use prometheus::{
    CounterVec, HistogramVec, IntCounter, IntCounterVec, IntGauge, Registry,
};
use std::sync::Arc;

/// Prometheus metrics for Synthia 3.0
#[derive(Clone)]
pub struct MetricsRegistry {
    pub registry: Arc<Registry>,

    // HTTP Metrics
    pub http_requests_total: IntCounterVec,
    pub http_request_duration_seconds: HistogramVec,
    pub http_concurrent_connections: IntGauge,

    // Task Metrics
    pub task_duration_seconds: HistogramVec,
    pub task_delegation_total: IntCounter,

    // Memory Metrics
    pub memory_operations_total: IntCounterVec,
    pub memory_response_time_seconds: HistogramVec,

    // LLM Provider Metrics
    pub llm_requests_total: IntCounterVec,
    pub llm_response_time_seconds: HistogramVec,

    // API Health Metrics
    pub api_errors_total: IntCounterVec,
    pub api_health_status: IntGauge,
}

impl MetricsRegistry {
    pub fn new() -> Result<Self, prometheus::Error> {
        let registry = Registry::new();

        // HTTP Metrics
        let http_requests_total = IntCounterVec::new(
            prometheus::Opts::new("http_requests_total", "Total HTTP requests")
                .namespace("synthia"),
            &["method", "endpoint", "status"],
        )?;
        registry.register(Box::new(http_requests_total.clone()))?;

        let http_request_duration_seconds = HistogramVec::new(
            prometheus::HistogramOpts::new("http_request_duration_seconds", "HTTP request duration")
                .namespace("synthia"),
            &["method", "endpoint"],
        )?;
        registry.register(Box::new(http_request_duration_seconds.clone()))?;

        let http_concurrent_connections = IntGauge::new(
            "synthia_http_concurrent_connections",
            "Current concurrent HTTP connections",
        )?;
        registry.register(Box::new(http_concurrent_connections.clone()))?;

        // Task Metrics
        let task_duration_seconds = HistogramVec::new(
            prometheus::HistogramOpts::new("task_duration_seconds", "Task execution duration")
                .namespace("synthia"),
            &["agent_system", "status"],
        )?;
        registry.register(Box::new(task_duration_seconds.clone()))?;

        let task_delegation_total = IntCounter::new(
            "synthia_task_delegation_total",
            "Total task delegations to Agent Zero",
        )?;
        registry.register(Box::new(task_delegation_total.clone()))?;

        // Memory Metrics
        let memory_operations_total = IntCounterVec::new(
            prometheus::Opts::new("memory_operations_total", "Total memory operations")
                .namespace("synthia"),
            &["operation_type"],
        )?;
        registry.register(Box::new(memory_operations_total.clone()))?;

        let memory_response_time_seconds = HistogramVec::new(
            prometheus::HistogramOpts::new("memory_response_time_seconds", "Memory operation response time")
                .namespace("synthia"),
            &["operation_type"],
        )?;
        registry.register(Box::new(memory_response_time_seconds.clone()))?;

        // LLM Provider Metrics
        let llm_requests_total = IntCounterVec::new(
            prometheus::Opts::new("llm_requests_total", "Total LLM provider requests")
                .namespace("synthia"),
            &["provider"],
        )?;
        registry.register(Box::new(llm_requests_total.clone()))?;

        let llm_response_time_seconds = HistogramVec::new(
            prometheus::HistogramOpts::new("llm_response_time_seconds", "LLM provider response time")
                .namespace("synthia"),
            &["provider"],
        )?;
        registry.register(Box::new(llm_response_time_seconds.clone()))?;

        // API Health Metrics
        let api_errors_total = IntCounterVec::new(
            prometheus::Opts::new("api_errors_total", "Total API errors by type")
                .namespace("synthia"),
            &["error_type", "endpoint"],
        )?;
        registry.register(Box::new(api_errors_total.clone()))?;

        let api_health_status = IntGauge::new(
            "synthia_api_health_status",
            "API health status (1 = healthy, 0 = unhealthy)",
        )?;
        api_health_status.set(1);
        registry.register(Box::new(api_health_status.clone()))?;

        Ok(MetricsRegistry {
            registry: Arc::new(registry),
            http_requests_total,
            http_request_duration_seconds,
            http_concurrent_connections,
            task_duration_seconds,
            task_delegation_total,
            memory_operations_total,
            memory_response_time_seconds,
            llm_requests_total,
            llm_response_time_seconds,
            api_errors_total,
            api_health_status,
        })
    }

    /// Export metrics in Prometheus text format
    pub fn gather(&self) -> Result<String, prometheus::Error> {
        use prometheus::Encoder;
        let encoder = prometheus::TextEncoder::new();
        let metric_families = self.registry.gather();
        let mut buffer = Vec::new();
        encoder.encode(&metric_families, &mut buffer)?;
        Ok(String::from_utf8_lossy(&buffer).to_string())
    }
}

impl Default for MetricsRegistry {
    fn default() -> Self {
        Self::new().expect("Failed to create metrics registry")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_metrics_registry_creation() {
        let metrics = MetricsRegistry::new();
        assert!(metrics.is_ok());
    }

    #[test]
    fn test_metrics_export() {
        let metrics = MetricsRegistry::new().unwrap();
        let output = metrics.gather();
        assert!(output.is_ok());
        let prometheus_text = output.unwrap();
        assert!(prometheus_text.contains("synthia_http_requests_total"));
        assert!(prometheus_text.contains("synthia_task_count"));
        assert!(prometheus_text.contains("synthia_memory_operations_total"));
    }
}
