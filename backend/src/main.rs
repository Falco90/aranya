use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{post},
};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{Pool, Postgres, migrate::Migrator, postgres::PgPoolOptions};
use std::{env, error::Error, net::SocketAddr, path::Path};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[derive(Deserialize, Debug)]
pub struct JoinCourseRequest {
    pub privy_id: String,
    pub course_id: i64,
}

#[derive(Deserialize, Debug)]
pub struct LessonCompleteRequest {
    pub privy_id: String,
    pub lesson_id: i64,
    pub module_id: i64,
    pub course_id: i64,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Course {
    pub title: String,
    pub description: String,
    pub creator_id: String,
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
    pub question_text: String,
    pub answers: Vec<AnswerOption>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct AnswerOption {
    pub answer_text: String,
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
        .route("/join-course", post(join_course))
        .route("/complete-lesson", post(complete_lesson))
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

    // Ensure creator exists
    sqlx::query("INSERT INTO creator (id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(&payload.creator_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let course_id: i64 = sqlx::query_scalar(
        "INSERT INTO course (title, creator_id, description) VALUES ($1, $2, $3) RETURNING id",
    )
    .bind(&payload.title)
    .bind(&payload.creator_id)
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
                "INSERT INTO question (question_text, quiz_id) VALUES ($1, $2) RETURNING id",
            )
            .bind(&question.question_text)
            .bind(quiz_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            for answer in &question.answers {
                sqlx::query(
                    "INSERT INTO answer_option (answer_text, is_correct, question_id) VALUES ($1, $2, $3)",
                )
                .bind(&answer.answer_text)
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

pub async fn join_course(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<JoinCourseRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    println!("payload: {:#?}", payload);

    // Ensure learner exists
    sqlx::query("INSERT INTO learner (id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(&payload.privy_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Insert enrollment
    sqlx::query(
        "INSERT INTO learner_course_enrollment (learner_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",).bind(&payload.privy_id).bind(&payload.course_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Course joined successfully", "course_id": &payload.course_id })),
    ))
}

pub async fn complete_lesson(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<LessonCompleteRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    println!("payload: {:#?}", payload);

    // 1. Validate that lesson belongs to the module
    let db_module_id: i64 = sqlx::query_scalar("SELECT module_id FROM lesson WHERE id = $1")
        .bind(&payload.lesson_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Lesson lookup failed: {}", e),
            )
        })?
        .ok_or_else(|| (StatusCode::BAD_REQUEST, "Lesson not found".to_string()))?;

    if db_module_id != payload.module_id {
        return Err((
            StatusCode::BAD_REQUEST,
            "Lesson does not belong to the specified module".to_string(),
        ));
    }

    // 2. Validate that module belongs to the course
    let db_course_id: i64 = sqlx::query_scalar("SELECT course_id FROM module WHERE id = $1")
        .bind(&payload.module_id)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Module lookup failed: {}", e),
            )
        })?
        .ok_or_else(|| (StatusCode::BAD_REQUEST, "Module not found".to_string()))?;

    if db_course_id != payload.course_id {
        return Err((
            StatusCode::BAD_REQUEST,
            "Module does not belong to the specified course".to_string(),
        ));
    }

    // 3. Ensure learner exists
    sqlx::query("INSERT INTO learner (id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(&payload.privy_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Insert learner failed: {}", e),
            )
        })?;

    // Insert lesson_progress
    sqlx::query(
        "INSERT INTO lesson_progress (learner_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING").bind(&payload.privy_id).bind(&payload.lesson_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Check if all lessons in module are completed
    let total_lessons: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM lesson WHERE module_id = $1")
        .bind(&payload.module_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            println!("❌ total_lessons query error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        })?;

    let completed_lessons: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM lesson_progress lp
         JOIN lesson l ON lp.lesson_id = l.id
         WHERE lp.learner_id = $1 AND l.module_id = $2",
    )
    .bind(&payload.privy_id)
    .bind(&payload.module_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        println!("❌ total_lessons query error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    if total_lessons > 0 && total_lessons == completed_lessons {
        sqlx::query(
            "INSERT INTO module_progress (learner_id, module_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING",
        )
        .bind(&payload.privy_id)
        .bind(&payload.module_id)
        .execute(&mut *tx)
        .await
        .ok();
    }

    let total_modules: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM module WHERE course_id = $1")
        .bind(&payload.course_id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| {
            println!("❌ total_lessons query error: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        })?;

    let completed_modules: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM module_progress
         WHERE learner_id = $1 AND module_id IN (
             SELECT id FROM module WHERE course_id = $2
         )",
    )
    .bind(&payload.privy_id)
    .bind(&payload.course_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        println!("❌ total_lessons query error: {}", e);
        (StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
    })?;

    if total_modules == completed_modules && total_modules > 0 {
        sqlx::query(
            "INSERT INTO course_progress (learner_id, course_id)
             VALUES ($1, $2) ON CONFLICT DO NOTHING",
        )
        .bind(&payload.privy_id)
        .bind(&payload.course_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }
    let progress_percent = if total_modules > 0 {
        (completed_modules * 100 / total_modules) as i32
    } else {
        0
    };

    let completed = progress_percent == 100;

    // Upsert into course_progress
    sqlx::query(
        "INSERT INTO course_progress (learner_id, course_id, progress_percent, completed)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (learner_id, course_id)
                 DO UPDATE SET progress_percent = $3, completed = $4, last_accessed = now()",
    )
    .bind(&payload.privy_id)
    .bind(&payload.course_id)
    .bind(&progress_percent)
    .bind(&completed)
    .execute(&mut *tx)
    .await
    .ok();

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Progress updated successfully" })),
    ))
}
