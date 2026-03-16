'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { ArtistModal } from '@/components/artist-modal'
import { supabase } from '@/lib/supabase'
import { Heart, MapPin, Eye, UserPlus, Image, Share2, ArrowRight, UserCheck } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

interface Artist {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  avatar_url?: string
  role: string
  status: string
  bio?: string
  website?: string
  upi_id?: string
  upi_qr_code?: string
  followers_count: number
  total_views: number
  created_at: string
  artwork_count?: number
}

export default function ArtistPage() {
  return (
    <Suspense fallback={
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-16 bg-neutral-900/50 rounded-2xl w-80 mx-auto mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
              <div className="h-6 bg-neutral-900/50 rounded-xl w-[30rem] mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-neutral-900/50 border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                  <div className="absolute inset-x-0 bottom-0 p-10 space-y-4">
                    <div className="h-10 bg-neutral-800/50 rounded-2xl w-3/4 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                    <div className="h-4 bg-neutral-800/50 rounded-lg w-1/2 relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    }>
      <ArtistPageContent />
    </Suspense>
  )
}

function ArtistPageContent() {
  const searchParams = useSearchParams()
  const artistParam = searchParams.get('id')
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const user = getCurrentUser()

  useEffect(() => {
    fetchArtists()
    if (user) fetchFollowing()
  }, [])

  useEffect(() => {
    if (artistParam && artists.length > 0) {
      const found = artists.find(a => a.id === artistParam)
      if (found) setSelectedArtist(found)
    }
  }, [artistParam, artists])

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'artist')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        return
      }
      
      // Fetch artwork counts for each artist
      const artistsWithCounts = await Promise.all(
        (data || []).map(async (artist) => {
          const { count } = await supabase
            .from('artworks')
            .select('*', { count: 'exact', head: true })
            .eq('artist_id', artist.id)
            .eq('status', 'approved')
          return { ...artist, artwork_count: count || 0 }
        })
      )
      
      setArtists(artistsWithCounts)
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFollowing = async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.user_id)
    
    if (data) {
      setFollowingIds(new Set(data.map(f => f.following_id)))
    }
  }

  const toggleFollow = async (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Please login to follow artists')
      return
    }

    const isFollowing = followingIds.has(artistId)
    const artist = artists.find(a => a.id === artistId)
    if (!artist) return

    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', user.user_id).eq('following_id', artistId)
      await supabase.from('users').update({ followers_count: artist.followers_count - 1 }).eq('id', artistId)
      setFollowingIds(prev => { const next = new Set(prev); next.delete(artistId); return next })
      setArtists(prev => prev.map(a => a.id === artistId ? { ...a, followers_count: a.followers_count - 1 } : a))
    } else {
      await supabase.from('follows').insert({ follower_id: user.user_id, following_id: artistId })
      await supabase.from('users').update({ followers_count: artist.followers_count + 1 }).eq('id', artistId)
      setFollowingIds(prev => new Set(prev).add(artistId))
      setArtists(prev => prev.map(a => a.id === artistId ? { ...a, followers_count: a.followers_count + 1 } : a))
    }
  }

  const shareArtist = (artistId: string, artistName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/artist?id=${artistId}`
    navigator.clipboard.writeText(url)
    toast.success(`Link copied! Share ${artistName}'s profile`)
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="h-16 bg-neutral-900/50 rounded-2xl w-80 mx-auto mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
              <div className="h-6 bg-neutral-900/50 rounded-xl w-[30rem] mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="aspect-[4/5] rounded-[2.5rem] bg-neutral-900/50 border border-white/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                  
                  {/* Logo Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border border-white/5 flex items-center justify-center opacity-20">
                      <span className="text-xs font-serif text-white/50 tracking-widest">A</span>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-10 space-y-6">
                    <div className="space-y-3">
                      <div className="h-10 bg-neutral-800/40 rounded-2xl w-3/4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                      <div className="h-4 bg-neutral-800/40 rounded-lg w-1/2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                    <div className="flex gap-8 pt-6 border-t border-white/5">
                      <div className="h-8 w-16 bg-neutral-800/40 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                      <div className="h-8 w-16 bg-neutral-800/40 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-neutral-950 pt-32 pb-32 px-6 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full" />
           <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-amber-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Elite Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-24 space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
               <div className="h-px w-8 bg-amber-600/30" />
               <span className="text-[10px] text-amber-600 uppercase tracking-[0.5em] font-black">Global Selection</span>
               <div className="h-px w-8 bg-amber-600/30" />
            </div>
            
            <h1 className="text-6xl md:text-9xl font-light text-white leading-none tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              The <span className="text-neutral-500 italic">Elite</span> Collection
            </h1>
            
            <div className="max-w-2xl mx-auto">
               <p className="text-neutral-500 text-sm md:text-lg font-light leading-relaxed tracking-wide">
                 Acquire works from an exclusive circle of visionary artists redefined by modern craftsmanship and timeless aesthetics.
               </p>
            </div>
          </motion.div>

          {/* Staggered Grid Entry */}
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14"
          >
            {artists.map((artist) => (
              <motion.div
                key={artist.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                }}
                onClick={() => setSelectedArtist(artist)}
                className="group cursor-pointer relative"
              >
                {/* Museum Card Structure */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-neutral-800/80 transition-all duration-700 group-hover:border-amber-600/30 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(217,119,6,0.1)]">
                  
                  {/* Image Container with Luxury Scaling */}
                  <div className="absolute inset-0 z-0">
                    {artist.avatar_url ? (
                      <img 
                        src={artist.avatar_url} 
                        alt={artist.full_name} 
                        className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-8xl text-amber-600/10 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {artist.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950 group-hover:opacity-40 transition-opacity duration-700" />
                  </div>

                  {/* High-Fidelity Labels (Museum Plaque Style) */}
                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 z-10 space-y-6">
                    {/* Darker, more pronounced glass overlay for visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent -z-10" />
                    
                    <div className="space-y-3 relative">
                       <motion.h3 
                         className="text-3xl sm:text-4xl font-light text-white tracking-tight" 
                         style={{ fontFamily: 'ForestSmooth, serif' }}
                       >
                         {artist.full_name}
                       </motion.h3>
                       {artist.location && (
                        <div className="flex items-center gap-2 text-neutral-400 text-[10px] tracking-widest uppercase font-black">
                           <MapPin size={10} className="text-amber-600" />
                           {artist.location}
                        </div>
                       )}
                    </div>

                    {/* Permanently Visible Stats for Accessibility */}
                    <div className="flex items-center gap-8 pt-6 border-t border-white/10 transition-all duration-500">
                       <div className="space-y-1">
                          <p className="text-[14px] font-medium text-white">{artist.followers_count.toLocaleString()}</p>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">Followers</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[14px] font-medium text-white">{(artist.artwork_count || 0).toLocaleString()}</p>
                          <p className="text-[8px] text-neutral-500 uppercase tracking-widest font-black">Views</p>
                       </div>
                       <div className="flex-1 flex justify-end">
                          <div className="h-10 w-10 sm:h-8 sm:w-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 group-hover:border-amber-600/50 group-hover:text-amber-600 transition-colors">
                             <ArrowRight size={14} />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Permanently Visible Interactive Buttons for Mobile/UX */}
                  <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                    <button
                      onClick={(e) => toggleFollow(artist.id, e)}
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${
                        followingIds.has(artist.id)
                          ? 'bg-neutral-800 text-amber-600 border border-neutral-700'
                          : 'bg-white text-black hover:bg-neutral-200'
                      }`}
                    >
                      {followingIds.has(artist.id) ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    </button>
                    <button
                      onClick={(e) => shareArtist(artist.id, artist.full_name, e)}
                      className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all flex items-center justify-center shadow-2xl"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {artists.length === 0 && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-40 border-t border-neutral-900 mt-20"
            >
              <p className="text-neutral-600 text-[10px] tracking-[0.5em] uppercase font-black">Archive Empty</p>
              <h2 className="text-4xl font-light text-white/20 mt-4" style={{ fontFamily: 'ForestSmooth, serif' }}>Refining Selection...</h2>
            </motion.div>
          )}
        </div>
      </div>
      <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
    </>
  )
}
