-- Courses
ALTER TABLE course
ADD COLUMN description TEXT,
ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Modules (each course has multiple modules)
CREATE TABLE module (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INT NOT NULL, -- ordering
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons (each module has multiple lessons)
CREATE TABLE lesson (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT, -- link to video file
    position INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quizzes (optional per module)
CREATE TABLE quiz (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    title TEXT NOT NULL
);

-- Final exam (one per course)
CREATE TABLE final_exam (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title TEXT NOT NULL
);

-- Questions for quizzes and final exams
CREATE TABLE question (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT REFERENCES quiz(id) ON DELETE CASCADE,
    exam_id BIGINT REFERENCES final_exam(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL
);

-- Multiple choice answers
CREATE TABLE answer_option (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);


