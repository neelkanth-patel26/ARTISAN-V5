'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
      {/* Immersive Search Container */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent scale-x-75 group-focus-within:scale-x-100 transition-transform duration-700" />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-600 transition-colors" size={22} />
        <input
          type="text"
          placeholder="Search by artist name or masterpiece title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] pl-16 pr-8 py-6 text-white text-lg placeholder:text-neutral-600 focus:outline-none focus:bg-neutral-900/60 transition-all font-light tracking-wide shadow-2xl"
        />
      </div>

      <div className="flex flex-col items-center gap-10">
        {/* Toggleable Category Plaque */}
        <div className="flex flex-col items-center gap-6">
           <button
             onClick={() => setShowFilters(!showFilters)}
             className={`px-10 py-3 rounded-full text-[10px] tracking-[0.4em] font-black uppercase transition-all duration-500 border ${
               showFilters 
                 ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                 : 'bg-neutral-900/40 backdrop-blur-xl border-white/5 text-neutral-500 hover:text-white hover:border-white/10'
             }`}
           >
             {showFilters ? 'Hide Categories' : 'Explore Categories'}
           </button>

           <AnimatePresence>
             {showFilters && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, height: 0 }}
                 animate={{ opacity: 1, y: 0, height: 'auto' }}
                 exit={{ opacity: 0, y: -10, height: 0 }}
                 className="flex flex-wrap justify-center gap-3 p-2 bg-neutral-900/30 backdrop-blur-md border border-white/5 rounded-[2.5rem] shadow-inner overflow-hidden"
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
                     className={`px-8 py-3 rounded-full text-[10px] tracking-[0.2em] font-black uppercase transition-all duration-500 ${
                       selectedCategory === category
                         ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]'
                         : 'text-neutral-500 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     {category}
                   </motion.button>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-col items-center gap-6">
           <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLiveOnly(!showLiveOnly)}
              className={`group relative px-10 py-4 rounded-2xl text-[10px] tracking-[0.4em] font-black uppercase transition-all duration-700 overflow-hidden ${
                showLiveOnly
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                  : 'bg-neutral-900/40 backdrop-blur-xl border border-white/5 text-neutral-500 hover:text-white'
              }`}
           >
              <div className="relative z-10 flex items-center gap-3">
                 <div className={`w-1.5 h-1.5 rounded-full ${showLiveOnly ? 'bg-black animate-pulse' : 'bg-neutral-800 group-hover:bg-amber-600'} transition-colors`} />
                 Live Collection Only
              </div>
              {/* Luxury hover glow */}
              {!showLiveOnly && <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
           </motion.button>

           <div className="flex items-center gap-8 text-[10px] tracking-[0.3em] uppercase font-black text-neutral-500">
              <div className="h-px w-8 bg-white/5" />
              <p>Curated Selection</p>
              <div className="h-px w-8 bg-white/5" />
           </div>
        </div>
      </div>
    </div>
  )
}
