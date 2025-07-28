use axum::{extract::{Query, State}, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;
use sqlx::{Pool, Postgres};
use std::convert::TryInto;

use crate::models::{course::{Course, CourseQuery, NumCompletedResponse}, progress::JoinCourseRequest};
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
    let result = sqlx::query(
        "INSERT INTO learner_course_enrollment (learner_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",).bind(&payload.privy_id).bind(&payload.course_id)
    .execute(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    // Only increment if enrollment actually happened
    if result.rows_affected() > 0 {
        sqlx::query("UPDATE course SET num_learners = num_learners + 1 WHERE id = $1")
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
        Json(json!({ "message": "Course joined successfully", "course_id": &payload.course_id })),
    ))
}

pub async fn get_num_completed(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseQuery>,
) -> Result<Json<NumCompletedResponse>, (StatusCode, String)> {
    println!("Get num completed triggered");
    let result: Option<NumCompletedResponse> = sqlx::query_as::<_, NumCompletedResponse>(
        r#"
        SELECT
            num_completed
        FROM course
        WHERE id = $1
        "#,
    )
    .bind(&params.course_id)
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
            "Course not found".to_string(),
        )),
    }
}
