'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { EventsMap } from '@/components/events-map'
import { MapPin, Calendar, Clock, Navigation2, Building2, Map, Loader2, MapIcon, ExternalLink, LogIn, ArrowRight, ShieldCheck, Globe } from 'lucide-react'
import { fetchNearbyEvents, fetchGlobalEvents, ProcessedEvent } from '@/lib/ticketmaster'
import { getCurrentUser } from '@/lib/auth'

export default function VisitPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<ProcessedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [showGlobalEvents, setShowGlobalEvents] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const loadGlobalEvents = async () => {
    setLocationLoading(true)
    setError(null)
    try {
      const globalEvents = await fetchGlobalEvents()
      setEvents(globalEvents)
      setShowGlobalEvents(true)
      setShowMap(false)
    } catch (err) {
      setError('Failed to fetch global events. Please try again.')
    } finally {
      setLocationLoading(false)
    }
  }

  const requestLocation = async () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_redirect', window.location.pathname + window.location.search)
      }
      router.push('/login')
      return
    }

    setLocationLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        try {
          const radius = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEARCH_RADIUS || '50')
          const nearbyEvents = await fetchNearbyEvents(latitude, longitude, radius)
          setEvents(nearbyEvents)
          setShowMap(true)
        } catch (err) {
          setError('Failed to fetch nearby events.')
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        setError('Location access denied. Please enable and try again.')
        setLocationLoading(false)
      }
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white selection:bg-amber-600/30">
      <Navigation />

      {/* Concierge Hero */}
      <section className="relative pt-44 pb-32 px-4 md:px-12 max-w-7xl mx-auto text-center border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-amber-600/50" />
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="space-y-8"
        >
          <p className="text-amber-600 text-[10px] tracking-[0.6em] font-black uppercase">Your Journey Begins</p>
          <h1 className="text-6xl md:text-9xl font-light tracking-tighter leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Plan Your <br /> Visit
          </h1>
          <p className="text-neutral-500 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Curate your artistic experience with live global exploration or local discovery. Our digital concierge connects you with the finest galleries worldwide.
          </p>
        </motion.div>

        {!user ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-20 group inline-block"
          >
            <Link href="/login" className="flex items-center gap-6 px-12 py-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
              <LogIn className="text-amber-600" size={24} />
              <div className="text-left">
                <p className="text-xs font-black tracking-widest uppercase">Member Entry</p>
                <p className="text-[10px] text-neutral-500 font-light">Sign in to unlock location discovery</p>
              </div>
              <ArrowRight className="text-neutral-600 group-hover:translate-x-1 transition-transform" size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="mt-16 flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={requestLocation}
              disabled={locationLoading}
              className="flex items-center gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-500 rounded-2xl text-black transition-all disabled:opacity-50"
            >
              {locationLoading ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
              <div className="text-left">
                <p className="text-xs font-black tracking-widest uppercase leading-none">Nearby Events</p>
                <p className="text-[10px] opacity-60 font-medium mt-0.5">Use my live location</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={loadGlobalEvents}
              disabled={locationLoading}
              className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all disabled:opacity-50"
            >
              {locationLoading ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} className="text-amber-600" />}
              <div className="text-left">
                <p className="text-xs font-black tracking-widest uppercase leading-none">Global Pulse</p>
                <p className="text-[10px] text-neutral-500 font-light mt-0.5">Explore exhibitions worldwide</p>
              </div>
            </motion.button>
          </div>
        )}
      </section>

      {/* Map & Results Section */}
      <section className="px-4 md:px-12 py-32 max-w-7xl mx-auto space-y-32">
        
        <AnimatePresence mode="wait">
          {showMap && userLocation && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative rounded-[3rem] overflow-hidden border border-white/5 bg-neutral-900/40 p-2 shadow-2xl"
            >
              <div className="absolute top-10 left-10 z-10 bg-neutral-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 max-w-xs">
                <h3 className="text-lg font-light mb-2">Discovery Radar</h3>
                <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                  Real-time synchronization with global art databases. Markers represent confirmed exhibitions and gallery openings.
                </p>
              </div>
              <EventsMap events={events} userLocation={userLocation} />
            </motion.div>
          )}

          {events.length > 0 && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-3 pb-8 border-b border-white/5 flex items-center justify-between font-black">
                <p className="text-[10px] tracking-[0.4em] uppercase text-neutral-500">Live Encounters Found: {events.length}</p>
                <div className="flex items-center gap-2 text-amber-600">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] tracking-[0.2em] uppercase">Verified Pulse</span>
                </div>
              </div>

              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-amber-600/50 transition-all duration-700"
                >
                  <img src={event.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                  
                  <div className="absolute inset-x-8 bottom-8 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="px-3 py-1 bg-amber-600 text-black text-[9px] font-black uppercase tracking-widest rounded-full">{event.type}</span>
                       <p className="text-[10px] text-white/60 font-medium">{event.date}</p>
                    </div>
                    <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'serif' }}>{event.name}</h3>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed font-light">{event.description}</p>
                    
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-amber-600">
                         <MapPin size={12} />
                         <span className="text-[10px] font-black uppercase tracking-widest">{event.distance === 'N/A' ? 'Featured' : event.distance}</span>
                       </div>
                       <a href={event.url} target="_blank" className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest hover:text-amber-500 transition-colors">
                         Secure Access <ExternalLink size={12} />
                       </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {events.length === 0 && !locationLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto text-center"
          >
            <div className="bg-neutral-900/40 border border-white/5 rounded-3xl py-14 px-8 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center mx-auto">
                <MapIcon className="text-amber-600/60" size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>No Active Transmissions</h3>
                <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                  We couldn't detect any live art encounters in this sector. Try expanding your horizon with Global Pulse.
                </p>
              </div>
              <button
                onClick={loadGlobalEvents}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600/10 border border-amber-600/20 rounded-xl text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-600/20 transition-all"
              >
                <Globe size={11} />
                Try Global Pulse
              </button>
            </div>
          </motion.div>
        )}
      </section>

      <Footer />
    </main>
  )
}
