use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;
use sqlx::{Pool, Postgres, Row, Transaction};
use std::{collections::HashMap, convert::TryInto};

use crate::models::course::{
    AnswerOption, AnswerOptionRow, Course, CourseCreatorResponse, CoursePreview, CourseQuery,
    CourseRow, CreateCoursePayload, CreatedCourse, EnrolledCourse, JoinCourseRequest, LearnerId,
    Lesson, LessonRow, Module, ModuleRow, NumCompletedResponse, Question, QuestionRow, Quiz,
    QuizRow, UserCoursesResponse, UserQuery,
};

pub async fn create_course(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<CreateCoursePayload>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

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

        if let Some(quiz) = &module.quiz {
            let quiz_id: i64 =
                sqlx::query_scalar("INSERT INTO quiz (module_id) VALUES ($1) RETURNING id")
                    .bind(module_id)
                    .fetch_one(&mut *tx)
                    .await
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            for question in &quiz.questions {
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

pub async fn enroll(
    State(pool): State<Pool<Postgres>>,
    Json(payload): Json<JoinCourseRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    sqlx::query("INSERT INTO learner (id) VALUES ($1) ON CONFLICT DO NOTHING")
        .bind(&payload.learner_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    sqlx::query(
        "INSERT INTO learner_course_enrollment (learner_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",).bind(&payload.learner_id).bind(&payload.course_id)
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

pub async fn get_all_courses(
    State(pool): State<Pool<Postgres>>,
) -> Result<Json<Vec<CoursePreview>>, (StatusCode, String)> {
    let rows = sqlx::query(
        r#"
        SELECT
            c.id,
            c.title,
            cr.id AS creator,
            COALESCE(enrollments.count, 0) AS num_enrollments,
            COALESCE(completions.count, 0) AS num_completions,
            COALESCE(modules.count, 0) AS num_modules
        FROM course c
        JOIN creator cr ON cr.id = c.creator_id
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM learner_course_enrollment lce
            WHERE lce.course_id = c.id
        ) AS enrollments ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM course_completion cc
            WHERE cc.course_id = c.id
        ) AS completions ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM module m
            WHERE m.course_id = c.id
        ) AS modules ON true
        ORDER BY num_enrollments DESC
        "#,
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let previews: Vec<CoursePreview> = rows
        .into_iter()
        .map(|row| CoursePreview {
            course_id: row.try_get("id").unwrap(),
            title: row.try_get("title").unwrap(),
            creator_id: row.try_get("creator").unwrap(),
            num_enrollments: row.try_get("num_enrollments").unwrap(),
            num_completions: row.try_get("num_completions").unwrap(),
            num_modules: row.try_get("num_modules").unwrap(),
        })
        .collect::<Vec<_>>();

    Ok(Json(previews))
}

pub async fn get_top_courses(
    State(pool): State<Pool<Postgres>>,
) -> Result<Json<Vec<CoursePreview>>, (StatusCode, String)> {
    let rows = sqlx::query(
        r#"
        SELECT
            c.id,
            c.title,
            cr.id AS creator,
            COALESCE(enrollments.count, 0) AS num_enrollments,
            COALESCE(completions.count, 0) AS num_completions,
            COALESCE(modules.count, 0) AS num_modules
        FROM course c
        JOIN creator cr ON cr.id = c.creator_id
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM learner_course_enrollment lce
            WHERE lce.course_id = c.id
        ) AS enrollments ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM course_completion cc
            WHERE cc.course_id = c.id
        ) AS completions ON true
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS count
            FROM module m
            WHERE m.course_id = c.id
        ) AS modules ON true
        ORDER BY num_enrollments DESC
        LIMIT 3
        "#,
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let previews: Vec<CoursePreview> = rows
        .into_iter()
        .map(|row| CoursePreview {
            course_id: row.try_get("id").unwrap(),
            title: row.try_get("title").unwrap(),
            creator_id: row.try_get("creator").unwrap(),
            num_enrollments: row.try_get("num_enrollments").unwrap(),
            num_completions: row.try_get("num_completions").unwrap(),
            num_modules: row.try_get("num_modules").unwrap(),
        })
        .collect::<Vec<_>>();

    Ok(Json(previews))
}

pub async fn get_learners_by_course(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseQuery>,
) -> Result<Json<Vec<LearnerId>>, (StatusCode, String)> {
    let learners = sqlx::query_as::<_, LearnerId>(
        r#"
        SELECT learner_id
        FROM learner_course_enrollment
        WHERE course_id = $1
        "#,
    )
    .bind(&params.course_id)
    .fetch_all(&pool)
    .await
    .map_err(|err| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database query failed: {}", err),
        )
    })?;

    Ok(Json(learners))
}

