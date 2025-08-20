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
    pub quiz: Option<CreateQuizPayload>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLessonPayload {
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub position: i32,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuizPayload {
    pub questions: Vec<CreateQuestionPayload>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionPayload {
    pub question_text: String,
    pub answers: Vec<CreateAnswerOptionPayload>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAnswerOptionPayload {
    pub answer_text: String,
    pub is_correct: bool,
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

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct JoinCourseRequest {
    pub learner_id: String,
    pub course_id: i64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseQuery {
    pub course_id: i64,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatorQuery {
    pub creator_id: String,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct NumCompletedResponse {
    pub num_completed: i64,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct CourseCreatorResponse {
    pub creator_id: String,
}

#[derive(Debug, Deserialize, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Module {
    pub id: i64,
    pub course_id: i64,
    pub title: String,
    pub position: i32,
    pub lessons: Vec<Lesson>,
    pub quiz: Option<Quiz>,
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserQuery {
    pub user_id: String,
}

// Courses created by user
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatedCourse {
    pub course_id: i64,
    pub title: String,
    pub num_learners: i64,
    pub num_completed: i64,
}

// Courses enrolled in by user
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnrolledCourse {
    pub course_id: i64,
    pub title: String,
    pub total_modules: i64,
    pub completed_modules: i64,
    pub progress_percent: i64,
    pub completed: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCoursesResponse {
    pub created_courses: Vec<CreatedCourse>,
    pub enrolled_courses: Vec<EnrolledCourse>,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct CoursePreview {
    pub course_id: i64,
    pub title: String,
    pub creator_id: String,
    pub num_enrollments: i64,
    pub num_completions: i64,
    pub num_modules: i64,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct LearnerId {
    pub learner_id: String,
}
