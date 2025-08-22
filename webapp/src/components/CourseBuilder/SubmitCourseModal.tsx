"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    Loader2Icon,
    ArrowRightIcon,
    ServerIcon,
    FileTextIcon,
    ShieldCheckIcon,
    WalletIcon,
    SendIcon,
    LeafIcon,
} from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
// If your ABI lives elsewhere, adjust the path:
import ICourseManager from "../../app/abis/aranya/ICourseManager.json";
// If you keep CourseManager address in env, surface it to the client via NEXT_PUBLIC_*
const COURSE_MANAGER_ADDRESS =
    process.env.NEXT_PUBLIC_COURSE_MANAGER_ADDRESS || "";

// If you want to post the whole course, grab it from context:
import { useCourseBuilder, Quiz } from "./CourseContext";
import { CoursePayload, QuizPayload } from "../../types/course";

interface SubmitCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseTitle: string;
}

type SubmissionStep =
    | "saving"
    | "attestation"
    | "proof"
    | "pending"
    | "transaction"
    | "success"
    | "failed";

const stepOrder: SubmissionStep[] = [
    "saving",
    "attestation",
    "proof",
    "pending",
    "transaction",
    "success",
];

type ServerResponse = {
    // Shape this to match your API response
    proof?: any;
    courseId?: string | number;
    title?: string;
    // add any other fields your API returns
};

function toQuizPayload(quiz: Quiz): QuizPayload {
    return {
        questions: quiz.questions.map((q) => ({
            questionText: q.questionText,
            answers: q.answers.map((opt) => ({
                answerText: opt.answerText,
                isCorrect: opt.isCorrect,
            })),
        })),
    };
}