pub async fn get_num_completed(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseQuery>,
) -> Result<Json<NumCompletedResponse>, (StatusCode, String)> {
    let result: NumCompletedResponse = sqlx::query_as::<_, NumCompletedResponse>(
        r#"
        SELECT COUNT(*)::bigint AS num_completed
        FROM course_completion
        WHERE course_id = $1
        "#,
    )
    .bind(&params.course_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Database error: {}", e),
        )
    })?;

    Ok(Json(result))
}

pub async fn get_course(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let tx = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    let course_row: CourseRow = sqlx::query_as::<_, CourseRow>(
        r#"
    SELECT id, title, description, creator_id, num_learners, num_completed
    FROM course
    WHERE id = $1
    "#,
    )
    .bind(&params.course_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let module_rows: Vec<ModuleRow> = sqlx::query_as::<_, ModuleRow>(
        r#"
    SELECT id, course_id, title, position
    FROM module
    WHERE course_id = $1
    "#,
    )
    .bind(&params.course_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let module_ids: Vec<i64> = module_rows.iter().map(|m| m.id).collect();

    let lesson_rows: Vec<LessonRow> = sqlx::query_as::<_, LessonRow>(
        r#"
    SELECT id, module_id, title, content, video_url, position
    FROM lesson
    WHERE module_id = ANY($1)
    "#,
    )
    .bind(&module_ids)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let quiz_rows: Vec<QuizRow> = sqlx::query_as::<_, QuizRow>(
        r#"
    SELECT id, module_id
    FROM quiz
    WHERE module_id = ANY($1)
    "#,
    )
    .bind(&module_ids)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let quiz_ids: Vec<i64> = quiz_rows.iter().map(|q| q.id).collect();

    let question_rows: Vec<QuestionRow> = sqlx::query_as::<_, QuestionRow>(
        r#"
    SELECT id, quiz_id, question_text
    FROM question
    WHERE quiz_id = ANY($1)
    "#,
    )
    .bind(&quiz_ids)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let question_ids: Vec<i64> = question_rows.iter().map(|q| q.id).collect();

    let answer_rows: Vec<AnswerOptionRow> = sqlx::query_as::<_, AnswerOptionRow>(
        r#"
    SELECT id, question_id, answer_text, is_correct
    FROM answer_option
    WHERE question_id = ANY($1)
    "#,
    )
    .bind(&question_ids)
    .fetch_all(&pool)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    let mut answers_by_question: HashMap<i64, Vec<AnswerOption>> = HashMap::new();
    for a in answer_rows {
        let answer = AnswerOption {
            id: a.id,
            question_id: a.question_id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
        };
        answers_by_question
            .entry(a.question_id)
            .or_default()
            .push(answer);
    }

    let mut questions_by_quiz: HashMap<i64, Vec<Question>> = HashMap::new();
    for q in question_rows {
        let question = Question {
            id: q.id,
            quiz_id: q.quiz_id,
            question_text: q.question_text,
            answers: answers_by_question.remove(&q.id).unwrap_or_default(),
        };
        questions_by_quiz
            .entry(q.quiz_id)
            .or_default()
            .push(question);
    }

    let mut quiz_by_module: HashMap<i64, Quiz> = HashMap::new();
    for q in quiz_rows {
        let quiz: Quiz = Quiz {
            id: q.id,
            module_id: q.module_id,
            questions: questions_by_quiz.remove(&q.id).unwrap_or_default(),
        };
        quiz_by_module.insert(q.module_id, quiz);
    }

    let mut lessons_by_module: HashMap<i64, Vec<Lesson>> = HashMap::new();
    for l in lesson_rows {
        let lesson = Lesson {
            id: l.id,
            module_id: l.module_id,
            title: l.title,
            content: l.content,
            video_url: l.video_url,
            position: l.position,
        };
        lessons_by_module
            .entry(l.module_id)
            .or_default()
            .push(lesson);
    }

    let modules: Vec<Module> = module_rows
        .into_iter()
        .map(|m| Module {
            id: m.id,
            course_id: m.course_id,
            title: m.title,
            position: m.position,
            lessons: lessons_by_module.remove(&m.id).unwrap_or_default(),
            quiz: quiz_by_module.remove(&m.id),
        })
        .collect();

    let course = Course {
        id: course_row.id,
        title: course_row.title,
        description: course_row.description,
        creator_id: course_row.creator_id,
        num_learners: course_row.num_learners,
        num_completed: course_row.num_completed,
        modules,
    };

    Ok((StatusCode::OK, Json(course)))
}

pub async fn get_course_creator(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<CourseQuery>,
) -> Result<Json<CourseCreatorResponse>, (StatusCode, String)> {
    let result: Option<CourseCreatorResponse> = sqlx::query_as::<_, CourseCreatorResponse>(
        r#"
        SELECT
            creator_id
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
        None => Err((StatusCode::NOT_FOUND, "Course not found".to_string())),
    }
}

pub async fn get_user_courses(
    State(pool): State<Pool<Postgres>>,
    Query(params): Query<UserQuery>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let mut tx: Transaction<'_, Postgres> = pool.begin().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("TX Failed to begin transaction: {}", e),
        )
    })?;

    let created_rows = sqlx::query(
        r#"
        SELECT 
            c.id AS course_id,
            c.title,
            (
                SELECT COUNT(*)::BIGINT 
                FROM learner_course_enrollment e 
                WHERE e.course_id = c.id
            ) AS num_learners,
            (
                SELECT COUNT(*)::BIGINT 
                FROM course_completion cc 
                WHERE cc.course_id = c.id
            ) AS num_completed
        FROM course c
        WHERE c.creator_id = $1
        ORDER BY c.id DESC
        "#,
    )
    .bind(&params.user_id)
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let created_courses = created_rows
        .into_iter()
        .map(|row| CreatedCourse {
            course_id: row.try_get("course_id").unwrap(),
            title: row.try_get("title").unwrap(),
            num_learners: row.try_get("num_learners").unwrap(),
            num_completed: row.try_get("num_completed").unwrap(),
        })
        .collect::<Vec<_>>();

    let enrolled_rows = sqlx::query(
        r#"
        SELECT 
            c.id AS course_id,
            c.title,
            COUNT(m.id)::BIGINT AS total_modules,
            COALESCE(SUM(CASE WHEN mc.learner_id IS NOT NULL THEN 1 ELSE 0 END), 0)::BIGINT AS completed_modules
        FROM course c
        LEFT JOIN module m ON m.course_id = c.id
        LEFT JOIN module_completion mc 
            ON mc.module_id = m.id AND mc.learner_id = $1
        INNER JOIN learner_course_enrollment e 
            ON e.course_id = c.id AND e.learner_id = $1
        GROUP BY c.id, c.title
        ORDER BY c.id DESC
        "#
    )
    .bind(&params.user_id)
    .fetch_all(&mut *tx)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let enrolled_courses = enrolled_rows
        .into_iter()
        .map(|row| {
            let total_modules: i64 = row.try_get("total_modules").unwrap_or(0);
            let completed_modules: i64 = row.try_get("completed_modules").unwrap_or(0);

            EnrolledCourse {
                course_id: row.try_get("course_id").unwrap(),
                title: row.try_get("title").unwrap(),
                total_modules,
                completed_modules,
                progress_percent: if total_modules > 0 {
                    (completed_modules * 100) / total_modules
                } else {
                    0
                },
                completed: total_modules > 0 && completed_modules == total_modules,
            }
        })
        .collect::<Vec<_>>();

    tx.commit().await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to commit transaction: {}", e),
        )
    })?;

    Ok((
        StatusCode::OK,
        Json(UserCoursesResponse {
            created_courses,
            enrolled_courses,
        }),
    ))
}
