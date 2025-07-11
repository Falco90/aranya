use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use dotenv::dotenv;
use serde::Deserialize;
use serde_json::json;
use sqlx::{Pool, Postgres, migrate::Migrator, postgres::PgPoolOptions};
use std::{env, error::Error, net::SocketAddr, path::Path};
use tokio::net::TcpListener;

#[derive(Deserialize)]
struct NewCourse {
    title: String,
    creator: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let url = env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new().connect(&url).await?;

    let app = Router::new()
        .route("/create-course", post(create_course))
        .route("/run-migrations", get(run_migrations))
        .with_state(pool);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();

    Ok(())
}

async fn run_migrations(
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

async fn create_course(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<NewCourse>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let _ = sqlx::query("INSERT INTO course (title, creator, num_students) VALUES ($1, $2, $3)")
        .bind(&payload.title)
        .bind(&payload.creator)
        .bind(0)
        .execute(&pool)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Course created successfully" })),
    ))
}
