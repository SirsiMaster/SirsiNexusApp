use std::sync::Arc;
use anyhow::Result;
use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use tracing::{info, warn, error};
use uuid::Uuid;

use qdrant_client::{
    client::QdrantClient,
    qdrant::{CreateCollectionBuilder, VectorParamsBuilder, Distance, PointStruct},
};
use sqlx::postgres::PgPool;
use redis::aio::ConnectionManager;

/// Hybrid Database Layer for AI-Optimized SirsiNexus
/// 
/// This layer routes data to the optimal database based on data type:
/// - CockroachDB: Relational data (users, projects, configurations)
/// - Qdrant: Vector data (embeddings, AI knowledge, agent memory)
/// - Redis: Session data (conversations, temporary state)
#[derive(Clone)]
pub struct HybridDatabaseLayer {
    // Relational database for traditional data
    pub relational: Arc<PgPool>,
    
    // Vector database for AI/ML workloads
    pub vector: Arc<QdrantClient>,
    
    // Cache for sessions and temporary data
    pub cache: Arc<RwLock<ConnectionManager>>,
}

/// Data router that determines optimal database for each operation
pub struct DataRouter {
    pub hybrid_layer: HybridDatabaseLayer,
}

/// AI Knowledge Store backed by vector database
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIKnowledgeStore {
    pub agent_memory_collection: String,
    pub knowledge_graph_collection: String,
    pub interaction_patterns_collection: String,
    pub best_practices_collection: String,
    pub conversation_context_collection: String,
}

/// Vector store configuration for different AI collections
#[derive(Debug, Clone)]
pub struct VectorCollectionConfig {
    pub name: String,
    pub dimension: u64,
    pub distance: Distance,
    pub description: String,
}

impl HybridDatabaseLayer {
    /// Initialize hybrid database layer with all connections
    pub async fn new(
        relational_url: &str,
        vector_url: &str,
        redis_url: &str,
    ) -> Result<Self> {
        info!("🔄 Initializing Hybrid Database Layer");

        // Initialize CockroachDB connection
        let relational = Arc::new(
            PgPool::connect(relational_url)
                .await
                .map_err(|e| anyhow::anyhow!("Failed to connect to CockroachDB: {}", e))?
        );
        info!("✅ CockroachDB connection established");

        // Initialize Qdrant connection
        let vector = Arc::new(
            QdrantClient::from_url(vector_url)
                .build()
                .map_err(|e| anyhow::anyhow!("Failed to connect to Qdrant: {}", e))?
        );
        info!("✅ Qdrant vector database connection established");

        // Initialize Redis connection
        let redis_client = redis::Client::open(redis_url)
            .map_err(|e| anyhow::anyhow!("Failed to create Redis client: {}", e))?;
        let cache = Arc::new(RwLock::new(
            ConnectionManager::new(redis_client)
                .await
                .map_err(|e| anyhow::anyhow!("Failed to connect to Redis: {}", e))?
        ));
        info!("✅ Redis cache connection established");

        let layer = Self {
            relational,
            vector,
            cache,
        };

        // Initialize AI collections
        layer.initialize_ai_collections().await?;

        info!("🚀 Hybrid Database Layer fully initialized");
        Ok(layer)
    }

    /// Initialize AI vector collections
    async fn initialize_ai_collections(&self) -> Result<()> {
        info!("🧠 Initializing AI vector collections");

        let collections = vec![
            VectorCollectionConfig {
                name: "agent_memory".to_string(),
                dimension: 1536, // OpenAI embedding dimension
                distance: Distance::Cosine,
                description: "Agent memory and learning patterns".to_string(),
            },
            VectorCollectionConfig {
                name: "knowledge_graph".to_string(),
                dimension: 1536,
                distance: Distance::Cosine,
                description: "Cross-domain knowledge synthesis".to_string(),
            },
            VectorCollectionConfig {
                name: "interaction_patterns".to_string(),
                dimension: 1536,
                distance: Distance::Cosine,
                description: "User interaction patterns and preferences".to_string(),
            },
            VectorCollectionConfig {
                name: "best_practices".to_string(),
                dimension: 1536,
                distance: Distance::Cosine,
                description: "Infrastructure best practices and recommendations".to_string(),
            },
            VectorCollectionConfig {
                name: "conversation_context".to_string(),
                dimension: 1536,
                distance: Distance::Cosine,
                description: "Real-time conversation context and history".to_string(),
            },
        ];

        for config in collections {
            if let Err(e) = self.create_collection(&config).await {
                warn!("Collection {} may already exist: {}", config.name, e);
            } else {
                info!("✅ Created collection: {}", config.name);
            }
        }

        Ok(())
    }

