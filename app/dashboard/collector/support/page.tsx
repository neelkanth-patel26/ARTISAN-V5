'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, TrendingUp, Users, MapPin, ExternalLink, Clock, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function CollectorSupport() {
  const [supports, setSupports]   = useState<any[]>([])
  const [stats, setStats]         = useState({ total: 0, count: 0, artists: 0, avg: 0 })
  const [loading, setLoading]     = useState(true)
  const [activeArtist, setActiveArtist] = useState<string | null>(null)
  const [mobileView, setMobileView]     = useState<'list' | 'detail'>('list')

  useEffect(() => { loadSupports() }, [])

  const loadSupports = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('buyer_id', user.user_id)
      .eq('transaction_type', 'support')
      .order('created_at', { ascending: false })

    if (error || !data) { setLoading(false); return }

    const artistIds = [...new Set(data.map((t: any) => t.artist_id).filter(Boolean))] as string[]
    const artistMap: Record<string, any> = {}

    if (artistIds.length > 0) {
      const { data: artists } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, bio, location, followers_count')
        .in('id', artistIds)
      artists?.forEach((a: any) => { artistMap[a.id] = a })
    }

    const enriched = data.map((t: any) => ({ ...t, artist: artistMap[t.artist_id] }))
    setSupports(enriched)

    const total = enriched.reduce((s: number, t: any) => s + Number(t.amount || 0), 0)
    setStats({ total, count: enriched.length, artists: artistIds.length, avg: enriched.length ? Math.round(total / enriched.length) : 0 })

    if (artistIds.length) setActiveArtist(artistIds[0])
    setLoading(false)
  }

  // Group transactions by artist
  const byArtist = supports.reduce((acc, t) => {
    const id = t.artist_id
    if (!acc[id]) acc[id] = []
    acc[id].push(t)
    return acc
  }, {} as Record<string, any[]>)

  const artistEntries = Object.entries(byArtist) as [string, any[]][]
  const activeTxns    = activeArtist ? (byArtist[activeArtist] ?? []) : []
  const activeInfo    = activeTxns[0]?.artist

  const selectArtist = (id: string) => { setActiveArtist(id); setMobileView('detail') }

  // ── Artist list panel ──
  const ArtistList = () => (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-800/60 flex items-center justify-between">
        <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase">Artists Supported</p>
        <span className="text-[9px] text-neutral-600 font-black tracking-wider">{artistEntries.length}</span>
      </div>
      <div className="divide-y divide-neutral-800/40">
        {artistEntries.map(([artistId, txns], i) => {
          const artist   = txns[0]?.artist
          const isActive = activeArtist === artistId
          const total    = txns.reduce((s: number, t: any) => s + Number(t.amount || 0), 0)

          return (
            <motion.button
              key={artistId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => selectArtist(artistId)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 relative group ${
                isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="support-bar"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-amber-600 rounded-r-full shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0 flex items-center justify-center">
                {artist?.avatar_url
                  ? <img src={artist.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-lg font-light text-amber-600/40" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {artist?.full_name?.charAt(0) ?? '?'}
                    </span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-base font-light truncate transition-colors ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}
                  style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {artist?.full_name || 'Unknown Artist'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-amber-600/80 font-black tracking-wider">₹{total.toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-600">·</span>
                  <span className="text-[10px] text-neutral-500 tracking-wider">{txns.length}×</span>
                </div>
              </div>

              <Heart size={14} className={`shrink-0 transition-colors ${isActive ? 'text-amber-600' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  // ── Detail panel ──
  const DetailPanel = () => (
    <AnimatePresence mode="wait">
      {activeInfo || activeTxns.length > 0 ? (
        <motion.div
          key={activeArtist}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden"
        >
          {/* Hero */}
          <div className="relative h-44 sm:h-52 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-neutral-900 to-neutral-900" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />

            {/* Mobile back */}
            <button
              onClick={() => setMobileView('list')}
              className="lg:hidden absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10"
            >
              ←
            </button>

            <div className="absolute inset-0 flex items-end p-5 gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-2xl bg-neutral-800 flex items-center justify-center">
                {activeInfo?.avatar_url
                  ? <img src={activeInfo.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-light text-amber-600/40" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {activeInfo?.full_name?.charAt(0) ?? '?'}
                    </span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {activeInfo?.full_name || 'Unknown Artist'}
                </h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {activeInfo?.location && (
                    <span className="flex items-center gap-1 text-[9px] text-neutral-400 tracking-wider">
                      <MapPin size={9} /> {activeInfo.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[9px] text-neutral-500 tracking-wider">
                    <Heart size={9} /> {activeInfo?.followers_count ?? 0} followers
                  </span>
                </div>
              </div>

              <Link
                href={`/artist?id=${activeArtist}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black tracking-[0.3em] uppercase shrink-0"
              >
                <ExternalLink size={11} /> Profile
              </Link>
            </div>
          </div>

          {/* Bio */}
          {activeInfo?.bio && (
            <div className="px-5 pt-4 pb-0">
              <p className="text-neutral-500 text-sm font-light leading-relaxed italic">"{activeInfo.bio}"</p>
            </div>
          )}

          {/* Summary strip */}
          <div className="grid grid-cols-3 divide-x divide-neutral-800/60 border-t border-b border-neutral-800/60 mt-4">
            {[
              { label: 'Total Sent',  value: `₹${activeTxns.reduce((s: number, t: any) => s + Number(t.amount || 0), 0).toLocaleString()}` },
              { label: 'Payments',    value: activeTxns.length },
              { label: 'Avg Amount',  value: `₹${activeTxns.length ? Math.round(activeTxns.reduce((s: number, t: any) => s + Number(t.amount || 0), 0) / activeTxns.length).toLocaleString() : 0}` },
            ].map(item => (
              <div key={item.label} className="px-4 py-3 text-center">
                <p className="text-[9px] text-neutral-600 tracking-[0.35em] font-black uppercase mb-1">{item.label}</p>
                <p className="text-lg font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Transaction timeline */}
          <div className="p-5 sm:p-6">
            <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase mb-5">Payment History</p>
            <div className="relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-600/40 via-neutral-700/30 to-transparent pointer-events-none" />
              <div className="space-y-3">
                {activeTxns.map((txn: any, i: number) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-3 sm:gap-4"
                  >
                    {/* Node */}
                    <div className="w-10 h-10 rounded-full border border-amber-600/20 bg-amber-600/10 flex items-center justify-center shrink-0 z-10">
                      <Heart size={12} className="text-amber-600" />
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-800/20 px-4 py-3 flex items-center justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          ₹{Number(txn.amount).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={9} className="text-neutral-600" />
                          <span className="text-[9px] text-neutral-600 tracking-wider">
                            {new Date(txn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {txn.payment_method && (
                          <span className="text-[9px] text-neutral-600 font-black tracking-[0.3em] uppercase px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-800/40">
                            {txn.payment_method}
                          </span>
                        )}
                        <span className="text-[9px] text-emerald-400 font-black tracking-[0.3em] uppercase px-2 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                          {txn.status || 'completed'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-5 p-4 lg:p-8">
        <PageHeader title="Artist Support" description="Your support history and impact" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Sent',  value: `₹${stats.total.toLocaleString()}`, color: 'text-amber-400',   icon: TrendingUp },
            { label: 'Payments',    value: stats.count,                         color: 'text-white',       icon: Heart      },
            { label: 'Artists',     value: stats.artists,                       color: 'text-white',       icon: Users      },
            { label: 'Avg Payment', value: `₹${stats.avg.toLocaleString()}`,    color: 'text-neutral-300', icon: Sparkles   },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3.5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase">{s.label}</p>
                <s.icon size={13} className="text-neutral-700" />
              </div>
              <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : supports.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10">
            <EmptyState icon={Heart} title="No support sent yet" description="Support artists to help them create more art" />
          </div>
        ) : (
          <>
            {/* Desktop two-column */}
            <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-4 items-start">
              <ArtistList />
              <DetailPanel />
            </div>

            {/* Mobile navigation */}
            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                {mobileView === 'list' ? (
                  <motion.div key="list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                    <ArtistList />
                  </motion.div>
                ) : (
                  <motion.div key="detail" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }}>
                    <DetailPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
