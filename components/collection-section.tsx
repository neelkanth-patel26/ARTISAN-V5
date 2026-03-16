'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function CollectionSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center relative z-40">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:block hidden"
        >
          <div className="space-y-4 md:space-y-6">
            <motion.div 
              className="flex items-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles size={12} className="text-amber-500" />
              Curated Collection
            </motion.div>
            <motion.h2 
              className="text-4xl md:text-6xl font-light text-white/90 leading-tight"
              style={{ fontFamily: 'ForestSmooth, serif' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Original
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Artworks</span>
            </motion.h2>
            <motion.p 
              className="text-neutral-400 text-sm md:text-base leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Browse our carefully curated selection of original paintings, sculptures, and mixed media pieces. Each artwork is created by verified artists and comes with a certificate of authenticity.
            </motion.p>
            <motion.div 
              className="flex gap-8 md:gap-12 pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
                className="relative will-change-transform"
              >
                <div className="relative">
                  <div className="text-3xl md:text-5xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>500+</div>
                  <div className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase">Artworks</div>
                </div>
              </motion.div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber-600/30 to-transparent" />
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
                className="relative will-change-transform"
              >
                <div className="relative">
                  <div className="text-3xl md:text-5xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>150+</div>
                  <div className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase">Artists</div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="pointer-events-auto"
            >
              <Link href="/collection">
                <button className="group mt-8 px-10 py-4 border border-white/5 bg-white/5 text-white/90 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/10 hover:border-white/10 transition-all duration-500 flex items-center gap-3 rounded-xl shadow-2xl">
                  Browse Collection
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        <div className="lg:hidden block">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase">
              <Sparkles size={12} className="text-amber-500" />
              Curated Collection
            </div>
            <h2 
              className="text-4xl md:text-6xl font-light text-white/90 leading-tight"
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              Original
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Artworks</span>
            </h2>
            <p className="text-neutral-500 text-sm md:text-base leading-relaxed font-light">
              Browse our carefully curated selection of original paintings, sculptures, and mixed media pieces. Each artwork is created by verified artists and comes with a certificate of authenticity.
            </p>
            <div className="flex gap-8 md:gap-12 pt-4">
              <div className="relative">
                <div className="text-3xl md:text-5xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>500+</div>
                <div className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase">Artworks</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="relative">
                <div className="text-3xl md:text-5xl font-light text-white/90" style={{ fontFamily: 'ForestSmooth, serif' }}>150+</div>
                <div className="text-[9px] text-neutral-500 tracking-[0.3em] font-black uppercase">Artists</div>
              </div>
            </div>
            <div className="pointer-events-auto">
              <Link href="/collection">
                <button className="group mt-8 px-10 py-4 border border-white/5 bg-white/5 text-white/90 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/10 hover:border-white/10 transition-all duration-500 flex items-center gap-3 rounded-xl shadow-2xl">
                  Browse Collection
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative group cursor-pointer"
        >
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            className="will-change-transform"
          >
            <motion.img
              src="https://images.unsplash.com/photo-1579783483458-83d02161294e?w=600&h=700&fit=crop&q=90"
              alt="Original artwork"
              className="relative w-full h-[350px] md:h-[500px] object-cover border border-neutral-800/50 group-hover:border-amber-600/30 transition-all duration-500 will-change-transform"
              style={{
                filter: 'contrast(1.1)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)',
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
