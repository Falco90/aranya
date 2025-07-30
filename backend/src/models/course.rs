use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCoursePayload {
    pub title: String,
    pub description: String,
    pub creator_id: String,
    pub modules: Vec<Module>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Course {
    pub title: String,
    pub description: String,
    pub creator_id: String,
    pub modules: Vec<Module>,
    pub num_learners: i32,
    pub num_completed: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CourseQuery {
    pub course_id: i64,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
pub struct NumCompletedResponse {
    pub num_completed: i32,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Module {
    pub title: String,
    pub position: i32,
    pub lessons: Vec<Lesson>,
    pub quiz: Quiz,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Lesson {
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub position: i32,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Quiz {
    pub questions: Vec<Question>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub question_text: String,
    pub answers: Vec<AnswerOption>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnswerOption {
    pub answer_text: String,
    pub is_correct: bool,
}
