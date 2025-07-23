use axum::{Router, routing::{get, post}};
use sqlx::Pool;
use sqlx::Postgres;

use crate::handlers::course::{create_course, join_course, get_num_completed};

pub fn course_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/create-course", post(create_course))
        .route("/join-course", post(join_course))
        .route("/get-num-completed", get(get_num_completed))
        .with_state(pool)
}
