use axum::{Router, routing::post};
use sqlx::{Pool, Postgres};
use crate::handlers::progress::{get_course_progress, complete_lesson};

pub fn progress_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/complete-lesson", post(complete_lesson))
        .route("/get-course-progress", post(get_course_progress))
        .with_state(pool)
}
