'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { ProcessedEvent } from '@/lib/ticketmaster'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface EventsMapProps {
  events: ProcessedEvent[]
  userLocation: { lat: number; lng: number } | null
}

export function EventsMap({ events, userLocation }: EventsMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient || !userLocation) {
    return (
      <div className="w-full h-96 bg-neutral-800/30 border border-neutral-700/30 rounded-xl flex items-center justify-center">
        <p className="text-neutral-400">Loading map...</p>
      </div>
    )
  }

  const eventsWithLocation = events.filter(event => event.latitude && event.longitude)

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-neutral-700/30">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">Your Location</p>
            </div>
          </Popup>
        </Marker>

        {/* Event markers */}
        {eventsWithLocation.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude!, event.longitude!]}
          >
            <Popup>
              <div className="max-w-xs">
                <img 
                  src={event.image} 
                  alt={event.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{event.name}</h3>
                <p className="text-xs text-gray-600 mb-1">{event.type}</p>
                <p className="text-xs text-gray-600 mb-1">{event.address}</p>
                <p className="text-xs text-gray-600 mb-2">{event.date} {event.time}</p>
                {event.url && (
                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-amber-600 text-white px-2 py-1 rounded hover:bg-amber-700"
                  >
                    View Details
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}