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
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchEnrollmentAndProgress = async () => {
            if (!address) return;

            try {
                // 1. Check enrollment
                const enrollUrl = new URL("http://localhost:4000/is-enrolled");
                enrollUrl.searchParams.set("courseId", String(course.id));
                enrollUrl.searchParams.set("learnerId", address);

                const enrollRes = await fetch(enrollUrl.toString());
                if (!enrollRes.ok) throw new Error("Failed to check enrollment");

                const { enrolled } = await enrollRes.json();
                setIsEnrolled(enrolled);

                // 2. Only fetch progress if enrolled
                if (enrolled) {
                    const progressUrl = new URL("http://localhost:4000/get-course-progress");
                    progressUrl.searchParams.set("courseId", String(course.id));
                    progressUrl.searchParams.set("learnerId", address);

                    const progressRes = await fetch(progressUrl.toString());
                    if (!progressRes.ok) throw new Error("Failed to fetch progress");

                    const data = await progressRes.json();
                    setProgress(data);
                } else {
                    setProgress({
                        completedLessonIds: [],
                        completedQuizIds: [],
                        completedModuleIds: [],
                        progressPercent: 0,
                        courseCompleted: false,
                    });
                }
            } catch (err) {
                console.error(err);
                setIsEnrolled(false);
                setProgress({
                    completedLessonIds: [],
                    completedQuizIds: [],
                    completedModuleIds: [],
                    progressPercent: 0,
                    courseCompleted: false,
                });
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) {
            fetchEnrollmentAndProgress();
        }
    }, [address, isConnected, course.id]);

    console.log(progress);

    if (loading) {
        return <div>Loading progress...</div>;
    }

    return (
        <CourseViewerProvider course={course} courseProgress={progress!} isEnrolled={isEnrolled} >
            <CourseViewerLayout />
        </CourseViewerProvider>
    );
};

export default CourseViewerClient;
