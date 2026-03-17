'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { DollarSign, TrendingUp, ShoppingBag, ShieldCheck, User, Phone, Calendar, Hash, ChevronRight, CreditCard, Image as ImageIcon, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArtistEarnings() {
  const [transactions, setTransactions]       = useState<any[]>([])
  const [loading, setLoading]                 = useState(true)
  const [selectedTx, setSelectedTx]           = useState<string | null>(null)

  useEffect(() => { loadEarnings() }, [])

  const loadEarnings = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data } = await supabase
      .from('transactions')
      .select('*, artworks(title, image_url), buyer:users!buyer_id(full_name, email, phone)')
      .eq('artist_id', user.user_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    setTransactions(data || [])
    setLoading(false)
  }

  const totalEarnings  = transactions.reduce((s, t) => s + Number(t.artist_earnings ?? 0), 0)
  const totalSales     = transactions.length
  const platformFees   = transactions.reduce((s, t) => s + Number(t.platform_fee ?? 0), 0)
  const upiPending     = transactions.filter(t => t.payment_method === 'upi').reduce((s, t) => s + Number(t.platform_fee ?? 0), 0)

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen">

        {/* Atmospheric Sentinel — identical to artist dashboard */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Fiscal Registry</span>
              </div>
              <Sparkles size={14} className="text-neutral-700" />
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Earnings <span className="text-neutral-500 italic">Ledger</span>
            </h1>
            <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
              An immutable record of your creative acquisitions and revenue flow.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Primary stat vectors — same as dashboard */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Earnings',    value: `₹${totalEarnings.toLocaleString()}`, icon: DollarSign,  color: 'text-orange-400', glow: 'bg-orange-500/5'  },
                  { label: 'Total Sales',        value: totalSales,                           icon: ShoppingBag, color: 'text-rose-400',   glow: 'bg-rose-500/5'    },
                  { label: 'Platform Fees',      value: `₹${platformFees.toLocaleString()}`,  icon: TrendingUp,  color: 'text-cyan-400',   glow: 'bg-cyan-500/5'    },
                  { label: 'UPI Pending Tax',    value: `₹${upiPending.toLocaleString()}`,    icon: ShieldCheck, color: 'text-blue-400',   glow: 'bg-blue-500/5'    },
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
                      <p className="text-3xl font-light text-white leading-none">
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Transactions list */}
              <section className="space-y-8">
                <div className="flex items-end justify-between px-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Audit Trail</p>
                    <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      Recent <span className="text-neutral-500">Transactions</span>
                    </h2>
                  </div>
                  {upiPending > 0 && (
                    <div className="px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[9px] text-orange-400 font-black uppercase tracking-widest">₹{upiPending.toFixed(0)} pending</span>
                    </div>
                  )}
                </div>

                {transactions.length === 0 ? (
                  <div className="py-32 rounded-[3.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl flex flex-col items-center gap-8 text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <CreditCard size={32} className="text-neutral-700" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>No Transactions Yet</h3>
                      <p className="text-[13px] text-neutral-500 font-light max-w-xs">Your earnings will appear here once collectors acquire your work.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                      {transactions.map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                          onClick={() => setSelectedTx(selectedTx === tx.id ? null : tx.id)}
                          className={`group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] overflow-hidden backdrop-blur-3xl cursor-pointer hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px] ${selectedTx === tx.id ? 'border-orange-500/20 bg-neutral-900/60' : ''}`}
                        >
                          {/* Top section */}
                          <div className="p-10 flex items-start justify-between gap-6">
                            {/* Artwork thumbnail */}
                            <div className="relative h-20 w-20 rounded-[1.4rem] overflow-hidden shrink-0 border border-white/[0.05] bg-neutral-800 group-hover:border-orange-500/20 transition-all duration-700">
                              {tx.artworks?.image_url ? (
                                <img
                                  src={tx.artworks.image_url}
                                  alt={tx.artworks.title}
                                  className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon size={20} className="text-neutral-700" strokeWidth={1} />
                                </div>
                              )}
                            </div>

                            {/* Earnings */}
                            <div className="text-right">
                              <p className="text-3xl font-light text-white group-hover:text-orange-400 transition-colors duration-700 leading-none">
                                +₹{Number(tx.artist_earnings).toLocaleString()}
                              </p>
                              <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-black mt-1">
                                gross ₹{Number(tx.amount).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Bottom section */}
                          <div className="px-10 pb-10 pt-4 border-t border-white/[0.03] space-y-4">
                            <div className="space-y-1">
                              <h3 className="text-xl font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                {tx.artworks?.title || 'Unknown Artwork'}
                              </h3>
                              <div className="flex items-center gap-3">
                                <div className="h-px w-4 bg-orange-500/20" />
                                <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                                  completed
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={11} className="text-neutral-700" />
                                  {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Hash size={11} className="text-neutral-700" />
                                  {tx.transaction_code?.slice(0, 10)}
                                </div>
                              </div>
                              <div className={`p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all duration-500 ${selectedTx === tx.id ? 'rotate-90 text-orange-400 border-orange-500/30' : ''}`}>
                                <ChevronRight size={14} strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          <AnimatePresence>
                            {selectedTx === tx.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="mx-10 mb-10 pt-8 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-8">

                                  {/* Buyer */}
                                  <div className="space-y-4">
                                    <p className="text-[9px] text-orange-500/60 font-black uppercase tracking-[0.4em]" style={{ fontFamily: 'Oughter, serif' }}>Buyer</p>
                                    <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.05] space-y-4">
                                      <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                                          <User size={16} className="text-orange-400/60" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-base font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{tx.buyer?.full_name}</p>
                                          <p className="text-[9px] text-neutral-600 font-black tracking-widest uppercase truncate" style={{ fontFamily: 'Oughter, serif' }}>{tx.buyer?.email}</p>
                                        </div>
                                      </div>
                                      {tx.buyer?.phone && (
                                        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05] text-[10px] text-neutral-500">
                                          <Phone size={11} className="text-neutral-700" />
                                          <span className="tracking-widest">{tx.buyer.phone}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment detail */}
                                  <div className="space-y-4">
                                    <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.4em]" style={{ fontFamily: 'Oughter, serif' }}>Payment Detail</p>
                                    <div className="space-y-1">
                                      {[
                                        { label: 'Method',      value: tx.payment_method },
                                        { label: 'Platform Fee', value: `₹${Number(tx.platform_fee).toLocaleString()}` },
                                        { label: 'Status',      value: 'Immutable', highlight: true },
                                      ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                                          <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{row.label}</span>
                                          <span className={`text-[9px] font-black uppercase tracking-widest ${row.highlight ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-300'}`}>
                                            {row.highlight && <ShieldCheck size={10} />}{row.value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
