use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressQuery {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressResponse {
    pub completed_lesson_ids: Vec<i64>,
    pub completed_quiz_ids: Vec<i64>,
    pub completed_module_ids: Vec<i64>,
    pub progress_percent: f32,
    pub course_completed: bool,
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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModuleCompleteRequest {
    pub learner_id: String,
    pub module_id: i64,
    pub course_id: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseCompleteRequest {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompleteQuizPayload {
    pub quiz_id: i64,
    pub learner_id: String,
    pub score: i32,
    pub total_questions: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressSummary {
    pub course_id: i64,
    pub course_title: String,
    pub completed_lesson_ids: Vec<i64>,
    pub completed_quiz_ids: Vec<i64>,
    pub completed_module_ids: Vec<i64>,
    pub progress_percent: f32,
    pub course_completed: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LearnerQuery {
    pub learner_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressPercentage {
    pub progress_percent: u8,
}
