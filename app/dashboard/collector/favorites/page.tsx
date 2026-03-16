'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, ExternalLink, Search, TrendingUp, Palette, Grid3X3, List, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CollectorFavorites() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [view, setView]           = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadFavorites()
    const user = getCurrentUser()
    if (user?.user_id) {
      const ch = supabase.channel('likes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `user_id=eq.${user.user_id}` }, loadFavorites)
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    }
  }, [])

  const loadFavorites = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) { setLoading(false); return }

    const { data, error } = await supabase
      .from('likes')
      .select('*, artworks(id, title, image_url, price, artist_id, medium, year_created)')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error || !data) { setLoading(false); return }

    const artistIds = [...new Set(data.map((l: any) => l.artworks?.artist_id).filter(Boolean))] as string[]
    const artistMap: Record<string, string> = {}
    if (artistIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', artistIds)
      users?.forEach((u: any) => { artistMap[u.id] = u.full_name ?? 'Artist' })
    }

    setFavorites(data.map((like: any) => ({
      ...like,
      artworks: like.artworks ? { ...like.artworks, artist_name: artistMap[like.artworks.artist_id] ?? 'Artist' } : null,
    })))
    setLoading(false)
  }

  const filtered = favorites.filter(like =>
    !search ||
    like.artworks?.title?.toLowerCase().includes(search.toLowerCase()) ||
    like.artworks?.artist_name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue    = favorites.reduce((s, l) => s + Number(l.artworks?.price ?? 0), 0)
  const uniqueArtists = new Set(favorites.map(l => l.artworks?.artist_id).filter(Boolean)).size

  const stats = [
    { label: 'Saved',    value: favorites.length,                    icon: Heart,      color: 'text-white',       glow: 'bg-white/5'       },
    { label: 'Artists',  value: uniqueArtists,                       icon: Palette,    color: 'text-amber-400',   glow: 'bg-amber-600/8'   },
    { label: 'Value',    value: `₹${totalValue.toLocaleString()}`,   icon: TrendingUp, color: 'text-emerald-400', glow: 'bg-emerald-600/8' },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-amber-500/60" />
              <span className="text-[10px] tracking-[0.35em] uppercase font-black text-amber-600/50">Collection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              My Favorites
            </h1>
            <p className="text-[13px] text-neutral-600 mt-1">Artworks you've liked and saved</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={`relative rounded-2xl border border-white/[0.06] ${s.glow} px-4 py-4 overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] text-neutral-600 tracking-[0.35em] font-black uppercase">{s.label}</p>
                <s.icon size={13} className="text-neutral-700" />
              </div>
              <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
              <input
                type="text"
                placeholder="Search title or artist…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-700 focus:outline-none focus:border-amber-600/40 focus:bg-amber-600/[0.03] transition-all"
              />
            </div>
            <div className="flex rounded-xl border border-white/[0.07] overflow-hidden shrink-0">
              <button
                onClick={() => setView('grid')}
                className={`p-2.5 transition-all ${view === 'grid' ? 'bg-amber-600/20 text-amber-400' : 'bg-transparent text-neutral-600 hover:text-neutral-300'}`}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2.5 transition-all ${view === 'list' ? 'bg-amber-600/20 text-amber-400' : 'bg-transparent text-neutral-600 hover:text-neutral-300'}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-neutral-800/60" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-800/60 rounded-lg w-3/4" />
                  <div className="h-3 bg-neutral-800/40 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12">
            <EmptyState icon={Heart} title="No favorites yet" description="Like artworks in the gallery to save them here" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-neutral-600 text-sm">No results for "<span className="text-neutral-400">{search}</span>"</p>
          </div>
        ) : view === 'grid' ? (

          /* ── Grid ── */
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((like, i) => (
                <motion.div
                  layout
                  key={like.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-amber-600/20 hover:bg-amber-600/[0.02] transition-all duration-300"
                >
                  {/* Top shimmer on hover */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-600/0 to-transparent group-hover:via-amber-600/30 transition-all duration-500" />

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
                    {like.artworks?.image_url ? (
                      <img
                        src={like.artworks.image_url}
                        alt={like.artworks.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart size={28} className="text-neutral-800" />
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* View button */}
                    <Link
                      href={`/gallery?artwork=${like.artworks?.id}`}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black tracking-[0.25em] uppercase opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:bg-amber-600/80 hover:border-amber-600/50"
                    >
                      <ExternalLink size={10} /> View
                    </Link>

                    {/* Heart badge */}
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                      <Heart size={11} className="text-amber-500 fill-amber-500" />
                    </div>

                    {/* Medium tag */}
                    {like.artworks?.medium && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-[9px] text-neutral-400 tracking-wider uppercase">
                        {like.artworks.medium}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-light text-white text-[15px] truncate leading-snug" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {like.artworks?.title}
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5 truncate">by {like.artworks?.artist_name}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                      <p className="text-sm font-light text-amber-500">₹{Number(like.artworks?.price ?? 0).toLocaleString()}</p>
                      <p className="text-[9px] text-neutral-700 tracking-wider">
                        {new Date(like.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        ) : (

          /* ── List ── */
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
            <AnimatePresence>
              {filtered.map((like, i) => (
                <motion.div
                  key={like.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/[0.06] shrink-0">
                    {like.artworks?.image_url
                      ? <img src={like.artworks.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-neutral-900" />}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                      <Heart size={12} className="text-amber-500 fill-amber-500" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {like.artworks?.title}
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5">by {like.artworks?.artist_name}</p>
                    {like.artworks?.medium && (
                      <span className="inline-block mt-1 text-[9px] tracking-wider uppercase text-neutral-700 bg-white/[0.04] px-1.5 py-0.5 rounded-md">
                        {like.artworks.medium}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-light text-amber-500">₹{Number(like.artworks?.price ?? 0).toLocaleString()}</p>
                    <p className="text-[9px] text-neutral-700 tracking-wider mt-1">
                      {new Date(like.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <Link
                    href={`/gallery?artwork=${like.artworks?.id}`}
                    className="w-8 h-8 rounded-xl border border-white/[0.07] flex items-center justify-center text-neutral-600 hover:text-amber-400 hover:border-amber-600/30 hover:bg-amber-600/[0.06] transition-all shrink-0"
                  >
                    <ExternalLink size={13} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
