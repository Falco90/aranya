use axum::{routing::{get, post}, Router};
use sqlx::{Pool, Postgres};
use crate::handlers::progress::{get_course_progress, complete_lesson, complete_module, complete_quiz, get_completed_lesson_ids, get_all_course_progress};

pub fn progress_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/complete-lesson", post(complete_lesson))
        .route("/complete-module", post(complete_module))
        .route("/complete-quiz", post(complete_quiz))
        .route("/get-course-progress", get(get_course_progress))
        .route("/get-completed-lesson-ids", get(get_completed_lesson_ids))
        .route("/get-all-course-progress", get(get_all_course_progress))
        .with_state(pool)
}
