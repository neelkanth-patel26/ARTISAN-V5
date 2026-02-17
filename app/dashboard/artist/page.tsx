'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard, PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Upload, Image, Palette, BarChart3, TrendingUp, DollarSign, Eye, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ArtistDashboard() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    sold: 0,
    earnings: 0,
    views: 0,
    followers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const user = await getCurrentUser()
      if (!user?.user_id) return

      const [statsRes, artworksRes, userRes] = await Promise.all([
        supabase.rpc('get_artist_stats', { p_artist_id: user.user_id }),
        supabase.rpc('get_artist_artworks', { p_artist_id: user.user_id }),
        supabase.from('users').select('total_views, followers_count').eq('id', user.user_id).single(),
      ])

      if (statsRes.error) throw statsRes.error
      if (artworksRes.error) throw artworksRes.error

      if (statsRes.data) {
        const s = typeof statsRes.data === 'string' ? JSON.parse(statsRes.data) : statsRes.data
        setStats({
          total: s.totalArtworks ?? s.totalartworks ?? 0,
          approved: s.approvedArtworks ?? s.approvedartworks ?? 0,
          pending: s.pendingArtworks ?? s.pendingartworks ?? 0,
          sold: 0,
          earnings: Number(s.totalRevenue ?? s.totalrevenue ?? 0),
          views: userRes.data?.total_views || 0,
          followers: userRes.data?.followers_count || 0,
        })
      }
      setArtworks(artworksRes.data ?? [])
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="p-6 lg:p-10">
        <PageHeader title="Artist Dashboard" description="Manage your artworks and track performance" />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-7">
              <StatCard label="Total Artworks" value={stats.total} icon={Image} delay={0} />
              <StatCard label="Approved" value={stats.approved} icon={Palette} delay={0.05} />
              <StatCard label="Pending" value={stats.pending} icon={BarChart3} delay={0.1} />
              <StatCard label="Sold" value={stats.sold} icon={TrendingUp} delay={0.15} />
              <StatCard label="Earnings" value={`₹${stats.earnings.toFixed(2)}`} icon={DollarSign} delay={0.2} />
              <StatCard label="Views" value={stats.views} icon={Eye} delay={0.25} />
              <StatCard label="Followers" value={stats.followers} icon={Heart} delay={0.3} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-6 lg:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Recent Artworks
                </h2>
                <Link
                  href="/dashboard/artist/upload"
                  className="flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  <Upload size={18} />
                  Upload New
                </Link>
              </div>

              {artworks.length === 0 ? (
                <EmptyState
                  icon={Image}
                  title="No artworks yet"
                  description="Upload your first artwork to start selling on the platform"
                  action={
                    <Link
                      href="/dashboard/artist/upload"
                      className="rounded-lg bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm font-medium text-white transition-colors"
                    >
                      Upload Artwork
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {artworks.slice(0, 6).map((artwork, i) => (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-800/50 transition-colors hover:border-amber-600/50"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={artwork.image_url}
                          alt={artwork.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="mb-1 font-semibold text-white line-clamp-1">
                          {artwork.title}
                        </h3>
                        <p className="mb-2 text-sm text-neutral-400">₹{Number(artwork.price).toLocaleString()}</p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            artwork.status === 'approved'
                              ? 'bg-green-600/20 text-green-600'
                              : artwork.status === 'pending'
                                ? 'bg-yellow-600/20 text-yellow-600'
                                : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {artwork.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
