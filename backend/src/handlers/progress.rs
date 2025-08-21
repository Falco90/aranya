use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Pool, Postgres, Row, postgres::PgRow};

use crate::models::progress::{
    CompleteQuizPayload, CompletedLessonsQuery, CompletedLessonsResponse, CourseCompleteRequest, CourseProgressPercentage, CourseProgressQuery, CourseProgressResponse, CourseProgressSummary, EnrollmentQuery, LearnerQuery, LessonCompleteRequest, ModuleCompleteRequest
};

pub async fn is_enrolled(
    State(pool): State<Pool<Postgres>>,
    Query(query): Query<EnrollmentQuery>,
) -> Result<Json<bool>, (StatusCode, String)> {
    let exists = sqlx::query_scalar::<_, bool>(
        r#"
        SELECT EXISTS(
            SELECT 1
            FROM learner_course_enrollment
            WHERE course_id = $1 AND learner_id = $2
        )
        "#,
    )
    .bind(query.course_id)
    .bind(query.learner_id)
    .fetch_one(&pool)
    .await
    .map_err(|err| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database query failed: {}", err),
        )
    })?;

    Ok(Json(exists))
}
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
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to begin transaction: {}", e),
        )
    })?;

    let total_lessons: i64 =
        sqlx::query_scalar(r#"SELECT COUNT(*) FROM lesson WHERE module_id = $1"#)
            .bind(&payload.module_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to count lessons: {}", e),
                )
            })?;

    let completed_lessons: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) 
        FROM lesson_completion lp
        JOIN lesson l ON lp.lesson_id = l.id
        WHERE lp.learner_id = $1 AND l.module_id = $2
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.module_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to count completed lessons: {}", e),
        )
    })?;

    if total_lessons == 0 || completed_lessons < total_lessons {
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
    .execute(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to insert module completion: {}", e),
        )
    })?;

    let total_modules: i64 =
        sqlx::query_scalar(r#"SELECT COUNT(*) FROM module WHERE course_id = $1"#)
            .bind(&payload.course_id)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to count modules: {}", e),
                )
            })?;

    let completed_modules: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) 
        FROM module_completion 
        WHERE learner_id = $1 AND module_id IN 
            (SELECT id FROM module WHERE course_id = $2)
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.course_id)
    .fetch_one(&mut *tx)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to count completed modules: {}", e),
        )
    })?;

    let all_modules_completed = total_modules > 0 && (completed_modules == total_modules);

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "module_completed": true,
            "course_completed": all_modules_completed
        })),
    ))
}

pub async fn complete_course(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<CourseCompleteRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let total_modules: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM module WHERE course_id = $1")
        .bind(&payload.course_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to count modules: {}", e),
            )
        })?;

    let completed_modules: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) 
        FROM module_completion 
        WHERE learner_id = $1 AND module_id IN (SELECT id FROM module WHERE course_id = $2)
        "#,
    )
    .bind(&payload.learner_id)
    .bind(&payload.course_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to count completed modules: {}", e),
        )
    })?;

    if completed_modules != total_modules || total_modules == 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            "Not all modules are completed".to_string(),
        ));
    }

    sqlx::query(
        "INSERT INTO course_completion (learner_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    )
    .bind(&payload.learner_id)
    .bind(&payload.course_id)
    .execute(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to insert course completion: {}", e),
        )
    })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "course_completed": true
        })),
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

    let progress_percent = ((lesson_progress + module_progress) / 2.0) * 100.0;

    let course_completed = completed_module_ids.len() as i64 == total_modules;

    Ok(Json(CourseProgressResponse {
        completed_lesson_ids,
        completed_quiz_ids,
        completed_module_ids,
        progress_percent,
        course_completed,
    }))
}

pub async fn get_course_progress_percentage(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseProgressQuery>,
) -> Result<Json<CourseProgressPercentage>, (StatusCode, String)> {
    let course_id = params.course_id;
    let learner_id = &params.learner_id;

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

    let completed_lessons: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM lesson_completion lc
        JOIN lesson l ON lc.lesson_id = l.id
        JOIN module m ON l.module_id = m.id
        WHERE lc.learner_id = $1 AND m.course_id = $2
        "#,
    )
    .bind(learner_id)
    .bind(course_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

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

    let completed_modules: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*)
        FROM module_completion
        WHERE learner_id = $1
        AND module_id IN (SELECT id FROM module WHERE course_id = $2)
        "#,
    )
    .bind(learner_id)
    .bind(course_id)
    .fetch_one(&pool)
    .await
    .map_err(internal_error)?;

    let lesson_progress = if total_lessons > 0 {
        completed_lessons as f32 / total_lessons as f32
    } else {
        0.0
    };

    let module_progress = if total_modules > 0 {
        completed_modules as f32 / total_modules as f32
    } else {
        0.0
    };

    let raw_progress = ((lesson_progress + module_progress) / 2.0) * 100.0;

    let progress_percent: u8 = raw_progress.clamp(0.0, 100.0) as u8;

    Ok(Json(CourseProgressPercentage { progress_percent }))
}

