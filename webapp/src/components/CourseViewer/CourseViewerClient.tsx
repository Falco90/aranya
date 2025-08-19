"use client";

import React, { useEffect, useState } from 'react';
import { CourseViewerProvider } from '../CourseViewer/CourseContext';
import CourseViewerLayout from './CourseViewerLayout';
import { Course, CourseProgress } from '../../types/course';
import { useAccount } from 'wagmi';

interface Props {
    course: Course;
}

const CourseViewerClient: React.FC<Props> = ({ course }) => {
    const { address, isConnected } = useAccount();
    const [progress, setProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            if (!address) return;

            try {
                const learnerId = address; // or wrap it as DID if you need
                const url = new URL("http://localhost:4000/get-course-progress");
                url.searchParams.set("courseId", String(course.id));
                url.searchParams.set("learnerId", learnerId);

                const res = await fetch(url.toString());
                if (!res.ok) throw new Error("Failed to fetch progress");

                const data = await res.json();
                setProgress(data);
            } catch (err) {
                console.error(err);
                setProgress({ completedLessonIds: [], completedQuizIds: [], completedModuleIds: [], progressPercent: 0, courseCompleted: false });
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) {
            fetchProgress();
        }
    }, [address, isConnected, course.id]);

    console.log(progress);

    if (loading) {
        return <div>Loading progress...</div>;
    }
    
    return (
        <CourseViewerProvider course={course} courseProgress={progress!}>
            <CourseViewerLayout />
        </CourseViewerProvider>
    );
};

export default CourseViewerClient;
