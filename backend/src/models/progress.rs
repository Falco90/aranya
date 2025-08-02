use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressQuery {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressResponse {
    pub course_id: i64,
    pub learner_id: String,
    pub progress_percent: i32,
    pub completed: bool,
    pub last_accessed: Option<DateTime<Utc>>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JoinCourseRequest {
    pub privy_id: String,
    pub course_id: i64,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LessonCompleteRequest {
    pub learner_id: String,
    pub lesson_id: i64,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CompletedLessonsQuery {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CompletedLessonsResponse {
    pub lesson_ids: Vec<i64>,
}
