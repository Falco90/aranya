use axum::{routing::{get, post}, Router};
use sqlx::{Pool, Postgres};
use crate::handlers::progress::{get_course_progress, complete_lesson, get_completed_lesson_ids};

pub fn progress_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/complete-lesson", post(complete_lesson))
        .route("/get-course-progress", get(get_course_progress))
        .route("/get-completed-lesson-ids", get(get_completed_lesson_ids))
        .with_state(pool)
}
