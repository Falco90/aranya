use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use dotenv::dotenv;
use serde_json::json;
use sqlx::{migrate::Migrator, postgres::PgPoolOptions, Pool, Postgres};
use std::{env, path::Path};

pub async fn connect() -> Result<Pool<Postgres>, sqlx::Error> {
    dotenv().ok();
    let url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    PgPoolOptions::new().connect(&url).await
}

pub async fn run_migrations(
    State(pool): State<Pool<Postgres>>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let migrator = Migrator::new(Path::new("./migrations"))
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    migrator
        .run(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    println!("Migrations applied successfully.");

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Migrations ran successfully" })),
    ))
}
