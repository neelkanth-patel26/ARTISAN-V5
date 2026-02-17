'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { MapPin, Calendar, Clock, Navigation2, Building2, Map } from 'lucide-react'

export default function VisitPage() {
  const stats = [
    { label: 'Art Venues', value: '25+', icon: Building2 },
    { label: 'Active Events', value: '18', icon: Calendar },
    { label: 'Nearby', value: '5 km', icon: Map },
  ]

  const events = [
    {
      id: 1,
      name: 'Downtown Art Gallery',
      type: 'Gallery',
      image: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=800&h=600&fit=crop&q=90',
      distance: '0.5 km',
      address: '123 Main Street, Downtown',
      hours: 'Mon-Sat: 10:00 AM - 8:00 PM',
      event: 'Contemporary Art Exhibition',
      date: 'Ongoing',
      description: 'Featuring modern and contemporary artworks from local and international artists.'
    },
    {
      id: 2,
      name: 'City Museum of Art',
      type: 'Museum',
      image: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=800&h=600&fit=crop&q=90',
      distance: '1.2 km',
      address: '456 Cultural Avenue',
      hours: 'Tue-Sun: 9:00 AM - 6:00 PM',
      event: 'Classical Sculptures Display',
      date: 'Until March 2024',
      description: 'Explore timeless sculptures and classical art pieces from various eras.'
    },
    {
      id: 3,
      name: 'Urban Art Space',
      type: 'Art Space',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop&q=90',
      distance: '2.0 km',
      address: '789 Street Art Lane',
      hours: 'Daily: 11:00 AM - 9:00 PM',
      event: 'Street Art Festival',
      date: 'Feb 15-20, 2024',
      description: 'Vibrant street art and graffiti from renowned urban artists.'
    },
    {
      id: 4,
      name: 'Photography Center',
      type: 'Gallery',
      image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop&q=90',
      distance: '1.8 km',
      address: '321 Lens Boulevard',
      hours: 'Wed-Sun: 10:00 AM - 7:00 PM',
      event: 'World Photography Showcase',
      date: 'Jan 10 - Mar 15, 2024',
      description: 'Stunning photography from award-winning photographers around the globe.'
    },
    {
      id: 5,
      name: 'Abstract Art Studio',
      type: 'Studio',
      image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop&q=90',
      distance: '3.5 km',
      address: '555 Creative Drive',
      hours: 'Mon-Fri: 12:00 PM - 8:00 PM',
      event: 'Abstract Expressions Workshop',
      date: 'Every Weekend',
      description: 'Interactive workshops and exhibitions focusing on abstract art forms.'
    },
    {
      id: 6,
      name: 'Digital Arts Hub',
      type: 'Gallery',
      image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop&q=90',
      distance: '2.8 km',
      address: '888 Tech Plaza',
      hours: 'Daily: 10:00 AM - 10:00 PM',
      event: 'Digital Art & NFT Exhibition',
      date: 'Ongoing',
      description: 'Cutting-edge digital art installations and NFT showcases.'
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
          <div className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-4">NEARBY ART EVENTS</div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Visit & Explore
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto font-light mb-12">Discover art venues, galleries, and exhibitions near you</p>
          
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
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
                    <span>{event.distance} away</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <p className="text-white/90 text-sm font-light mb-1">{event.event}</p>
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
                        <p className="text-neutral-500 text-[10px] tracking-wider uppercase">Hours</p>
                      </div>
                      <p className="text-neutral-300 text-xs font-light truncate">{event.hours}</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-3 py-3 bg-amber-600/90 border border-amber-600 text-white rounded-lg text-xs tracking-[0.2em] font-light hover:bg-amber-600 transition-all duration-300">
                  GET DIRECTIONS
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
