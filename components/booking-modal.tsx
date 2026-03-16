'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Users, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

const inputClass =
  'w-full bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-600/50 focus:bg-white/[0.05] transition-all'

const labelClass = 'block text-[9px] tracking-[0.4em] text-neutral-500 uppercase font-black mb-2 ml-1'

export function BookingModal({ exhibition, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorEmail: '',
    visitorPhone: '',
    visitDate: '',
    visitTime: '19:00',
    numberOfVisitors: 1,
    specialRequirements: '',
  })
  const [processing, setProcessing] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    setViewportHeight(window.innerHeight)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const set = (key: string, val: any) => setFormData((p) => ({ ...p, [key]: val }))

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
        status: 'pending',
      })
      if (error) throw error
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-600/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-white text-sm">Booking confirmed</p>
            <p className="text-xs text-neutral-400">We'll reach out with details</p>
          </div>
        </div>,
        { style: { background: '#0a0a0a', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '16px', padding: '14px' } }
      )
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit booking')
    } finally {
      setProcessing(false)
    }
  }

  const times = [
    ['10:00', '10:00 AM'], ['11:00', '11:00 AM'], ['12:00', '12:00 PM'],
    ['13:00', '1:00 PM'],  ['14:00', '2:00 PM'],  ['15:00', '3:00 PM'],
    ['16:00', '4:00 PM'],  ['17:00', '5:00 PM'],  ['18:00', '6:00 PM'],
    ['19:00', '7:00 PM'],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: viewportHeight ? `${viewportHeight * 0.95}px` : '95vh' }}
        className="relative bg-neutral-950 border border-white/5 rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex flex-col"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-600/5 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between p-6 sm:p-8 border-b border-white/5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-amber-600" />
              <span className="text-[9px] tracking-[0.5em] text-amber-600/70 font-black uppercase">Reserve Your Visit</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-tight"
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              {exhibition.title}
            </h2>
            <p className="text-xs text-neutral-500 font-light">{exhibition.location} · {exhibition.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white/5 border border-white/5 text-neutral-500 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-4 group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-6 sm:p-8 space-y-5">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text" required placeholder="Your name"
                  value={formData.visitorName}
                  onChange={(e) => set('visitorName', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email" required placeholder="your@email.com"
                  value={formData.visitorEmail}
                  onChange={(e) => set('visitorEmail', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Phone + Visitors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel" required placeholder="+91 00000 00000"
                  value={formData.visitorPhone}
                  onChange={(e) => set('visitorPhone', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Visitors</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => set('numberOfVisitors', Math.max(1, formData.numberOfVisitors - 1))}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 text-white text-lg hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
                  >−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-light text-white">{formData.numberOfVisitors}</span>
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-black">
                      {formData.numberOfVisitors === 1 ? 'person' : 'people'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set('numberOfVisitors', Math.min(10, formData.numberOfVisitors + 1))}
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 text-white text-lg hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1.5"><Calendar size={9} />Visit Date</span>
                </label>
                <input
                  type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.visitDate}
                  onChange={(e) => set('visitDate', e.target.value)}
                  className={inputClass + ' [color-scheme:dark]'}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1.5"><Clock size={9} />Visit Time</span>
                </label>
                <select
                  required
                  value={formData.visitTime}
                  onChange={(e) => set('visitTime', e.target.value)}
                  className={inputClass + ' [color-scheme:dark]'}
                >
                  {times.map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <label className={labelClass}>Special Requirements</label>
              <textarea
                rows={3}
                value={formData.specialRequirements}
                onChange={(e) => set('specialRequirements', e.target.value)}
                placeholder="Accessibility needs, dietary preferences, etc."
                className={inputClass + ' resize-none'}
              />
            </div>

            {/* Summary pill */}
            {formData.visitDate && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-amber-600/5 border border-amber-600/15"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600/15 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-medium truncate">
                    {new Date(formData.visitDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}{times.find(([v]) => v === formData.visitTime)?.[1]}
                  </p>
                  <p className="text-[10px] text-amber-600/60 font-black uppercase tracking-widest">
                    {formData.numberOfVisitors} {formData.numberOfVisitors === 1 ? 'visitor' : 'visitors'} · {exhibition.location}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/8 text-neutral-400 text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-[2] py-4 rounded-2xl bg-amber-600 text-black text-[10px] font-black tracking-[0.3em] uppercase hover:bg-amber-500 transition-all shadow-[0_10px_30px_-5px_rgba(217,119,6,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {processing ? 'Reserving…' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
