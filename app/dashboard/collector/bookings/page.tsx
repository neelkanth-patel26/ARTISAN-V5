'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function CollectorBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    try {
      const user = getCurrentUser()
      if (!user?.user_id) return

      const { data, error } = await supabase.rpc('get_user_bookings', { p_user_id: user.user_id })
      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-500" />
      case 'cancelled': return <XCircle size={16} className="text-red-500" />
      case 'completed': return <CheckCircle size={16} className="text-blue-500" />
      default: return <AlertCircle size={16} className="text-amber-500" />
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

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="My Bookings" description="View and manage your exhibition visit bookings" />

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Book a visit to an exhibition to see your bookings here"
          />
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-neutral-900 rounded-xl border border-neutral-800 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{booking.exhibition_title || 'Exhibition Visit'}</h3>
                    <p className="text-sm text-neutral-400">Booking ID: {booking.id.slice(0, 8)}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-amber-500" />
                      <p className="text-xs text-neutral-400">Date</p>
                    </div>
                    <p className="text-sm text-white">{new Date(booking.visit_date).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={14} className="text-amber-500" />
                      <p className="text-xs text-neutral-400">Time</p>
                    </div>
                    <p className="text-sm text-white">{booking.visit_time}</p>
                  </div>

                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users size={14} className="text-amber-500" />
                      <p className="text-xs text-neutral-400">Visitors</p>
                    </div>
                    <p className="text-sm text-white">{booking.number_of_visitors}</p>
                  </div>

                  <div className="bg-neutral-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-amber-500" />
                      <p className="text-xs text-neutral-400">Status</p>
                    </div>
                    <p className="text-sm text-white">{booking.payment_status || 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-400 mb-1">Visitor Name</p>
                      <p className="text-white">{booking.visitor_name}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 mb-1">Contact</p>
                      <p className="text-white">{booking.visitor_phone}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
