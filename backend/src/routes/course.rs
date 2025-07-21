use axum::{Router, routing::post};
use sqlx::Pool;
use sqlx::Postgres;

use crate::handlers::course::{create_course, join_course};

pub fn course_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/create-course", post(create_course))
        .route("/join-course", post(join_course))
        .with_state(pool)
}
