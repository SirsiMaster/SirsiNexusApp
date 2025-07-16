# Scheduler

The Scheduler component provides job scheduling and orchestration capabilities with support for distributed workloads, resource management, and workflow automation.

## Overview

The Scheduler component provides:
- Distributed job scheduling
- Resource management and allocation
- Workflow orchestration
- Job lifecycle management
- Task dependencies and DAGs
- Resource quotas and limits

## Features

### Job Scheduling

```rust
// Create job
let job = Job {
    name: "data-processing",
    image: "data-processor:1.0",
    command: vec!["process", "--input", "s3://data/input"],
    resources: ResourceRequirements {
        cpu: ResourceQuantity::new(2.0),
        memory: ResourceQuantity::gb(4),
        gpu: None,
    },
    restart_policy: RestartPolicy::OnFailure {
        max_retries: 3,
        backoff: ExponentialBackoff {
            initial: Duration::from_secs(10),
            max: Duration::from_secs(300),
            multiplier: 2.0,
        },
    },
    schedule: Some(Schedule::Cron("0 0 * * *")), // Daily at midnight
    timeout: Some(Duration::from_hours(2)),
    parallelism: Some(ParallelismConfig {
        max_concurrent: 5,
        completion_strategy: CompletionStrategy::AllSuccessful,
    }),
};

scheduler.create_job(job).await?;

// Create job template
let template = JobTemplate {
    name: "batch-processing",
    spec: JobSpec {
        image: "batch-processor:1.0",
        resources: ResourceRequirements {
            cpu: ResourceQuantity::new(4.0),
            memory: ResourceQuantity::gb(8),
        },
        volumes: vec![
            Volume {
                name: "data",
                source: VolumeSource::PersistentVolume("pv-data"),
                mount_path: "/data",
            },
        ],
    },
    parameters: vec![
        Parameter {
            name: "input_path",
            required: true,
            default: None,
        },
        Parameter {
            name: "batch_size",
            required: false,
            default: Some("1000"),
        },
    ],
};

scheduler.create_job_template(template).await?;
```

### Workflow Orchestration

```rust
// Create workflow
let workflow = Workflow {
    name: "data-pipeline",
    tasks: vec![
        Task {
            name: "extract",
            job: "data-extractor",
            dependencies: vec![],
            parameters: HashMap::from([
                ("source", "database"),
                ("query", "SELECT * FROM users"),
            ]),
            success_criteria: SuccessCriteria::ExitCode(0),
        },
        Task {
            name: "transform",
            job: "data-transformer",
            dependencies: vec!["extract"],
            parameters: HashMap::from([
                ("input", "#{extract.output}"),
                ("format", "parquet"),
            ]),
            retry: RetryPolicy {
                max_attempts: 3,
                backoff: LinearBackoff {
                    interval: Duration::from_secs(60),
                },
            },
        },
        Task {
            name: "load",
            job: "data-loader",
            dependencies: vec!["transform"],
            parameters: HashMap::from([
                ("input", "#{transform.output}"),
                ("destination", "warehouse"),
            ]),
            resources: Some(ResourceRequirements {
                cpu: ResourceQuantity::new(4.0),
                memory: ResourceQuantity::gb(16),
            }),
        },
    ],
    on_failure: FailurePolicy::Continue,
    schedule: Some(Schedule::Fixed {
        interval: Duration::from_hours(6),
    }),
    timeout: Duration::from_hours(4),
    parallelism: 2,
};

scheduler.create_workflow(workflow).await?;

// Execute workflow
let execution = scheduler.execute_workflow("data-pipeline")
    .with_parameters(params)
    .with_timeout(Duration::from_hours(2))
    .await?;

// Monitor workflow
let status = scheduler.get_workflow_status(execution.id).await?;
```

### Resource Management

