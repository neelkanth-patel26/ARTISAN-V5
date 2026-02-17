'use client'

import { BadgeCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface VerifiedBadgeProps {
  size?: number
  showTooltip?: boolean
  className?: string
}

export function VerifiedBadge({ size = 18, showTooltip = true, className = '' }: VerifiedBadgeProps) {
  return (
    <div className={`relative inline-flex ${className}`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="group relative"
      >
        <BadgeCheck 
          size={size} 
          className="text-amber-600 fill-amber-600/20" 
        />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800 shadow-lg">
            Verified Artist
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
