SET statement_timeout = '5min';

-- Drop in reverse order due to foreign key dependencies
DROP TABLE IF EXISTS lesson_progress;
DROP TABLE IF EXISTS module_progress;
DROP TABLE IF EXISTS course_progress;
DROP TABLE IF EXISTS learner_course_enrollment;
DROP TABLE IF EXISTS learner;
DROP TABLE IF EXISTS answer_option;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS quiz;
DROP TABLE IF EXISTS lesson;
DROP TABLE IF EXISTS module;
DROP TABLE IF EXISTS course;

-- Course table
CREATE TABLE course (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    creator VARCHAR NOT NULL,
    num_students INT DEFAULT 0
);

-- Module table
CREATE TABLE module (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES course(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Lesson table
CREATE TABLE lesson (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL REFERENCES module(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    position INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz table (optional, per module or course)
CREATE TABLE quiz (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT REFERENCES module(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES course(id) ON DELETE CASCADE
);

-- Question table (belongs to quiz)
CREATE TABLE question (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quiz(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);

-- Multiple-choice answer options
CREATE TABLE answer_option (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES question(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- Learner table
CREATE TABLE learner (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

-- Learner-course many-to-many relationship
CREATE TABLE learner_course_enrollment (
    learner_id BIGINT REFERENCES learner(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES course(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (learner_id, course_id)
);

-- Track completed lessons
CREATE TABLE lesson_progress (
    learner_id BIGINT REFERENCES learner(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lesson(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (learner_id, lesson_id)
);

-- Track completed modules
CREATE TABLE module_progress (
    learner_id BIGINT REFERENCES learner(id) ON DELETE CASCADE,
    module_id BIGINT REFERENCES module(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (learner_id, module_id)
);

-- Track course progress
CREATE TABLE course_progress (
    learner_id BIGINT REFERENCES learner(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES course(id) ON DELETE CASCADE,
    progress_percent INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (learner_id, course_id)
);
