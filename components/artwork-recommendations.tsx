'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Heart, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Artwork {
  id: string
  title: string
  image_url: string
  price: number
  category: string
  artist: { id: string; full_name: string; is_verified: boolean }
  views: number
  likes: number
}

export function ArtworkRecommendations({ userId, currentArtworkId }: { userId?: string; currentArtworkId?: string }) {
  const [recommendations, setRecommendations] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [algorithm, setAlgorithm] = useState<'similar' | 'trending' | 'personalized'>('similar')

  useEffect(() => {
    loadRecommendations()
  }, [userId, currentArtworkId, algorithm])

  const loadRecommendations = async () => {
    setLoading(true)

    try {
      let artworks: Artwork[] = []

      if (algorithm === 'similar' && currentArtworkId) {
        artworks = await getSimilarArtworks(currentArtworkId)
      } else if (algorithm === 'trending') {
        artworks = await getTrendingArtworks()
      } else if (algorithm === 'personalized' && userId) {
        artworks = await getPersonalizedRecommendations(userId)
      }

      setRecommendations(artworks)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSimilarArtworks = async (artworkId: string): Promise<Artwork[]> => {
    // Get current artwork category
    const { data: current } = await supabase
      .from('artworks')
      .select('category, price')
      .eq('id', artworkId)
      .single()

    if (!current) return []

    // Find similar artworks (same category, similar price range)
    const { data } = await supabase
      .from('artworks')
      .select('*, users!artist_id(id, full_name, is_verified)')
      .eq('category', current.category)
      .eq('status', 'approved')
      .neq('id', artworkId)
      .gte('price', current.price * 0.7)
      .lte('price', current.price * 1.3)
      .order('views', { ascending: false })
      .limit(6)

    return data?.map(a => ({ ...a, artist: a.users })) || []
  }

  const getTrendingArtworks = async (): Promise<Artwork[]> => {
    // Get artworks with high views and likes in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data } = await supabase
      .from('artworks')
      .select('*, users!artist_id(id, full_name, is_verified)')
      .eq('status', 'approved')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('views', { ascending: false })
      .order('likes', { ascending: false })
      .limit(6)

    return data?.map(a => ({ ...a, artist: a.users })) || []
  }

  const getPersonalizedRecommendations = async (userId: string): Promise<Artwork[]> => {
    // Get user's liked artworks categories
    const { data: likes } = await supabase
      .from('likes')
      .select('artworks(category)')
      .eq('user_id', userId)

    const categories = [...new Set(likes?.map(l => l.artworks?.category).filter(Boolean))]

    if (categories.length === 0) {
      return getTrendingArtworks()
    }

    // Get artworks from preferred categories
    const { data } = await supabase
      .from('artworks')
      .select('*, users!artist_id(id, full_name, is_verified)')
      .in('category', categories)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)

    return data?.map(a => ({ ...a, artist: a.users })) || []
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-neutral-900 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-amber-600" />
          <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
            {algorithm === 'similar' ? 'Similar Artworks' : 
             algorithm === 'trending' ? 'Trending Now' : 
             'Recommended for You'}
          </h3>
        </div>

        {/* Algorithm Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setAlgorithm('similar')}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              algorithm === 'similar'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Similar
          </button>
          <button
            onClick={() => setAlgorithm('trending')}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              algorithm === 'trending'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Trending
          </button>
          {userId && (
            <button
              onClick={() => setAlgorithm('personalized')}
              className={`px-3 py-1 rounded-lg text-xs transition-all ${
                algorithm === 'personalized'
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              For You
            </button>
          )}
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((artwork, i) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group cursor-pointer"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-900 mb-2 relative">
              <img 
                src={artwork.image_url} 
                alt={artwork.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <div className="flex items-center gap-1 text-white text-xs">
                  <Eye size={14} />
                  {artwork.views}
                </div>
                <div className="flex items-center gap-1 text-white text-xs">
                  <Heart size={14} />
                  {artwork.likes}
                </div>
              </div>
            </div>
            <h4 className="text-white text-sm font-medium truncate">{artwork.title}</h4>
            <p className="text-neutral-400 text-xs truncate">{artwork.artist.full_name}</p>
            <p className="text-amber-600 text-sm font-semibold">₹{artwork.price.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
