'use client'

import { useState } from 'react'
import { X, Calendar, Users, CreditCard } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

interface BookingModalProps {
  exhibition: {
    id: string | number
    title: string
    artist: string
    date: string
    location: string
  }
  onClose: () => void
}

export function BookingModal({ exhibition, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitDate: '',
    visitTime: '19:00',
    numberOfVisitors: 1,
    specialRequirements: ''
  })
  const [processing, setProcessing] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useState(() => {
    setViewportHeight(window.innerHeight)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const user = getCurrentUser()
      if (!user) {
        toast.error('Please sign in to book a visit')
        return
      }

      const { error } = await supabase.from('visit_bookings').insert({
        user_id: user.user_id,
        exhibition_id: typeof exhibition.id === 'string' ? exhibition.id : null,
        visitor_name: formData.visitorName,
        visitor_email: formData.visitorEmail,
        visitor_phone: formData.visitorPhone,
        visit_date: formData.visitDate,
        visit_time: formData.visitTime,
        number_of_visitors: formData.numberOfVisitors,
        special_requirements: formData.specialRequirements || null,
        status: 'pending'
      })

      if (error) throw error

      toast.success('Booking submitted successfully!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit booking')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div style={{ height: viewportHeight ? `${viewportHeight * 0.9}px` : '90vh' }} className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-2xl w-full overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light text-white mb-1">Book Visit</h2>
            <p className="text-sm text-neutral-400">{exhibition.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Full Name *</label>
              <input
                type="text"
                required
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.visitorEmail}
                onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Phone *</label>
              <input
                type="tel"
                required
                value={formData.visitorPhone}
                onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Number of Visitors *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.numberOfVisitors}
                onChange={(e) => setFormData({ ...formData, numberOfVisitors: parseInt(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Visit Date *</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Visit Time *</label>
              <select
                required
                value={formData.visitTime}
                onChange={(e) => setFormData({ ...formData, visitTime: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none"
              >
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-400 mb-2">Special Requirements</label>
            <textarea
              rows={3}
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-amber-600 focus:outline-none resize-none"
              placeholder="Any special requirements or accessibility needs..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Submitting...' : 'Submit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
