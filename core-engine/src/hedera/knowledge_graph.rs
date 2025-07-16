use std::collections::{HashMap, HashSet};
use serde::{Deserialize, Serialize};
use crate::error::AppResult;

#[derive(Debug, Clone)]
pub struct KnowledgeNodes {
    pub nodes: HashMap<String, KnowledgeNodeData>,
    pub edges: HashMap<String, Vec<KnowledgeEdge>>,
    pub indices: KnowledgeIndices,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeNodeData {
    pub node_id: String,
    pub resource_id: String,
    pub source_agent: String,
    pub knowledge_type: String,
    pub content: serde_json::Value,
    pub confidence: f64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
    pub version: u32,
    pub parent_node: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeEdge {
    pub edge_id: String,
    pub from_node: String,
    pub to_node: String,
    pub relationship_type: RelationshipType,
    pub weight: f64,
    pub created_by: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    DependsOn,
    Influences,
    PartOf,
    Similar,
    Contradicts,
    Validates,
    Triggers,
    Custom(String),
}

#[derive(Debug, Clone)]
pub struct KnowledgeIndices {
    pub by_resource: HashMap<String, HashSet<String>>,
    pub by_agent: HashMap<String, HashSet<String>>,
    pub by_type: HashMap<String, HashSet<String>>,
    pub by_tag: HashMap<String, HashSet<String>>,
    pub by_timestamp: Vec<(chrono::DateTime<chrono::Utc>, String)>,
}

#[derive(Debug, Clone)]
pub struct KnowledgeQuery {
    pub resource_filter: Option<String>,
    pub agent_filter: Option<String>,
    pub type_filter: Option<String>,
    pub tag_filter: Option<Vec<String>>,
    pub confidence_threshold: Option<f64>,
    pub time_range: Option<(chrono::DateTime<chrono::Utc>, chrono::DateTime<chrono::Utc>)>,
    pub content_search: Option<String>,
    pub limit: Option<usize>,
    pub include_edges: bool,
}

impl KnowledgeNodes {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
            edges: HashMap::new(),
            indices: KnowledgeIndices::new(),
        }
    }

    /// Add a new knowledge node
    pub async fn add_node(&mut self, node_data: KnowledgeNodeData) -> AppResult<()> {
        let node_id = node_data.node_id.clone();
        
        // Update indices
        self.indices.by_resource
            .entry(node_data.resource_id.clone())
            .or_insert_with(HashSet::new)
            .insert(node_id.clone());

        self.indices.by_agent
            .entry(node_data.source_agent.clone())
            .or_insert_with(HashSet::new)
            .insert(node_id.clone());

        self.indices.by_type
            .entry(node_data.knowledge_type.clone())
            .or_insert_with(HashSet::new)
            .insert(node_id.clone());

        for tag in &node_data.tags {
            self.indices.by_tag
                .entry(tag.clone())
                .or_insert_with(HashSet::new)
                .insert(node_id.clone());
        }

        self.indices.by_timestamp.push((node_data.timestamp, node_id.clone()));
        self.indices.by_timestamp.sort_by(|a, b| a.0.cmp(&b.0));

        // Store the node
        self.nodes.insert(node_id.clone(), node_data);

        tracing::debug!("📝 Added knowledge node: {}", node_id);
        Ok(())
    }

    /// Add a knowledge edge (relationship)
    pub async fn add_edge(&mut self, edge: KnowledgeEdge) -> AppResult<()> {
        let from_node = edge.from_node.clone();
        
        self.edges
            .entry(from_node)
            .or_insert_with(Vec::new)
            .push(edge.clone());

        tracing::debug!("🔗 Added knowledge edge: {}", edge.edge_id);
        Ok(())
    }

