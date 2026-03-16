'use client'

import { Sparkles, Globe, Zap as ZapIcon, ShieldCheck, PieChart, PenTool } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
import ArtistPreloader from '@/components/artist-preloader'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const FloatingArt = ({ src, delay = 0, x = 0, y = 0, scale = 1, mobileHide = false }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      y: [y, y - 16, y],
      rotate: [0, 2, 0],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'easeInOut' }}
    style={{ left: `${x}%`, top: `${y}%`, scale }}
    className={`absolute rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl z-0 blur-[2px] hover:blur-0 transition-all duration-700
      w-28 h-40 md:w-48 md:h-64 lg:w-64 lg:h-80
      ${mobileHide ? 'hidden sm:block' : ''}`}
  >
    <img src={src} className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity duration-700" />
    <div className="absolute inset-0 bg-neutral-950/20" />
  </motion.div>
)

export default function ArtistLanding() {
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] })
  useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  return (
    <main ref={containerRef} className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 min-h-screen selection:bg-amber-600/30 overflow-x-hidden">
      <AnimatePresence>
        {loading && <ArtistPreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Navigation />

          {/* ── Hero ── */}
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-white/5 px-4 py-24 pt-32">
            {/* Floating art — only 2 visible on mobile, all 4 on desktop */}
            <div className="absolute inset-0 z-0">
              <FloatingArt src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500" x={2} y={10} delay={0} scale={0.8} />
              <FloatingArt src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500" x={72} y={8} delay={2} scale={0.9} mobileHide />
              <FloatingArt src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500" x={0} y={62} delay={4} scale={1} mobileHide />
              <FloatingArt src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=500" x={76} y={58} delay={6} scale={0.7} />
            </div>

            {/* Radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(217,119,6,0.07),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 text-center space-y-8 md:space-y-12 max-w-4xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-5 md:space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 md:px-6 bg-amber-600/10 border border-amber-600/20 rounded-full backdrop-blur-3xl">
                  <Sparkles size={12} className="text-amber-600" />
                  <span className="text-[9px] md:text-[10px] tracking-[0.4em] text-amber-600 font-black uppercase">Creator Collective</span>
                </div>

                <h1
                  className="text-[2.8rem] leading-[1] sm:text-6xl md:text-8xl lg:text-[9rem] font-light text-white tracking-tighter"
                  style={{ fontFamily: 'ForestSmooth, serif' }}
                >
                  The Artist's<br />Sanctuary
                </h1>

                <p className="text-neutral-400 text-xs sm:text-sm md:text-lg font-light max-w-xl mx-auto leading-relaxed italic px-2">
                  "Where your vision meets its destiny. A digital pedestal crafted for the world's most exceptional creators."
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link href="/artist/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-amber-600 text-black text-[10px] md:text-xs font-black tracking-[0.4em] uppercase rounded-2xl shadow-[0_20px_40px_-10px_rgba(217,119,6,0.5)]"
                  >
                    Get Started
                  </motion.button>
                </Link>
                <Link href="/gallery" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 bg-white/5 border border-white/10 text-white text-[10px] md:text-xs font-black tracking-[0.4em] uppercase rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Curate First
                  </motion.button>
                </Link>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
              <div className="w-px h-16 md:h-24 bg-gradient-to-b from-transparent via-amber-600/50 to-transparent" />
              <span className="text-[8px] md:text-[9px] text-amber-600/60 font-black tracking-widest uppercase">Ascend</span>
            </div>
          </section>

          {/* ── Features ── */}
          <section className="py-20 md:py-32 lg:py-44 px-5 md:px-12 max-w-7xl mx-auto border-b border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 lg:gap-32 items-center">
              <div className="space-y-8 md:space-y-12">
                <div className="space-y-3 md:space-y-4">
                  <p className="text-amber-600 text-[10px] tracking-[0.6em] font-black uppercase">Infrastructure</p>
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light text-white leading-tight"
                    style={{ fontFamily: 'ForestSmooth, serif' }}
                  >
                    Architected for<br />Masterpieces
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-5 md:gap-8">
                  {[
                    { title: 'Global Echo', desc: 'Sync your portfolio across every continent instantly.', icon: Globe },
                    { title: 'Purity Engine', desc: 'Preserves the soul of your art with ultra-high fidelity.', icon: ZapIcon },
                    { title: 'Safe Vault', desc: 'Bank-grade protection for every transaction.', icon: ShieldCheck },
                    { title: 'Pulse Analytics', desc: 'Understand how the world feels about your vision.', icon: PieChart },
                  ].map((f, i) => (
                    <div key={i} className="space-y-3 group">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-600/40 transition-all">
                        <f.icon className="text-neutral-500 group-hover:text-amber-600" size={16} />
                      </div>
                      <h3 className="text-white text-[10px] md:text-sm font-black tracking-widest uppercase">{f.title}</h3>
                      <p className="text-neutral-500 text-[10px] md:text-xs font-light leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature image card */}
              <div className="relative aspect-square max-w-sm mx-auto w-full lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent rounded-[2.5rem] md:rounded-[4rem] blur-3xl" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative h-full border border-white/10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-neutral-950 shadow-2xl p-3 md:p-4"
                >
                  <div
                    className="h-full w-full rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783483458-83d02161294e?w=800')" }}
                  >
                    <div className="absolute inset-x-4 md:inset-x-8 bottom-4 md:bottom-8 p-5 md:p-10 bg-neutral-950/40 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] space-y-2 md:space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[9px] md:text-[10px] text-amber-600 font-black uppercase tracking-widest">Selected Artist</p>
                          <p className="text-base md:text-2xl text-white font-light" style={{ fontFamily: 'serif' }}>The Creator's Canvas</p>
                        </div>
                        <PenTool className="text-amber-600" size={18} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── Stats ── */}
          <section className="py-20 md:py-32 lg:py-44 px-5 md:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20 lg:mb-32 space-y-3 md:space-y-4">
              <p className="text-amber-600 text-[10px] tracking-[0.8em] md:tracking-[1em] font-black uppercase">The Proof</p>
              <h2
                className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-light text-white"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              >
                Global Impact
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-16 lg:gap-24">
              {[
                { label: 'Royalties Paid', val: '₹2M+', sub: 'Empowering creators' },
                { label: 'Global Artists', val: '5k+', sub: 'Vibrant community' },
                { label: 'Exhibitions', val: '150+', sub: 'World-class events' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center space-y-3 md:space-y-4"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full mb-6 md:mb-8" />
                  <p className="text-5xl md:text-6xl lg:text-8xl font-light text-white" style={{ fontFamily: 'serif' }}>{s.val}</p>
                  <div className="space-y-1">
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.4em]">{s.label}</p>
                    <p className="text-xs text-neutral-500 font-light">{s.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Final CTA ── */}
          <section className="py-28 md:py-44 lg:py-64 relative overflow-hidden border-t border-white/5 px-5">
            <div className="absolute inset-0 bg-amber-600/[0.02] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(217,119,6,0.05),transparent_70%)] pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center space-y-8 md:space-y-12 relative z-10">
              <h2
                className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-light text-white leading-none"
                style={{ fontFamily: 'ForestSmooth, serif' }}
              >
                Write Your<br />Narrative
              </h2>
              <p className="text-neutral-500 text-sm md:text-lg lg:text-2xl font-light italic">
                "The world is waiting for your vision. Don't let it remain unheard."
              </p>
              <div className="pt-4 md:pt-8">
                <Link href="/artist/signup">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-10 md:px-16 py-5 md:py-8 bg-white text-black text-[10px] md:text-xs font-black tracking-[0.5em] uppercase rounded-2xl shadow-[0_30px_60px_-15px_rgba(255,255,255,0.3)]"
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
