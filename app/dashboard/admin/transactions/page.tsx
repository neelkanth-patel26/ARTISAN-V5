'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import {
  DollarSign, ShoppingBag, HandHeart, TrendingUp,
  Search, CreditCard, Smartphone, ArrowUpRight,
  Receipt, Filter, X, ArrowRight, Banknote,
  Palette, Hash, Clock,
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

type FilterType = 'all' | 'purchase' | 'support'
type PayFilter  = 'all' | 'upi' | 'card' | 'gateway'

const METHOD: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  upi:     { icon: Smartphone,   color: 'text-amber-400',   bg: 'bg-amber-500/10', border: 'border-amber-500/20',   label: 'UPI'      },
  card:    { icon: CreditCard,   color: 'text-sky-400',     bg: 'bg-sky-500/10',   border: 'border-sky-500/20',     label: 'CARD'     },
  gateway: { icon: ArrowUpRight, color: 'text-neutral-400', bg: 'bg-white/5',      border: 'border-white/10',       label: 'GATEWAY'  },
}

const TYPE: Record<string, { color: string; bg: string; border: string; icon: any; accent: string }> = {
  purchase: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: ShoppingBag, accent: 'from-orange-600/10' },
  support:  { color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/20',   icon: HandHeart,   accent: 'from-rose-600/10'   },
}

function Avatar({ name, url, size = 8 }: { name?: string; url?: string; size?: number }) {
  const dim = `w-${size} h-${size}`
  return (
    <div className={`${dim} rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.08] shrink-0 flex items-center justify-center p-0.5`}>
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover rounded-lg" />
        : <span className="text-[10px] text-neutral-400 font-black tracking-tighter">{name?.charAt(0).toUpperCase() ?? '?'}</span>
      }
    </div>
  )
}

