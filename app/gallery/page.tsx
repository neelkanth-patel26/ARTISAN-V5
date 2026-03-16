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

const demoArtworks = [
  { id: 'd1', title: 'Abstract Dreams', artist: 'Sarah Johnson', category: 'abstract', image: 'https://images.unsplash.com/photo-1579783483458-83d02161294e?w=600&h=800&fit=crop&q=90', price: 1200, likes: 45 },
  { id: 'd2', title: 'Mountain Vista', artist: 'Michael Chen', category: 'landscape', image: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=600&h=800&fit=crop&q=90', price: 850, likes: 32 },
  { id: 'd3', title: 'Urban Portrait', artist: 'Emma Davis', category: 'portrait', image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&h=800&fit=crop&q=90', price: 950, likes: 67 },
  { id: 'd4', title: 'Modern Sculpture', artist: 'David Lee', category: 'sculpture', image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=800&fit=crop&q=90', price: 2100, likes: 28 },
  { id: 'd5', title: 'Digital Waves', artist: 'Lisa Wang', category: 'digital', image: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=600&h=800&fit=crop&q=90', price: 650, likes: 89 },
  { id: 'd6', title: 'City Lights', artist: 'James Brown', category: 'photography', image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&h=800&fit=crop&q=90', price: 450, likes: 54 },
  { id: 'd7', title: 'Color Burst', artist: 'Martinez', category: 'abstract', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop&q=90', price: 1100, likes: 76 },
  { id: 'd8', title: 'Sunset Valley', artist: 'Robert Taylor', category: 'landscape', image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop&q=90', price: 780, likes: 41 },
]

function GalleryContent() {
  const searchParams = useSearchParams()
  const artworkParam = searchParams.get('artwork')
  
  const [categories, setCategories] = useState<string[]>(['all'])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showLiveOnly, setShowLiveOnly] = useState(false)
  const [realArtworks, setRealArtworks] = useState<RealArtwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<RealArtwork[]>([])
  const [loading, setLoading] = useState(true)
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

  const fetchArtworks = useCallback(async () => {
    try {
      const { data: artworksData, error } = await supabase
        .from('artworks')
        .select('id, title, image_url, price, likes_count, description, medium, dimensions, year_created, artist_id, category_id, categories(name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
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
      
      if (artworkParam) {
        const found = list.find((a: RealArtwork) => a.id === artworkParam)
        if (found) setSelectedArtwork(found)
      }
    } catch (err) {
      console.error('Error loading artworks:', err)
      setRealArtworks([])
    } finally {
      setLoading(false)
    }
  }, [artworkParam])

  useEffect(() => {
    fetchArtworks()
    const channel = supabase
      .channel('artworks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => fetchArtworks())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchArtworks])

  useEffect(() => {
    // Combine real and demo artworks
    const allItems = showLiveOnly ? realArtworks : [...realArtworks, ...demoArtworks as RealArtwork[]]
    
    let filtered = allItems
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
  }, [selectedCategory, searchQuery, realArtworks, showLiveOnly])

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

  return (
    <main className="min-h-screen bg-neutral-950 relative overflow-hidden">
      <Navigation />
      
      {/* Decorative Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20 z-0">
         <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] bg-amber-600/10 blur-[160px] rounded-full animate-pulse" />
         <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 pt-32 pb-40">
        {/* Elite Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-32 space-y-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
             <div className="h-px w-12 bg-amber-600/30" />
             <span className="text-[10px] text-amber-600 uppercase tracking-[0.5em] font-black">Digital Sanctuary</span>
             <div className="h-px w-12 bg-amber-600/30" />
          </div>
          
          <h1 className="text-7xl md:text-9xl lg:text-[11rem] font-light text-white leading-none tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
            The <span className="text-neutral-500 italic">Curated</span> Archive
          </h1>
          
          <div className="max-w-xl mx-auto">
             <p className="text-neutral-500 text-sm md:text-lg font-light leading-relaxed tracking-wide opacity-80">
               Discover an unparalleled collection of original masterpieces, curated for the discerning eye.
             </p>
          </div>
        </motion.div>

        {/* Premium Tools Bar */}
        <div className="mb-20">
          <GalleryFilters 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showLiveOnly={showLiveOnly}
            setShowLiveOnly={setShowLiveOnly} 
          />
        </div>

        {/* High-Fidelity Collection Grid */}
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
            <div className="space-y-1">
              <p className="text-amber-600/60 text-[10px] tracking-[0.4em] font-black uppercase">Refined Selection</p>
              <h2 className="text-4xl md:text-5xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Masterpieces
              </h2>
            </div>
            <p className="text-neutral-500 text-sm font-medium tracking-tight">
              Showing <span className="text-white">{filteredArtworks.length}</span> individual works
            </p>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                 <div key={i} className="aspect-[3/4] rounded-[2rem] bg-neutral-900 animate-pulse" />
               ))}
             </div>
          ) : filteredArtworks.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-40 bg-neutral-900/10 rounded-[3rem] border border-dashed border-white/5"
             >
               <p className="text-neutral-600 text-[10px] tracking-[0.5em] uppercase font-black">No Matches Found</p>
               <h2 className="text-4xl font-light text-white/20 mt-4" style={{ fontFamily: 'ForestSmooth, serif' }}>Expanding Search...</h2>
             </motion.div>
          ) : (
             <motion.div 
               initial="hidden"
               animate="show"
               variants={{
                 hidden: { opacity: 0 },
                 show: {
                   opacity: 1,
                   transition: {
                     staggerChildren: 0.1
                   }
                 }
               }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-14"
             >
               {filteredArtworks.map((artwork, i) => (
                 <motion.div
                   key={artwork.id}
                   variants={{
                     hidden: { opacity: 0, y: 40 },
                     show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                   }}
                   className="cursor-pointer"
                 >
                   <ArtworkCard
                     artwork={artwork}
                     initialLiked={likedArtworkIds.has(artwork.id)}
                     onLike={handleLike}
                     onOpen={(selected) => {
                        if (!getCurrentUser() && typeof window !== 'undefined') {
                          localStorage.setItem('auth_redirect', `/gallery?artwork=${selected.id}`)
                        }
                        // Non-blocking update for view count
                        if (selected.id.toString().startsWith('d')) {
                          // Skip db update for demo items
                        } else {
                          supabase.from('artworks').update({ views_count: (selected as any).views_count + 1 }).eq('id', selected.id)
                        }
                        setSelectedArtwork(selected as RealArtwork)
                     }}
                   />
                 </motion.div>
               ))}
             </motion.div>
          )}
        </div>
      </div>

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
