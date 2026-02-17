'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Calendar, CheckCircle, XCircle, Users, Clock, Mail, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
      <div className="space-y-4 p-4 lg:p-6">
        <PageHeader title="Bookings Management" description="Manage exhibition visit bookings" />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-neutral-900 rounded-xl border border-neutral-800 p-4"
                >
                  <p className="text-xs text-neutral-400 mb-1">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    filter === status
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors"
                >
                  <div className="bg-gradient-to-br from-amber-600/10 to-transparent p-5 border-b border-neutral-800">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white leading-tight mb-1">{(booking.exhibitions as any)?.title || 'Exhibition Visit'}</h3>
                        <p className="text-xs text-neutral-500">#{booking.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Calendar size={14} className="text-amber-500" />
                          <span className="text-xs text-neutral-400">Date</span>
                        </div>
                        <p className="text-sm font-medium text-white">{new Date(booking.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="bg-neutral-800/50 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock size={14} className="text-amber-500" />
                          <span className="text-xs text-neutral-400">Time</span>
                        </div>
                        <p className="text-sm font-medium text-white">{booking.visit_time}</p>
                      </div>
                    </div>

                    <div className="bg-neutral-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Users size={14} className="text-amber-500" />
                        <span className="text-xs text-neutral-400">Visitors</span>
                      </div>
                      <p className="text-sm font-medium text-white">{booking.number_of_visitors} {booking.number_of_visitors === 1 ? 'person' : 'people'}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Visitor</p>
                        <p className="text-sm font-medium text-white">{booking.visitor_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Contact</p>
                        <p className="text-xs text-neutral-400 truncate">{booking.visitor_email}</p>
                        <p className="text-xs text-neutral-400">{booking.visitor_phone}</p>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <CheckCircle size={16} />
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="flex-1 px-3 py-2.5 bg-neutral-800 text-neutral-300 rounded-xl hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
