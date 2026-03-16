'use client'

import { motion } from 'framer-motion'

interface PaginationSidebarProps {
  currentSection: number
  onSectionChange: (section: number) => void
  totalSections?: number
}

export function PaginationSidebar({ currentSection, onSectionChange, totalSections }: PaginationSidebarProps) {
  const pages = [
    { label: '01', title: 'Home' },
    { label: '02', title: 'Collection' },
    { label: '03', title: 'Artists' },
    { label: '04', title: 'History' },
    { label: '05', title: 'Visit' },
    { label: '06', title: 'App' },
  ]

  const displayPages = totalSections ? pages.slice(0, totalSections) : pages

  return (
    <div className="hidden lg:flex fixed left-12 top-1/2 -translate-y-1/2 z-50 flex-col gap-9">
      {displayPages.map((page, index) => {
        const isActive = index === currentSection
        return (
          <motion.button
            key={index}
            onClick={() => onSectionChange(index)}
            className="flex items-center gap-3 group relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 4.5 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 4 }}
            style={{ willChange: 'transform' }}
          >
            {/* Active bar indicator — matches drawer active pill */}
            <div className="relative flex items-center justify-center w-4 h-7">
              {isActive ? (
                <motion.div
                  layoutId="sidebar-active"
                  className="w-[3px] h-7 bg-amber-600 rounded-full shadow-[0_0_12px_rgba(217,119,6,0.6)]"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              ) : (
                <div className="w-px h-4 bg-white/[0.12] group-hover:bg-amber-600/30 transition-colors duration-300 rounded-full" />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] tracking-[0.5em] font-black uppercase transition-all duration-400 ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-600 group-hover:text-neutral-400'
              }`}
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              {page.label}
            </span>

            {/* Hover title — fades in to the right */}
            <span
              className={`absolute left-full ml-4 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.4em] font-black uppercase whitespace-nowrap pointer-events-none transition-all duration-300 ${
                isActive
                  ? 'text-amber-600/60 opacity-100'
                  : 'text-neutral-600 opacity-0 group-hover:opacity-100 group-hover:text-neutral-400'
              }`}
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              {page.title}
            </span>
          </motion.button>
        )
      })}

      {/* Vertical ambient line */}
      <div className="absolute left-[5px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent -z-10 pointer-events-none" />
    </div>
  )
}