function TxCard({ tx, index }: { tx: any; index: number }) {
  const [open, setOpen] = useState(false)
  const method = tx.payment_method?.toLowerCase() || 'gateway'
  const type   = tx.transaction_type?.toLowerCase() || 'purchase'
  const mCfg   = METHOD[method] ?? METHOD.gateway
  const tCfg   = TYPE[type] ?? TYPE.purchase
  const MIcon  = mCfg.icon
  const TIcon  = tCfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-[2rem] border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 overflow-hidden flex flex-col shadow-xl hover:shadow-orange-500/5`}
    >
      {/* Visual Identity Header */}
      <div className="relative h-40 bg-neutral-900 overflow-hidden shrink-0">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-neutral-950 to-transparent z-10" />
        
        {tx.artwork?.image_url ? (
          <img 
            src={tx.artwork.image_url} 
            alt={tx.artwork.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-60 group-hover:opacity-80" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900">
            <TIcon size={40} className={`${tCfg.color} opacity-10`} strokeWidth={1} />
          </div>
        )}

        {/* Status Sentinel */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border text-[8px] font-black tracking-[0.2em] uppercase ${tCfg.bg} ${tCfg.border} ${tCfg.color}`}>
            <TIcon size={10} strokeWidth={2.5} />
            {tx.transaction_type}
          </div>
        </div>

        {/* Protocol Metadata */}
        <div className="absolute top-4 right-4 z-20">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border text-[8px] font-black tracking-[0.2em] uppercase ${mCfg.bg} ${mCfg.border} ${mCfg.color}`}>
            <MIcon size={10} strokeWidth={2.5} />
            {mCfg.label}
          </div>
        </div>

        {/* High-Denomination Value */}
        <div className="absolute bottom-4 left-6 z-20">
          <p className="text-3xl font-light text-white leading-none tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
            ₹{Number(tx.amount).toLocaleString()}
          </p>
          <p className="text-[9px] text-neutral-500 tracking-[0.3em] uppercase font-black mt-2" style={{ fontFamily: 'Oughter, serif' }}>Settlement Value</p>
        </div>
      </div>

      {/* Audit Context */}
      <div className="p-6 space-y-6 flex-1 relative">
        <div className="space-y-1">
          <p className="text-[10px] text-orange-500/60 tracking-[0.25em] uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Inventory Link</p>
          <h4 className="text-[15px] font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
            {tx.transaction_type === 'purchase' ? (tx.artwork?.title ?? 'Anonymous Acquisition') : 'Guardian Contribution'}
          </h4>
        </div>

        {/* Entity Interchange */}
        <div className="grid grid-cols-1 gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={tx.buyer?.full_name} url={tx.buyer?.avatar_url} size={8} />
              <div className="min-w-0">
                <p className="text-[11px] text-white font-light truncate">{tx.buyer?.full_name ?? 'Anonymous Client'}</p>
                <p className="text-[8px] text-neutral-600 tracking-widest uppercase font-black">Origin</p>
              </div>
            </div>
            <ArrowRight size={12} className="text-neutral-700" />
            <div className="flex items-center gap-2.5 min-w-0 text-right">
              <div className="min-w-0">
                <p className="text-[11px] text-white font-light truncate">{tx.artist?.full_name ?? 'Unspecified Artist'}</p>
                <p className="text-[8px] text-neutral-600 tracking-widest uppercase font-black">Beneficiary</p>
              </div>
              <Avatar name={tx.artist?.full_name} url={tx.artist?.avatar_url} size={8} />
            </div>
          </div>
        </div>

        {/* Fiscal Breakdown */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <p className="text-[8px] text-neutral-600 tracking-widest uppercase font-black">Protocol Fee</p>
            <p className="text-sm font-light text-orange-400">₹{Number(tx.platform_fee ?? 0).toFixed(2)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[8px] text-neutral-600 tracking-widest uppercase font-black">Net Disbursement</p>
            <p className="text-sm font-light text-emerald-400">
              ₹{Number(tx.artist_earnings ?? (tx.amount - (tx.platform_fee ?? 0))).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Audit Toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl border border-white/[0.05] text-[9px] text-neutral-400 hover:text-white tracking-[0.3em] uppercase font-black transition-all duration-300 flex items-center justify-center gap-2"
          style={{ fontFamily: 'Oughter, serif' }}
        >
          {open ? 'Collapse Record' : 'Scan Audit Logs'}
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-[10px]">▼</motion.span>
        </button>
      </div>

      {/* Deep Audit Data */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-neutral-950/40 backdrop-blur-2xl"
          >
            <div className="p-px bg-white/[0.05]">
              <div className="grid grid-cols-2 gap-px">
                {[
                  { label: 'Settlement Time', value: new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), icon: Clock, color: 'text-neutral-400' },
                  { label: 'Protocol ID', value: tx.transaction_code ? `…${tx.transaction_code.slice(-8)}` : 'GEN-0x00', icon: Hash, color: 'text-neutral-500' },
                ].map(d => (
                  <div key={d.label} className="bg-neutral-900/40 p-5 space-y-1">
                    <p className="text-[8px] text-neutral-600 tracking-[0.2em] uppercase font-black">{d.label}</p>
                    <p className={`text-xs font-light font-mono ${d.color}`}>{d.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-neutral-900/40 px-5 py-4 flex items-center justify-between border-t border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Receipt size={12} className="text-orange-500/40" />
                  <p className="text-[9px] text-neutral-500 tracking-wider">Authenticated Record</p>
                </div>
                <p className="text-[10px] text-neutral-600 font-mono">
                  {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({ totalRevenue: 0, purchases: 0, supports: 0, platformFees: 0, upiPlatformFees: 0 })
  const [loading, setLoading]     = useState(true)
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [payFilter,  setPayFilter]  = useState<PayFilter>('all')
  const [search, setSearch]       = useState('')

  useEffect(() => { loadTransactions() }, [])

  const loadTransactions = async () => {
    const { data } = await supabase
      .from('transactions').select('*').eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    const userIds    = [...new Set([...data.map(t => t.buyer_id), ...data.map(t => t.artist_id)].filter(Boolean))]
    const artworkIds = [...new Set(data.map(t => t.artwork_id).filter(Boolean))]

    const [usersRes, artworksRes] = await Promise.all([
      supabase.from('users').select('id, full_name, avatar_url').in('id', userIds),
      artworkIds.length > 0 ? supabase.from('artworks').select('id, title, image_url').in('id', artworkIds) : { data: [] },
    ])

    const userMap: Record<string, any>    = {}
    const artworkMap: Record<string, any> = {}
    usersRes.data?.forEach(u => { userMap[u.id] = u })
    artworksRes.data?.forEach(a => { artworkMap[a.id] = a })

    const enriched = data.map(t => ({
      ...t,
      buyer:   userMap[t.buyer_id],
      artist:  userMap[t.artist_id],
      artwork: artworkMap[t.artwork_id],
    }))

    setTransactions(enriched)
    setStats({
      totalRevenue:    enriched.reduce((s, t) => s + Number(t.amount ?? 0), 0),
      purchases:       enriched.filter(t => t.transaction_type === 'purchase').length,
      supports:        enriched.filter(t => t.transaction_type === 'support').length,
      platformFees:    enriched.reduce((s, t) => s + Number(t.platform_fee ?? 0), 0),
      upiPlatformFees: enriched.filter(t => t.payment_method === 'upi').reduce((s, t) => s + Number(t.platform_fee ?? 0), 0),
    })
    setLoading(false)
  }

  const filtered = useMemo(() => transactions.filter(t => {
    const type = t.transaction_type?.toLowerCase() || ''
    const method = t.payment_method?.toLowerCase() || 'gateway'
    
    if (typeFilter !== 'all' && type !== typeFilter) return false
    if (payFilter !== 'all' && method !== payFilter) return false
    
    if (search) {
      const q = search.toLowerCase()
      return (
        t.buyer?.full_name?.toLowerCase().includes(q) ||
        t.artist?.full_name?.toLowerCase().includes(q) ||
        t.artwork?.title?.toLowerCase().includes(q) ||
        t.transaction_code?.toLowerCase().includes(q)
      )
    }
    return true
  }), [transactions, typeFilter, payFilter, search])

  const statCards = [
    { label: 'Platform Volume', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign,  color: 'text-white',       border: 'border-white/5',       glow: 'bg-white/[0.02]' },
    { label: 'Acquisitions',     value: stats.purchases,                           icon: ShoppingBag, color: 'text-orange-400', border: 'border-orange-500/10', glow: 'bg-orange-500/[0.03]' },
    { label: 'Guardianship',     value: stats.supports,                            icon: HandHeart,   color: 'text-rose-400',   border: 'border-rose-500/10',   glow: 'bg-rose-500/[0.03]'   },
    { label: 'Protocol Yield',   value: `₹${stats.platformFees.toLocaleString()}`, icon: TrendingUp,  color: 'text-emerald-400', border: 'border-emerald-500/10', glow: 'bg-emerald-500/[0.03]' },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen p-6 lg:p-10 space-y-10">
        {/* Atmospheric Sentinel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-700/5 blur-[120px] pointer-events-none -z-10" />

        {/* Header: Fiscal Oracle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-orange-500/30" />
              <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-500/50" style={{ fontFamily: 'Oughter, serif' }}>Sentinel Interface</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Fiscal Oracle
            </h1>
            <p className="text-[13px] text-neutral-500 max-w-md leading-relaxed">System-wide monitoring of commerce, contributions, and platform protocol yields.</p>
          </div>
          
          {!loading && (
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-md">
              <div className="text-right">
                <p className="text-[9px] text-neutral-600 tracking-widest uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Global Records</p>
                <p className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{transactions.length}</p>
              </div>
              <div className="h-10 w-px bg-white/5" />
              <div className="text-right">
                <p className="text-[9px] text-neutral-600 tracking-widest uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Current Status</p>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest">Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`relative group rounded-[2rem] border ${s.border} ${s.glow} p-6 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <s.icon size={48} strokeWidth={1} />
                </div>
                <div className="relative z-10 space-y-4">
                  <p className="text-[10px] text-neutral-500 tracking-[0.25em] font-black uppercase" style={{ fontFamily: 'Oughter, serif' }}>{s.label}</p>
                  <p className={`text-3xl lg:text-4xl font-light ${s.color} tracking-tighter`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {s.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* UPI Protocol Banner */}
        {stats.upiPlatformFees > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-[2rem] border border-amber-500/10 bg-amber-500/[0.02] p-6 lg:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5">
                  <Smartphone size={24} className="text-amber-500" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.2em]" style={{ fontFamily: 'Oughter, serif' }}>UPI Protocol Surcharge (5.0%)</p>
                  <p className="text-[13px] text-white/80 font-light">gaming.network.studio.mg@okicici</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mb-1">Yield Collected</p>
                <p className="text-3xl font-light text-amber-500" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  ₹{stats.upiPlatformFees.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sentinel Filtering */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.01] p-2 overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col xl:flex-row items-center gap-2">
            {/* Scan Query */}
            <div className="relative flex-1 w-full min-w-[300px]">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                placeholder="Scan identities, artifacts or protocol refs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-14 pr-14 py-5 bg-transparent text-[15px] text-white placeholder-neutral-700 focus:outline-none transition-colors"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={14} className="text-neutral-500" />
                </button>
              )}
            </div>

            <div className="h-10 w-px bg-white/5 hidden xl:block" />

            {/* Nomenclature Filters */}
            <div className="flex flex-wrap items-center gap-2 p-2 w-full xl:w-auto">
              {(['all', 'purchase', 'support'] as FilterType[]).map(f => {
                const cfg = f !== 'all' ? TYPE[f] : { color: 'text-white', bg: 'bg-white/5', border: 'border-white/10', icon: Hash }
                const active = typeFilter === f
                return (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                      active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-lg`
                        : 'text-neutral-600 border-transparent hover:text-neutral-400'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <cfg.icon size={11} strokeWidth={active ? 2.5 : 1.5} />
                    {f}
                  </button>
                )
              })}

              <div className="w-px bg-white/5 mx-2 h-6" />

              {(['all', 'upi', 'card', 'gateway'] as PayFilter[]).map(p => {
                const cfg = p !== 'all' ? METHOD[p] : { color: 'text-white', bg: 'bg-white/5', border: 'border-white/10', icon: CreditCard }
                const active = payFilter === p
                return (
                  <button
                    key={p}
                    onClick={() => setPayFilter(p)}
                    className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border ${
                      active
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-lg`
                        : 'text-neutral-600 border-transparent hover:text-neutral-400'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <cfg.icon size={11} strokeWidth={active ? 2.5 : 1.5} />
                    {p}
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Audit Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[500px] rounded-[2rem] border border-white/[0.05] bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[3rem] border border-white/[0.05] bg-white/[0.01] p-32 flex flex-col items-center gap-6 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-orange-500/5 border border-orange-500/10 flex items-center justify-center">
              <Receipt size={32} className="text-orange-500/20" strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Empty Registry</h3>
              <p className="text-[13px] text-neutral-600 max-w-sm mx-auto">The fiscal oracle finds no matching records for the current parameters.</p>
            </div>
            <button 
              onClick={() => { setSearch(''); setTypeFilter('all'); setPayFilter('all'); }}
              className="mt-4 px-8 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl text-[10px] text-white font-black tracking-[0.3em] uppercase transition-all"
            >
              Reset Sentinel
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
              {filtered.map((tx, i) => <TxCard key={tx.id} tx={tx} index={i} />)}
            </div>

            {/* Fiscal Summary Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 py-10 border-t border-white/5">
              <p className="text-[11px] text-neutral-600 tracking-wider">
                Showing <span className="text-neutral-400">{filtered.length}</span> of <span className="text-neutral-400">{transactions.length}</span> verified protocol records
              </p>
              <div className="flex items-center gap-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] px-8 py-4 backdrop-blur-md">
                <div className="text-right">
                  <p className="text-[9px] text-neutral-600 tracking-widest uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Registry Volume</p>
                  <p className="text-2xl font-light text-emerald-400" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    ₹{filtered.reduce((s, t) => s + Number(t.amount ?? 0), 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-right">
                  <p className="text-[9px] text-neutral-600 tracking-widest uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Yield Variance</p>
                  <p className="text-2xl font-light text-orange-400" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    ₹{filtered.reduce((s, t) => s + Number(t.platform_fee ?? 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

