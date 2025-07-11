"use client";

import { useState } from "react";

type Answer = {
    text: string;
    is_correct: boolean;
};

type Question = {
    text: string;
    answers: Answer[];
};

type Quiz = {
    questions: Question[];
};

type Lesson = {
    title: string;
    content: string;
};

type Module = {
    title: string;
    lessons: Lesson[];
    quiz: Quiz;
};

type CreateCoursePayload = {
    title: string;
    creator: string;
    modules: Module[];
    final_exam: Quiz;
};

export default function CreateCourse() {
    const [title, setTitle] = useState("");
    const [creator, setCreator] = useState("");

    const handleSubmit = async () => {
        const payload: CreateCoursePayload = {
            title,
            creator,
            modules: [
                {
                    title: "Module 1",
                    lessons: [
                        { title: "Lesson 1", content: "Intro content" },
                        { title: "Lesson 2", content: "More content" },
                    ],
                    quiz: {
                        questions: [
                            {
                                text: "What is Rust?",
                                answers: [
                                    { text: "A programming language", is_correct: true },
                                    { text: "A car", is_correct: false },
                                ],
                            },
                        ],
                    },
                },
            ],
            final_exam: {
                questions: [
                    {
                        text: "Final exam question?",
                        answers: [
                            { text: "Yes", is_correct: true },
                            { text: "No", is_correct: false },
                        ],
                    },
                ],
            },
        };

        console.log(payload);
        try {
            const res = await fetch("http://localhost:4000/create-course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Course created! ID: ${data.course_id}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error(error);
            alert("Network error");
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Create Course</h1>

            <label className="block mb-2">
                Title:
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </label>

            <label className="block mb-4">
                Creator:
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                />
            </label>

            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Submit Course
            </button>
        </div>
    );
}
