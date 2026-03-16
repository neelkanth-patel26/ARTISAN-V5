'use client'

import { motion } from 'framer-motion'
import { NeonRing } from './neon-ring'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

export function HeroSection() {
  const [showContent, setShowContent] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), isMobile ? 0 : 5200)
    return () => clearTimeout(timer)
  }, [isMobile])

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl lg:block hidden"
        animate={{ 
          x: [0, 100, 0], 
          y: [0, 50, 0], 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl lg:block hidden"
        animate={{ 
          x: [0, -50, 0], 
          y: [0, -80, 0], 
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="absolute inset-0 z-10">
        <NeonRing />
      </div>

      <div className="absolute inset-0 z-20 opacity-30 mix-blend-overlay grayscale pointer-events-none" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1547891269-05520f836692?w=1600&q=80")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 z-21 bg-gradient-to-b from-neutral-950/80 via-transparent to-neutral-950/80 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center z-30 px-4">
        <motion.div
          className="text-center"
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-9xl font-light tracking-wider text-white/90 mb-2"
            style={{ fontFamily: 'ForestSmooth, serif' }}
            initial={isMobile ? false : { letterSpacing: '0.05em', opacity: 0, scale: 0.9 }}
            animate={showContent ? { letterSpacing: '0.1em', opacity: 1, scale: 1 } : { letterSpacing: '0.05em', opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            whileHover={!isMobile ? { scale: 1.02, letterSpacing: '0.15em' } : undefined}
          >
            {['A', 'R', 'T', 'I', 'S', 'A', 'N'].map((letter, i) => (
              <motion.span
                key={i}
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: showContent ? 0.5 + i * 0.1 : 0 }}
                whileHover={!isMobile ? { 
                  y: -10, 
                  color: 'rgb(217, 119, 6)',
                  textShadow: '0 0 20px rgba(217, 119, 6, 0.5)'
                } : undefined}
                className="inline-block cursor-default"
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
          <motion.div 
            className="mt-4 md:mt-6 flex items-center justify-center gap-3 md:gap-4"
            initial={isMobile ? false : { opacity: 0, scale: 0.8 }}
            animate={showContent ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.div 
              className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent hidden md:block"
              initial={isMobile ? false : { width: 0, opacity: 0 }}
              animate={showContent ? { width: '5rem', opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.2 }}
            />
            <motion.p 
              className="text-[9px] md:text-[10px] tracking-[0.5em] text-amber-500/60 font-black uppercase leading-none"
              initial={isMobile ? false : { opacity: 0 }}
              animate={showContent ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Curated Art Sanctuary
            </motion.p>
            <motion.div 
              className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent hidden md:block"
              initial={isMobile ? false : { width: 0, opacity: 0 }}
              animate={showContent ? { width: '5rem', opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.2 }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-16 md:bottom-20 right-6 md:right-12 z-40 max-w-[200px] md:max-w-xs pointer-events-none"
        initial={isMobile ? false : { opacity: 0, x: 30 }}
        animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        whileHover={!isMobile ? { x: -5 } : undefined}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <motion.p 
          className="text-xs md:text-sm text-neutral-500 leading-relaxed font-light italic" 
          style={{ fontFamily: 'serif' }}
          initial={isMobile ? false : { opacity: 0 }}
          animate={showContent ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          "The most beautiful thing we can experience is the mysterious. It is the source of all true art."
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute bottom-16 md:bottom-20 left-6 md:left-12 z-40 pointer-events-none"
        initial={isMobile ? false : { opacity: 0, x: -30 }}
        animate={showContent ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
        whileHover={!isMobile ? { x: 5 } : undefined}
        transition={{ duration: 1, delay: 1.2 }}
      >
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-px h-8 bg-gradient-to-b from-transparent via-amber-600/40 to-transparent"
            initial={isMobile ? false : { height: 0 }}
            animate={showContent ? { height: '2rem' } : { height: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          />
          <motion.div 
            className="text-amber-600/50 text-[9px] tracking-[0.5em] font-black uppercase"
            initial={isMobile ? false : { opacity: 0 }}
            animate={showContent ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 1.7 }}
          >
            Est. 2024
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40"
        initial={{ opacity: 0, y: -10 }}
        animate={showContent ? { opacity: [0, 1, 1, 0], y: [0, 10, 10, 0] } : { opacity: 0, y: -10 }}
        transition={{ duration: 2, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="text-amber-600/50 w-6 h-6" strokeWidth={1} />
      </motion.div>
    </section>
  )
}
