'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { ShoppingBag, Heart, TrendingUp, Receipt, ExternalLink, Clock, Search, ArrowUpRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

type Filter = 'all' | 'purchase' | 'support'

const TYPE = {
  purchase: { label: 'Purchase', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20',   dot: 'bg-blue-400'  },
  support:  { label: 'Support',  cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
} as const

export default function CollectorPurchases() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState<Filter>('all')
  const [search, setSearch]             = useState('')
  const [featured, setFeatured]         = useState<any>(null)

  useEffect(() => {
    loadTransactions()
    const user = getCurrentUser()
    if (user?.user_id) {
      const ch = supabase.channel('transactions-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `buyer_id=eq.${user.user_id}` }, loadTransactions)
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    }
  }, [])

  const loadTransactions = async () => {
    const user = await getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*, artworks(id, title, image_url, artist_id, medium, year_created)')
      .eq('buyer_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error || !data) { setLoading(false); return }

    const artistIds = [...new Set(data.map((t: any) => t.artist_id || t.artworks?.artist_id).filter(Boolean))] as string[]
    const artistMap: Record<string, any> = {}
    if (artistIds.length > 0) {
      const { data: artists } = await supabase.from('users').select('id, full_name, avatar_url').in('id', artistIds)
      artists?.forEach((a: any) => { artistMap[a.id] = a })
    }

    const enriched = data.map((t: any) => ({
      ...t,
      artist: artistMap[t.artist_id] ?? artistMap[t.artworks?.artist_id],
      artworks: t.artworks ? { ...t.artworks, artist_name: artistMap[t.artworks.artist_id]?.full_name ?? 'Artist' } : null,
    }))

    setTransactions(enriched)
    // Set featured to most recent purchase with image
    const firstPurchase = enriched.find(t => t.transaction_type === 'purchase' && t.artworks?.image_url)
    setFeatured(firstPurchase ?? enriched[0] ?? null)
    setLoading(false)
  }

  const purchases = transactions.filter(t => t.transaction_type === 'purchase')
  const supports  = transactions.filter(t => t.transaction_type === 'support')
  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount ?? 0), 0)

  const filtered = transactions
    .filter(t => filter === 'all' || t.transaction_type === filter)
    .filter(t => !search ||
      t.artworks?.title?.toLowerCase().includes(search.toLowerCase()) ||
      (t.artist?.full_name ?? '').toLowerCase().includes(search.toLowerCase())
    )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-5 p-4 lg:p-8">
        <PageHeader title="My Purchases" description="Your purchase and support history" />

        {/* ── Stats ── */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 px-1">
          {[
            { label: 'Total Spent',     value: `₹${totalSpent.toLocaleString()}`, color: 'text-amber-500'    },
            { label: 'Transactions',    value: transactions.length,                color: 'text-white'        },
            { label: 'Artworks Bought', value: purchases.length,                   color: 'text-white'        },
            { label: 'Artist Supports', value: supports.length,                    color: 'text-white'        },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-baseline gap-2"
            >
              <span className={`text-2xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{s.value}</span>
              <span className="text-[9px] text-neutral-600 tracking-[0.35em] font-black uppercase">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10">
            <EmptyState icon={ShoppingBag} title="No transactions yet" description="Your purchases and supports will appear here" />
          </div>
        ) : (
          <>
            {/* ── Featured hero ── */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl border border-neutral-800 overflow-hidden h-52 sm:h-64 group"
              >
                {/* BG */}
                {featured.artworks?.image_url ? (
                  <img src={featured.artworks.image_url} alt="" className="absolute inset-0 w-full h-full object-cover scale-105 blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/70 to-transparent" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />

                <div className="relative h-full flex items-center gap-6 px-6 sm:px-8">
                  {/* Artwork thumb */}
                  {featured.artworks?.image_url && (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
                      <img src={featured.artworks.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-amber-600/60" />
                      <span className="text-[9px] text-amber-600/60 tracking-[0.5em] font-black uppercase">Latest Transaction</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {featured.transaction_type === 'purchase' ? (featured.artworks?.title ?? 'Artwork') : 'Artist Support'}
                    </h2>
                    <p className="text-sm text-neutral-400">
                      {featured.transaction_type === 'purchase'
                        ? `by ${featured.artworks?.artist_name}`
                        : `to ${featured.artist?.full_name ?? 'Artist'}`}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-xl font-light text-amber-500">₹{Number(featured.amount).toLocaleString()}</span>
                      <span className={`text-[9px] font-black tracking-[0.3em] uppercase px-2.5 py-1 rounded-lg border ${TYPE[featured.transaction_type as keyof typeof TYPE]?.cls ?? TYPE.purchase.cls}`}>
                        {TYPE[featured.transaction_type as keyof typeof TYPE]?.label}
                      </span>
                    </div>
                  </div>

                  {featured.transaction_type === 'purchase' && featured.artworks?.id && (
                    <a href={`/gallery?artwork=${featured.artworks.id}`}
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black tracking-[0.3em] uppercase shrink-0"
                    >
                      <ExternalLink size={12} /> View
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {([
                  { key: 'all',      label: `All (${transactions.length})`,    dot: '' },
                  { key: 'purchase', label: `Purchases (${purchases.length})`, dot: 'bg-blue-400' },
                  { key: 'support',  label: `Supports (${supports.length})`,   dot: 'bg-amber-400' },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase whitespace-nowrap transition-all border ${
                      filter === f.key
                        ? 'bg-amber-600 text-white border-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.25)]'
                        : 'bg-neutral-900/40 text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />}
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full bg-neutral-900/40 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
                />
              </div>
            </div>

            {/* ── Two-column split: purchases | supports ── */}
            {filter === 'all' && !search ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Purchases column */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase">Artworks Purchased</p>
                    </div>
                    <span className="text-[9px] text-neutral-600 font-black">{purchases.length}</span>
                  </div>
                  <div className="divide-y divide-neutral-800/40 max-h-[480px] overflow-y-auto scrollbar-hide">
                    {purchases.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-neutral-600 text-sm">No purchases yet</p>
                      </div>
                    ) : purchases.map((t, i) => (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0">
                          {t.artworks?.image_url
                            ? <img src={t.artworks.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <ShoppingBag size={16} className="text-neutral-600 m-auto mt-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {t.artworks?.title ?? 'Artwork'}
                          </p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">by {t.artworks?.artist_name}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-amber-500 font-light">₹{Number(t.amount).toLocaleString()}</p>
                          <p className="text-[9px] text-neutral-700 mt-0.5">
                            {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        {t.artworks?.id && (
                          <a href={`/gallery?artwork=${t.artworks.id}`}
                            className="w-7 h-7 rounded-lg border border-neutral-700 flex items-center justify-center text-neutral-600 hover:text-white hover:border-neutral-500 transition-all shrink-0"
                          >
                            <ArrowUpRight size={12} />
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Supports column */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase">Artist Supports</p>
                    </div>
                    <span className="text-[9px] text-neutral-600 font-black">{supports.length}</span>
                  </div>
                  <div className="divide-y divide-neutral-800/40 max-h-[480px] overflow-y-auto scrollbar-hide">
                    {supports.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-neutral-600 text-sm">No supports yet</p>
                      </div>
                    ) : supports.map((t, i) => (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0 flex items-center justify-center">
                          {t.artist?.avatar_url
                            ? <img src={t.artist.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-lg font-light text-amber-600/30" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                {t.artist?.full_name?.charAt(0) ?? '?'}
                              </span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {t.artist?.full_name ?? 'Artist'}
                          </p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">Artist Support</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-amber-500 font-light">₹{Number(t.amount).toLocaleString()}</p>
                          <p className="text-[9px] text-neutral-700 mt-0.5">
                            {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Filtered / search list ── */
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden divide-y divide-neutral-800/50">
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <div className="p-10">
                      <EmptyState icon={Search} title="No results" description={`No transactions match "${search}"`} />
                    </div>
                  ) : filtered.map((t, i) => {
                    const isPurchase = t.transaction_type === 'purchase'
                    const badge = TYPE[t.transaction_type as keyof typeof TYPE] ?? TYPE.purchase
                    return (
                      <motion.div key={t.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0 flex items-center justify-center">
                          {isPurchase && t.artworks?.image_url
                            ? <img src={t.artworks.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : isPurchase
                              ? <ShoppingBag size={18} className="text-neutral-600" />
                              : t.artist?.avatar_url
                                ? <img src={t.artist.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <Heart size={18} className="text-amber-600/30" strokeWidth={1.5} />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {isPurchase ? (t.artworks?.title ?? 'Artwork') : 'Artist Support'}
                          </h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                            {isPurchase ? `by ${t.artworks?.artist_name}` : `to ${t.artist?.full_name ?? 'Artist'}`}
                          </p>
                        </div>
                        <span className={`hidden sm:inline text-[9px] font-black tracking-[0.3em] uppercase px-2.5 py-1 rounded-lg border shrink-0 ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-light text-amber-500">₹{Number(t.amount).toLocaleString()}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <Clock size={9} className="text-neutral-700" />
                            <p className="text-[9px] text-neutral-700">
                              {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        {isPurchase && t.artworks?.id && (
                          <a href={`/gallery?artwork=${t.artworks.id}`}
                            className="w-8 h-8 rounded-xl border border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-500 transition-all shrink-0"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
