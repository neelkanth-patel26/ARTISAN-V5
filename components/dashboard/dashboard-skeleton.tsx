'use client'

import { motion } from 'framer-motion'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-5">
            <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
            <div className="h-7 w-12 rounded bg-neutral-700" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-5">
          <div className="mb-3 h-4 w-16 rounded bg-neutral-800" />
          <div className="h-7 w-12 rounded bg-neutral-700" />
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex min-h-[160px] items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
    </div>
  )
}