    /// Query knowledge nodes
    pub async fn query(&self, query: &KnowledgeQuery) -> AppResult<Vec<KnowledgeNodeData>> {
        let mut candidates: HashSet<String> = HashSet::new();
        let mut first_filter = true;

        // Apply filters to find candidate nodes
        if let Some(resource) = &query.resource_filter {
            if let Some(nodes) = self.indices.by_resource.get(resource) {
                if first_filter {
                    candidates = nodes.clone();
                    first_filter = false;
                } else {
                    candidates = candidates.intersection(nodes).cloned().collect();
                }
            } else if first_filter {
                return Ok(Vec::new());
            }
        }

        if let Some(agent) = &query.agent_filter {
            if let Some(nodes) = self.indices.by_agent.get(agent) {
                if first_filter {
                    candidates = nodes.clone();
                    first_filter = false;
                } else {
                    candidates = candidates.intersection(nodes).cloned().collect();
                }
            } else if first_filter {
                return Ok(Vec::new());
            }
        }

        if let Some(type_filter) = &query.type_filter {
            if let Some(nodes) = self.indices.by_type.get(type_filter) {
                if first_filter {
                    candidates = nodes.clone();
                    first_filter = false;
                } else {
                    candidates = candidates.intersection(nodes).cloned().collect();
                }
            } else if first_filter {
                return Ok(Vec::new());
            }
        }

        if let Some(tags) = &query.tag_filter {
            for tag in tags {
                if let Some(nodes) = self.indices.by_tag.get(tag) {
                    if first_filter {
                        candidates = nodes.clone();
                        first_filter = false;
                    } else {
                        candidates = candidates.intersection(nodes).cloned().collect();
                    }
                }
            }
        }

        // If no filters applied, include all nodes
        if first_filter {
            candidates = self.nodes.keys().cloned().collect();
        }

        // Filter by additional criteria and collect results
        let mut results: Vec<KnowledgeNodeData> = candidates
            .into_iter()
            .filter_map(|node_id| self.nodes.get(&node_id))
            .filter(|node| {
                // Confidence threshold
                if let Some(threshold) = query.confidence_threshold {
                    if node.confidence < threshold {
                        return false;
                    }
                }

                // Time range
                if let Some((start, end)) = &query.time_range {
                    if node.timestamp < *start || node.timestamp > *end {
                        return false;
                    }
                }

                // Content search (simple string matching)
                if let Some(search_term) = &query.content_search {
                    let content_str = node.content.to_string().to_lowercase();
                    if !content_str.contains(&search_term.to_lowercase()) {
                        return false;
                    }
                }

                true
            })
            .cloned()
            .collect();

        // Sort by timestamp (newest first)
        results.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Apply limit
        if let Some(limit) = query.limit {
            results.truncate(limit);
        }

        tracing::debug!("🔍 Knowledge query returned {} results", results.len());
        Ok(results)
    }

    /// Get related nodes through edges
    pub async fn get_related_nodes(&self, node_id: &str, max_depth: usize) -> AppResult<Vec<KnowledgeNodeData>> {
        let mut visited = HashSet::new();
        let mut queue = vec![(node_id.to_string(), 0)];
        let mut results = Vec::new();

        while let Some((current_id, depth)) = queue.pop() {
            if depth >= max_depth || visited.contains(&current_id) {
                continue;
            }

            visited.insert(current_id.clone());

            if let Some(node) = self.nodes.get(&current_id) {
                if depth > 0 { // Don't include the starting node
                    results.push(node.clone());
                }
            }

            // Add connected nodes to queue
            if let Some(edges) = self.edges.get(&current_id) {
                for edge in edges {
                    if !visited.contains(&edge.to_node) {
                        queue.push((edge.to_node.clone(), depth + 1));
                    }
                }
            }
        }

        Ok(results)
    }

    /// Update node confidence based on validation
    pub async fn update_confidence(&mut self, node_id: &str, new_confidence: f64) -> AppResult<()> {
        if let Some(node) = self.nodes.get_mut(node_id) {
            node.confidence = new_confidence.clamp(0.0, 1.0);
            node.version += 1;
            tracing::debug!("📊 Updated confidence for node {}: {}", node_id, new_confidence);
        }
        Ok(())
    }

