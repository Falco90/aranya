use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{Pool, Postgres, migrate::Migrator, postgres::PgPoolOptions};
use std::{env, error::Error, net::SocketAddr, path::Path};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[derive(Debug, Deserialize, Serialize)]
pub struct Course {
    pub title: String,
    pub description: String,
    pub creator: String,
    pub modules: Vec<Module>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Module {
    pub title: String,
    pub position: i32,
    pub lessons: Vec<Lesson>,
    pub quiz: Quiz,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Lesson {
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub position: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Quiz {
    pub questions: Vec<Question>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Question {
    pub text: String,
    pub answers: Vec<AnswerOption>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AnswerOption {
    pub text: String,
    pub is_correct: bool,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    dotenv().ok();

    let url = env::var("DATABASE_URL")?;
    let pool = PgPoolOptions::new().connect(&url).await?;

    let cors = CorsLayer::new()
        .allow_origin(Any) // ⚠️ use `Any` for development only
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/create-course", post(create_course))
        .route("/run-migrations", get(run_migrations))
        .with_state(pool)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 4000));
    println!("Listening on {}", addr);

    let listener = TcpListener::bind("127.0.0.1:4000").await.unwrap();
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

pub async fn create_course(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<Course>,
) -> Result<impl IntoResponse, (StatusCode, String)> {

    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    println!("payload: {:#?}", payload);
    let course_id: i64 = sqlx::query_scalar(
        "INSERT INTO course (title, creator, description) VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(&payload.title)
    .bind(&payload.creator)
    .bind(&payload.description)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    for module in &payload.modules {
        let position_i32: i32 = module.position.try_into().map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                format!("Position {} is too large for an i32", module.position),
            )
        })?;

        let module_id: i64 = sqlx::query_scalar(
            "INSERT INTO module (title, course_id, position) VALUES ($1, $2, $3) RETURNING id",
        )
        .bind(&module.title)
        .bind(course_id)
        .bind(position_i32)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        for lesson in &module.lessons {
            let position_i32: i32 = lesson.position.try_into().map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    format!("Position {} is too large for an i32", module.position),
                )
            })?;

            sqlx::query(
                "INSERT INTO lesson (title, content, video_url, module_id, position) VALUES ($1, $2, $3, $4, $5)",
            )
            .bind(&lesson.title)
            .bind(&lesson.content)
            .bind(&lesson.video_url)
            .bind(module_id)
            .bind(position_i32)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        }

        let quiz_id: i64 =
            sqlx::query_scalar("INSERT INTO quiz (module_id) VALUES ($1) RETURNING id")
                .bind(module_id)
                .fetch_one(&mut *tx)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        for question in &module.quiz.questions {
            let question_id: i64 = sqlx::query_scalar(
                "INSERT INTO question (text, quiz_id) VALUES ($1, $2) RETURNING id",
            )
            .bind(&question.text)
            .bind(quiz_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            for answer in &question.answers {
                sqlx::query(
                    "INSERT INTO answer_option (text, is_correct, question_id) VALUES ($1, $2, $3)",
                )
                .bind(&answer.text)
                .bind(answer.is_correct)
                .bind(question_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
            }
        }
    }

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Course created successfully", "course_id": course_id })),
    ))
}
