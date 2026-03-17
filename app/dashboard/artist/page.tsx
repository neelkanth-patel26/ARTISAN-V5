'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Upload, Image, Palette, BarChart3, TrendingUp, DollarSign, Eye, Heart, Sparkles, ArrowRight, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

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
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
          {/* ── Creative Command Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400">Creative Hub</span>
                </div>
                <Sparkles size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Atelier <span className="text-neutral-500 italic">Pulse</span>
              </h1>
              <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
                Orchestrating curatorial excellence and monitoring transactional resonance.
              </p>
            </div>

            <Link
              href="/dashboard/artist/upload"
              className="group relative flex items-center gap-4 px-8 py-4 rounded-3xl bg-neutral-900 border border-white/[0.05] hover:border-orange-500/30 transition-all duration-700 hover:bg-neutral-900 hover:translate-y-[-4px]"
            >
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-black transition-all duration-500">
                <Plus size={18} />
              </div>
              <span className="text-[11px] font-black tracking-[0.3em] uppercase text-white/90" style={{ fontFamily: 'Oughter, serif' }}>Initiate Creation</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* ── Vitality Metrics: Primary Vectors ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Cumulative Revenue', value: `₹${stats.earnings.toLocaleString()}`, icon: DollarSign, color: 'text-orange-400', glow: 'bg-orange-500/5' },
                  { label: 'Network Reach', value: stats.followers.toLocaleString(), icon: Heart, color: 'text-rose-400', glow: 'bg-rose-500/5' },
                  { label: 'Aesthetic Resonance', value: stats.views.toLocaleString(), icon: Eye, color: 'text-cyan-400', glow: 'bg-cyan-500/5' },
                  { label: 'Portfolio Magnitude', value: stats.total, icon: Image, color: 'text-blue-400', glow: 'bg-blue-500/5' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group hover:border-orange-500/20 transition-all duration-700 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${stat.glow}`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] ${stat.color} group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-700`}>
                          <stat.icon size={18} strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-[9px] tracking-[0.4em] uppercase font-black text-neutral-600 group-hover:text-neutral-400 transition-colors mb-2" style={{ fontFamily: 'Oughter, serif' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Secondary Curatorial Vectors ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Approved Protocol', value: stats.approved, icon: Palette, color: 'text-emerald-400' },
                  { label: 'Pending Authentication', value: stats.pending, icon: Clock, color: 'text-amber-400' },
                  { label: 'Acquired Artifacts', value: stats.sold, icon: TrendingUp, color: 'text-purple-400' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500 flex items-center gap-6"
                  >
                    <div className={`p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] ${stat.color}`}>
                      <stat.icon size={16} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[9px] text-neutral-600 uppercase font-black tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{stat.label}</span>
                      <p className="text-xl text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ── Portfolio Showcase ── */}
              <section className="space-y-8">
                <div className="flex items-end justify-between px-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Registry Evolution</p>
                    <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Recent <span className="text-neutral-500">Creations</span></h2>
                  </div>
                  <Link href="/dashboard/artist/artworks" className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-600 hover:text-orange-400 transition-colors duration-500 flex items-center gap-3 group">
                    Full Portfolio <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {artworks.length === 0 ? (
                  <div className="py-32 rounded-[3.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl flex flex-col items-center gap-8 text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <Image size={32} className="text-neutral-700" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Manifest Your Vision</h3>
                       <p className="text-[13px] text-neutral-500 font-light max-w-xs">Initiate your presence on the platform by uploading your first masterpiece.</p>
                    </div>
                    <Link
                      href="/dashboard/artist/upload"
                      className="px-8 py-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-orange-600/20 transition-all duration-500"
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      Authenticate Artwork
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                      {artworks.slice(0, 6).map((artwork, i) => (
                        <motion.div
                          key={artwork.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                          className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] overflow-hidden backdrop-blur-3xl hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                        >
                          <div className="aspect-[4/3] overflow-hidden relative">
                            <img
                              src={artwork.image_url}
                              alt={artwork.title}
                              className="w-full h-full object-cover transition-all duration-1000 grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                            
                            <div className="absolute top-6 right-6">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md ${
                                  artwork.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : artwork.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-neutral-800/80 text-neutral-400 border-white/5'
                                }`}
                                style={{ fontFamily: 'Oughter, serif' }}
                              >
                                {artwork.status}
                              </span>
                            </div>
                          </div>

                          <div className="p-10 space-y-6">
                             <div className="space-y-1">
                                <h3 className="text-2xl font-light text-white group-hover:text-orange-400 transition-colors duration-700 line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  {artwork.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                   <div className="h-px w-8 bg-orange-500/20" />
                                   <p className="text-[11px] text-neutral-500 tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{artwork.category || 'Collection Piece'}</p>
                                </div>
                             </div>

                             <div className="pt-6 border-t border-white/[0.03] flex items-center justify-between">
                                <div className="space-y-1">
                                   <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Exchange Valve</p>
                                   <p className="text-xl text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{Number(artwork.price).toLocaleString()}</p>
                                </div>
                                <Link 
                                  href={`/dashboard/artist/artworks/${artwork.id}`}
                                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 hover:text-white hover:border-orange-500/30 transition-all duration-500"
                                >
                                  <ArrowRight size={18} strokeWidth={1} />
                                </Link>
                             </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
