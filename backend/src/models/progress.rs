use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Deserialize)]
pub struct CourseProgressQuery {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Serialize, FromRow)]
pub struct CourseProgressResponse {
    pub course_id: i64,
    pub learner_id: String,
    pub progress_percent: i32,
    pub completed: bool,
    pub last_accessed: Option<DateTime<Utc>>,
}

#[derive(Deserialize, Debug)]
pub struct JoinCourseRequest {
    pub privy_id: String,
    pub course_id: i64,
}

#[derive(Deserialize, Debug)]
pub struct LessonCompleteRequest {
    pub privy_id: String,
    pub lesson_id: i64,
    pub module_id: i64,
    pub course_id: i64,
}
