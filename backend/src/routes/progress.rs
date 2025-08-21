use axum::{routing::{get, post}, Router};
use sqlx::{Pool, Postgres};
use crate::handlers::progress::{complete_course, complete_lesson, complete_module, complete_quiz, get_all_course_progress, get_completed_lesson_ids, get_course_progress, get_course_progress_percentage, is_enrolled};

pub fn progress_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/complete-lesson", post(complete_lesson))
        .route("/complete-module", post(complete_module))
        .route("/complete-course", post(complete_course))
        .route("/complete-quiz", post(complete_quiz))
        .route("/get-course-progress", get(get_course_progress))
        .route("/get-course-progress-percentage", get(get_course_progress_percentage))
        .route("/is-enrolled", get(is_enrolled))
        .route("/get-completed-lesson-ids", get(get_completed_lesson_ids))
        .route("/get-all-course-progress", get(get_all_course_progress))
        .with_state(pool)
}
