'use client'

import { motion } from 'framer-motion'
import { Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FeaturedArtistsSection() {
  const artists = [
    { 
      name: 'Sarah Chen', 
      specialty: 'Abstract Paintings', 
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop',
      works: '24'
    },
    { 
      name: 'Marcus Rivera', 
      specialty: 'Bronze Sculptures', 
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop',
      works: '18'
    },
    { 
      name: 'Elena Volkov', 
      specialty: 'Contemporary Art', 
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop',
      works: '32'
    },
  ]

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 py-8 md:py-0">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="max-w-6xl mx-auto px-4 md:px-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <motion.div 
            className="flex items-center justify-center gap-2 text-amber-600/70 text-xs tracking-[0.3em] font-light mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Users size={14} strokeWidth={1.5} />
            FEATURING
          </motion.div>
          <motion.h2 
            className="text-3xl md:text-7xl font-light text-white/90 mb-3 md:mb-4"
            style={{ fontFamily: 'ForestSmooth, serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Artists</span>
          </motion.h2>
          <motion.p 
            className="text-neutral-400 text-xs md:text-sm font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Discover exceptional works from our top-selling artists
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 overflow-y-auto md:overflow-visible max-h-[70vh] md:max-h-none pb-4 md:pb-0">
          {artists.map((artist, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer will-change-transform"
            >
              <motion.div 
                className="relative overflow-hidden border border-neutral-800/50 group-hover:border-amber-600/30 transition-all duration-500 mb-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-amber-600/0 to-amber-600/0 group-hover:from-amber-600/10 group-hover:to-transparent transition-all duration-500 z-10" />
                <motion.img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-[280px] md:h-[400px] object-cover object-center will-change-transform"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-px bg-gradient-to-r from-amber-600/70 to-transparent" />
                    <span className="text-[10px] text-amber-600/70 tracking-wider font-light">{artist.works} WORKS</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-light text-white/90 mb-1" style={{ fontFamily: 'Oughter, serif' }}>{artist.name}</h3>
                  <p className="text-xs text-neutral-400 tracking-wider font-light">{artist.specialty}</p>
                </div>
              </motion.div>
              <Link href="/gallery">
                <motion.button 
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="group/btn flex items-center gap-2 text-xs text-amber-600/70 hover:text-amber-600 transition-all duration-300 tracking-wider font-light"
                >
                  VIEW WORKS
                  <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={1.5} />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
