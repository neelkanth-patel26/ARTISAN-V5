'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Eye, Heart, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  image_url: string
  price: number
  category_name: string
  artist_name: string
  views_count: number
  likes_count: number
}

type Algorithm = 'trending' | 'personalized' | 'recent'

export function ArtworkRecommendations({ userId, currentArtworkId }: { userId?: string; currentArtworkId?: string }) {
  const [recommendations, setRecommendations] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [algorithm, setAlgorithm] = useState<Algorithm>('trending')

  useEffect(() => {
    load()
  }, [userId, currentArtworkId, algorithm])

  const fetchAndMap = async (query: any): Promise<Artwork[]> => {
    const { data, error } = await query
    if (error || !data) return []

    const artistIds = [...new Set(data.map((a: any) => a.artist_id).filter(Boolean))] as string[]
    const artistMap: Record<string, string> = {}
    if (artistIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', artistIds)
      users?.forEach((u: any) => { artistMap[u.id] = u.full_name ?? 'Artist' })
    }

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      image_url: a.image_url ?? '',
      price: Number(a.price ?? 0),
      category_name: (a.categories as any)?.name ?? 'Art',
      artist_name: artistMap[a.artist_id] ?? 'Artist',
      views_count: Number(a.views_count ?? 0),
      likes_count: Number(a.likes_count ?? 0),
    }))
  }

  const getTrending = () => fetchAndMap(
    supabase
      .from('artworks')
      .select('id, title, image_url, price, views_count, likes_count, artist_id, categories(name)')
      .eq('status', 'approved')
      .order('views_count', { ascending: false })
      .limit(6)
  )

  const getRecent = () => fetchAndMap(
    supabase
      .from('artworks')
      .select('id, title, image_url, price, views_count, likes_count, artist_id, categories(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)
  )

  const getPersonalized = async (): Promise<Artwork[]> => {
    if (!userId) return getTrending()

    // Get category_ids from user's liked artworks
    const { data: likes } = await supabase
      .from('likes')
      .select('artworks(category_id)')
      .eq('user_id', userId)

    const categoryIds = [...new Set(
      likes?.map((l: any) => l.artworks?.category_id).filter(Boolean)
    )] as string[]

    if (categoryIds.length === 0) return getTrending()

    return fetchAndMap(
      supabase
        .from('artworks')
        .select('id, title, image_url, price, views_count, likes_count, artist_id, categories(name)')
        .in('category_id', categoryIds)
        .eq('status', 'approved')
        .order('likes_count', { ascending: false })
        .limit(6)
    )
  }

  const load = async () => {
    setLoading(true)
    try {
      let data: Artwork[] = []
      if (algorithm === 'trending') data = await getTrending()
      else if (algorithm === 'recent') data = await getRecent()
      else if (algorithm === 'personalized') data = await getPersonalized()
      setRecommendations(data)
    } catch (e) {
      console.error('Recommendations error:', e)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: Algorithm; label: string }[] = [
    { key: 'trending', label: 'Trending' },
    { key: 'recent', label: 'Recent' },
    ...(userId ? [{ key: 'personalized' as Algorithm, label: 'For You' }] : []),
  ]

  return (
    <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-600" />
          <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Recommendations
          </h3>
        </div>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setAlgorithm(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                algorithm === tab.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-500 text-sm">No recommendations yet.</p>
          <p className="text-neutral-600 text-xs mt-1">Like some artworks to personalise your feed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group cursor-pointer"
            >
              <Link href={`/gallery?artwork=${artwork.id}`}>
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-800 mb-2 relative">
                  {artwork.image_url ? (
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">No image</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Eye size={12} /> {artwork.views_count}
                    </div>
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Heart size={12} /> {artwork.likes_count}
                    </div>
                    <ExternalLink size={12} className="text-white/60" />
                  </div>
                </div>
                <h4 className="text-white text-xs font-medium truncate">{artwork.title}</h4>
                <p className="text-neutral-500 text-xs truncate">{artwork.artist_name}</p>
                <p className="text-amber-600 text-xs font-semibold mt-0.5">₹{artwork.price.toLocaleString()}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
