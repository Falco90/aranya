'use client';

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

type JoinCourseProps = {
    courseId: number;
};

export default function JoinCourse({ courseId }: JoinCourseProps) {
    const { user, ready } = usePrivy();
    const router = useRouter();

    const handleJoin = async () => {
        if (!ready || !user) {
            alert("You must be logged in to join a course.");
            return;
        }

        const privyId = user.id;

        try {
            const res = await fetch("http://localhost:4000/join-course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ privy_id: privyId, course_id: courseId }),
            });

            if (res.ok) {
                alert("Successfully joined the course!");
                router.push("/");
            } else {
                const data = await res.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Join failed", error);
            alert("Failed to join the course.");
        }
    };

    return (
        <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleJoin}
        >
            Join Course
        </button>
    );
}