```rust
// Configure resource quota
let quota = ResourceQuota {
    name: "team-quota",
    namespace: "team-a",
    limits: ResourceLimits {
        cpu: ResourceQuantity::new(32.0),
        memory: ResourceQuantity::gb(128),
        gpu: Some(ResourceQuantity::new(4.0)),
        storage: ResourceQuantity::tb(1),
    },
    scopes: vec![
        QuotaScope::Job,
        QuotaScope::Workflow,
    ],
};

scheduler.create_resource_quota(quota).await?;

// Configure priority classes
let priority = PriorityClass {
    name: "high-priority",
    value: 1000,
    preemption_policy: PreemptionPolicy::PreemptLowerPriority,
    description: "For critical jobs",
};

scheduler.create_priority_class(priority).await?;

// Configure auto-scaling
let scaling = AutoscalingPolicy {
    name: "workflow-scaling",
    target: ScalingTarget::Workflow("data-pipeline"),
    metrics: vec![
        ScalingMetric::QueueLength {
            target: 10,
            tolerance: 2,
        },
        ScalingMetric::ResourceUtilization {
            resource: Resource::CPU,
            target_percentage: 70,
        },
    ],
    min_replicas: 1,
    max_replicas: 10,
    scale_up: ScalingRule {
        threshold: 80,
        duration: Duration::from_minutes(5),
        step: 2,
    },
    scale_down: ScalingRule {
        threshold: 40,
        duration: Duration::from_minutes(10),
        step: 1,
    },
};

scheduler.configure_autoscaling(scaling).await?;
```

## Architecture

```plaintext
+------------------+
|    Scheduler     |
+------------------+
         |
+------------------+     +------------------+     +------------------+
|   Job Manager    |     | Resource Manager |     | Queue Manager   |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Workflow Engine  |     | Policy Engine    |     | State Store     |
+------------------+     +------------------+     +------------------+
         |                       |                        |
+------------------+     +------------------+     +------------------+
| Task Executor    |     | Quota Manager   |     | Event Manager   |
+------------------+     +------------------+     +------------------+
```

### Components

1. **Job Manager**
   - Job lifecycle
   - Scheduling
   - Resource allocation
   - Job monitoring

2. **Resource Manager**
   - Resource tracking
   - Quota enforcement
   - Resource optimization
   - Auto-scaling

3. **Workflow Engine**
   - DAG execution
   - Task orchestration
   - Dependency management
   - Error handling

4. **Task Executor**
   - Task execution
   - Runtime environment
   - Log management
   - Status reporting

## Configuration

### Scheduler Configuration

```yaml
scheduler:
  job_defaults:
    timeout: 1h
    retries: 3
    backoff:
      initial: 10s
      max: 5m
      multiplier: 2
  
  workflow_defaults:
    parallelism: 5
    failure_policy: stop
    timeout: 24h
  
  queues:
    - name: default
      priority: 0
    - name: high-priority
      priority: 100
```

### Resource Configuration

```yaml
resources:
  quotas:
    team-quota:
      cpu: 32
      memory: 128Gi
      gpu: 4
      storage: 1Ti
  
  classes:
    standard:
      cpu: 1
      memory: 4Gi
    large:
      cpu: 4
      memory: 16Gi
  
  auto_scaling:
    enabled: true
    min_nodes: 3
    max_nodes: 10
    target_cpu_utilization: 70
```

### Workflow Configuration

```yaml
workflows:
  defaults:
    retry:
      max_attempts: 3
      backoff: exponential
    timeout: 4h
    
  hooks:
    pre_execute:
      - validate_resources
      - check_dependencies
    post_execute:
      - cleanup_resources
      - notify_completion
```

## API Reference

### Job Management

```rust
#[async_trait]
pub trait JobManager: Send + Sync {
    async fn create_job(&self, job: Job) -> Result<Job>;
    async fn delete_job(&self, name: &str) -> Result<()>;
    async fn suspend_job(&self, name: &str) -> Result<()>;
    async fn resume_job(&self, name: &str) -> Result<()>;
    async fn get_job_status(&self, name: &str) -> Result<JobStatus>;
}
```

### Workflow Management

```rust
#[async_trait]
pub trait WorkflowManager: Send + Sync {
    async fn create_workflow(&self, workflow: Workflow) -> Result<Workflow>;
    async fn execute_workflow(&self, name: &str) -> Result<WorkflowExecution>;
    async fn cancel_workflow(&self, execution_id: &str) -> Result<()>;
    async fn get_workflow_status(&self, execution_id: &str) -> Result<WorkflowStatus>;
}
```

