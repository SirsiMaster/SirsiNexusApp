use axum::{
    extract::{Path, State},
    Json,
};
use serde::Deserialize;
use sqlx::PgPool; // CockroachDB uses PostgreSQL protocol
use uuid::Uuid;
use validator::Validate;

use crate::{
    error::AppResult,
    middleware::AuthUser,
    models::project::{CreateProject, Project, ProjectStatus},
};

// Router function for backwards compatibility
use axum::{routing::{get, post, put, delete}, Router};

pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/", get(list_projects_handler))
        .route("/", post(create_project_handler))
        .route("/:id", get(get_project_handler))
        .route("/:id", put(update_project_handler))
        .route("/:id", delete(delete_project_handler))
}

#[derive(Debug, Deserialize, Validate)]
pub struct CreateProjectRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProjectRequest {
    #[validate(length(min = 1, max = 255))]
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<ProjectStatus>,
}

#[axum::debug_handler]
pub async fn list_projects_handler(
    State(pool): State<PgPool>,
    auth: AuthUser,
) -> AppResult<Json<Vec<Project>>> {
    let projects = Project::find_by_owner(&pool, auth.user.id).await?;
    Ok(Json(projects))
}

#[axum::debug_handler]
pub async fn create_project_handler(
    State(pool): State<PgPool>,
    auth: AuthUser,
    Json(payload): Json<CreateProjectRequest>,
) -> AppResult<Json<Project>> {
    // Validate request
    payload.validate()?;

    // Create project
    let project = Project::create(
        &pool,
        CreateProject {
            name: payload.name,
            description: payload.description,
            owner_id: auth.user.id,
        },
    ).await?;

    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn get_project_handler(
    State(pool): State<PgPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<Json<Project>> {
    let project = Project::find_by_id(&pool, id)
        .await?
        .ok_or_else(|| crate::error::AppError::NotFound("Project not found".into()))?;

    // Verify ownership
    if project.owner_id != auth.user.id {
        return Err(crate::error::AppError::Auth("Not authorized".into()));
    }

    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn update_project_handler(
    State(pool): State<PgPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateProjectRequest>,
) -> AppResult<Json<Project>> {
    // Validate request
    payload.validate()?;

    // Get project
    let mut project = Project::find_by_id(&pool, id)
        .await?
        .ok_or_else(|| crate::error::AppError::NotFound("Project not found".into()))?;

    // Verify ownership
    if project.owner_id != auth.user.id {
        return Err(crate::error::AppError::Auth("Not authorized".into()));
    }

    // Update project
    if let Some(name) = payload.name {
        project.name = name;
    }
    if let Some(description) = payload.description {
        project.description = Some(description);
    }
    if let Some(status) = payload.status {
        project.status = status;
    }

    project.update(&pool).await?;

    Ok(Json(project))
}

#[axum::debug_handler]
pub async fn delete_project_handler(
    State(pool): State<PgPool>,
    auth: AuthUser,
    Path(id): Path<Uuid>,
) -> AppResult<()> {
    // Get project
    let project = Project::find_by_id(&pool, id)
        .await?
        .ok_or_else(|| crate::error::AppError::NotFound("Project not found".into()))?;

    // Verify ownership
    if project.owner_id != auth.user.id {
        return Err(crate::error::AppError::Auth("Not authorized".into()));
    }

    // Delete project
    Project::delete(&pool, id).await?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
        routing::{get, post},
        Router,
    };
use sqlx::postgres::PgPoolOptions; // CockroachDB connection
    use tower::ServiceExt;

    async fn setup() -> PgPool {
        // Load environment variables from .env file
        dotenv::dotenv().ok();
        
        let db_url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable".to_string());
        
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&db_url)
            .await
            .expect("Failed to connect to database");

        // Clear test database
        sqlx::query("TRUNCATE projects CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");

        pool
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_create_project() {
        let pool = setup().await;
        
        let app: Router<()> = Router::new()
            .route("/projects", post(create_project_handler))
            .with_state(pool.clone());

        let request = CreateProjectRequest {
            name: "Test Project".to_string(),
            description: Some("Test Description".to_string()),
        };

        // TODO: Add test with authentication once auth is implemented
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_list_projects() {
        let pool = setup().await;
        
        let app: Router<()> = Router::new()
            .route("/projects", get(list_projects_handler))
            .with_state(pool.clone());

        // TODO: Add test with authentication once auth is implemented
    }
}
