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
pub struct CreateCoursePayload {
    title: String,
    creator: String,
    modules: Vec<Module>,
    final_exam: Quiz,
}

#[derive(Deserialize)]
pub struct Module {
    title: String,
    position: u32,
    lessons: Vec<Lesson>,
    quiz: Quiz,
}

#[derive(Deserialize)]
pub struct Lesson {
    title: String,
    position: u32,
    content: String,
}

#[derive(Deserialize)]
struct Quiz {
    questions: Vec<Question>,
}

#[derive(Deserialize)]
struct Question {
    text: String,
    answers: Vec<Answer>,
}

#[derive(Deserialize)]
pub struct Answer {
    text: String,
    is_correct: bool,
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
    Json(payload): Json<CreateCoursePayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to begin transaction: {}", e),
        )
    })?;

    let course_id: i64 = sqlx::query_scalar(
        "INSERT INTO course (title, creator, num_students) VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(&payload.title)
    .bind(&payload.creator)
    .bind(0)
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

            sqlx::query("INSERT INTO lesson (title, content, module_id, position) VALUES ($1, $2, $3, $4)")
                .bind(&lesson.title)
                .bind(&lesson.content)
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
                "INSERT INTO question (question, quiz_id) VALUES ($1, $2) RETURNING id",
            )
            .bind(&question.text)
            .bind(quiz_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            for answer in &question.answers {
                sqlx::query(
                    "INSERT INTO answer (text, is_correct, question_id) VALUES ($1, $2, $3)",
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

    let exam_quiz_id: i64 =
        sqlx::query_scalar("INSERT INTO quiz (course_id) VALUES ($1) RETURNING id")
            .bind(course_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    for question in &payload.final_exam.questions {
        let question_id: i64 = sqlx::query_scalar(
            "INSERT INTO question (question, quiz_id) VALUES ($1, $2) RETURNING id",
        )
        .bind(&question.text)
        .bind(exam_quiz_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        for answer in &question.answers {
            sqlx::query("INSERT INTO answer (text, is_correct, question_id) VALUES ($1, $2, $3)")
                .bind(&answer.text)
                .bind(answer.is_correct)
                .bind(question_id)
                .execute(&mut *tx)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
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
