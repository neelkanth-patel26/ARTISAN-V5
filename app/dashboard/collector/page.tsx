'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import {
  ShoppingBag, Heart, MessageSquare, DollarSign,
  FileText, Sparkles, ArrowRight, TrendingUp,
  UserPlus, Ticket, Settings, ExternalLink, HandHeart,
  LayoutGrid, List, ChevronDown, ChevronUp, ImageOff,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ExportTransactions } from '@/components/export-transactions'
import { ArtworkRecommendations } from '@/components/artwork-recommendations'

const TABS = [
  { id: 'overview',        label: 'Overview', icon: TrendingUp },
  { id: 'recommendations', label: 'Discover', icon: Sparkles   },
  { id: 'export',          label: 'Export',   icon: FileText   },
] as const

type Tab = typeof TABS[number]['id']

export default function CollectorDashboard() {
  const [stats, setStats]       = useState({ purchases: 0, likes: 0, comments: 0, spent: 0 })
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [activityFilter, setActivityFilter] = useState<'all' | 'purchase' | 'support'>('all')
  const [activityView, setActivityView]     = useState<'list' | 'grid'>('list')
  const [expanded, setExpanded] = useState<string | null>(null)
  const user = getCurrentUser()

  useEffect(() => {
    loadDashboard()
    const u = getCurrentUser()
    if (!u?.user_id) return
    const ch = supabase.channel('collector-dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `buyer_id=eq.${u.user_id}` }, loadDashboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes',        filter: `user_id=eq.${u.user_id}`  }, loadDashboard)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews',      filter: `reviewer_id=eq.${u.user_id}` }, loadDashboard)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const loadDashboard = async () => {
    try {
      const u = getCurrentUser()
      if (!u?.user_id) return
      const [txRes, likesRes, reviewsRes] = await Promise.all([
        supabase.from('transactions').select('*, artworks(image_url, title)').eq('buyer_id', u.user_id).eq('status', 'completed').order('created_at', { ascending: false }),
        supabase.from('likes').select('id').eq('user_id', u.user_id),
        supabase.from('reviews').select('id').eq('reviewer_id', u.user_id),
      ])
      const transactions = txRes.data ?? []
      const spent = transactions.reduce((s, t) => s + Number(t.amount ?? 0), 0)
      const purchaseCount = transactions.filter(t => t.transaction_type === 'purchase').length
      const artistIds = [...new Set(transactions.filter(t => t.transaction_type === 'support').map(t => t.artist_id).filter(Boolean))]
      let artistMap: Record<string, string> = {}
      if (artistIds.length > 0) {
        const { data: artists } = await supabase.from('users').select('id, full_name').in('id', artistIds as string[])
        artists?.forEach((a: any) => { artistMap[a.id] = a.full_name })
      }
      setPurchases(transactions.map(t => ({ ...t, artist_name: t.transaction_type === 'support' ? artistMap[t.artist_id] : null })))
      setStats({ purchases: purchaseCount, likes: likesRes.data?.length ?? 0, comments: reviewsRes.data?.length ?? 0, spent })
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Purchases',   value: stats.purchases,                    icon: ShoppingBag,   href: '/dashboard/collector/purchases', color: 'text-blue-400',   glow: 'bg-blue-600/6'   },
    { label: 'Favorites',   value: stats.likes,                        icon: Heart,         href: '/dashboard/collector/favorites', color: 'text-rose-400',   glow: 'bg-rose-600/6'   },
    { label: 'Comments',    value: stats.comments,                     icon: MessageSquare, href: '/dashboard/collector/comments',  color: 'text-violet-400', glow: 'bg-violet-600/6' },
    { label: 'Total Spent', value: `₹${stats.spent.toLocaleString()}`, icon: DollarSign,    href: null,                            color: 'text-orange-400', glow: 'bg-orange-600/6' },
  ]

  const quickLinks = [
    { label: 'Purchases', icon: ShoppingBag,   href: '/dashboard/collector/purchases' },
    { label: 'Favorites', icon: Heart,         href: '/dashboard/collector/favorites' },
    { label: 'Following', icon: UserPlus,      href: '/dashboard/collector/following' },
    { label: 'Bookings',  icon: Ticket,        href: '/dashboard/collector/bookings'  },
    { label: 'Comments',  icon: MessageSquare, href: '/dashboard/collector/comments'  },
    { label: 'Settings',  icon: Settings,      href: '/dashboard/collector/settings'  },
  ]

  // Derived filtered list — computed outside JSX to avoid IIFE
  const filteredActivity = purchases.filter(tx =>
    activityFilter === 'all' || tx.transaction_type === activityFilter
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-orange-500/50" />
            <span className="text-[10px] tracking-[0.35em] uppercase font-black text-orange-600/50">Collector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
            My Dashboard
          </h1>
          <p className="text-[13px] text-neutral-600 mt-1">Manage your collection and discover new art</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-light tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-600/20 text-orange-400 shadow-[inset_0_0_0_1px_rgba(234,88,12,0.2)]'
                  : 'text-neutral-600 hover:text-neutral-300'
              }`}
              style={{ fontFamily: 'Oughter, serif' }}
            >
              <tab.icon size={13} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
              ))}
            </div>
            <div className="h-64 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
                className="space-y-6"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {statCards.map((s, i) => {
                    const card = (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative rounded-2xl border border-white/[0.06] ${s.glow} px-4 py-4 overflow-hidden group transition-all hover:border-white/[0.1] ${s.href ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[9px] text-neutral-600 tracking-[0.35em] font-black uppercase">{s.label}</p>
                          <s.icon size={13} className="text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                        </div>
                        <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {s.value}
                        </p>
                        {s.href && (
                          <ArrowRight size={11} className="absolute bottom-3.5 right-3.5 text-neutral-700 group-hover:text-neutral-400 transition-all group-hover:translate-x-0.5" />
                        )}
                      </motion.div>
                    )
                    return s.href ? <Link key={s.label} href={s.href}>{card}</Link> : <div key={s.label}>{card}</div>
                  })}
                </div>

                {/* Quick Links */}
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase font-black text-neutral-700 mb-3">Quick Access</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quickLinks.map((q, i) => (
                      <motion.div
                        key={q.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 + i * 0.04 }}
                      >
                        <Link
                          href={q.href}
                          className="group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-4 hover:border-orange-600/20 hover:bg-orange-600/[0.04] transition-all"
                        >
                          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:bg-orange-600/15 group-hover:border-orange-600/25 transition-all">
                            <q.icon size={15} strokeWidth={1.5} className="text-neutral-500 group-hover:text-orange-400 transition-colors" />
                          </div>
                          <span className="text-[10px] text-neutral-600 group-hover:text-neutral-300 tracking-wide transition-colors" style={{ fontFamily: 'Oughter, serif' }}>
                            {q.label}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                >
                  {/* Activity header */}
                  <div className="px-5 py-4 border-b border-white/[0.05] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Recent Activity</h2>
                        <p className="text-[11px] text-neutral-600 mt-0.5">Your latest purchases & support</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-xl border border-white/[0.07] overflow-hidden">
                          <button
                            onClick={() => setActivityView('list')}
                            className={`p-2 transition-all ${activityView === 'list' ? 'bg-orange-600/20 text-orange-400' : 'text-neutral-600 hover:text-neutral-300'}`}
                          >
                            <List size={13} />
                          </button>
                          <button
                            onClick={() => setActivityView('grid')}
                            className={`p-2 transition-all ${activityView === 'grid' ? 'bg-orange-600/20 text-orange-400' : 'text-neutral-600 hover:text-neutral-300'}`}
                          >
                            <LayoutGrid size={13} />
                          </button>
                        </div>
                        {purchases.length > 0 && (
                          <Link href="/dashboard/collector/purchases" className="flex items-center gap-1 text-[11px] text-neutral-600 hover:text-orange-400 transition-colors">
                            All <ArrowRight size={11} />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Filter pills */}
                    {purchases.length > 0 && (
                      <div className="flex gap-1.5">
                        {(['all', 'purchase', 'support'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setActivityFilter(f)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase transition-all border ${
                              activityFilter === f
                                ? f === 'purchase'
                                  ? 'bg-blue-600/20 text-blue-400 border-blue-600/25'
                                  : f === 'support'
                                  ? 'bg-rose-600/20 text-rose-400 border-rose-600/25'
                                  : 'bg-orange-600/20 text-orange-400 border-orange-600/25'
                                : 'text-neutral-700 hover:text-neutral-400 border-transparent'
                            }`}
                          >
                            {f === 'purchase' && <ShoppingBag size={9} />}
                            {f === 'support'  && <HandHeart size={9} />}
                            {f === 'all'      && <Sparkles size={9} />}
                            {f === 'all' ? 'All' : f}
                            <span className="opacity-50">
                              {f === 'all' ? purchases.length : purchases.filter(t => t.transaction_type === f).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity body */}
                  {purchases.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon={ShoppingBag}
                        title="No activity yet"
                        description="Start collecting art or support artists to see your activity here"
                        action={
                          <Link href="/gallery" className="flex items-center gap-2 rounded-xl bg-orange-600/20 border border-orange-600/30 hover:bg-orange-600/30 px-5 py-2.5 text-sm text-orange-400 transition-all">
                            Browse Gallery <ExternalLink size={13} />
                          </Link>
                        }
                      />
                    </div>
                  ) : activityView === 'list' ? (
                    <div className="divide-y divide-white/[0.04]">
                      {filteredActivity.slice(0, 8).map((tx, i) => {
                        const isOpen = expanded === tx.id
                        return (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <button
                              onClick={() => setExpanded(isOpen ? null : tx.id)}
                              className="w-full group flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
                            >
                              {/* Thumbnail */}
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-neutral-900 border border-white/[0.06] shrink-0">
                                {tx.transaction_type === 'purchase' && tx.artworks?.image_url ? (
                                  <img src={tx.artworks.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${tx.transaction_type === 'support' ? 'bg-rose-600/10' : 'bg-neutral-800'}`}>
                                    {tx.transaction_type === 'support'
                                      ? <HandHeart size={14} className="text-rose-500/60" strokeWidth={1.5} />
                                      : <ImageOff size={14} className="text-neutral-700" strokeWidth={1.5} />}
                                  </div>
                                )}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  {tx.transaction_type === 'purchase' ? (tx.artworks?.title ?? 'Artwork') : (tx.artist_name ?? 'Artist')}
                                </p>
                                <p className="text-[10px] text-neutral-600 mt-0.5">
                                  {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>

                              {/* Right */}
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-light text-white">₹{Number(tx.amount).toLocaleString()}</p>
                                  <span className={`text-[9px] tracking-[0.15em] uppercase font-black px-1.5 py-0.5 rounded-md ${
                                    tx.transaction_type === 'purchase' ? 'bg-blue-600/15 text-blue-400' : 'bg-rose-600/15 text-rose-400'
                                  }`}>
                                    {tx.transaction_type}
                                  </span>
                                </div>
                                <div className="text-neutral-700 group-hover:text-neutral-400 transition-colors">
                                  {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </div>
                              </div>
                            </button>

                            {/* Expanded detail panel */}
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="mx-5 mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                                    {tx.transaction_type === 'purchase' && tx.artworks?.image_url && (
                                      <div className="aspect-[16/7] overflow-hidden">
                                        <img src={tx.artworks.image_url} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04]">
                                      {[
                                        { label: 'Amount',       value: `₹${Number(tx.amount).toLocaleString()}` },
                                        { label: 'Platform Fee', value: tx.platform_fee ? `₹${Number(tx.platform_fee).toLocaleString()}` : '—' },
                                        { label: 'Status',       value: tx.status ?? '—' },
                                        { label: 'Ref',          value: tx.transaction_code ? tx.transaction_code.slice(-8) : '—' },
                                      ].map(d => (
                                        <div key={d.label} className="bg-neutral-950/60 px-4 py-3">
                                          <p className="text-[9px] text-neutral-700 tracking-[0.25em] uppercase font-black mb-1">{d.label}</p>
                                          <p className="text-[13px] font-light text-white">{d.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    /* Grid view */
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredActivity.slice(0, 8).map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.1] transition-all"
                        >
                          <div className="aspect-square overflow-hidden bg-neutral-900">
                            {tx.transaction_type === 'purchase' && tx.artworks?.image_url ? (
                              <img src={tx.artworks.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${tx.transaction_type === 'support' ? 'bg-rose-600/10' : 'bg-neutral-900'}`}>
                                {tx.transaction_type === 'support'
                                  ? <HandHeart size={24} className="text-rose-500/40" strokeWidth={1} />
                                  : <ImageOff size={24} className="text-neutral-800" strokeWidth={1} />}
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-[12px] font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {tx.transaction_type === 'purchase' ? (tx.artworks?.title ?? 'Artwork') : (tx.artist_name ?? 'Artist')}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[11px] text-orange-400">₹{Number(tx.amount).toLocaleString()}</p>
                              <span className={`text-[8px] tracking-[0.15em] uppercase font-black px-1.5 py-0.5 rounded-md ${
                                tx.transaction_type === 'purchase' ? 'bg-blue-600/15 text-blue-400' : 'bg-rose-600/15 text-rose-400'
                              }`}>
                                {tx.transaction_type === 'purchase' ? 'Buy' : 'Sup'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Recommendations preview */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <ArtworkRecommendations userId={user.user_id} />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── Discover ── */}
            {activeTab === 'recommendations' && user && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              >
                <ArtworkRecommendations userId={user.user_id} />
              </motion.div>
            )}

            {/* ── Export ── */}
            {activeTab === 'export' && user && (
              <motion.div
                key="export"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              >
                <ExportTransactions userId={user.user_id} role="collector" />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  )
}
