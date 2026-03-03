'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AuthPromptModal } from '@/components/auth-prompt-modal'
import { BookingModal } from '@/components/booking-modal'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react'

type ExhibitionItem = {
  id: number | string
  title: string
  artist: string
  image: string
  date: string
  location: string
  time: string
  status: string
  visitors: string
  description: string
}

function ExhibitionCard({ exhibition, index, onBookVisit }: { exhibition: ExhibitionItem; index: number; onBookVisit?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + (index % 20) * 0.1 }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden bg-neutral-900/50 border border-neutral-800/50 rounded-2xl hover:border-amber-600/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-amber-600/10"
    >
      <div className="relative h-72 overflow-hidden">
        <img
          src={exhibition.image}
          alt={exhibition.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-4 py-1.5 text-xs tracking-[0.2em] font-light backdrop-blur-md rounded-full ${exhibition.status === 'Current'
              ? 'bg-amber-600/90 text-white border border-amber-500'
              : 'bg-neutral-900/80 text-amber-600 border border-amber-600/50'
            }`}>
            {exhibition.status}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl md:text-3xl font-light text-white mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>
            {exhibition.title}
          </h2>
          <p className="text-amber-600/80 text-sm tracking-wide font-light">by {exhibition.artist}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-neutral-400 text-sm leading-relaxed font-light">
          {exhibition.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-800/30 rounded-xl p-3 border border-neutral-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-amber-600" />
              <p className="text-neutral-500 text-[10px] tracking-wider uppercase font-light">Date</p>
            </div>
            <p className="text-neutral-300 text-xs font-light">{exhibition.date}</p>
          </div>
          <div className="bg-neutral-800/30 rounded-xl p-3 border border-neutral-700/30">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-amber-600" />
              <p className="text-neutral-500 text-[10px] tracking-wider uppercase font-light">Location</p>
            </div>
            <p className="text-neutral-300 text-xs font-light">{exhibition.location}</p>
          </div>
          <div className="bg-neutral-800/30 rounded-xl p-3 border border-neutral-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-amber-600" />
              <p className="text-neutral-500 text-[10px] tracking-wider uppercase font-light">Hours</p>
            </div>
            <p className="text-neutral-300 text-xs font-light">{exhibition.time}</p>
          </div>
          <div className="bg-neutral-800/30 rounded-xl p-3 border border-neutral-700/30">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-amber-600" />
              <p className="text-neutral-500 text-[10px] tracking-wider uppercase font-light">Visitors</p>
            </div>
            <p className="text-neutral-300 text-xs font-light">{exhibition.visitors}</p>
          </div>
        </div>

        <button type="button" onClick={onBookVisit} className="w-full mt-4 py-3 bg-amber-600 border border-amber-600 text-white rounded-xl text-xs tracking-[0.2em] font-light hover:bg-amber-500 transition-all duration-300">
          BOOK VISIT
        </button>
      </div>
    </motion.div>
  )
}

export default function ExhibitionsPage() {
  const [realExhibitions, setRealExhibitions] = useState<ExhibitionItem[]>([])
  const [realLoading, setRealLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<ExhibitionItem | null>(null)

  const handleBookVisit = (exhibition: ExhibitionItem) => {
    if (!getCurrentUser()) {
      setShowAuthPrompt(true)
    } else {
      setSelectedExhibition(exhibition)
    }
  }

  useEffect(() => {
    async function loadRealExhibitions() {
      try {
        const { data, error } = await supabase.rpc('get_all_exhibitions')
        if (error) throw error
        const list = (data || []).map((e: { id: string; title: string; description: string; location: string; image_url: string; start_date: string; end_date: string; status: string; hours?: string; artist?: string }) => ({
          id: e.id,
          title: e.title,
          artist: e.artist ?? '—',
          image: e.image_url ?? 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=90',
          date: [e.start_date, e.end_date].filter(Boolean).map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).join(' – ') || 'TBA',
          location: e.location ?? '—',
          time: e.hours ?? '—',
          status: e.status === 'active' ? 'Current' : e.status === 'upcoming' ? 'Upcoming' : e.status === 'completed' ? 'Completed' : e.status,
          visitors: '—',
          description: e.description ?? '',
        }))
        setRealExhibitions(list)
      } catch {
        setRealExhibitions([])
      } finally {
        setRealLoading(false)
      }
    }
    loadRealExhibitions()
  }, [])

  const stats = [
    { label: 'Active Shows', value: '12', icon: Ticket, color: 'amber' },
    { label: 'Monthly Visitors', value: '8.5K', icon: Users, color: 'amber' },
    { label: 'Exhibitions', value: '45+', icon: Calendar, color: 'amber' },
  ]

  const exhibitions = [
    {
      id: 1,
      title: 'Modern Perspectives',
      artist: 'Neelkanth Patel',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&q=90',
      date: 'Aug 14, 2025',
      location: 'Main Gallery',
      time: '07:00 PM',
      status: 'Completed',
      visitors: '2.3K',
      description: 'A collection of contemporary artworks exploring modern themes and perspectives.'
    },
    {
      id: 2,
      title: 'Digital Dreams',
      artist: 'Neelkanth Patel',
      image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop&q=90',
      date: 'Feb 1 - Apr 15, 2024',
      location: 'East Wing',
      time: '10:00 AM - 8:00 PM',
      status: 'Current',
      visitors: '1.8K',
      description: 'Immersive digital art installations pushing the boundaries of technology and creativity.'
    },
    {
      id: 3,
      title: 'Sculptural Forms',
      artist: 'Urmi Thakkar',
      image: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=800&h=600&fit=crop&q=90',
      date: 'Mar 10 - May 20, 2024',
      location: 'Sculpture Garden',
      time: '9:00 AM - 7:00 PM',
      status: 'Upcoming',
      visitors: 'TBA',
      description: 'Exploring three-dimensional art through innovative sculptural techniques.'
    },
    {
      id: 4,
      title: 'Abstract Expressions',
      artist: 'Jay Shah',
      image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop&q=90',
      date: 'Apr 5 - Jun 30, 2024',
      location: 'West Gallery',
      time: '10:00 AM - 6:00 PM',
      status: 'Upcoming',
      visitors: 'TBA',
      description: 'Bold abstract paintings that challenge perception and evoke emotion.'
    },
    {
      id: 5,
      title: 'Street Stories',
      artist: 'Urban Collective',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&q=90',
      date: 'May 1 - Jul 15, 2024',
      location: 'Lower Level',
      time: '11:00 AM - 9:00 PM',
      status: 'Upcoming',
      visitors: 'TBA',
      description: 'Street art and graffiti culture brought into the gallery space.'
    },
    {
      id: 6,
      title: 'Portrait Series',
      artist: 'James Wilson',
      image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&h=600&fit=crop&q=90',
      date: 'Jun 10 - Aug 25, 2024',
      location: 'Portrait Hall',
      time: '10:00 AM - 6:00 PM',
      status: 'Upcoming',
      visitors: 'TBA',
      description: 'Intimate portraits capturing the essence of human emotion and character.'
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <Navigation />
      <div className="absolute inset-0 opacity-5 fixed" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 px-4 sm:px-6 md:px-12 pt-24 md:pt-32 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-4">CURRENT & UPCOMING</div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Exhibitions
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto font-light mb-12">Experience world-class art exhibitions featuring renowned and emerging artists</p>

          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-5 backdrop-blur-sm hover:border-amber-600/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={24} className="text-amber-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl md:text-3xl font-light text-white/90 mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-light">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {exhibitions.map((exhibition, index) => (
            <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index} onBookVisit={() => handleBookVisit(exhibition)} />
          ))}
        </div>

        {realExhibitions.length > 0 && (
          <div className="border-t border-neutral-800/80 pt-16 mt-16 max-w-7xl mx-auto">
            <p className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-2">FROM OUR PROGRAM</p>
            <h2 className="text-3xl md:text-4xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Live exhibitions
            </h2>
            <p className="text-neutral-400 text-sm font-light mb-8 max-w-2xl">
              Current and upcoming exhibitions from the museum.
            </p>
            {realLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-600/60" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {realExhibitions.map((exhibition, index) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} index={index + 100} onBookVisit={() => handleBookVisit(exhibition)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} message="Sign in to book a visit to this exhibition." />
      {selectedExhibition && (
        <BookingModal
          exhibition={selectedExhibition}
          onClose={() => setSelectedExhibition(null)}
        />
      )}
      <Footer />
    </main>
  )
}
