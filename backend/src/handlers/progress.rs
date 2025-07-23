use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Pool, Postgres};

use crate::models::progress::{CourseProgressQuery, CourseProgressResponse, LessonCompleteRequest};

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

    if completed {
        sqlx::query("UPDATE course SET num_completed = num_completed + 1 WHERE id = $1")
            .bind(&payload.course_id)
            .execute(&mut *tx)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

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
