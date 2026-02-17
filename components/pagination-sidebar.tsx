'use client'

import { motion } from 'framer-motion'

interface PaginationSidebarProps {
  currentSection: number
  onSectionChange: (section: number) => void
}

export function PaginationSidebar({ currentSection, onSectionChange }: PaginationSidebarProps) {
  const pages = [
    { label: '01', title: 'Home' },
    { label: '02', title: 'Collection' },
    { label: '03', title: 'Artists' },
    { label: '04', title: 'History' },
    { label: '05', title: 'Visit' },
    { label: '06', title: 'App' },
  ]

  return (
    <div className="hidden lg:flex fixed left-4 md:left-12 top-1/2 transform -translate-y-1/2 z-50 flex-col gap-6 md:gap-8">
      {pages.map((page, index) => (
        <motion.button
          key={index}
          onClick={() => onSectionChange(index)}
          className="flex items-center gap-3 group relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 4.5 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          style={{ willChange: 'transform' }}
        >
          <div className="relative">
            {index === currentSection && (
              <div className="absolute inset-0 bg-amber-600/20 rounded-full blur-md" />
            )}
            <div 
              className={`relative w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                index === currentSection 
                  ? 'bg-amber-600 border-amber-600 shadow-lg shadow-amber-600/50' 
                  : 'bg-transparent border-neutral-600 hover:border-amber-600/50'
              }`}
            />
          </div>
          {index === currentSection && (
            <motion.div 
              className="h-px bg-gradient-to-r from-amber-600 to-transparent" 
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}
          <motion.span 
            className={`text-xs font-light tracking-wider transition-all duration-300 ${
              index === currentSection 
                ? 'text-amber-600 opacity-100' 
                : 'text-neutral-600 opacity-0 group-hover:opacity-100 group-hover:text-amber-600/70'
            }`}
            style={{ fontFamily: 'Oughter, serif' }}
          >
            {page.label}
          </motion.span>
          <motion.span
            className={`absolute left-12 top-1/2 -translate-y-1/2 text-xs font-light tracking-wider whitespace-nowrap transition-all duration-300 ${
              index === currentSection
                ? 'opacity-0'
                : 'text-neutral-600 opacity-0 group-hover:opacity-100'
            }`}
          >
            {page.title}
          </motion.span>
        </motion.button>
      ))}
    </div>
  )
}
