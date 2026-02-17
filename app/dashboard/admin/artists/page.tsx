'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { TrendingUp, Users, Heart, DollarSign, Image } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function AdminArtistPerformance() {
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArtistPerformance()
  }, [])

  const loadArtistPerformance = async () => {
    // Get all artists
    const { data: artistsData, error: artistsError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, followers_count, total_views, created_at')
      .eq('role', 'artist')
      .eq('status', 'active')

    if (artistsError) {
      console.error('Error loading artists:', artistsError)
      setLoading(false)
      return
    }

    // Get artwork counts
    const { data: artworksData } = await supabase
      .from('artworks')
      .select('artist_id, status')

    // Get transactions (sales and support)
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('artist_id, amount, artist_earnings, transaction_type, status')
      .eq('status', 'completed')

    // Process data
    const artworksByArtist: Record<string, number> = {}
    artworksData?.forEach(a => {
      artworksByArtist[a.artist_id] = (artworksByArtist[a.artist_id] || 0) + 1
    })

    const salesByArtist: Record<string, { count: number; revenue: number; support: number }> = {}
    transactionsData?.forEach(t => {
      if (!salesByArtist[t.artist_id]) {
        salesByArtist[t.artist_id] = { count: 0, revenue: 0, support: 0 }
      }
      salesByArtist[t.artist_id].count++
      salesByArtist[t.artist_id].revenue += Number(t.artist_earnings || 0)
      if (t.transaction_type === 'support') {
        salesByArtist[t.artist_id].support += Number(t.artist_earnings || 0)
      }
    })

    // Combine data
    const enriched = artistsData?.map(artist => ({
      ...artist,
      artworks: artworksByArtist[artist.id] || 0,
      sales: salesByArtist[artist.id]?.count || 0,
      revenue: salesByArtist[artist.id]?.revenue || 0,
      support: salesByArtist[artist.id]?.support || 0,
      performance: (
        (artist.followers_count * 2) +
        (artist.total_views * 0.1) +
        ((salesByArtist[artist.id]?.count || 0) * 10) +
        ((salesByArtist[artist.id]?.revenue || 0) * 0.01)
      )
    })) || []

    // Sort by performance
    enriched.sort((a, b) => b.performance - a.performance)

    setArtists(enriched)
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Artist Performance" description="Monitor artist metrics and performance" />

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                      {artist.avatar_url ? (
                        <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-amber-600">
                          {artist.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {artist.full_name}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Joined {new Date(artist.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-neutral-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-amber-600 mb-1">
                        <Image size={12} />
                        <span className="text-xs">Artworks</span>
                      </div>
                      <p className="text-lg font-semibold text-white">{artist.artworks}</p>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <Users size={12} />
                        <span className="text-xs">Followers</span>
                      </div>
                      <p className="text-lg font-semibold text-white">{artist.followers_count}</p>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-purple-400 mb-1">
                        <TrendingUp size={12} />
                        <span className="text-xs">Sales</span>
                      </div>
                      <p className="text-lg font-semibold text-white">{artist.sales}</p>
                    </div>
                    <div className="bg-neutral-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-green-400 mb-1">
                        <DollarSign size={12} />
                        <span className="text-xs">Revenue</span>
                      </div>
                      <p className="text-sm font-semibold text-white">₹{artist.revenue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-1 text-pink-400 mb-1">
                      <Heart size={12} />
                      <span className="text-xs">Support Received</span>
                    </div>
                    <p className="text-lg font-semibold text-white">₹{artist.support.toLocaleString()}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-neutral-400">Performance</span>
                      <span className="text-xs font-semibold text-amber-600 ml-auto">
                        {Math.round(artist.performance)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((artist.performance / 1000) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                      />
                    </div>
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
