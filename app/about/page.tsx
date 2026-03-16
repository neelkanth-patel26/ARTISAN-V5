'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Heart, Target, Eye, Users, Sparkles, Shield, Zap, Globe } from 'lucide-react'

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Radial amber core */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(217,119,6,0.07),transparent)]" />

      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Fine crosshatch grid */}
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          </pattern>
          {/* Amber glow filter */}
          <filter id="amber-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Rotating outer ring */}
        <motion.circle
          cx="50%" cy="50%" r="38%"
          fill="none" stroke="rgba(217,119,6,0.06)" strokeWidth="1"
          strokeDasharray="6 14"
          style={{ originX: '50%', originY: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />

        {/* Counter-rotating middle ring */}
        <motion.circle
          cx="50%" cy="50%" r="26%"
          fill="none" stroke="rgba(217,119,6,0.09)" strokeWidth="0.5"
          strokeDasharray="2 8"
          style={{ originX: '50%', originY: '50%' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulsing inner ring */}
        <motion.circle
          cx="50%" cy="50%" r="14%"
          fill="none" stroke="rgba(217,119,6,0.12)" strokeWidth="0.5"
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 1, 0.4] }}
          style={{ originX: '50%', originY: '50%' }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Diagonal sweep lines */}
        {[15, 35, 65, 85].map((x, i) => (
          <motion.line
            key={i}
            x1={`${x}%`} y1="0%" x2={`${x - 10}%`} y2="100%"
            stroke="rgba(217,119,6,0.04)" strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: i * 0.4, ease: 'easeOut' }}
          />
        ))}

        {/* Corner bracket — top-left */}
        <motion.path
          d="M 40 80 L 80 80 L 80 40"
          fill="none" stroke="rgba(217,119,6,0.2)" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        />
        {/* Corner bracket — bottom-right (dynamic via viewBox %) */}
        <motion.path
          d="M calc(100% - 40px) calc(100% - 80px) L calc(100% - 80px) calc(100% - 80px) L calc(100% - 80px) calc(100% - 40px)"
          fill="none" stroke="rgba(217,119,6,0.2)" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
        />

        {/* Orbiting amber dot */}
        <motion.circle
          r="3" fill="rgba(217,119,6,0.7)" filter="url(#amber-glow)"
          animate={{
            cx: ['50%', '88%', '50%', '12%', '50%'],
            cy: ['12%', '50%', '88%', '50%', '12%'],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* Second orbiting dot — offset phase */}
        <motion.circle
          r="1.5" fill="rgba(217,119,6,0.4)"
          animate={{
            cx: ['50%', '12%', '50%', '88%', '50%'],
            cy: ['12%', '50%', '88%', '50%', '12%'],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />

        {/* Horizontal scan line */}
        <motion.line
          x1="0" y1="50%" x2="100%" y2="50%"
          stroke="rgba(217,119,6,0.05)" strokeWidth="1"
          animate={{ y1: ['20%', '80%', '20%'], y2: ['20%', '80%', '20%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

const StorySection = ({ title, subtitle, content, icon: Icon, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 1, delay }}
    className="relative group p-12 lg:p-20 border-b border-white/5"
  >
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-600/10 flex items-center justify-center border border-amber-600/20">
          <Icon className="text-amber-600" size={32} />
        </div>
        <div className="space-y-1">
          <p className="text-amber-600 text-[10px] tracking-[0.5em] font-black uppercase">{subtitle}</p>
          <h2 className="text-4xl md:text-6xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{title}</h2>
        </div>
      </div>
      <p className="text-neutral-400 text-lg md:text-2xl font-light leading-relaxed tracking-wide italic">
        "{content}"
      </p>
    </div>
  </motion.div>
)

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <main ref={containerRef} className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 min-h-screen selection:bg-amber-600/30 overflow-x-hidden">
      <Navigation />
      
      {/* Hero: The Manuscript Cover */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <AnimatedBackground />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px rounded-full bg-amber-500"
              style={{
                left: `${10 + (i * 7.5) % 80}%`,
                top: `${15 + (i * 13) % 70}%`,
                boxShadow: '0 0 4px 1px rgba(217,119,6,0.6)',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + (i % 4),
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="space-y-4"
          >
            <p className="text-amber-600 text-xs tracking-[0.8em] font-black uppercase">Established 2024</p>
            <h1 className="text-7xl md:text-[12rem] font-light text-white tracking-tighter leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Artisan
            </h1>
          </motion.div>

          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 2, delay: 1 }}
             className="h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent max-w-4xl mx-auto"
          />

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-neutral-500 text-sm md:text-xl font-light max-w-xl mx-auto tracking-widest uppercase"
          >
            A Digital Sanctuary for High-End Artistic Encounter
          </motion.p>
        </div>

      {/* Scroll-driven SVG path */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <defs>
            <filter id="path-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Glow copy */}
          <motion.path
            d="M50,0 C65,15 35,30 50,50 C65,70 35,85 50,100"
            stroke="rgba(217,119,6,0.15)"
            strokeWidth="2"
            filter="url(#path-glow)"
            style={{ pathLength: smoothProgress }}
          />
          {/* Sharp line on top */}
          <motion.path
            d="M50,0 C65,15 35,30 50,50 C65,70 35,85 50,100"
            stroke="rgba(217,119,6,0.5)"
            strokeWidth="0.4"
            style={{ pathLength: smoothProgress }}
          />
          {/* Travelling dot along path */}
          <motion.circle
            r="0.8"
            fill="rgba(217,119,6,0.9)"
            filter="url(#path-glow)"
            style={{
              offsetPath: "path('M50,0 C65,15 35,30 50,50 C65,70 35,85 50,100')",
              offsetDistance: smoothProgress as any,
            } as any}
          />
        </svg>
      </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <svg width="1" height="60" viewBox="0 0 1 60" className="overflow-visible">
            <motion.line
              x1="0.5" y1="0" x2="0.5" y2="60"
              stroke="url(#scroll-grad)" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 2.5 }}
            />
            <defs>
              <linearGradient id="scroll-grad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="rgba(217,119,6,0.8)" />
                <stop offset="100%" stopColor="rgba(217,119,6,0)" />
              </linearGradient>
            </defs>
          </svg>
          <motion.span
            className="text-[9px] text-amber-600/70 font-black uppercase tracking-[0.5em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
          >
            Descend
          </motion.span>
        </motion.div>
      </section>

      {/* Narrative Flow */}
      <section className="relative">
        <StorySection 
          subtitle="Our Genesis"
          title="The Story"
          content="Founded in 2024, Artisan emerged from a vision to democratize the elite art world. We believe that exceptional masterpieces shouldn't just be seen—they should be encountered in a space that respects their soul."
          icon={Heart}
        />
        
        <StorySection 
          subtitle="Our Compass"
          title="Mission & Vision"
          content="Our mission is to empower global artists by providing a digital pedestal that reflects the true value of their vision. We envision a world where the connection between creator and collector is as pure as the art itself."
          icon={Target}
          delay={0.2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-white/5">
           {[
             { label: 'Authenticity', val: 'Verified', icon: Shield },
             { label: 'Innovation', val: 'Digital First', icon: Zap },
             { label: 'Community', val: 'Global', icon: Users },
             { label: 'Excellence', val: 'Curated', icon: Sparkles }
           ].map((item, i) => (
             <div key={i} className="p-16 border-r border-white/5 last:border-r-0 group hover:bg-white/[0.02] transition-colors">
               <item.icon className="text-amber-600/40 mb-8 group-hover:text-amber-600 group-hover:scale-110 transition-all" size={24} />
               <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mb-2">{item.label}</p>
               <p className="text-xl text-white font-light">{item.val}</p>
             </div>
           ))}
        </div>

        <section className="py-64 px-4 text-center space-y-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-3xl" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-5xl md:text-8xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Global Footprint</h3>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 mt-20">
               {[
                 { num: '500+', label: 'Artworks' },
                 { num: '150+', label: 'Artists' },
                 { num: '50+', label: 'Countries' },
                 { num: '1k+', label: 'Collectors' }
               ].map((stat, i) => (
                 <div key={i} className="space-y-1">
                   <p className="text-4xl md:text-6xl font-light text-amber-600" style={{ fontFamily: 'serif' }}>{stat.num}</p>
                   <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em]">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        <section className="py-44 px-4 md:px-12 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6">
              <p className="text-amber-600 text-[10px] tracking-[0.4em] font-black uppercase">The Artisan Protocol</p>
              <h2 className="text-4xl md:text-6xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Uncompromising <br /> Standards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full lg:w-2/3">
               {[
                 { title: 'Secure Vault', desc: 'Bank-grade encryption for every transaction.' },
                 { title: 'Safe Delivery', desc: 'Museum-standard transit with full insurance.' },
                 { title: 'Purity Check', desc: 'Rigorous 14-day curation and return window.' }
               ].map((protocol, i) => (
                 <div key={i} className="p-8 rounded-3xl bg-black border border-white/5 hover:border-amber-600/30 transition-all">
                   <p className="text-xs font-black uppercase tracking-widest text-white mb-4">{protocol.title}</p>
                   <p className="text-[10px] text-neutral-500 font-light leading-relaxed uppercase tracking-wider">{protocol.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </main>
  )
}