export default function SubmitCourseModal({
    isOpen,
    onClose,
    courseTitle,
}: SubmitCourseModalProps) {
    const [currentStep, setCurrentStep] = useState<SubmissionStep>("saving");
    const [error, setError] = useState<string | null>(null);
    const { isConnected, chainId, address } = useAccount();
    const { writeContractAsync, isPending: isWritePending } = useWriteContract();
    const [serverData, setServerData] = useState<ServerResponse | null>(null);
    const { course } = useCourseBuilder();

    const coursePayload: CoursePayload = {
        title: course.title,
        description: course.description,
        creatorId: address!,
        modules: course.modules.map((mod) => ({
            title: mod.title,
            position: mod.position,
            lessons: mod.lessons.map((lesson) => ({
                title: lesson.title,
                content: lesson.content,
                videoUrl: lesson.videoUrl,
                position: lesson.position,
            })),
            quiz: mod.quiz ? toQuizPayload(mod.quiz) : undefined
        }))
    };



    // A tiny helper to move through early steps while the server runs
    const bumpIntermediates = () => {
        // Show “saving” quickly, then “attestation”, then “proof”
        setCurrentStep("saving");
        setTimeout(() => setCurrentStep((s) => (s === "saving" ? "attestation" : s)), 500);
        setTimeout(
            () => setCurrentStep((s) => (s === "attestation" ? "proof" : s)),
            1200
        );
    };

    // Hit your Next.js API route when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        setError(null);
        setServerData(null);
        bumpIntermediates();

        const runServerFlow = async () => {
            try {
                const res = await fetch("/api/create-course", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // You can send only what your API needs (title/modules/lessons/etc.)
                    body: JSON.stringify(coursePayload),
                });

                if (!res.ok) {
                    throw new Error(`Server returned ${res.status}`);
                }

                const data = (await res.json()) as { proof?: any; courseId?: string | number; creatorId?: string; message?: string };
                if (cancelled) return;

                setServerData(data);
                // Server finished: we move to “pending” (user must sign tx next)
                setCurrentStep("pending");
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message || "Failed to submit course.");
                setCurrentStep("failed");
            }
        };

        runServerFlow();
        return () => {
            cancelled = true;
        };
    }, [isOpen, course]);

    useEffect(() => {
        if (currentStep === "pending" && serverData && isConnected) {
            // Auto-confirm transaction
            handleConfirmTransaction();
        }
    }, [currentStep, serverData, isConnected]);

    const handleConfirmTransaction = async () => {
        if (!isConnected) {
            setError("Please connect your wallet to continue.");
            return;
        }
        if (!COURSE_MANAGER_ADDRESS) {
            setError(
                "Missing CourseManager address. Set NEXT_PUBLIC_COURSE_MANAGER_ADDRESS."
            );
            return;
        }
        if (!serverData) {
            setError("Missing server response data needed for transaction.");
            return;
        }

        try {
            setError(null);
            setCurrentStep("transaction");

            const args = [
                BigInt(serverData.courseId!),
                serverData.proof,
                serverData.title
            ];

            const response = await writeContractAsync({
                address: COURSE_MANAGER_ADDRESS as `0x${string}`,
                abi: ICourseManager.abi,
                functionName: "createCourse",
                args,
            });

            console.log(response);

            setCurrentStep("success");
        } catch (e: any) {
            console.error(e);
            setError(e?.message || "Transaction failed. Please try again.");
            setCurrentStep("failed");
        }
    };

    const handleClose = () => {
        // Allow close anytime; if you want a guard, re-enable your confirm()
        onClose();
    };

    if (!isOpen) return null;

    const Step = ({
        label,
        description,
        icon: Icon,
        stepKey,
        waitingDescription = "Waiting...",
    }: {
        label: string;
        description: string;
        icon: React.ElementType;
        stepKey: SubmissionStep;
        waitingDescription?: string;
    }) => {
        let status: "waiting" | "active" | "done" | "error" = "waiting";

        if (currentStep === stepKey) {
            status = "active";
        } else if (
            currentStep === "failed" &&
            stepOrder.indexOf(stepKey) <= stepOrder.indexOf(currentStep)
        ) {
            status = "error";
        } else if (stepOrder.indexOf(currentStep) > stepOrder.indexOf(stepKey)) {
            status = "done";
        }

        const iconClasses = {
            waiting: "bg-stone-100 border-2 border-stone-300",
            active: "bg-amber-100 text-amber-700",
            done: "bg-emerald-100 text-emerald-600",
            error: "bg-red-100 text-red-600",
        };

        return (
            <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${status === "waiting" ? "" : iconClasses[status]
                            }`}
                    >
                        {status === "active" ? (
                            <Loader2Icon className="h-5 w-5 animate-spin" />
                        ) : status === "done" ? (
                            <CheckCircleIcon className="h-5 w-5" />
                        ) : status === "error" ? (
                            <XCircleIcon className="h-5 w-5" />
                        ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-stone-300" />
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center">
                        <Icon className="h-4 w-4 text-stone-600 mr-2" />
                        <h4 className="font-medium text-stone-800">{label}</h4>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                        {status === "active"
                            ? description
                            : status === "done"
                                ? description.replace("...", " successfull")
                                : waitingDescription}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-stone-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-800">Submit Course</h2>
                    <button
                        onClick={handleClose}
                        className="text-stone-500 hover:text-stone-700"
                    >
                        <XCircleIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <LeafIcon className="h-5 w-5 text-amber-700 mr-2" />
                            <h3 className="font-medium text-stone-800">
                                {courseTitle || "Untitled Course"}
                            </h3>
                        </div>
                        <p className="text-stone-600 text-sm">
                            Your course is being submitted. This may take a few minutes.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Step
                            label="Saving course to database"
                            description="Uploading your course content..."
                            icon={ServerIcon}
                            stepKey="saving"
                        />
                        <Step
                            label="Submitting attestation"
                            description="Creating attestation for your course..."
                            icon={FileTextIcon}
                            stepKey="attestation"
                        />
                        <Step
                            label="Retrieving proof"
                            description="Generating cryptographic proof..."
                            icon={ShieldCheckIcon}
                            stepKey="proof"
                        />
                        <Step
                            label="Pending transaction"
                            description={
                                isConnected
                                    ? "Please confirm the transaction to continue."
                                    : "Connect your wallet to continue."
                            }
                            icon={WalletIcon}
                            stepKey="pending"
                        />
                        <Step
                            label="Submitting transaction"
                            description="Processing blockchain transaction..."
                            icon={SendIcon}
                            stepKey="transaction"
                        />
                    </div>

                    {/* Pending action */}
                    {currentStep === "pending" && (
                        <button
                            onClick={handleConfirmTransaction}
                            disabled={!isConnected || isWritePending}
                            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <ArrowRightIcon className="h-4 w-4 mr-2" />
                            {isConnected ? "Confirm Transaction" : "Connect Wallet First"}
                        </button>
                    )}

                    {/* Final status */}
                    {(currentStep === "success" || currentStep === "failed") && (
                        <div
                            className={`mt-6 p-4 rounded-md ${currentStep === "success"
                                ? "bg-emerald-50 border border-emerald-100"
                                : "bg-red-50 border border-red-100"
                                }`}
                        >
                            <div className="flex items-start">
                                {currentStep === "success" ? (
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                                )}
                                <div>
                                    <h4
                                        className={`font-medium ${currentStep === "success"
                                            ? "text-emerald-800"
                                            : "text-red-800"
                                            }`}
                                    >
                                        {currentStep === "success"
                                            ? "Transaction successful"
                                            : "Transaction failed"}
                                    </h4>
                                    <p
                                        className={`text-sm mt-1 ${currentStep === "success"
                                            ? "text-emerald-700"
                                            : "text-red-700"
                                            }`}
                                    >
                                        {currentStep === "success"
                                            ? "Your course has been successfully submitted."
                                            : error ||
                                            "There was an error submitting your course. Please try again later."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inline error (non-final) */}
                    {error && !["success", "failed"].includes(currentStep) && (
                        <p className="mt-4 text-sm text-red-600">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
