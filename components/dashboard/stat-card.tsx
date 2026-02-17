'use client'

import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  delay?: number
}

export function StatCard({ label, value, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/80 p-5 transition-colors hover:border-neutral-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-neutral-800 p-3">
          <Icon className="text-neutral-400" size={22} strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  )
}
