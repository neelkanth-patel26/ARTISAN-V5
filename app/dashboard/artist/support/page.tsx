'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, DollarSign, TrendingUp, Users, Sparkles, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArtistSupport() {
  const [supports, setSupports] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, count: 0, thisMonth: 0, uniqueSupporters: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupports()
  }, [])

  const loadSupports = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) { setLoading(false); return }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('artist_id', user.user_id)
      .eq('transaction_type', 'support')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const buyerIds = [...new Set(data.map(t => t.buyer_id).filter(Boolean))]
      let buyerMap: Record<string, any> = {}

      if (buyerIds.length > 0) {
        const { data: buyers } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .in('id', buyerIds)
        buyers?.forEach(b => { buyerMap[b.id] = b })
      }

      const enriched = data.map(t => ({ ...t, buyer: buyerMap[t.buyer_id] }))
      setSupports(enriched)

      const total = enriched.reduce((sum, t) => sum + Number(t.artist_earnings || 0), 0)
      const thisMonth = enriched
        .filter(t => new Date(t.created_at).getMonth() === new Date().getMonth() &&
                     new Date(t.created_at).getFullYear() === new Date().getFullYear())
        .reduce((sum, t) => sum + Number(t.artist_earnings || 0), 0)

      setStats({ total, count: enriched.length, thisMonth, uniqueSupporters: buyerIds.length })
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen">
        {/* Atmospheric Sentinel Glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Community</span>
              </div>
              <Sparkles size={14} className="text-neutral-700" />
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Support <span className="text-neutral-500 italic">Received</span>
            </h1>
            <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
              Contributions from your community of supporters.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Support', value: `₹${stats.total.toLocaleString()}`, icon: DollarSign, color: 'text-orange-400', glow: 'bg-orange-500/5' },
                  { label: 'Support Count', value: stats.count, icon: Heart, color: 'text-rose-400', glow: 'bg-rose-500/5' },
                  { label: 'This Month', value: `₹${stats.thisMonth.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400', glow: 'bg-emerald-500/5' },
                  { label: 'Unique Supporters', value: stats.uniqueSupporters, icon: Users, color: 'text-blue-400', glow: 'bg-blue-500/5' },
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

              {/* Section Header */}
              <div className="flex items-end justify-between px-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Supporter Registry</p>
                  <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>All <span className="text-neutral-500">Contributions</span></h2>
                </div>
                {supports.length > 0 && (
                  <span className="text-[10px] text-neutral-600 font-black tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{supports.length} transactions</span>
                )}
              </div>

              {/* Content */}
              {supports.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 rounded-[3.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl flex flex-col items-center gap-8 text-center"
                >
                  <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                    <Heart size={32} className="text-neutral-700" strokeWidth={1} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>No Support Yet</h3>
                    <p className="text-[13px] text-neutral-500 font-light max-w-xs">When your community supports you, their contributions will appear here.</p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {supports.map((transaction, i) => (
                      <motion.div
                        key={transaction.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                        className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] overflow-hidden backdrop-blur-3xl hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px] p-10"
                      >
                        {/* Subtle hover glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.03] blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center gap-6">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                              {transaction.buyer?.avatar_url ? (
                                <img
                                  src={transaction.buyer.avatar_url}
                                  alt={transaction.buyer.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-light text-neutral-500" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  {transaction.buyer?.full_name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                              <Heart size={12} className="text-rose-400" fill="currentColor" />
                            </div>
                          </div>

                          {/* Name & Date */}
                          <div className="space-y-1">
                            <h3 className="text-xl font-light text-white group-hover:text-orange-400 transition-colors duration-700" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {transaction.buyer?.full_name || 'Anonymous'}
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-600 font-black tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>
                              <Calendar size={10} />
                              <span>{new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="w-full pt-6 border-t border-white/[0.05] space-y-2">
                            <p className="text-[9px] text-orange-500/60 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Contribution</p>
                            <p className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              ₹{Number(transaction.artist_earnings || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-neutral-600 font-black tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>
                              Platform fee: ₹{Number(transaction.platform_fee || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
