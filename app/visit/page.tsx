'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { EventsMap } from '@/components/events-map'
import { MapPin, Calendar, Clock, Navigation2, Building2, Map, Loader2, MapIcon, ExternalLink, LogIn } from 'lucide-react'
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
      console.error('Error fetching global events:', err)
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
          setError('Failed to fetch nearby events. Please try again.')
          console.error('Error fetching events:', err)
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }
        setError(errorMessage)
        setLocationLoading(false)
        console.error('Geolocation error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: parseInt(process.env.NEXT_PUBLIC_LOCATION_TIMEOUT || '10000'),
        maximumAge: parseInt(process.env.NEXT_PUBLIC_LOCATION_MAX_AGE || '300000')
      }
    )
  }

  const stats = [
    { label: 'Events Found', value: events.length.toString(), icon: Building2 },
    { label: showGlobalEvents ? 'Coverage' : 'Search Radius', value: showGlobalEvents ? 'Worldwide' : `${process.env.NEXT_PUBLIC_DEFAULT_SEARCH_RADIUS || '50'} km`, icon: Map },
    { label: 'Live Data', value: 'Real-time', icon: Calendar },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
      </main>
    )
  }

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
          <div className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-4">NEARBY ART EVENTS</div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Visit & Explore
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto font-light mb-12">
            Discover real art venues, galleries, and exhibitions near your location or explore events worldwide using live data from Ticketmaster
          </p>
          
          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto bg-neutral-900/50 border border-neutral-700/50 rounded-xl p-8 backdrop-blur-sm"
            >
              <LogIn className="mx-auto mb-4 text-amber-600" size={48} />
              <h2 className="text-xl text-white/90 mb-4">Login Required</h2>
              <p className="text-neutral-400 mb-6 text-sm">
                Please login to access location-based event discovery and view nearby art venues.
              </p>
              <Link
                href="/login"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_redirect', window.location.pathname + window.location.search)
                  }
                }}
                className="inline-block w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm tracking-[0.2em] font-light transition-colors duration-300"
              >
                LOGIN TO CONTINUE
              </Link>
            </motion.div>
          ) : (
            <>
              {!showMap && !showGlobalEvents && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={requestLocation}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600/90 hover:bg-amber-600 border border-amber-600 text-white rounded-lg text-sm tracking-[0.2em] font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        FINDING EVENTS...
                      </>
                    ) : (
                      <>
                        <MapIcon size={20} />
                        DISCOVER NEARBY EVENTS
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={loadGlobalEvents}
                    disabled={locationLoading}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 border border-neutral-600 text-white rounded-lg text-sm tracking-[0.2em] font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        LOADING...
                      </>
                    ) : (
                      <>
                        <Building2 size={20} />
                        VIEW GLOBAL EVENTS
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm max-w-md mx-auto"
                >
                  {error}
                </motion.div>
              )}

              {(showMap || showGlobalEvents) && events.length > 0 && (
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 mt-8">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="bg-neutral-900/30 border border-neutral-700/30 rounded-xl p-5 backdrop-blur-sm">
                        <Icon size={24} className="text-amber-600/70 mx-auto mb-3" />
                        <p className="text-2xl md:text-3xl font-light text-white/90 mb-1">{stat.value}</p>
                        <p className="text-xs text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>

        {showMap && userLocation && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto mb-12"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-light text-white/90 mb-2">Interactive Map</h2>
              <p className="text-neutral-400 text-sm">Your location and nearby events are marked on the map</p>
            </div>
            <EventsMap events={events} userLocation={userLocation} />
          </motion.div>
        )}

        {events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
                className="group relative overflow-hidden bg-neutral-900/30 border border-neutral-700/50 rounded-xl hover:border-amber-600/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-600/10"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1.5 text-[10px] tracking-wider font-light bg-amber-600/90 text-white backdrop-blur-sm rounded-full border border-amber-600">
                      {event.type}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-light text-white mb-1 group-hover:text-amber-400 transition-colors duration-300" style={{ fontFamily: 'serif' }}>
                      {event.name}
                    </h2>
                    <div className="flex items-center gap-2 text-amber-600/80 text-xs">
                      <Navigation2 size={12} />
                      <span>{showGlobalEvents ? event.distance : `${event.distance} away`}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-white/90 text-sm font-light mb-1">{event.name}</p>
                    <p className="text-neutral-400 text-xs leading-relaxed font-light">{event.description}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={12} className="text-amber-600/70" />
                        <p className="text-neutral-500 text-[10px] tracking-wider uppercase">Address</p>
                      </div>
                      <p className="text-neutral-300 text-xs font-light">{event.address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={12} className="text-amber-600/70" />
                          <p className="text-neutral-500 text-[10px] tracking-wider uppercase">Date</p>
                        </div>
                        <p className="text-neutral-300 text-xs font-light">{event.date}</p>
                      </div>
                      <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={12} className="text-amber-600/70" />
                          <p className="text-neutral-500 text-[10px] tracking-wider uppercase">Time</p>
                        </div>
                        <p className="text-neutral-300 text-xs font-light">{event.time || 'TBA'}</p>
                      </div>
                    </div>
                    {event.priceRange && (
                      <div className="bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-600/70 text-xs">💰</span>
                          <p className="text-neutral-500 text-[10px] tracking-wider uppercase">Price Range</p>
                        </div>
                        <p className="text-neutral-300 text-xs font-light">{event.priceRange}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600/90 border border-amber-600 text-white rounded-lg text-xs tracking-[0.2em] font-light hover:bg-amber-600 transition-all duration-300"
                      >
                        <ExternalLink size={12} />
                        VIEW DETAILS
                      </a>
                    )}
                    {event.latitude && event.longitude && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-700/50 border border-neutral-600 text-white rounded-lg text-xs tracking-[0.2em] font-light hover:bg-neutral-600/50 transition-all duration-300"
                      >
                        <Navigation2 size={12} />
                        DIRECTIONS
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {(showMap || showGlobalEvents) && events.length === 0 && !locationLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Building2 className="mx-auto mb-4 text-neutral-600" size={48} />
            <h3 className="text-xl text-white/70 mb-2">No Events Found</h3>
            <p className="text-neutral-400 max-w-md mx-auto">
              {showGlobalEvents 
                ? 'No arts and theatre events found globally. Try again later.' 
                : 'No arts and theatre events found within 50km of your location. Try again later or check a different area.'}
            </p>
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  )
}
