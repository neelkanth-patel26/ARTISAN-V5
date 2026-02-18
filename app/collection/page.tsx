'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Skiper30 } from '@/element/skiper30'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Palette, Mountain, User, Box, Monitor, Camera } from 'lucide-react'

export default function CollectionPage() {
  const categories = [
    { name: 'Abstract', count: '450+', icon: Palette, color: 'from-purple-600 to-pink-600' },
    { name: 'Landscape', count: '380+', icon: Mountain, color: 'from-green-600 to-teal-600' },
    { name: 'Portrait', count: '520+', icon: User, color: 'from-blue-600 to-cyan-600' },
    { name: 'Sculpture', count: '290+', icon: Box, color: 'from-amber-600 to-orange-600' },
    { name: 'Digital', count: '610+', icon: Monitor, color: 'from-indigo-600 to-purple-600' },
    { name: 'Photography', count: '720+', icon: Camera, color: 'from-red-600 to-pink-600' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-y-auto" style={{ height: '100vh' }}>
      <Navigation />
      
      <div className="relative pt-32 pb-16 text-center px-4">
        <div className="text-amber-600/60 text-xs tracking-[0.3em] font-light mb-4">CURATED COLLECTION</div>
        <h1 className="text-5xl md:text-8xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
          Art Categories
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto mb-12 font-light">Explore our diverse collection by category</p>
        
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-4 mb-16">
          {categories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <Link key={i} href={`/gallery?category=${cat.name.toLowerCase()}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group relative bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-8 md:p-10 hover:border-amber-600/50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-amber-600/10"
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-amber-600/10 group-hover:bg-amber-600/20 p-3 mb-5 mx-auto flex items-center justify-center transition-all duration-300">
                      <Icon className="w-full h-full text-amber-600" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-light text-white mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>{cat.name}</h3>
                    <p className="text-neutral-500 text-sm font-light">{cat.count} artworks</p>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>

      <Skiper30 />
      
      <Footer />
    </main>
  )
}
