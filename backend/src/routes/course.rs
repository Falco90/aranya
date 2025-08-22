use axum::{
    Router,
    routing::{get, post},
};
use sqlx::Pool;
use sqlx::Postgres;

use crate::handlers::course::{create_course, get_course, get_num_completed, enroll, get_course_creator, get_user_courses, get_learners_by_course, get_top_courses, get_all_courses, get_counts};

pub fn course_routes(pool: Pool<Postgres>) -> Router {
    Router::new()
        .route("/create-course", post(create_course))
        .route("/enroll", post(enroll))
        .route("/get-num-completed", get(get_num_completed))
        .route("/get-course", get(get_course))
        .route("/get-course-creator", get(get_course_creator))
        .route("/get-user-courses", get(get_user_courses))
        .route("/get-top-courses", get(get_top_courses))
        .route("/get-all-courses", get(get_all_courses))
        .route("/get-learners-by-course", get(get_learners_by_course))
        .route("/get-counts", get(get_counts))
        .with_state(pool)
}
