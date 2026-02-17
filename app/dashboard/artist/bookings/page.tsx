'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, LoadingSpinner, EmptyState } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function ArtistBookings() {
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

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="My Bookings" description="View your exhibition visit bookings" />

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Your exhibition visit bookings will appear here"
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
                <h3 className="text-lg font-medium text-white mb-2">{booking.exhibition_title || 'Exhibition Visit'}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-400 mb-1">Date</p>
                    <p className="text-white">{new Date(booking.visit_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 mb-1">Time</p>
                    <p className="text-white">{booking.visit_time}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 mb-1">Visitors</p>
                    <p className="text-white">{booking.number_of_visitors}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400 mb-1">Status</p>
                    <p className="text-white capitalize">{booking.status}</p>
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
