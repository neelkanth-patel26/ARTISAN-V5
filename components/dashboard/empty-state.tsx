'use client'

import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700/80 bg-neutral-900/30 py-16 px-6">
      <div className="mb-4 rounded-full border border-neutral-800 bg-neutral-800/50 p-4">
        <Icon className="text-neutral-500" size={40} strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-neutral-500">
        {description}
      </p>
      {action}
    </div>
  )
}