## Best Practices

1. **Job Design**
   - Define resource requirements
   - Set appropriate timeouts
   - Configure retry policies
   - Use job templates

2. **Workflow Design**
   - Model dependencies correctly
   - Handle failures gracefully
   - Manage state properly
   - Monitor execution

3. **Resource Management**
   - Set proper quotas
   - Use priority classes
   - Configure auto-scaling
   - Monitor utilization

4. **Operations**
   - Regular monitoring
   - Log management
   - Failure analysis
   - Performance tuning

## Examples

### Job Execution

```rust
use clusterdb::scheduler::{Scheduler, Job, ResourceRequirements};

#[tokio::main]
async fn main() -> Result<()> {
    let scheduler = Scheduler::new(config)?;
    
    // Create and run job
    let job = Job::new("data-processor")
        .with_image("processor:1.0")
        .with_command(vec!["process", "--input", "data.csv"])
        .with_resources(ResourceRequirements {
            cpu: 2.0,
            memory_gb: 4,
        });
    
    let job_id = scheduler.create_job(job).await?;
    
    // Monitor job status
    let status = scheduler.watch_job(job_id)
        .await
        .filter(|event| event.is_terminal())
        .next()
        .await?;
    
    println!("Job completed with status: {:?}", status);
}
```

### Workflow Management

```rust
use clusterdb::scheduler::{Scheduler, Workflow, Task};

#[tokio::main]
async fn main() -> Result<()> {
    let scheduler = Scheduler::new(config)?;
    
    // Create workflow
    let workflow = Workflow::new("data-pipeline")
        .add_task(Task::new("extract")
            .with_job("extractor")
            .with_parameters(extract_params))
        .add_task(Task::new("transform")
            .with_job("transformer")
            .with_dependencies(vec!["extract"]))
        .add_task(Task::new("load")
            .with_job("loader")
            .with_dependencies(vec!["transform"]));
    
    scheduler.create_workflow(workflow).await?;
    
    // Execute workflow
    let execution = scheduler.execute_workflow("data-pipeline").await?;
    
    // Monitor execution
    while let Some(event) = execution.events().await {
        println!("Workflow event: {:?}", event);
    }
}
```

## Integration

### With Monitoring

```rust
use clusterdb::{
    scheduler::Scheduler,
    monitoring::{Monitor, MetricsConfig},
};

// Configure scheduler monitoring
let metrics = MetricsConfig::new()
    .with_metric("job_duration")
    .with_metric("queue_length")
    .with_metric("resource_usage")
    .with_alerts(AlertConfig {
        queue_threshold: 100,
        job_timeout: Duration::from_hours(1),
    });

scheduler.configure_monitoring(metrics).await?;
```

### With Storage

```rust
use clusterdb::{
    scheduler::Scheduler,
    storage::{Storage, VolumeMount},
};

// Configure job storage
let storage = Storage::new(config)?;
let volume = storage.create_volume(VolumeConfig {
    name: "job-data",
    size_gb: 100,
    type_: VolumeType::SSD,
})?;

let job = Job::new("data-processor")
    .with_volume_mount(VolumeMount {
        volume: volume.name(),
        mount_path: "/data",
    });

scheduler.create_job(job).await?;
```

## Troubleshooting

### Common Issues

1. **Resource Issues**
   ```
   Error: Resource quota exceeded
   Cause: Insufficient quota
   Solution: Adjust quota or clean up resources
   ```

2. **Job Failures**
   ```
   Error: Job execution failed
   Cause: Runtime error
   Solution: Check logs and retry policy
   ```

3. **Workflow Issues**
   ```
   Error: Task dependency failed
   Cause: Upstream task failure
   Solution: Check task status and dependencies
   ```

### Debugging Tools

```bash
# Check job status
scheduler job status job-123

# View workflow execution
scheduler workflow logs workflow-456

# Monitor resource usage
scheduler resources show
```

## Support

- [Scheduler Issues](https://github.com/clusterdb/clusterdb/issues)
- [Scheduler Documentation](https://docs.clusterdb.io/scheduler)
- [Community Support](https://slack.clusterdb.io)
