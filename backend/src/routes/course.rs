use axum::{
    Router,
    routing::{get, post},
};
use sqlx::Pool;
use sqlx::Postgres;

use crate::handlers::course::{create_course, get_course, get_num_completed, join_course, get_course_creator, get_user_courses, get_top_courses};

pub fn course_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/create-course", post(create_course))
        .route("/join-course", post(join_course))
        .route("/get-num-completed", get(get_num_completed))
        .route("/get-course", get(get_course))
        .route("/get-course-creator", get(get_course_creator))
        .route("/get-user-courses", get(get_user_courses))
        .route("/get-top-courses", get(get_top_courses))
        .with_state(pool)
}
