import React from 'react'
import Link from 'next/link'
import { BookOpenIcon, PenToolIcon } from 'lucide-react'
interface EmptyStateProps {
  type: 'learner' | 'creator'
  message: string
  actionText: string
  actionLink: string
}
const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  actionText,
  actionLink,
}) => {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
        {type === 'learner' ? (
          <BookOpenIcon className="h-8 w-8 text-stone-400" />
        ) : (
          <PenToolIcon className="h-8 w-8 text-stone-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-stone-800 mb-2">{message}</h3>
      <p className="text-stone-600 mb-6">
        {type === 'learner'
          ? 'Discover courses that match your interests and start your learning journey'
          : 'Share your knowledge by creating your first course'}
      </p>
      <Link
        href={actionLink}
        className="inline-flex items-center px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800"
      >
        {type === 'learner' ? (
          <BookOpenIcon className="h-4 w-4 mr-2" />
        ) : (
          <PenToolIcon className="h-4 w-4 mr-2" />
        )}
        {actionText}
      </Link>
    </div>
  )
}
export default EmptyState
