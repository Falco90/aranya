"use client";

import { useState } from "react";
import { useUser } from "@privy-io/react-auth";

type AnswerOption = {
    text: string;
    is_correct: boolean;
};

type Question = {
    text: string;
    answers: AnswerOption[];
};

type Quiz = {
    questions: Question[];
};

type Lesson = {
    title: string;
    content: string;
    video_url: string | null;
    position: number;
};

type Module = {
    title: string;
    position: number;
    lessons: Lesson[];
    quiz: Quiz;
};

type CreateCoursePayload = {
    title: string;
    description: string;
    creator: string;
    modules: Module[];
};

export default function CreateCourse() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const { user } = useUser();

    const handleSubmit = async () => {
        const payload: CreateCoursePayload = {
            title,
            description,
            creator: user!.id,
            modules: [
                {
                    title: "Module 1",
                    position: 1,
                    lessons: [
                        { title: "Lesson 1", content: "Intro content", video_url: null, position: 1 },
                        { title: "Lesson 2", content: "More content", video_url: null, position: 2  },
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
            ]
        };

try {
    const res = await fetch("http://localhost:4000/create-course", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    console.log("Response status:", res.status); // <--- log status

    const text = await res.text(); // Don't assume it's JSON yet
    console.log("RAW RESPONSE:", text);

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        console.error("Response was not valid JSON:", text);
        alert("Server error: " + text);
        return;
    }

    if (res.ok) {
        alert(`Course created! ID: ${data.course_id}`);
    } else {
        alert(`Error: ${data.message}`);
    }
} catch (error) {
    console.error("FETCH ERROR:", error); // <--- catch any fetch issues
    alert("Network error or fetch failed.");
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
                Description:
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
