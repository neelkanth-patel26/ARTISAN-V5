'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Calendar, MapPin, Clock, Users, CheckCircle2, XCircle, AlertCircle, Hourglass, ExternalLink, Ticket } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS = {
  confirmed: { label: 'Confirmed', icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', icon: CheckCircle2, cls: 'text-blue-400   bg-blue-500/10   border-blue-500/20',    dot: 'bg-blue-400'    },
  cancelled: { label: 'Cancelled', icon: XCircle,      cls: 'text-red-400    bg-red-500/10    border-red-500/20',     dot: 'bg-red-400'     },
  pending:   { label: 'Pending',   icon: Hourglass,    cls: 'text-amber-400  bg-amber-500/10  border-amber-500/20',   dot: 'bg-amber-400'   },
} as const

type StatusKey = keyof typeof STATUS

export default function CollectorBookings() {
  const [bookings, setBookings]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState<string | null>(null)
  const [filter, setFilter]           = useState<StatusKey | 'all'>('all')

  useEffect(() => { loadBookings() }, [])

  const loadBookings = async () => {
    try {
      const user = getCurrentUser()
      if (!user?.user_id) return
      const { data, error } = await supabase.rpc('get_user_bookings', { p_user_id: user.user_id })
      if (error) throw error
      setBookings(data || [])
      if (data?.length) setExpanded(data[0].id)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const counts = {
    all:       bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.visit_date) >= new Date()).length

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-5 p-4 lg:p-8">
        <PageHeader title="My Bookings" description="View and manage your exhibition visit bookings" />

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: counts.all,       color: 'text-white'        },
            { label: 'Upcoming', value: upcoming,          color: 'text-amber-400'    },
            { label: 'Confirmed',value: counts.confirmed,  color: 'text-emerald-400'  },
            { label: 'Completed',value: counts.completed,  color: 'text-blue-400'     },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3.5"
            >
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase mb-1.5">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map(f => {
            const isActive = filter === f
            const s = f !== 'all' ? STATUS[f] : null
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? 'bg-amber-600 text-white border-amber-600 shadow-[0_0_12px_rgba(217,119,6,0.3)]'
                    : 'bg-neutral-900/40 text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-700'
                }`}
              >
                {s && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                {f === 'all' ? `All (${counts.all})` : `${STATUS[f].label} (${counts[f]})`}
              </button>
            )
          })}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10">
            <EmptyState
              icon={Calendar}
              title="No bookings found"
              description={filter === 'all' ? 'Book a visit to an exhibition to see your bookings here' : `No ${filter} bookings`}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking, i) => {
              const s         = STATUS[booking.status as StatusKey] ?? STATUS.pending
              const Icon      = s.icon
              const isOpen    = expanded === booking.id
              const visitDate = new Date(booking.visit_date)
              const isPast    = visitDate < new Date()
              const dateStr   = visitDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden"
                >
                  {/* ── Card header — always visible ── */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : booking.id)}
                    className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Date block */}
                    <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center border ${
                      isPast ? 'bg-neutral-800/40 border-neutral-700/40' : 'bg-amber-600/10 border-amber-600/20'
                    }`}>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${isPast ? 'text-neutral-500' : 'text-amber-500'}`}>
                        {visitDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className={`text-xl font-light leading-none ${isPast ? 'text-neutral-400' : 'text-white'}`}
                        style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {visitDate.getDate()}
                      </span>
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-light text-white group-hover:text-amber-50 transition-colors truncate"
                          style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {booking.exhibition_title || 'Exhibition Visit'}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                          <Clock size={10} /> {booking.visit_time}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                          <Users size={10} /> {booking.number_of_visitors} {booking.number_of_visitors === 1 ? 'visitor' : 'visitors'}
                        </span>
                        <span className="text-[9px] text-neutral-700 font-black tracking-wider">#{booking.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-black tracking-[0.3em] uppercase shrink-0 ${s.cls}`}>
                      <Icon size={11} />
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                  </button>

                  {/* ── Expanded detail ── */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-neutral-800/60 p-4 sm:p-5 space-y-4">

                          {/* Info grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { icon: Calendar, label: 'Date',    value: dateStr },
                              { icon: Clock,    label: 'Time',    value: booking.visit_time },
                              { icon: Users,    label: 'Visitors',value: booking.number_of_visitors },
                              { icon: MapPin,   label: 'Payment', value: booking.payment_status || 'N/A' },
                            ].map(item => (
                              <div key={item.label} className="rounded-xl border border-neutral-800 bg-neutral-800/20 p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <item.icon size={11} className="text-amber-600/60" />
                                  <p className="text-[9px] text-neutral-600 tracking-[0.3em] font-black uppercase">{item.label}</p>
                                </div>
                                <p className="text-sm text-white font-light">{item.value}</p>
                              </div>
                            ))}
                          </div>

                          {/* Visitor info */}
                          <div className="rounded-xl border border-neutral-800 bg-neutral-800/20 p-4">
                            <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase mb-3">Visitor Details</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <p className="text-[9px] text-neutral-600 tracking-wider uppercase mb-1">Name</p>
                                <p className="text-sm text-white font-light">{booking.visitor_name || '—'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-neutral-600 tracking-wider uppercase mb-1">Contact</p>
                                <p className="text-sm text-white font-light">{booking.visitor_phone || '—'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Ticket strip */}
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-neutral-700/60 bg-neutral-800/10 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Ticket size={14} className="text-amber-600/50" />
                              <span className="text-[10px] text-neutral-500 font-black tracking-[0.3em] uppercase">Booking Ref</span>
                            </div>
                            <span className="text-[11px] text-neutral-400 font-black tracking-widest">{booking.id.slice(0, 16).toUpperCase()}</span>
                            <button
                              onClick={() => window.location.href = '/exhibitions'}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all text-[10px] font-black tracking-[0.3em] uppercase"
                            >
                              <ExternalLink size={11} /> View
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
