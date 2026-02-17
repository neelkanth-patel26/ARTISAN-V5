'use client'

import { useState } from 'react'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchFilters {
  query: string
  category: string
  priceMin: string
  priceMax: string
  sortBy: string
  artistVerified: boolean
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories: string[]
}

export function AdvancedSearch({ onSearch, categories }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'newest',
    artistVerified: false
  })

  const handleSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    const cleared = {
      query: '',
      category: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'newest',
      artistVerified: false
    }
    setFilters(cleared)
    onSearch(cleared)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search artworks, artists..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-12 pr-4 py-3 text-white focus:border-amber-600 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-lg border transition-all flex items-center gap-2 ${
            showFilters
              ? 'bg-amber-600 border-amber-600 text-white'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-amber-600/50'
          }`}
        >
          <SlidersHorizontal size={20} />
          Filters
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-all"
        >
          Search
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Advanced Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Min */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                    placeholder="0"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
                  />
                </div>

                {/* Price Max */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    placeholder="Any"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:border-amber-600 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Verified Artists Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={filters.artistVerified}
                  onChange={(e) => setFilters({ ...filters, artistVerified: e.target.checked })}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-amber-600 focus:ring-amber-600"
                />
                <label htmlFor="verified" className="text-sm text-neutral-300">
                  Show only verified artists
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
