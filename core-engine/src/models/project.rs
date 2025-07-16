use serde::{Deserialize, Serialize};
use sqlx::{FromRow, postgres::PgPool}; // CockroachDB uses PostgreSQL protocol
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;

use crate::error::{Result, Error};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub status: ProjectStatus,
    pub owner_id: Uuid,
    pub created_at: Option<OffsetDateTime>,
    pub updated_at: Option<OffsetDateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::Type)]
#[sqlx(type_name = "TEXT", rename_all = "lowercase")]
pub enum ProjectStatus {
    Active,
    Paused,
    Completed,
    Archived,
}

#[derive(Debug, Validate, Clone)]
pub struct CreateProject {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    pub description: Option<String>,
    pub owner_id: Uuid,
}

impl Project {
    pub async fn create(pool: &PgPool, new_project: CreateProject) -> Result<Self> {
        let project = sqlx::query_as::<_, Self>(
            r#"INSERT INTO projects (name, description, status, owner_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, status, owner_id, created_at, updated_at"#
        )
        .bind(&new_project.name)
        .bind(&new_project.description)
        .bind(ProjectStatus::Active)
        .bind(new_project.owner_id)
        .fetch_one(pool)
        .await
        .map_err(Error::Database)?;

        Ok(project)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Self>> {
        let project = sqlx::query_as::<_, Self>(
            r#"SELECT id, name, description, status, owner_id, created_at, updated_at
            FROM projects WHERE id = $1"#
        )
        .bind(id)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?;

        Ok(project)
    }

    pub async fn find_by_owner(pool: &PgPool, owner_id: Uuid) -> Result<Vec<Self>> {
        let projects = sqlx::query_as::<_, Self>(
            r#"SELECT id, name, description, status, owner_id, created_at, updated_at
            FROM projects WHERE owner_id = $1
            ORDER BY created_at DESC"#
        )
        .bind(owner_id)
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

        Ok(projects)
    }

    pub async fn update(&self, pool: &PgPool) -> Result<()> {
        sqlx::query(
            "UPDATE projects
            SET name = $1, description = $2, status = $3
            WHERE id = $4"
        )
        .bind(&self.name)
        .bind(&self.description)
        .bind(&self.status)
        .bind(self.id)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

        Ok(())
    }

    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<()> {
        sqlx::query("DELETE FROM projects WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await
            .map_err(Error::Database)?;

        Ok(())
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;

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

        // Clear test database (clear projects first due to foreign key constraint)
        sqlx::query("TRUNCATE projects CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");
        
        sqlx::query("TRUNCATE users CASCADE")
            .execute(&pool)
            .await
            .expect("Failed to clear test database");

        pool
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_project_crud() {
        let pool = setup().await;

        // First create a user to own the project
        use crate::models::user::User;
        let user = User::create(
            &pool,
            "Test User",
            "test@example.com",
            "hashed_password",
        ).await.expect("Failed to create test user");

        // Create
        let new_project = CreateProject {
            name: "Test Project".to_string(),
            description: Some("Test Description".to_string()),
            owner_id: user.id,
        };

        let project = Project::create(&pool, new_project.clone())
            .await
            .expect("Failed to create project");

        assert_eq!(project.name, new_project.name);
        assert_eq!(project.description, new_project.description);
        assert_eq!(project.owner_id, new_project.owner_id);

        // Read
        let found = Project::find_by_id(&pool, project.id)
            .await
            .expect("Failed to fetch project")
            .expect("Project not found");

        assert_eq!(found.id, project.id);
        assert_eq!(found.name, project.name);

        // Update
        let mut updated = found;
        updated.name = "Updated Name".to_string();
        updated.update(&pool)
            .await
            .expect("Failed to update project");

        let found = Project::find_by_id(&pool, project.id)
            .await
            .expect("Failed to fetch project")
            .expect("Project not found");

        assert_eq!(found.name, "Updated Name");

        // Delete
        Project::delete(&pool, project.id)
            .await
            .expect("Failed to delete project");

        let found = Project::find_by_id(&pool, project.id)
            .await
            .expect("Failed to fetch project");

        assert!(found.is_none());
    }

    #[tokio::test]
    #[serial_test::serial]
    async fn test_find_by_owner() {
        let pool = setup().await;
        
        // First create a user to own the projects
        use crate::models::user::User;
        let user = User::create(
            &pool,
            "Test Owner",
            "owner@example.com",
            "hashed_password",
        ).await.expect("Failed to create test user");
        
        let owner_id = user.id;

        // Create multiple projects
        for i in 0..3 {
            let new_project = CreateProject {
                name: format!("Test Project {}", i),
                description: Some(format!("Test Description {}", i)),
                owner_id,
            };

            Project::create(&pool, new_project)
                .await
                .expect("Failed to create project");
        }

        // Create a project with different owner
        let other_user = User::create(
            &pool,
            "Other User",
            "other@example.com",
            "hashed_password",
        ).await.expect("Failed to create other test user");
        
        let new_project = CreateProject {
            name: "Other Project".to_string(),
            description: Some("Other Description".to_string()),
            owner_id: other_user.id,
        };

        Project::create(&pool, new_project)
            .await
            .expect("Failed to create project");

        // Find by owner
        let projects = Project::find_by_owner(&pool, owner_id)
            .await
            .expect("Failed to fetch projects");

        assert_eq!(projects.len(), 3);
        assert!(projects.iter().all(|p| p.owner_id == owner_id));
    }
}
