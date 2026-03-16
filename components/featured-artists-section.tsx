'use client'

import { motion } from 'framer-motion'
import { Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FeaturedArtistsSection() {
  const artists = [
    {
      name: 'Neelkanth Patel',
      specialty: 'Abstract Paintings',
      image: '/images/artists/neelkanth_logo.png',
      works: '24'
    },
    {
      name: 'Urmi Thakkar',
      specialty: 'Bronze Sculptures',
      image: '/images/artists/urmi_logo.png',
      works: '18'
    },
    {
      name: 'Jay Shah',
      specialty: 'Contemporary Art',
      image: '/images/artists/jay_logo.png',
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
            className="flex items-center justify-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Users size={12} className="text-amber-500" />
            Spotlight
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
            className="text-neutral-500 text-xs md:text-sm font-light italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            "Creativity takes courage." — Henri Matisse
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
                suppressHydrationWarning
                className="relative overflow-hidden border border-neutral-900 group-hover:border-amber-600/20 transition-all duration-700 mb-4 bg-black rounded-3xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <div suppressHydrationWarning className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.05)_0%,_transparent_80%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div suppressHydrationWarning className="relative w-full h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                  <motion.img
                    suppressHydrationWarning
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover filter will-change-transform z-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent z-20" />
                <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-px bg-amber-600/20" />
                    <span className="text-[9px] text-amber-600/50 tracking-[0.4em] font-black uppercase">{artist.works} Pieces</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-white/95 mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{artist.name}</h3>
                  <p className="text-[10px] text-neutral-500 tracking-[0.2em] font-light uppercase">{artist.specialty}</p>
                </div>
              </motion.div>
              <Link href="/gallery">
                <motion.button
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="group/btn flex items-center gap-3 text-[9px] text-white/40 hover:text-white transition-all duration-500 tracking-[0.4em] font-black uppercase"
                >
                  View Works
                  <ArrowRight size={12} className="group-hover/btn:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
