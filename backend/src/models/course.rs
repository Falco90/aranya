use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCoursePayload {
    pub title: String,
    pub description: String,
    pub creator_id: String,
    pub modules: Vec<CreateModulePayload>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateModulePayload {
    pub title: String,
    pub position: i32,
    pub lessons: Vec<CreateLessonPayload>,
    pub quiz: Option<CreateQuizPayload>
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLessonPayload {
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub position: i32
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuizPayload {
    pub questions: Vec<CreateQuestionPayload>
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionPayload{
    pub question_text: String,
    pub answers: Vec<CreateAnswerOptionPayload>
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAnswerOptionPayload {
    pub answer_text: String,
    pub is_correct: bool
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Course {
    pub id: i64,
    pub title: String,
    pub description: String,
    pub creator_id: String,
    pub modules: Vec<Module>,
    pub num_learners: i32,
    pub num_completed: i32,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseQuery {
    pub course_id: i64,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct NumCompletedResponse {
    pub num_completed: i32,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Module {
    pub id: i64,
    pub course_id: i64,
    pub title: String,
    pub position: i32,
    pub lessons: Vec<Lesson>,
    pub quiz: Quiz,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Lesson {
    pub id: i64,
    pub module_id: i64,
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub position: i32,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Quiz {
    pub id: i64,
    pub module_id: i64,
    pub questions: Vec<Question>,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Question {
    pub id: i64,
    pub quiz_id: i64,
    pub question_text: String,
    pub answers: Vec<AnswerOption>,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct AnswerOption {
    pub id: i64,
    pub question_id: i64,
    pub answer_text: String,
    pub is_correct: bool,
}
