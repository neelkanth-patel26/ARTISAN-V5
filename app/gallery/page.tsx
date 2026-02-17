'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { GalleryGrid } from '@/components/gallery-grid'
import { GalleryFilters } from '@/components/gallery-filters'
import { ArtworkCard } from '@/components/artwork-card'
import { ArtworkModal } from '@/components/artwork-modal'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { TrendingUp, Users, Eye, Heart } from 'lucide-react'

export type RealArtwork = {
  id: string
  title: string
  artist: string
  category: string
  image: string
  price: number
  likes: number
  artistId?: string
  description?: string
  medium?: string
  dimensions?: string
  year_created?: number
}

function GalleryContent() {
  const searchParams = useSearchParams()
  const artworkParam = searchParams.get('artwork')
  
  const [categories, setCategories] = useState<string[]>(['all'])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showLiveOnly, setShowLiveOnly] = useState(false)
  const [realArtworks, setRealArtworks] = useState<RealArtwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<RealArtwork[]>([])
  const [realLoading, setRealLoading] = useState(true)
  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(new Set())
  const [selectedArtwork, setSelectedArtwork] = useState<RealArtwork | null>(null)

  const loadLikedIds = useCallback(async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return
    const { data } = await supabase.from('likes').select('artwork_id').eq('user_id', user.user_id)
    setLikedArtworkIds(new Set((data ?? []).map((r: { artwork_id: string }) => r.artwork_id)))
  }, [])

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('name').eq('is_active', true).order('name')
      if (data) {
        setCategories(['all', ...data.map(c => c.name.toLowerCase())])
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadRealArtworks() {
      try {
        // Query artworks directly to ensure we get description
        const { data: artworksData, error } = await supabase
          .from('artworks')
          .select('id, title, image_url, price, likes_count, description, medium, dimensions, year_created, artist_id, category_id, categories(name)')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // Get artist names
        const artistIds = [...new Set(artworksData?.map(a => a.artist_id).filter(Boolean) || [])]
        const artistMap: Record<string, string> = {}
        if (artistIds.length > 0) {
          const { data: users } = await supabase.from('users').select('id, full_name').in('id', artistIds)
          users?.forEach((u: { id: string; full_name: string }) => { artistMap[u.id] = u.full_name ?? 'Artist' })
        }
        
        const list = (artworksData || []).map((a) => ({
          id: a.id,
          title: a.title,
          artist: artistMap[a.artist_id] ?? 'Artist',
          artistId: a.artist_id,
          category: (a.categories as any)?.name || 'Artwork',
          image: a.image_url ?? '',
          price: Number(a.price) ?? 0,
          likes: Number(a.likes_count ?? 0),
          description: a.description,
          medium: a.medium,
          dimensions: a.dimensions,
          year_created: a.year_created,
        }))
        setRealArtworks(list)
        setFilteredArtworks(list)
        
        if (artworkParam) {
          const found = list.find((a: RealArtwork) => a.id === artworkParam)
          if (found) setSelectedArtwork(found)
        }
      } catch {
        setRealArtworks([])
      } finally {
        setRealLoading(false)
      }
    }
    loadRealArtworks()
    
    // Real-time subscription for artworks
    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'artworks' },
        () => loadRealArtworks()
      )
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [artworkParam])

  useEffect(() => {
    let filtered = realArtworks
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase())
    }
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredArtworks(filtered)
  }, [selectedCategory, searchQuery, realArtworks])

  useEffect(() => {
    loadLikedIds()
  }, [loadLikedIds])

  const handleLike = useCallback(async (artworkId: string, isLiked: boolean) => {
    const user = getCurrentUser()
    if (!user?.user_id) return
    if (isLiked) {
      const { error } = await supabase.from('likes').insert({ user_id: user.user_id, artwork_id: artworkId })
      if (error) {
        toast.error('Could not save like. Try again.')
        return
      }
      setLikedArtworkIds(prev => new Set(prev).add(artworkId))
      setRealArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, likes: a.likes + 1 } : a))
    } else {
      const { error } = await supabase.from('likes').delete().eq('user_id', user.user_id).eq('artwork_id', artworkId)
      if (error) {
        toast.error('Could not remove like. Try again.')
        return
      }
      setLikedArtworkIds(prev => { const s = new Set(prev); s.delete(artworkId); return s })
      setRealArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, likes: Math.max(0, a.likes - 1) } : a))
    }
  }, [])

  const stats = [
    { label: 'Total Artworks', value: '2,450+', icon: TrendingUp },
    { label: 'Artists', value: '350+', icon: Users },
    { label: 'Total Views', value: '1.2M+', icon: Eye },
    { label: 'Favorites', value: '45K+', icon: Heart },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <Navigation />
      
      <div className="relative pt-32 pb-12 text-center px-4">
        <div className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-4">EXPLORE ART</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white/90 mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
          Gallery
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto font-light mb-12">Discover exceptional artworks from talented artists worldwide</p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 px-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-5 backdrop-blur-sm hover:border-amber-600/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center mx-auto mb-3">
                  <Icon size={24} className="text-amber-600" strokeWidth={1.5} />
                </div>
                <p className="text-2xl md:text-3xl font-light text-white/90 mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-light">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <GalleryFilters 
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showLiveOnly={showLiveOnly}
        setShowLiveOnly={setShowLiveOnly}
      />

      <GalleryGrid 
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        hidden={showLiveOnly}
      />

      {realArtworks.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-24">
          <div className="border-t border-neutral-800/80 pt-16 mt-8">
            <p className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-2">FROM OUR COLLECTION</p>
            <h2 className="text-3xl md:text-4xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Live collection
            </h2>
            <p className="text-neutral-400 text-sm font-light mb-8 max-w-2xl">
              Approved artworks from our artists. Like any artwork here to add it to your Favorites in the dashboard.
            </p>
            {realLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600/60" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-neutral-400 text-sm font-light">
                    Showing {filteredArtworks.length} {filteredArtworks.length === 1 ? 'artwork' : 'artworks'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredArtworks.map((artwork, i) => (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      onClick={() => {
                        if (!getCurrentUser() && typeof window !== 'undefined') {
                          localStorage.setItem('auth_redirect', `/gallery?artwork=${artwork.id}`)
                        }
                        // Increment view count
                        supabase.from('artworks').update({ views_count: (artwork as any).views_count + 1 }).eq('id', artwork.id)
                        setSelectedArtwork(artwork)
                      }}
                      className="cursor-pointer"
                    >
                      <ArtworkCard
                        artwork={artwork}
                        initialLiked={likedArtworkIds.has(artwork.id)}
                        onLike={handleLike}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => {
            setSelectedArtwork(null)
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/gallery')
            }
          }}
        />
      )}

      <Footer />
    </main>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GalleryContent />
    </Suspense>
  )
}
