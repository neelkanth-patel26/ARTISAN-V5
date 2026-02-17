'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CollectorFavorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
    
    // Real-time subscription
    const user = getCurrentUser()
    if (user?.user_id) {
      const channel = supabase
        .channel('likes-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'likes', filter: `user_id=eq.${user.user_id}` },
          () => loadFavorites()
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }
  }, [])

  const loadFavorites = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('likes')
      .select('*, artworks(id, title, image_url, price, artist_id)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Favorites load error:', error)
      setLoading(false)
      return
    }

    const likes = data ?? []
    if (likes.length === 0) {
      setFavorites([])
      setLoading(false)
      return
    }

    const artistIds = [...new Set(likes.map((l: any) => l.artworks?.artist_id).filter(Boolean))]
    const artistMap: Record<string, string> = {}
    if (artistIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', artistIds)
      users?.forEach((u: { id: string; full_name: string }) => { artistMap[u.id] = u.full_name ?? 'Artist' })
    }

    setFavorites(likes.map((like: any) => ({
      ...like,
      artworks: like.artworks ? { ...like.artworks, artist_name: artistMap[like.artworks.artist_id] ?? 'Artist' } : null,
    })))
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="My Favorites" description="Artworks you've liked" />

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : favorites.length === 0 ? (
            <EmptyState icon={Heart} title="No favorites yet" description="Like artworks to add them to your favorites" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((like, i) => (
                <motion.div 
                  key={like.id} 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  whileHover={{ scale: 1.02 }} 
                  className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800/30 transition-all hover:border-neutral-700"
                >
                  <div className="relative">
                    <img 
                      src={like.artworks?.image_url} 
                      alt={like.artworks?.title} 
                      className="w-full h-48 object-cover" 
                    />
                    <Link
                      href={`/gallery?artwork=${like.artworks?.id}`}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      title="View in gallery"
                    >
                      <ExternalLink size={18} />
                    </Link>
                  </div>
                  <div className="p-4">
                    <h3 className="font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{like.artworks?.title}</h3>
                    <p className="text-sm text-neutral-400 mb-2">by {like.artworks?.artist_name ?? 'Artist'}</p>
                    <p className="text-sm text-white">₹{like.artworks?.price}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
