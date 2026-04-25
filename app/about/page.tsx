'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Shield, Zap, Users, Sparkles } from 'lucide-react'

// Bento Box Data
const values = [
  { label: 'Authenticity', title: 'Verified Origins', desc: 'Every piece is cryptographically verified to ensure pure authenticity.', icon: Shield, span: 'col-span-1 md:col-span-2 row-span-2', delay: 0.1 },
  { label: 'Innovation', title: 'Digital First', desc: 'Pioneering the future of artistic ownership.', icon: Zap, span: 'col-span-1', delay: 0.2 },
  { label: 'Community', title: 'Global Network', desc: 'Connecting creators with discerning collectors worldwide.', icon: Users, span: 'col-span-1', delay: 0.3 },
  { label: 'Excellence', title: 'Curated Mastery', desc: 'Only the highest tier of artistic expression makes our collection.', icon: Sparkles, span: 'col-span-1 md:col-span-2', delay: 0.4 }
]

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  
  // Parallax elements
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])

  return (
    <main ref={containerRef} className="bg-neutral-950 min-h-screen selection:bg-amber-600/30 overflow-hidden text-neutral-200">
      <Navigation />
      
      {/* 1. Immersive Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4">
        {/* Blurred Orbs Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 text-center space-y-8 flex flex-col items-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-amber-600 text-xs tracking-[0.8em] font-black uppercase"
          >
            Established 2024
          </motion.p>
          
          <motion.div className="overflow-hidden">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-8xl md:text-[12rem] font-light text-white tracking-tighter leading-none" 
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              Artisan
            </motion.h1>
          </motion.div>

          <motion.div 
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
             className="h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent w-full max-w-2xl"
          />

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-neutral-500 text-sm md:text-lg font-light max-w-xl mx-auto tracking-[0.3em] uppercase"
          >
            A Digital Sanctuary for High-End Artistic Encounter
          </motion.p>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-amber-600/0 via-amber-600/50 to-amber-600/0 relative overflow-hidden">
             <motion.div 
               animate={{ y: ['-100%', '100%'] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 bg-amber-400"
             />
          </div>
          <span className="text-[9px] text-amber-600/70 font-black uppercase tracking-[0.5em]">Discover</span>
        </motion.div>
      </section>

      {/* 2. Split-Layout Story Section */}
      <section className="relative px-4 py-32 md:py-48 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24 relative">
          
          {/* Sticky Left Sidebar */}
          <div className="md:w-1/3 relative">
            <div className="md:sticky md:top-40 space-y-4">
              <p className="text-amber-600 text-[10px] tracking-[0.5em] font-black uppercase">Our Genesis</p>
              <h2 className="text-5xl md:text-7xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>The Story</h2>
              <div className="h-px w-24 bg-amber-600/30 mt-8" />
            </div>
          </div>

          {/* Scrolling Content Right */}
          <div className="md:w-2/3 space-y-24">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <p className="text-2xl md:text-4xl text-neutral-300 font-light leading-relaxed">
                Founded in 2024, Artisan emerged from a profound vision: to democratize the elite art world without diluting its prestige.
              </p>
              <p className="text-lg md:text-xl text-neutral-500 font-light leading-relaxed">
                We observed that exceptional masterpieces were often hidden behind closed doors. Our digital pedestal ensures that brilliance is not just seen, but encountered in a space that respects the creator's true soul and intention.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Our Compass</h3>
              <p className="text-xl text-neutral-400 font-light leading-relaxed">
                Our mission is to empower global artists by providing a platform that reflects the intrinsic value of their vision. We envision a seamless connection between visionary creators and discerning collectors—a bond as pure and unaltered as the art itself.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 3. Bento Box Core Values */}
      <section className="relative py-32 bg-neutral-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          <div className="text-center space-y-4">
            <p className="text-amber-600 text-[10px] tracking-[0.5em] font-black uppercase">Core Pillars</p>
            <h2 className="text-5xl md:text-6xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Our Values</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px]">
            {values.map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: item.delay }}
                className={`relative group overflow-hidden rounded-[2rem] bg-neutral-900 border border-white/5 p-10 flex flex-col justify-end hover:border-amber-600/30 transition-colors duration-500 ${item.span}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                  <item.icon size={120} className="text-amber-600" />
                </div>
                
                <div className="relative z-10 space-y-3">
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em]">{item.label}</p>
                  <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{item.title}</h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Stats Ribbon */}
      <section className="py-24 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center gap-12 lg:gap-0">
            {[
              { num: '500+', label: 'Artworks' },
              { num: '150+', label: 'Artists' },
              { num: '50+', label: 'Countries' },
              { num: '1k+', label: 'Collectors' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="w-full sm:w-auto text-center space-y-2"
              >
                <p className="text-5xl md:text-7xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.num}</p>
                <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. The Artisan Protocol */}
      <section className="relative py-32 md:py-48 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_100%,rgba(217,119,6,0.05),transparent)]" />
        
        <div className="max-w-7xl mx-auto space-y-20 relative z-10">
          <div className="text-center space-y-6">
            <p className="text-amber-600 text-[10px] tracking-[0.5em] font-black uppercase">The Artisan Protocol</p>
            <h2 className="text-5xl md:text-7xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Uncompromising Standards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Secure Vault', desc: 'Bank-grade encryption ensures that every transaction and digital transfer remains impenetrable.', num: '01' },
              { title: 'Safe Delivery', desc: 'Physical artifacts are shipped via museum-standard transit protocols with comprehensive global insurance.', num: '02' },
              { title: 'Purity Check', desc: 'A rigorous 14-day curation and return window guarantees that quality remains paramount.', num: '03' }
            ].map((protocol, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="group p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-amber-600/20 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-8xl font-light text-white/[0.02] group-hover:text-amber-600/5 transition-colors duration-500 pointer-events-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {protocol.num}
                </div>
                <div className="space-y-6 relative z-10">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white">{protocol.title}</p>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">{protocol.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
