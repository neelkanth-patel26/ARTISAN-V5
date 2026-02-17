'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface QuickActionCardProps {
  href: string
  icon: LucideIcon
  label: string
  description?: string
}

export function QuickActionCard({ href, icon: Icon, label, description }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-900/80 p-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
    >
      <div className="rounded-lg bg-neutral-800 p-3">
        <Icon className="text-neutral-400" size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{label}</p>
        {description && (
          <p className="text-sm text-neutral-500">
            {description}
          </p>
        )}
      </div>
    </Link>
  )
}
