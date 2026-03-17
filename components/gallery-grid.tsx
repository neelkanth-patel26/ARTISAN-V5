'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ArtworkCard } from './artwork-card'

const artworks = [
  { id: 1, title: 'Abstract Dreams', artist: 'Sarah Johnson', category: 'abstract', image: 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=600&h=800&fit=crop&q=90', price: 1200, likes: 45 },
  { id: 2, title: 'Mountain Vista', artist: 'Michael Chen', category: 'landscape', image: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=600&h=800&fit=crop&q=90', price: 850, likes: 32 },
  { id: 3, title: 'Urban Portrait', artist: 'Emma Davis', category: 'portrait', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=800&fit=crop&q=90', price: 950, likes: 67 },
  { id: 4, title: 'Modern Sculpture', artist: 'David Lee', category: 'sculpture', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=800&fit=crop&q=90', price: 2100, likes: 28 },
  { id: 5, title: 'Digital Waves', artist: 'Lisa Wang', category: 'digital', image: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=600&h=800&fit=crop&q=90', price: 650, likes: 89 },
  { id: 6, title: 'City Lights', artist: 'James Brown', category: 'photography', image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=800&fit=crop&q=90', price: 450, likes: 54 },
  { id: 7, title: 'Color Burst', artist: 'Anna Martinez', category: 'abstract', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop&q=90', price: 1100, likes: 76 },
  { id: 8, title: 'Sunset Valley', artist: 'Robert Taylor', category: 'landscape', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop&q=90', price: 780, likes: 41 },
  { id: 9, title: 'Soul Reflection', artist: 'Maria Garcia', category: 'portrait', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=600&h=800&fit=crop&q=90', price: 890, likes: 63 },
  { id: 10, title: 'Metal Forms', artist: 'Kevin Zhang', category: 'sculpture', image: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&h=800&fit=crop&q=90', price: 1850, likes: 35 },
  { id: 11, title: 'Neon Dreams', artist: 'Sophie Anderson', category: 'digital', image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=600&h=800&fit=crop&q=90', price: 720, likes: 92 },
  { id: 12, title: 'Nature Close-up', artist: 'Tom Wilson', category: 'photography', image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=600&h=800&fit=crop&q=90', price: 380, likes: 48 },
]

interface GalleryGridProps {
  selectedCategory: string
  searchQuery: string
  hidden?: boolean
}

export function GalleryGrid({ selectedCategory, searchQuery, hidden }: GalleryGridProps) {
  if (hidden) return null
  const filteredArtworks = artworks.filter(artwork => {
    const matchesCategory = selectedCategory === 'all' || artwork.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
      {filteredArtworks.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-neutral-500 text-lg font-light">No artworks found</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-neutral-400 text-sm font-light">
              Showing {filteredArtworks.length} {filteredArtworks.length === 1 ? 'artwork' : 'artworks'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-hidden">
            {filteredArtworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="overflow-hidden"
              >
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