fn internal_error<E: std::fmt::Display>(e: E) -> (StatusCode, String) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        format!("Database error: {}", e),
    )
}

pub async fn get_all_course_progress(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<LearnerQuery>,
) -> Result<Json<Vec<CourseProgressSummary>>, (StatusCode, String)> {
    let learner_id = &params.learner_id;

    let rows = sqlx::query(
        r#"
        SELECT
            c.id AS course_id,
            c.title AS course_title,
            l.id AS lesson_id,
            CASE WHEN lc.learner_id IS NOT NULL THEN TRUE ELSE FALSE END AS lesson_completed,
            q.id AS quiz_id,
            CASE WHEN qc.learner_id IS NOT NULL THEN TRUE ELSE FALSE END AS quiz_completed,
            m.id AS module_id,
            CASE WHEN mc.learner_id IS NOT NULL THEN TRUE ELSE FALSE END AS module_completed
        FROM learner_course_enrollment ce
        JOIN course c ON ce.course_id = c.id
        LEFT JOIN module m ON m.course_id = c.id
        LEFT JOIN lesson l ON l.module_id = m.id
        LEFT JOIN lesson_completion lc ON lc.lesson_id = l.id AND lc.learner_id = $1
        LEFT JOIN quiz q ON q.module_id = m.id
        LEFT JOIN quiz_completion qc ON qc.quiz_id = q.id AND qc.learner_id = $1
        LEFT JOIN module_completion mc ON mc.module_id = m.id AND mc.learner_id = $1
        WHERE ce.learner_id = $1
        "#,
    )
    .bind(learner_id)
    .fetch_all(&pool)
    .await
    .map_err(internal_error)?;

    use std::collections::{HashMap, HashSet};

    let mut summaries: HashMap<i64, CourseProgressSummary> = HashMap::new();
    let mut total_lessons: HashMap<i64, HashSet<i64>> = HashMap::new();
    let mut total_modules: HashMap<i64, HashSet<i64>> = HashMap::new();

    for row in rows {
        let course_id: i64 = row.get("course_id");
        let course_title: String = row.get("course_title");
        let lesson_id: Option<i64> = row.try_get("lesson_id").ok();
        let lesson_completed: bool = row.get("lesson_completed");
        let quiz_id: Option<i64> = row.try_get("quiz_id").ok();
        let quiz_completed: bool = row.get("quiz_completed");
        let module_id: Option<i64> = row.try_get("module_id").ok();
        let module_completed: bool = row.get("module_completed");

        let entry = summaries
            .entry(course_id)
            .or_insert_with(|| CourseProgressSummary {
                course_id,
                course_title,
                completed_lesson_ids: vec![],
                completed_quiz_ids: vec![],
                completed_module_ids: vec![],
                progress_percent: 0.0,
                course_completed: false,
            });

        if let Some(lid) = lesson_id {
            total_lessons.entry(course_id).or_default().insert(lid);
            if lesson_completed {
                if !entry.completed_lesson_ids.contains(&lid) {
                    entry.completed_lesson_ids.push(lid);
                }
            }
        }

        if let Some(qid) = quiz_id {
            if quiz_completed {
                if !entry.completed_quiz_ids.contains(&qid) {
                    entry.completed_quiz_ids.push(qid);
                }
            }
        }

        if let Some(mid) = module_id {
            total_modules.entry(course_id).or_default().insert(mid);
            if module_completed {
                if !entry.completed_module_ids.contains(&mid) {
                    entry.completed_module_ids.push(mid);
                }
            }
        }
    }

    for summary in summaries.values_mut() {
        let lesson_total = total_lessons
            .get(&summary.course_id)
            .map(|s| s.len())
            .unwrap_or(0);
        let module_total = total_modules
            .get(&summary.course_id)
            .map(|s| s.len())
            .unwrap_or(0);

        let lesson_progress = if lesson_total > 0 {
            summary.completed_lesson_ids.len() as f32 / lesson_total as f32
        } else {
            0.0
        };

        let module_progress = if module_total > 0 {
            summary.completed_module_ids.len() as f32 / module_total as f32
        } else {
            0.0
        };

        summary.progress_percent = ((lesson_progress + module_progress) / 2.0) * 100.0;
        summary.course_completed = summary.completed_module_ids.len() == module_total;
    }

    Ok(Json(summaries.into_values().collect()))
}
