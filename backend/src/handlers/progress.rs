use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Pool, Postgres, Row, postgres::PgRow};

use crate::models::progress::{
    CompletedLessonsQuery, CompletedLessonsResponse, CourseProgressQuery, CourseProgressResponse,
    LessonCompleteRequest,
};
pub async fn complete_lesson(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<LessonCompleteRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    sqlx::query(
        r#"
        INSERT INTO lesson_progress (learner_id, lesson_id)
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

pub async fn get_course_progress(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseProgressQuery>,
) -> Result<Json<CourseProgressResponse>, (StatusCode, String)> {
    let result: Option<CourseProgressResponse> = sqlx::query_as::<_, CourseProgressResponse>(
        r#"
        SELECT
            course_id,
            learner_id,
            progress_percent,
            completed,
            last_accessed
        FROM course_progress
        WHERE course_id = $1 AND learner_id = $2
        "#,
    )
    .bind(&params.course_id)
    .bind(&params.learner_id)
    .fetch_optional(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;

    match result {
        Some(progress) => Ok(Json(progress)),
        None => Err((
            StatusCode::NOT_FOUND,
            "Course progress not found for learner".to_string(),
        )),
    }
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
        JOIN lesson_progress lc ON lc.lesson_id = l.id
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