    /// Create a vector collection
    async fn create_collection(&self, config: &VectorCollectionConfig) -> Result<()> {
        let collection_name = &config.name;
        
        self.vector
            .create_collection(
                CreateCollectionBuilder::new(collection_name)
                    .vectors_config(VectorParamsBuilder::new(config.dimension, config.distance)),
            )
            .await
            .map_err(|e| anyhow::anyhow!("Failed to create collection {}: {}", collection_name, e))?;

        Ok(())
    }

    /// Health check for all database connections
    pub async fn health_check(&self) -> DatabaseHealth {
        let mut health = DatabaseHealth::default();

        // Check CockroachDB
        health.relational = match sqlx::query("SELECT 1")
            .fetch_one(self.relational.as_ref())
            .await
        {
            Ok(_) => true,
            Err(e) => {
                error!("CockroachDB health check failed: {}", e);
                false
            }
        };

        // Check Qdrant
        health.vector = match self.vector.health_check().await {
            Ok(_) => true,
            Err(e) => {
                error!("Qdrant health check failed: {}", e);
                false
            }
        };

        // Check Redis
        health.cache = match self.cache.read().await.get_connection().await {
            Ok(_) => true,
            Err(e) => {
                error!("Redis health check failed: {}", e);
                false
            }
        };

        health
    }
}

impl DataRouter {
    pub fn new(hybrid_layer: HybridDatabaseLayer) -> Self {
        Self { hybrid_layer }
    }

    /// Route data operations to optimal database
    pub async fn route_operation(&self, operation: DataOperation) -> Result<DataOperationResult> {
        match operation {
            DataOperation::RelationalQuery { query, params } => {
                // Route to CockroachDB
                self.execute_relational_query(&query, params).await
            }
            DataOperation::VectorSearch { collection, query_vector, limit } => {
                // Route to Qdrant
                self.execute_vector_search(&collection, query_vector, limit).await
            }
            DataOperation::CacheOperation { key, operation_type } => {
                // Route to Redis
                self.execute_cache_operation(&key, operation_type).await
            }
        }
    }

    async fn execute_relational_query(
        &self,
        query: &str,
        _params: Vec<String>,
    ) -> Result<DataOperationResult> {
        let result = sqlx::query(query)
            .fetch_all(self.hybrid_layer.relational.as_ref())
            .await?;

        Ok(DataOperationResult::RelationalResult {
            rows_affected: result.len(),
            data: serde_json::Value::Null, // Simplified for now
        })
    }

    async fn execute_vector_search(
        &self,
        collection: &str,
        query_vector: Vec<f32>,
        limit: u64,
    ) -> Result<DataOperationResult> {
        let results = self
            .hybrid_layer
            .vector
            .search_points(&qdrant_client::qdrant::SearchPointsBuilder::new(
                collection,
                query_vector,
                limit,
            ))
            .await?;

        Ok(DataOperationResult::VectorResult {
            results: results.result.len(),
            scores: results.result.iter().map(|r| r.score).collect(),
        })
    }

