'use client'

import { ArrowRight, Sparkles, TrendingUp, Users, Shield, Zap, DollarSign, CheckCircle, Star, Award, Palette, BarChart3, Globe, Zap as ZapIcon, ShieldCheck, PieChart, PenTool, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import ArtistPreloader from '@/components/artist-preloader'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const FloatingArt = ({ src, delay = 0, x = 0, y = 0, scale = 1 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [0.4, 0.7, 0.4],
      y: [y, y - 20, y],
      rotate: [0, 2, 0]
    }}
    transition={{ 
      duration: 8, 
      delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    style={{ left: `${x}%`, top: `${y}%`, scale }}
    className="absolute w-48 h-64 md:w-64 md:h-80 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl z-0 blur-[2px] hover:blur-0 transition-all duration-700"
  >
    <img src={src} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute inset-0 bg-neutral-950/20" />
  </motion.div>
)

export default function ArtistLanding() {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <main ref={containerRef} className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 min-h-screen selection:bg-amber-600/30 overflow-x-hidden">
      <AnimatePresence>
        {loading && <ArtistPreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && (
        <>
          <Navigation />

          {/* Master Creator Hero */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-white/5">
            <div className="absolute inset-0 z-0">
               <FloatingArt src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500" x={10} y={15} delay={0} scale={0.8} />
               <FloatingArt src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500" x={75} y={10} delay={2} scale={0.9} />
               <FloatingArt src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500" x={5} y={65} delay={4} scale={1.1} />
               <FloatingArt src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500" x={80} y={60} delay={6} scale={0.7} />
            </div>

            <div className="relative z-10 text-center space-y-12 max-w-5xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-600/10 border border-amber-600/20 rounded-full backdrop-blur-3xl">
                  <Sparkles size={14} className="text-amber-600" />
                  <span className="text-[10px] tracking-[0.4em] text-amber-600 font-black uppercase">Creator Collective</span>
                </div>
                
                <h1 className="text-6xl md:text-[10rem] font-light text-white tracking-tighter leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  The Artist's <br /> Sanctuary
                </h1>
                
                <p className="text-neutral-500 text-sm md:text-2xl font-light max-w-3xl mx-auto leading-relaxed italic">
                  "Where your vision meets its destiny. A digital pedestal crafted for the world's most exceptional creators."
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col md:flex-row gap-6 justify-center items-center"
              >
                <Link href="/artist/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-12 py-6 bg-amber-600 text-black text-xs font-black tracking-[0.4em] uppercase rounded-2xl shadow-[0_20px_40px_-10px_rgba(217,119,6,0.5)]"
                  >
                    Open Studio
                  </motion.button>
                </Link>
                <Link href="/gallery">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-12 py-6 bg-white/5 border border-white/10 text-white text-xs font-black tracking-[0.4em] uppercase rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Curate First
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-amber-600/50 to-transparent" />
              <span className="text-[9px] text-amber-600/60 font-black tracking-widest uppercase">Ascend</span>
            </div>
          </section>

          {/* Creator DNA: The Features */}
          <section className="py-44 px-4 md:px-12 max-w-7xl mx-auto border-b border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <p className="text-amber-600 text-[10px] tracking-[0.6em] font-black uppercase">Infrastructure</p>
                  <h2 className="text-4xl md:text-7xl font-light text-white leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>Architected for <br /> Masterpieces</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { title: 'Global Echo', desc: 'Sync your portfolio across every continent instantly.', icon: Globe },
                    { title: 'Purity Engine', desc: 'Preserves the soul of your art with ultra-high fidelity.', icon: ZapIcon },
                    { title: 'Safe Vault', desc: 'Bank-grade protection for every transaction.', icon: ShieldCheck },
                    { title: 'Pulse Analytics', desc: 'Understand how the world feels about your vision.', icon: PieChart }
                  ].map((f, i) => (
                    <div key={i} className="space-y-4 group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-600/40 transition-all">
                        <f.icon className="text-neutral-500 group-hover:text-amber-600" size={20} />
                      </div>
                      <h3 className="text-white text-sm font-black tracking-widest uppercase">{f.title}</h3>
                      <p className="text-neutral-500 text-xs font-light leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent rounded-[4rem] blur-3xl" />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative h-full border border-white/10 rounded-[4rem] overflow-hidden bg-neutral-950 shadow-2xl p-4"
                >
                  <div className="h-full w-full rounded-[3rem] border border-white/5 bg-[url('https://images.unsplash.com/photo-1579783483458-83d02161294e?w=800')] bg-cover bg-center">
                    <div className="absolute inset-x-8 bottom-8 p-10 bg-neutral-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Selected Artist</p>
                          <p className="text-2xl text-white font-light" style={{ fontFamily: 'serif' }}>The Creator's Canvas</p>
                        </div>
                        <PenTool className="text-amber-600" size={24} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Elite Stats: The Proof */}
          <section className="py-44 px-4 md:px-12 max-w-7xl mx-auto">
             <div className="text-center mb-32 space-y-4">
                <p className="text-amber-600 text-[10px] tracking-[1em] font-black uppercase">The Proof</p>
                <h2 className="text-5xl md:text-9xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Global Impact</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
                {[
                  { label: 'Royalties Paid', val: '₹2M+', sub: 'Empowering creators' },
                  { label: 'Global Artists', val: '5k+', sub: 'Vibrant community' },
                  { label: 'Exhibitions', val: '150+', sub: 'World-class events' }
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                    className="text-center space-y-4"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full mb-8" />
                    <p className="text-6xl md:text-8xl font-light text-white" style={{ fontFamily: 'serif' }}>{s.val}</p>
                    <div className="space-y-1">
                      <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em]">{s.label}</p>
                      <p className="text-xs text-neutral-500 font-light">{s.sub}</p>
                    </div>
                  </motion.div>
                ))}
             </div>
          </section>

          {/* Final Call */}
          <section className="py-64 relative overflow-hidden border-t border-white/5">
             <div className="absolute inset-0 bg-amber-600/[0.02] pointer-events-none" />
             <div className="max-w-4xl mx-auto text-center px-4 space-y-12 relative z-10">
                <h2 className="text-5xl md:text-9xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  Write Your <br /> Narrative
                </h2>
                <p className="text-neutral-500 text-lg md:text-2xl font-light italic">
                  "The world is waiting for your vision. Don't let it remain unheard."
                </p>
                <div className="pt-8">
                  <Link href="/artist/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="px-16 py-8 bg-white text-black text-xs font-black tracking-[0.5em] uppercase rounded-2xl shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)]"
                    >
                      Join the Elite
                    </motion.button>
                  </Link>
                </div>
             </div>
          </section>

          <Footer />
        </>
      )}
    </main>
  )
}
