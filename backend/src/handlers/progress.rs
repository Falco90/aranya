use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Pool, Postgres, Row, postgres::PgRow};

use crate::models::progress::{
    CompleteQuizPayload, CompletedLessonsQuery, CompletedLessonsResponse, CourseProgressQuery, CourseProgressResponse, LessonCompleteRequest, ModuleCompleteRequest
};
pub async fn complete_lesson(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<LessonCompleteRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query(
        r#"
        INSERT INTO lesson_completion (learner_id, lesson_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.lesson_id)
    .execute(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to insert lesson progress: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Lesson marked complete" })),
    ))
}

pub async fn complete_module(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<ModuleCompleteRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    // Count all lessons in the module
    let total: i64 = sqlx::query_scalar(r#"SELECT COUNT(*) FROM lesson WHERE module_id = $1"#)
        .bind(&payload.module_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to count lessons: {}", e),
            )
        })?;

    // Count completed lessons by the learner
    let completed: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) FROM lesson_completion lp
        JOIN lesson l ON lp.lesson_id = l.id
        WHERE lp.learner_id = $1 AND l.module_id = $2
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.module_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to count completed lessons: {}", e),
        )
    })?;

    if total == 0 || completed < total {
        return Err((
            StatusCode::BAD_REQUEST,
            "Not all lessons in module are completed".to_string(),
        ));
    }

    sqlx::query(
        r#"
        INSERT INTO module_completion (learner_id, module_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.module_id)
    .execute(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to insert module completion table: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "message": "Module marked complete" })),
    ))
}

pub async fn complete_quiz(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<CompleteQuizPayload>,
) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query(
        r#"
        INSERT INTO quiz_completion (quiz_id, learner_id, score, total_questions)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (quiz_id, learner_id) DO UPDATE
        SET score = EXCLUDED.score,
            total_questions = EXCLUDED.total_questions,
            completed_at = now()
        "#,
    )
    .bind(payload.quiz_id)
    .bind(&payload.learner_id)
    .bind(payload.score)
    .bind(payload.total_questions)
    .execute(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("DB error: {}", e),
        )
    })?;

    Ok(StatusCode::OK)
}

pub async fn get_completed_lesson_ids(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CompletedLessonsQuery>,
) -> Result<Json<CompletedLessonsResponse>, (StatusCode, String)> {
    let rows: Vec<PgRow> = sqlx::query(
        r#"
        SELECT l.id
        FROM lesson l
        JOIN module m ON l.module_id = m.id
        JOIN lesson_completion lc ON lc.lesson_id = l.id
        WHERE m.course_id = $1 AND lc.learner_id = $2
        "#,
    )
    .bind(&params.course_id)
    .bind(&params.learner_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;

    let lesson_ids: Vec<i64> = rows
        .into_iter()
        .filter_map(|row| row.try_get::<i64, _>("id").ok())
        .collect();

    Ok(Json(CompletedLessonsResponse { lesson_ids }))
}

pub async fn get_course_progress(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseProgressQuery>,
) -> Result<Json<CourseProgressResponse>, (StatusCode, String)> {
    let course_id = params.course_id;
    let learner_id = &params.learner_id;

    // 1. Get all lesson IDs in course
    let total_lessons: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM lesson l
        JOIN module m ON l.module_id = m.id
        WHERE m.course_id = $1
        "#,
    )
    .bind(course_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    // 2. Get completed lessons for learner
    let completed_lesson_ids: Vec<i64> = sqlx::query_scalar(
        r#"
        SELECT l.id
        FROM lesson_completion lc
        JOIN lesson l ON lc.lesson_id = l.id
        JOIN module m ON l.module_id = m.id
        WHERE lc.learner_id = $1 AND m.course_id = $2
        "#,
    )
    .bind(learner_id)
    .bind(course_id)
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    // 3. Get completed quiz IDs
    let completed_quiz_ids: Vec<i64> = sqlx::query_scalar(
        r#"
        SELECT q.id
        FROM quiz_completion qc
        JOIN quiz q ON qc.quiz_id = q.id
        JOIN module m ON q.module_id = m.id
        WHERE qc.learner_id = $1 AND m.course_id = $2
        "#,
    )
    .bind(learner_id)
    .bind(course_id)
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    // 4. Get completed module IDs
    let completed_module_ids: Vec<i64> = sqlx::query_scalar(
        r#"
        SELECT module_id
        FROM module_completion
        WHERE learner_id = $1
        AND module_id IN (
            SELECT id FROM module WHERE course_id = $2
        )
        "#,
    )
    .bind(learner_id)
    .bind(course_id)
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    // 5. Get total modules in course
    let total_modules: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM module
        WHERE course_id = $1
        "#,
    )
    .bind(course_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    // 6. Calculate progress
    let lesson_progress = if total_lessons > 0 {
        completed_lesson_ids.len() as f32 / total_lessons as f32
    } else {
        0.0
    };

    let module_progress = if total_modules > 0 {
        completed_module_ids.len() as f32 / total_modules as f32
    } else {
        0.0
    };

    // You can weigh lessons and modules however you like; here's a simple average:
    let progress_percent = ((lesson_progress + module_progress) / 2.0) * 100.0;

    // Determine course completion
    let course_completed = completed_module_ids.len() as i64 == total_modules;

    Ok(Json(CourseProgressResponse {
        completed_lesson_ids,
        completed_quiz_ids,
        completed_module_ids,
        progress_percent,
        course_completed,
    }))
}

fn internal_error<E: std::fmt::Display>(e: E) -> (StatusCode, String) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        format!("Database error: {}", e),
    )
}
