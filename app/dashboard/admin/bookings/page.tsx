'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Calendar, CheckCircle, XCircle, Users, Clock, Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_bookings')
        .select('*, exhibitions(title), users(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('visit_bookings')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      toast.success(`Booking ${status}`)
      loadBookings()
    } catch (error) {
      toast.error('Failed to update booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  }

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter)

  const stats = [
    { label: 'Total', value: bookings.length, color: 'text-neutral-400' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'text-amber-400' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'text-green-400' },
    { label: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: 'text-red-400' },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[35%] h-[35%] bg-orange-700/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
          {/* ── Registry Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-400">Visitor Protocols</span>
                </div>
                <Users size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Bookings <span className="text-neutral-500">Registry</span>
              </h1>
              <p className="text-[14px] text-neutral-500 font-light tracking-wide max-w-md">
                Managing private viewings and high-intelligence visitor engagements.
              </p>
            </div>

            {/* Metrics Nucleus */}
            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl group hover:border-orange-500/20 transition-all duration-500"
                  >
                    <p className="text-[9px] tracking-[0.3em] uppercase font-black text-neutral-600 mb-1 group-hover:text-neutral-400 transition-colors">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-light ${stat.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>
                      {stat.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {loading ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] animate-pulse" />)}
             </div>
          ) : (
            <div className="space-y-10">
              {/* Protocol Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl">
                  {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`relative px-5 py-2.5 rounded-xl text-[11px] font-light tracking-[0.2em] uppercase transition-all duration-500 ${
                        filter === status
                          ? 'bg-orange-500/10 text-orange-400 shadow-[0_0_20px_rgba(234,88,12,0.1)]'
                          : 'text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.02]'
                      }`}
                      style={{ fontFamily: 'Oughter, serif' }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIP Guest List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredBookings.map((booking, i) => (
                    <motion.div
                      key={booking.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                      className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl overflow-hidden hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                    >
                      {/* Atmospheric Accent */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/[0.01] blur-[60px] rounded-full group-hover:bg-orange-500/[0.03] transition-all duration-1000" />
                      
                      <div className="p-8 space-y-8 relative z-10 h-full flex flex-col">
                        {/* Header Protocol */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-500/50">VIP Observation</p>
                            <h3 className="text-xl font-light text-white group-hover:text-orange-400 transition-colors duration-700" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {(booking.exhibitions as any)?.title || 'Private Viewing'}
                            </h3>
                            <p className="text-[10px] text-neutral-600 font-black tracking-widest uppercase">ID: {booking.id.slice(0, 8)}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-700 ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </div>
                        </div>

                        {/* Scheduling Matrix */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-all duration-700">
                             <div className="flex items-center gap-2 mb-2">
                               <Calendar size={12} className="text-orange-500/40" />
                               <span className="text-[9px] tracking-[0.2em] uppercase font-black text-neutral-600">Protocol Date</span>
                             </div>
                             <p className="text-[14px] text-white/90 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                               {new Date(booking.visit_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                             </p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] group-hover:bg-white/[0.04] transition-all duration-700">
                             <div className="flex items-center gap-2 mb-2">
                               <Clock size={12} className="text-orange-500/40" />
                               <span className="text-[9px] tracking-[0.2em] uppercase font-black text-neutral-600">Protocol Time</span>
                             </div>
                             <p className="text-[14px] text-white/90 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                               {booking.visit_time}
                             </p>
                          </div>
                        </div>

                        {/* Visitor Intelligence */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-orange-600/10 border border-orange-600/20 text-orange-400 text-sm font-black" style={{ fontFamily: 'Oughter, serif' }}>
                              {booking.visitor_name?.charAt(0)}
                            </div>
                            <div className="flex-1">
                               <p className="text-[11px] tracking-[0.2em] uppercase font-black text-neutral-600 mb-0.5">Primary Guest</p>
                               <p className="text-[15px] text-white/90 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{booking.visitor_name}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[11px] tracking-[0.2em] uppercase font-black text-neutral-600 mb-0.5">Ensemble</p>
                               <div className="flex items-center justify-end gap-1.5 text-white/90 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                 <Users size={12} className="text-orange-500/40" />
                                 <span>{booking.number_of_visitors} Guests</span>
                               </div>
                            </div>
                          </div>

                          <div className="pt-2 grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                   <Mail size={10} className="text-orange-500" />
                                   <span className="text-[9px] uppercase font-black tracking-tight text-neutral-600">Terminal</span>
                                </div>
                                <p className="text-[11px] text-neutral-400 truncate font-light tracking-wide">{booking.visitor_email}</p>
                             </div>
                             <div className="space-y-1">
                                <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                   <Phone size={10} className="text-orange-500" />
                                   <span className="text-[9px] uppercase font-black tracking-tight text-neutral-600">Interface</span>
                                </div>
                                <p className="text-[11px] text-neutral-400 font-light tracking-wide">{booking.visitor_phone}</p>
                             </div>
                          </div>
                        </div>

                        {/* Curatorial Actions */}
                        {booking.status === 'pending' && (
                          <div className="mt-auto pt-8 flex gap-3">
                            <button
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              className="flex-1 group/btn relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[11px] font-black tracking-[0.3em] uppercase hover:bg-orange-600/20 hover:border-orange-500 transition-all duration-500 overflow-hidden"
                            >
                              <CheckCircle size={14} className="relative z-10" />
                              <span className="relative z-10">Confirm</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/0 via-orange-600/10 to-orange-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-neutral-600 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-500 flex items-center justify-center"
                              title="Terminate Protocol"
                            >
                              <XCircle size={16} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(booking.id, 'completed')}
                            className="mt-auto pt-8 w-full group/btn relative flex items-center justify-center gap-3 px-8 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-[0.4em] uppercase hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Seal Protocol
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredBookings.length === 0 && (
                 <div className="py-32 flex flex-col items-center gap-6 text-center">
                    <div className="w-20 h-20 rounded-[2rem] bg-orange-600/5 border border-orange-600/10 flex items-center justify-center shadow-2xl">
                      <Clock size={32} className="text-orange-500/30" strokeWidth={1} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>Quiet Equilibrium</p>
                      <p className="text-[13px] text-neutral-600 font-light">No visitor protocols found in this specific matrix segment.</p>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
