import React, { useEffect, useState } from 'react'
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
} from 'lucide-react'

interface SubmitCourseModalProps {
    isOpen: boolean
    onClose: () => void
    courseTitle: string
}

type SubmissionStep =
    | 'saving'
    | 'attestation'
    | 'proof'
    | 'pending'
    | 'transaction'
    | 'success'
    | 'failed'

const stepOrder: SubmissionStep[] = [
    'saving',
    'attestation',
    'proof',
    'pending',
    'transaction',
    'success',
]

export default function SubmitCourseModal({
    isOpen,
    onClose,
    courseTitle,
}: SubmitCourseModalProps) {
    const [currentStep, setCurrentStep] = useState<SubmissionStep>('saving')
    const [error, setError] = useState<string | null>(null)

    // Simulate process
    useEffect(() => {
        if (!isOpen) return
        setCurrentStep('saving')
        setError(null)

        const timers: NodeJS.Timeout[] = []

        timers.push(
            setTimeout(() => setCurrentStep('attestation'), 4000),
            setTimeout(() => setCurrentStep('proof'), 10000),
            setTimeout(() => setCurrentStep('pending'), 18000)
        )

        return () => timers.forEach(clearTimeout)
    }, [isOpen])

    const handleConfirmTransaction = () => {
        setCurrentStep('transaction')
        setTimeout(() => {
            if (Math.random() < 0.9) {
                setCurrentStep('success')
            } else {
                setCurrentStep('failed')
                setError('Transaction failed. Please try again later.')
            }
        }, 10000)
    }

    const handleClose = () => {
        if (!['success', 'failed', 'pending'].includes(currentStep)) {
            if (
                window.confirm(
                    'The submission process is still running. Are you sure you want to cancel?'
                )
            ) {
                onClose()
            }
        } else {
            onClose()
        }
    }

    if (!isOpen) return null

    const Step = ({
        label,
        description,
        icon: Icon,
        stepKey,
        waitingDescription = 'Waiting...',
    }: {
        label: string
        description: string
        icon: React.ElementType
        stepKey: SubmissionStep
        waitingDescription?: string
    }) => {
        let status: 'waiting' | 'active' | 'done' | 'error' = 'waiting'

        if (currentStep === stepKey) {
            status = 'active'
        } else if (currentStep === 'failed' && stepOrder.indexOf(stepKey) <= stepOrder.indexOf(currentStep)) {
            status = 'error'
        } else if (stepOrder.indexOf(currentStep) > stepOrder.indexOf(stepKey)) {
            status = 'done'
        }

        const iconClasses = {
            waiting: 'bg-stone-100 border-2 border-stone-300',
            active: 'bg-amber-100 text-amber-700 animate-spin',
            done: 'bg-emerald-100 text-emerald-600',
            error: 'bg-red-100 text-red-600',
        }

        return (
            <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${status === 'waiting' ? '' : iconClasses[status]
                            }`}
                    >
                        {status === 'waiting' ? (
                            <div className="h-5 w-5 rounded-full border-2 border-stone-300"></div>
                        ) : status === 'active' ? (
                            <Loader2Icon className="h-5 w-5" />
                        ) : status === 'done' ? (
                            <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                            <XCircleIcon className="h-5 w-5" />
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center">
                        <Icon className="h-4 w-4 text-stone-600 mr-2" />
                        <h4 className="font-medium text-stone-800">{label}</h4>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">
                        {status === 'active'
                            ? description
                            : status === 'done'
                                ? description.replace('...', 'ed successfully')
                                : waitingDescription}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-stone-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-stone-800">Submit Course</h2>
                    <button onClick={handleClose} className="text-stone-500 hover:text-stone-700">
                        <XCircleIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <LeafIcon className="h-5 w-5 text-amber-700 mr-2" />
                            <h3 className="font-medium text-stone-800">
                                {courseTitle || 'Untitled Course'}
                            </h3>
                        </div>
                        <p className="text-stone-600 text-sm">
                            Your course is being submitted to the blockchain. This may take a few minutes.
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
                            description="Please confirm the transaction to continue."
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

                    {/* Action for pending */}
                    {currentStep === 'pending' && (
                        <button
                            onClick={handleConfirmTransaction}
                            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 text-sm"
                        >
                            <ArrowRightIcon className="h-4 w-4 mr-2" />
                            Confirm Transaction
                        </button>
                    )}

                    {/* Final status */}
                    {(currentStep === 'success' || currentStep === 'failed') && (
                        <div
                            className={`mt-6 p-4 rounded-md ${currentStep === 'success'
                                    ? 'bg-emerald-50 border border-emerald-100'
                                    : 'bg-red-50 border border-red-100'
                                }`}
                        >
                            <div className="flex items-start">
                                {currentStep === 'success' ? (
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                                )}
                                <div>
                                    <h4
                                        className={`font-medium ${currentStep === 'success' ? 'text-emerald-800' : 'text-red-800'
                                            }`}
                                    >
                                        {currentStep === 'success'
                                            ? 'Transaction successful'
                                            : 'Transaction failed'}
                                    </h4>
                                    <p
                                        className={`text-sm mt-1 ${currentStep === 'success' ? 'text-emerald-700' : 'text-red-700'
                                            }`}
                                    >
                                        {currentStep === 'success'
                                            ? 'Your course has been successfully submitted.'
                                            : error ||
                                            'There was an error submitting your course. Please try again later.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