    /// Get knowledge summary statistics
    pub async fn get_statistics(&self) -> AppResult<KnowledgeStatistics> {
        let total_nodes = self.nodes.len();
        let total_edges = self.edges.values().map(|v| v.len()).sum();
        
        let mut confidence_sum = 0.0;
        let mut type_counts = HashMap::new();
        let mut agent_counts = HashMap::new();

        for node in self.nodes.values() {
            confidence_sum += node.confidence;
            *type_counts.entry(node.knowledge_type.clone()).or_insert(0) += 1;
            *agent_counts.entry(node.source_agent.clone()).or_insert(0) += 1;
        }

        let average_confidence = if total_nodes > 0 {
            confidence_sum / total_nodes as f64
        } else {
            0.0
        };

        Ok(KnowledgeStatistics {
            total_nodes,
            total_edges,
            average_confidence,
            knowledge_types: type_counts,
            agent_contributions: agent_counts,
            last_updated: chrono::Utc::now(),
        })
    }
}

impl KnowledgeIndices {
    pub fn new() -> Self {
        Self {
            by_resource: HashMap::new(),
            by_agent: HashMap::new(),
            by_type: HashMap::new(),
            by_tag: HashMap::new(),
            by_timestamp: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeStatistics {
    pub total_nodes: usize,
    pub total_edges: usize,
    pub average_confidence: f64,
    pub knowledge_types: HashMap<String, usize>,
    pub agent_contributions: HashMap<String, usize>,
    pub last_updated: chrono::DateTime<chrono::Utc>,
}

impl Default for KnowledgeQuery {
    fn default() -> Self {
        Self {
            resource_filter: None,
            agent_filter: None,
            type_filter: None,
            tag_filter: None,
            confidence_threshold: Some(0.5),
            time_range: None,
            content_search: None,
            limit: Some(100),
            include_edges: false,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_node(id: &str, resource: &str, agent: &str) -> KnowledgeNodeData {
        KnowledgeNodeData {
            node_id: id.to_string(),
            resource_id: resource.to_string(),
            source_agent: agent.to_string(),
            knowledge_type: "test".to_string(),
            content: serde_json::json!({"test": "data"}),
            confidence: 0.8,
            timestamp: chrono::Utc::now(),
            tags: vec!["test".to_string()],
            metadata: HashMap::new(),
            version: 1,
            parent_node: None,
        }
    }

    #[tokio::test]
    async fn test_add_node() {
        let mut knowledge = KnowledgeNodes::new();
        let node = create_test_node("node1", "resource1", "agent1");
        
        let result = knowledge.add_node(node).await;
        assert!(result.is_ok());
        assert_eq!(knowledge.nodes.len(), 1);
    }

    #[tokio::test]
    async fn test_query_by_resource() {
        let mut knowledge = KnowledgeNodes::new();
        let node1 = create_test_node("node1", "resource1", "agent1");
        let node2 = create_test_node("node2", "resource2", "agent1");
        
        knowledge.add_node(node1).await.unwrap();
        knowledge.add_node(node2).await.unwrap();

        let query = KnowledgeQuery {
            resource_filter: Some("resource1".to_string()),
            ..Default::default()
        };

        let results = knowledge.query(&query).await.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].resource_id, "resource1");
    }

    #[tokio::test]
    async fn test_confidence_filtering() {
        let mut knowledge = KnowledgeNodes::new();
        let mut node = create_test_node("node1", "resource1", "agent1");
        node.confidence = 0.3;
        knowledge.add_node(node).await.unwrap();

        let query = KnowledgeQuery {
            confidence_threshold: Some(0.5),
            ..Default::default()
        };

        let results = knowledge.query(&query).await.unwrap();
        assert_eq!(results.len(), 0);
    }
}
