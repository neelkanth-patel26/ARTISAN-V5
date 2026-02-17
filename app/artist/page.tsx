'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { ArtistModal } from '@/components/artist-modal'
import { supabase } from '@/lib/supabase'
import { Heart, MapPin, Eye, UserPlus, Image, Share2 } from 'lucide-react'
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
              <div className="h-12 bg-neutral-800/50 rounded w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-6 bg-neutral-800/50 rounded w-96 mx-auto animate-pulse" />
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
              <div className="h-12 bg-neutral-800/50 rounded w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-6 bg-neutral-800/50 rounded w-96 mx-auto animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-neutral-900/50 border border-amber-600/20 rounded-lg overflow-hidden">
                  <div className="h-64 bg-neutral-800 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-neutral-800/50 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-neutral-800/50 rounded w-1/2 animate-pulse" />
                    <div className="h-16 bg-neutral-800/50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-light tracking-wider text-white/90 mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Our Artists
          </h1>
          <p className="text-neutral-400 text-lg">Support talented artists by contributing directly</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, index) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedArtist(artist)}
              whileHover={{ y: -8 }}
              className="group bg-gradient-to-br from-neutral-900/80 to-neutral-900/50 border border-amber-600/20 rounded-2xl overflow-hidden hover:border-amber-600/50 hover:shadow-2xl hover:shadow-amber-600/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <div className="relative h-72 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl text-amber-600/30 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {artist.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{artist.full_name}</h3>
                  {artist.location && (
                    <div className="flex items-center gap-1.5 text-neutral-300 text-sm">
                      <MapPin size={14} />
                      <span>{artist.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                {artist.bio && (
                  <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">{artist.bio}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Heart size={16} className="text-amber-600" />
                    <span className="font-medium text-white">{artist.followers_count}</span>
                    <span className="text-neutral-500">followers</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-400">
                    <Image size={16} className="text-amber-600" />
                    <span className="font-medium text-white">{artist.artwork_count || 0}</span>
                    <span className="text-neutral-500">works</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 space-y-2">
                  <button
                    onClick={(e) => toggleFollow(artist.id, e)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      followingIds.has(artist.id)
                        ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                        : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20'
                    }`}
                  >
                    <UserPlus size={16} />
                    {followingIds.has(artist.id) ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={(e) => shareArtist(artist.id, artist.full_name, e)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700 hover:text-white font-medium transition-all border border-neutral-700/50 hover:border-neutral-600"
                  >
                    <Share2 size={16} />
                    Share Profile
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="text-center text-neutral-400 py-20">
            <p className="text-xl">No artists found at the moment.</p>
          </div>
        )}
      </div>
    </div>
    <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />
    </>
  )
}
