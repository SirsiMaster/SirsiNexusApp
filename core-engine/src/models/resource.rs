use serde::{Deserialize, Serialize};
use sqlx::{FromRow, postgres::PgPool}; // CockroachDB uses PostgreSQL protocol
use time::OffsetDateTime;
use uuid::Uuid;
use validator::Validate;
use serde_json::Value;

use crate::error::{Result, Error};

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Resource {
    pub id: Uuid,
    pub name: String,
    #[sqlx(rename = "type")]
    pub resource_type: String,
    pub data: Value,
    pub owner_id: Uuid,
    pub project_id: Uuid,
    pub created_at: Option<OffsetDateTime>,
    pub updated_at: Option<OffsetDateTime>,
}

#[derive(Debug, Validate, Deserialize)]
pub struct CreateResource {
    #[validate(length(min = 1, max = 255))]
    pub name: String,
    #[validate(length(min = 1, max = 100))]
    pub resource_type: String,
    pub description: Option<String>,
    pub data: Value,
    pub project_id: Uuid,
}

#[derive(Debug, Validate, Deserialize)]
pub struct UpdateResource {
    pub name: Option<String>,
    pub resource_type: Option<String>,
    pub description: Option<String>,
    pub data: Option<Value>,
}

impl Resource {
    pub async fn create(pool: &PgPool, new_resource: CreateResource, owner_id: Uuid) -> Result<Self> {
        let resource = sqlx::query_as::<_, Self>(
            r#"INSERT INTO resources (name, type, data, owner_id, project_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, type, data, owner_id, project_id, created_at, updated_at"#
        )
        .bind(&new_resource.name)
        .bind(&new_resource.resource_type)
        .bind(&new_resource.data)
        .bind(owner_id)
        .bind(new_resource.project_id)
        .fetch_one(pool)
        .await
        .map_err(Error::Database)?;

        Ok(resource)
    }

    pub async fn find_by_id(pool: &PgPool, id: Uuid, owner_id: Uuid) -> Result<Option<Self>> {
        let resource = sqlx::query_as::<_, Self>(
            r#"SELECT id, name, type, data, owner_id, project_id, created_at, updated_at
            FROM resources WHERE id = $1 AND owner_id = $2"#
        )
        .bind(id)
        .bind(owner_id)
        .fetch_optional(pool)
        .await
        .map_err(Error::Database)?;

        Ok(resource)
    }

    pub async fn find_by_owner(pool: &PgPool, owner_id: Uuid) -> Result<Vec<Self>> {
        let resources = sqlx::query_as::<_, Self>(
            r#"SELECT id, name, type, data, owner_id, project_id, created_at, updated_at
            FROM resources WHERE owner_id = $1
            ORDER BY created_at DESC"#
        )
        .bind(owner_id)
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

        Ok(resources)
    }

    pub async fn find_by_project(pool: &PgPool, project_id: Uuid, owner_id: Uuid) -> Result<Vec<Self>> {
        let resources = sqlx::query_as::<_, Self>(
            r#"SELECT id, name, type, data, owner_id, project_id, created_at, updated_at
            FROM resources WHERE project_id = $1 AND owner_id = $2
            ORDER BY created_at DESC"#
        )
        .bind(project_id)
        .bind(owner_id)
        .fetch_all(pool)
        .await
        .map_err(Error::Database)?;

        Ok(resources)
    }

    pub async fn update(&self, pool: &PgPool, updates: UpdateResource) -> Result<()> {
        sqlx::query(
            r#"UPDATE resources
            SET name = COALESCE($1, name),
                type = COALESCE($2, type),
                data = COALESCE($3, data),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND owner_id = $5"#
        )
        .bind(updates.name)
        .bind(updates.resource_type)
        .bind(updates.data)
        .bind(self.id)
        .bind(self.owner_id)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

        Ok(())
    }

    pub async fn delete(pool: &PgPool, id: Uuid, owner_id: Uuid) -> Result<bool> {
        let result = sqlx::query(
            "DELETE FROM resources WHERE id = $1 AND owner_id = $2"
        )
        .bind(id)
        .bind(owner_id)
        .execute(pool)
        .await
        .map_err(Error::Database)?;

        Ok(result.rows_affected() > 0)
    }
}
