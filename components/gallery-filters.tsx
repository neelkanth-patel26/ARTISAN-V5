'use client'

import { motion } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface GalleryFiltersProps {
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  showLiveOnly: boolean
  setShowLiveOnly: (show: boolean) => void
}

export function GalleryFilters({ categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, showLiveOnly, setShowLiveOnly }: GalleryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
        <input
          type="text"
          placeholder="Search by artist name or artwork title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/50 border border-neutral-800/50 rounded-xl pl-12 pr-4 py-4 text-white/90 placeholder:text-neutral-500 focus:outline-none focus:border-amber-600/50 transition-colors font-light"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLiveOnly(!showLiveOnly)}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
            showLiveOnly
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30'
              : 'bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 hover:border-amber-600/50 hover:text-neutral-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${showLiveOnly ? 'bg-white animate-pulse' : 'bg-neutral-600'}`} />
            LIVE COLLECTION ONLY
          </span>
        </motion.button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 hover:border-amber-600/50 hover:text-neutral-300 transition-all text-sm"
        >
          <span>Filters</span>
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {categories.map((category, i) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full text-xs tracking-wider transition-all font-light ${
                selectedCategory === category
                  ? 'bg-amber-600 border border-amber-600 text-white'
                  : 'bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 hover:border-amber-600/50 hover:text-neutral-300'
              }`}
            >
              {category.toUpperCase()}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