    async fn execute_cache_operation(
        &self,
        key: &str,
        operation_type: CacheOperationType,
    ) -> Result<DataOperationResult> {
        let mut connection = self.hybrid_layer.cache.write().await;
        
        match operation_type {
            CacheOperationType::Get => {
                let value: Option<String> = redis::cmd("GET")
                    .arg(key)
                    .query_async(&mut *connection)
                    .await?;
                
                Ok(DataOperationResult::CacheResult {
                    success: value.is_some(),
                    value: value.unwrap_or_default(),
                })
            }
            CacheOperationType::Set { value, ttl } => {
                let result: String = redis::cmd("SETEX")
                    .arg(key)
                    .arg(ttl)
                    .arg(value)
                    .query_async(&mut *connection)
                    .await?;
                
                Ok(DataOperationResult::CacheResult {
                    success: result == "OK",
                    value: result,
                })
            }
        }
    }
}

/// Database health status
#[derive(Debug, Default)]
pub struct DatabaseHealth {
    pub relational: bool,
    pub vector: bool,
    pub cache: bool,
}

impl DatabaseHealth {
    pub fn is_healthy(&self) -> bool {
        self.relational && self.vector && self.cache
    }

    pub fn status_summary(&self) -> String {
        format!(
            "Relational: {}, Vector: {}, Cache: {}",
            if self.relational { "✅" } else { "❌" },
            if self.vector { "✅" } else { "❌" },
            if self.cache { "✅" } else { "❌" }
        )
    }
}

/// Data operation types for routing
#[derive(Debug)]
pub enum DataOperation {
    RelationalQuery {
        query: String,
        params: Vec<String>,
    },
    VectorSearch {
        collection: String,
        query_vector: Vec<f32>,
        limit: u64,
    },
    CacheOperation {
        key: String,
        operation_type: CacheOperationType,
    },
}

#[derive(Debug)]
pub enum CacheOperationType {
    Get,
    Set { value: String, ttl: u64 },
}

/// Results from database operations
#[derive(Debug)]
pub enum DataOperationResult {
    RelationalResult {
        rows_affected: usize,
        data: serde_json::Value,
    },
    VectorResult {
        results: usize,
        scores: Vec<f32>,
    },
    CacheResult {
        success: bool,
        value: String,
    },
}

/// AI-specific operations for consciousness and agent memory
pub struct SirsiConsciousness {
    pub hybrid_layer: HybridDatabaseLayer,
    pub semantic_memory_collection: String,
}

impl SirsiConsciousness {
    pub fn new(hybrid_layer: HybridDatabaseLayer) -> Self {
        Self {
            hybrid_layer,
            semantic_memory_collection: "agent_memory".to_string(),
        }
    }

    /// Store semantic memory with vector embedding
    pub async fn store_semantic_memory(
        &self,
        memory_id: Uuid,
        content: &str,
        embedding: Vec<f32>,
        metadata: serde_json::Value,
    ) -> Result<()> {
        let point = PointStruct::new(
            memory_id.to_string(),
            embedding,
            metadata,
        );

        self.hybrid_layer
            .vector
            .upsert_points(&self.semantic_memory_collection, None, vec![point], None)
            .await?;

        info!("💾 Stored semantic memory: {}", memory_id);
        Ok(())
    }

    /// Retrieve similar memories using vector search
    pub async fn retrieve_similar_memories(
        &self,
        query_embedding: Vec<f32>,
        limit: u64,
        score_threshold: Option<f32>,
    ) -> Result<Vec<(String, f32, serde_json::Value)>> {
        let mut search_builder = qdrant_client::qdrant::SearchPointsBuilder::new(
            &self.semantic_memory_collection,
            query_embedding,
            limit,
        );

        if let Some(threshold) = score_threshold {
            search_builder = search_builder.score_threshold(threshold);
        }

        let results = self.hybrid_layer.vector.search_points(&search_builder).await?;

        let memories = results
            .result
            .into_iter()
            .map(|point| {
                (
                    point.id.unwrap().point_id_options.unwrap().to_string(),
                    point.score,
                    serde_json::to_value(point.payload).unwrap_or(serde_json::Value::Null),
                )
            })
            .collect();

        Ok(memories)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_database_health() {
        // This would require running databases for full integration test
        let health = DatabaseHealth::default();
        assert!(!health.is_healthy());
    }
}
