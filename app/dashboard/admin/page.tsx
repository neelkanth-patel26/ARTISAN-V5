'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import {
  Users, Image, TrendingUp, Calendar, Clock, DollarSign,
  CheckCircle, AlertCircle, BarChart3, BadgeCheck, ArrowRight,
  ShieldCheck, Layers, Activity, Sparkles, Eye, XCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const TABS = [
  { id: 'overview', label: 'Overview',  icon: Activity },
  { id: 'pending',  label: 'Pending',   icon: Clock     },
] as const
type Tab = typeof TABS[number]['id']

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalArtists: 0, totalCollectors: 0,
    totalArtworks: 0, pendingArtworks: 0, totalExhibitions: 0, totalRevenue: 0,
  })
  const [pendingArtworks, setPendingArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      const [usersRes, artworksRes, exhibitionsRes, transactionsRes] = await Promise.all([
        supabase.from('users').select('id, role'),
        supabase.from('artworks').select('id, status'),
        supabase.from('exhibitions').select('id'),
        supabase.from('transactions').select('amount, platform_fee').eq('status', 'completed'),
      ])
      setStats({
        totalUsers:      usersRes.data?.length ?? 0,
        totalArtists:    usersRes.data?.filter(u => u.role === 'artist').length ?? 0,
        totalCollectors: usersRes.data?.filter(u => u.role === 'collector').length ?? 0,
        totalArtworks:   artworksRes.data?.length ?? 0,
        pendingArtworks: artworksRes.data?.filter(a => a.status === 'pending').length ?? 0,
        totalExhibitions: exhibitionsRes.data?.length ?? 0,
        totalRevenue:    transactionsRes.data?.reduce((s, t) => s + Number(t.platform_fee ?? 0), 0) ?? 0,
      })
      const { data: pending } = await supabase
        .from('artworks')
        .select('*, users!artworks_artist_id_fkey(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      setPendingArtworks((pending ?? []).map(a => ({ ...a, artist_name: a.users?.full_name ?? 'Unknown' })))
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve')
    await supabase.from('artworks').update({ status: 'approved' }).eq('id', id)
    toast.success('Artwork approved')
    setActionLoading(null)
    loadDashboard()
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject')
    await supabase.from('artworks').update({ status: 'rejected' }).eq('id', id)
    toast.success('Artwork rejected')
    setActionLoading(null)
    loadDashboard()
  }

  const statCards = [
    { label: 'Total Users',      value: stats.totalUsers,                        icon: Users,      color: 'text-sky-400',    glow: 'bg-sky-600/6',    border: 'hover:border-sky-600/20',    href: '/dashboard/admin/users'        },
    { label: 'Artists',          value: stats.totalArtists,                      icon: Sparkles,   color: 'text-violet-400', glow: 'bg-violet-600/6', border: 'hover:border-violet-600/20', href: '/dashboard/admin/artists'      },
    { label: 'Collectors',       value: stats.totalCollectors,                   icon: TrendingUp, color: 'text-emerald-400',glow: 'bg-emerald-600/6',border: 'hover:border-emerald-600/20',href: null                            },
    { label: 'Total Artworks',   value: stats.totalArtworks,                     icon: Image,      color: 'text-amber-400',  glow: 'bg-amber-600/6',  border: 'hover:border-amber-600/20',  href: '/dashboard/admin/artworks'     },
    { label: 'Pending Approval', value: stats.pendingArtworks,                   icon: Clock,      color: 'text-orange-400', glow: 'bg-orange-600/6', border: 'hover:border-orange-600/20', href: null,                           urgent: stats.pendingArtworks > 0 },
    { label: 'Exhibitions',      value: stats.totalExhibitions,                  icon: Calendar,   color: 'text-pink-400',   glow: 'bg-pink-600/6',   border: 'hover:border-pink-600/20',   href: '/dashboard/admin/exhibitions'  },
    { label: 'Platform Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400',  glow: 'bg-green-600/6',  border: 'hover:border-green-600/20',  href: '/dashboard/admin/transactions' },
  ]

  const quickLinks = [
    { label: 'Verify Artists',    icon: BadgeCheck,  href: '/dashboard/admin/users',         desc: 'Manage verification'       },
    { label: 'Transactions',      icon: DollarSign,  href: '/dashboard/admin/transactions',  desc: 'Monitor platform revenue'  },
    { label: 'Manage Artworks',   icon: Layers,      href: '/dashboard/admin/artworks',      desc: 'Review & approve uploads'  },
    { label: 'Analytics',         icon: BarChart3,   href: '/dashboard/admin/analytics',     desc: 'Platform insights'         },
    { label: 'Exhibitions',       icon: Calendar,    href: '/dashboard/admin/exhibitions',   desc: 'Manage exhibitions'        },
    { label: 'Security',          icon: ShieldCheck, href: '/dashboard/admin/users',         desc: 'User management'           },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-orange-700/[0.02] rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-amber-500/[0.02] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
          {/* ── Command Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-400">Command Center</span>
                </div>
                <Activity size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Platform <span className="text-neutral-500">Registry</span>
              </h1>
              <p className="text-[14px] text-neutral-500 font-light tracking-wide max-w-md">
                Orchestrating the elite artisan ecosystem and overseeing curatorial protocols.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-light tracking-widest transition-all duration-500 ${
                      activeTab === tab.id
                        ? 'bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.1)]'
                        : 'text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.02]'
                    }`}
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <tab.icon size={14} className={activeTab === tab.id ? 'text-orange-400' : 'text-neutral-700'} />
                    <span className="uppercase">{tab.label}</span>
                    {tab.id === 'pending' && stats.pendingArtworks > 0 && (
                      <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-black text-white shadow-lg shadow-orange-500/20">
                        {stats.pendingArtworks}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-44 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'overview' ? (
              <div
                key="overview"
                className="space-y-16"
              >
                  {/* ── Metrics Nucleus ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((s, i) => (
                      <motion.div
                        key={s.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                      >
                        <Link href={s.href || '#'} className={`group relative block h-full p-8 rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-2xl transition-all duration-700 hover:bg-neutral-900/60 hover:border-white/[0.1] hover:translate-y-[-4px] overflow-hidden ${!s.href && 'cursor-default'}`}>
                          {/* Inner atmospheric glow */}
                          <div className={`absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[60px] rounded-full pointer-events-none ${s.glow.replace('bg-', 'bg-')}`} />
                          
                          <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] group-hover:scale-110 group-hover:bg-orange-500/5 group-hover:border-orange-500/20 transition-all duration-700">
                                <s.icon size={20} className="text-neutral-500 group-hover:text-orange-400 transition-colors duration-700" />
                              </div>
                              {s.urgent && (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-tighter">Action Required</span>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-[11px] tracking-[0.4em] uppercase font-black text-neutral-600 mb-2 group-hover:text-neutral-400 transition-colors duration-700">
                              {s.label}
                            </p>
                            <h3 className={`text-4xl font-light tracking-tighter group-hover:scale-[1.02] origin-left transition-transform duration-700 ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {s.value}
                            </h3>
                            
                            {s.href && (
                              <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] text-neutral-600 group-hover:text-orange-400 transition-all duration-700 opacity-60 group-hover:opacity-100 tracking-[0.2em] font-black uppercase">
                                View Intelligence <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* ── Curation Inbox ── */}
                  <div className="rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-700 hover:bg-neutral-900/60 hover:border-white/[0.1]">
                    <div className="space-y-2">
                       <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Curation <span className="text-neutral-500">Inbox</span></h2>
                       <p className="text-[14px] text-neutral-500 font-light tracking-wide">Evaluating new masterpieces for platform inclusion.</p>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="px-5 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[12px] font-black tracking-widest uppercase">
                         {stats.pendingArtworks} Pending
                       </div>
                       <button 
                         onClick={() => setActiveTab('pending')}
                         className="px-8 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white text-[11px] font-black tracking-[0.2em] uppercase hover:bg-white/[0.06] hover:border-white/[0.2] transition-all duration-500"
                         style={{ fontFamily: 'Oughter, serif' }}
                       >
                         Manage Submissions
                       </button>
                    </div>
                  </div>

                  {/* ── Quick Protocols ── */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                       <ShieldCheck size={16} className="text-orange-500/30" />
                       <h2 className="text-[10px] tracking-[0.6em] uppercase font-black text-neutral-700">Quick Protocols</h2>
                       <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {quickLinks.map((q, i) => (
                        <motion.div
                          key={q.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                        >
                          <Link href={q.href} className="group relative block p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.04] hover:bg-orange-500/[0.03] hover:border-orange-500/20 transition-all duration-700 text-center overflow-hidden">
                            <div className="relative z-10 flex flex-col items-center gap-4">
                              <div className="p-4 rounded-2xl bg-neutral-900 border border-white/[0.05] group-hover:scale-110 group-hover:border-orange-500/30 transition-all duration-500 shadow-xl">
                                <q.icon size={20} strokeWidth={1} className="text-neutral-600 group-hover:text-orange-400 transition-colors" />
                              </div>
                              <div className="space-y-1">
                                <span className="block text-[12px] text-white/90 font-light tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{q.label}</span>
                                <span className="block text-[9px] text-neutral-600 leading-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">{q.desc}</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* ── Demographics Breakdown ── */}
                  <section 
                    className="p-8 lg:p-12 rounded-[3.5rem] bg-gradient-to-br from-neutral-900/60 to-neutral-900/20 border border-white/[0.05] backdrop-blur-3xl overflow-hidden relative"
                  >
                    <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[150%] bg-orange-500/[0.01] rotate-12 blur-[100px] pointer-events-none" />
                    
                    <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Ecosystem <span className="text-neutral-500">Composition</span></h2>
                          <p className="text-[14px] text-neutral-500 font-light leading-relaxed">
                            A live visualization of the platform's user segments, reflecting the balance between the elite curatorial force and high-value collectors.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                          {[
                            { label: 'Verified Artists', value: stats.totalArtists, color: 'text-violet-400', icon: Sparkles },
                            { label: 'Patron Collectors', value: stats.totalCollectors, color: 'text-emerald-400', icon: TrendingUp }
                          ].map(item => (
                            <div key={item.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
                              <item.icon size={16} className={`mb-3 ${item.color}`} />
                              <p className="text-[10px] tracking-[0.2em] uppercase font-black text-neutral-600 mb-1">{item.label}</p>
                              <p className={`text-2xl font-light ${item.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-10">
                        {[
                          { label: 'Artist Intelligence', value: stats.totalArtists, total: stats.totalUsers, color: 'from-violet-500/40 to-violet-500', glow: 'shadow-violet-500/20' },
                          { label: 'Collector Network', value: stats.totalCollectors, total: stats.totalUsers, color: 'from-emerald-500/40 to-emerald-500', glow: 'shadow-emerald-500/20' },
                        ].map((row, i) => {
                          const pct = stats.totalUsers > 0 ? Math.round((row.value / stats.totalUsers) * 100) : 0
                          return (
                            <div key={row.label} className="space-y-4">
                              <div className="flex items-end justify-between">
                                <div className="space-y-1">
                                  <p className="text-[10px] tracking-[0.4em] uppercase font-black text-white/50">{row.label}</p>
                                  <p className="text-[12px] text-neutral-400 font-light">Saturation Protocol</p>
                                </div>
                                <span className="text-4xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>{pct}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.05]">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: 1 + i * 0.2, duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                                  className={`h-full rounded-full bg-gradient-to-r ${row.color} ${row.glow} shadow-xl`}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                /* ── Curation Inbox (Pending) ── */
                <div
                  key="pending"
                  className="rounded-[3rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl overflow-hidden relative"
                >
                  <div className="p-8 lg:p-12 border-b border-white/[0.04] flex items-center justify-between relative z-10">
                    <div className="space-y-2">
                       <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Curation <span className="text-neutral-500">Inbox</span></h2>
                       <p className="text-[14px] text-neutral-500 font-light tracking-wide">Evaluating new masterpieces for platform inclusion.</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="px-5 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[12px] font-black tracking-widest uppercase">
                         {pendingArtworks.length} Pending
                       </div>
                    </div>
                  </div>

                  {pendingArtworks.length === 0 ? (
                    <div className="py-32 flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shadow-2xl">
                        <BadgeCheck size={32} className="text-emerald-500/30" strokeWidth={1} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>Aesthetic Equilibrium</p>
                        <p className="text-[13px] text-neutral-600 font-light">All submissions have been successfully curated.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.03]">
                      {pendingArtworks.map((artwork, i) => (
                        <div
                          key={artwork.id}
                          className="group relative flex flex-col sm:flex-row sm:items-center gap-8 p-8 lg:p-12 hover:bg-white/[0.01] transition-all duration-700"
                        >
                          {/* Artwork Frame */}
                          <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-neutral-900 border border-white/[0.06] shadow-2xl group-hover:scale-105 transition-transform duration-700">
                            <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          </div>

                          {/* Metadata Stack */}
                          <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                               <p className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-500/50">New Submission</p>
                               <h3 className="text-2xl font-light text-white group-hover:text-orange-400 transition-colors duration-700" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                 {artwork.title}
                               </h3>
                               <div className="flex items-center gap-2">
                                  <span className="text-[12px] text-neutral-500 font-light">Curated by</span>
                                  <span className="text-[12px] text-neutral-300 font-medium tracking-wide" style={{ fontFamily: 'Oughter, serif' }}>{artwork.artist_name}</span>
                               </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 pt-2">
                               <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400 font-light tracking-widest uppercase">
                                 {artwork.medium || 'Unique Creation'}
                               </div>
                               <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-neutral-400 font-light tracking-widest uppercase">
                                 {artwork.category || 'Fine Art'}
                               </div>
                               <div className="text-[14px] text-orange-500/80 font-light tracking-tight flex items-center gap-1.5 border-l border-white/10 pl-4 py-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                 <DollarSign size={14} className="text-orange-500/40" />
                                 {Number(artwork.price).toLocaleString()}
                               </div>
                            </div>
                          </div>

                          {/* Curatorial Actions */}
                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => handleApprove(artwork.id)}
                              disabled={!!actionLoading}
                              className="group/btn relative flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[11px] font-black tracking-[0.2em] uppercase hover:bg-orange-600/20 hover:border-orange-500 transition-all duration-500 disabled:opacity-50 overflow-hidden"
                            >
                              <CheckCircle size={14} strokeWidth={2.5} className="relative z-10" />
                              <span className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">Authenticate</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/10 to-orange-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                            
                            <button
                              onClick={() => handleReject(artwork.id)}
                              disabled={!!actionLoading}
                              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-500 disabled:opacity-50"
                              title="Decline Protocol"
                            >
                              <XCircle size={18} strokeWidth={1} />
                            </button>

                            <Link
                              href={`/gallery?artwork=${artwork.id}`}
                              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-600 hover:text-white hover:bg-white/[0.06] transition-all duration-500"
                              title="Inspect Essence"
                            >
                              <Eye size={18} strokeWidth={1} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
          }
        </div>
      </div>
    </DashboardLayout>
  )
}
