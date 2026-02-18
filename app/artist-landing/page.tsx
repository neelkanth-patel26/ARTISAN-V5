'use client'

import { ArrowRight, Sparkles, TrendingUp, Users, Shield, Zap, DollarSign, CheckCircle, Star, Award, Palette, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import ArtistPreloader from '@/components/artist-preloader'

export default function ArtistLanding() {
  const [loading, setLoading] = useState(true)
  const [activeFeature, setActiveFeature] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'pwa-desktop' | 'pwa-mobile'>('desktop')

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth < 1024
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      
      if (isPWA && isMobile) {
        setDeviceType('pwa-mobile')
      } else if (isPWA && !isMobile) {
        setDeviceType('pwa-desktop')
      } else if (isMobile) {
        setDeviceType('mobile')
      } else {
        setDeviceType('desktop')
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    const handleWheel = (e: WheelEvent) => {
      if (deviceType !== 'desktop' && deviceType !== 'pwa-desktop') return
      if (isScrolling || loading) return
      
      e.preventDefault()
      e.stopPropagation()
      setIsScrolling(true)
      
      if (e.deltaY > 0 && currentSection < 3) {
        setCurrentSection(prev => prev + 1)
      } else if (e.deltaY < 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1)
      }
      
      setTimeout(() => setIsScrolling(false), 1000)
    }

    if (deviceType === 'desktop' || deviceType === 'pwa-desktop') {
      document.body.style.overflow = 'hidden'
      window.addEventListener('wheel', handleWheel, { passive: false })
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('wheel', handleWheel as any)
    }
  }, [isScrolling, loading, deviceType, currentSection])

  return (
    <>
      <AnimatePresence>
        {loading && <ArtistPreloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      {!loading && (
        <div className={`min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-x-hidden ${deviceType === 'desktop' || deviceType === 'pwa-desktop' ? 'overflow-y-hidden h-screen' : 'overflow-y-auto scrollbar-hide'}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Navigation */}
          <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 py-6 px-6 md:px-12 bg-gradient-to-b from-black/50 via-black/30 to-transparent backdrop-blur-sm border-b border-amber-600/10"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link href="/" className="group">
                <span className="text-xl font-light tracking-[0.3em] text-white transition-colors group-hover:text-amber-500" style={{ fontFamily: 'ForestSmooth, serif' }}>ARTISAN</span>
              </Link>
              
              <Link href="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm tracking-wider rounded-lg font-medium"
                >
                  SIGN IN
                </motion.button>
              </Link>
            </div>
          </motion.nav>

          <div
            className="transition-transform duration-1000 ease-in-out"
            style={{
              transform: deviceType === 'desktop' || deviceType === 'pwa-desktop' ? `translateY(-${currentSection * 100}vh)` : 'none'
            }}
          >
          {/* Hero Section */}
          <section className="relative min-h-screen h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"
              animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
              animate={{ x: [0, -50, 0], y: [0, -80, 0], scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-amber-600/10 border border-amber-600/30 rounded-full backdrop-blur-sm"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-sm tracking-wider text-amber-500 font-medium">FOR CREATORS</span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-light text-white mb-6 leading-[0.95]" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="block"
                  >
                    Turn Your
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
                  >
                    Art Into Income
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl text-neutral-400 mb-10 leading-relaxed max-w-xl"
                >
                  Join 5,000+ artists earning from their passion. Upload, showcase, and sell your artwork to a global audience.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-4 mb-12"
                >
                  <Link href="/artist">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(217, 119, 6, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm tracking-wider rounded-xl font-medium flex items-center justify-center gap-2 shadow-xl shadow-amber-600/30"
                    >
                      START SELLING
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                  <Link href="/gallery">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 border-2 border-neutral-700 text-neutral-300 text-sm tracking-wider rounded-xl font-medium hover:border-amber-600/50 hover:bg-amber-600/5 transition-all"
                    >
                      VIEW GALLERY
                    </motion.button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex items-center gap-8"
                >
                  {[
                    { value: '₹2M+', label: 'Paid Out' },
                    { value: '50K+', label: 'Artworks' },
                    { value: '4.9★', label: 'Rating' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="text-center"
                    >
                      <p className="text-3xl font-light text-amber-500 mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                      <p className="text-xs text-neutral-500 tracking-wider">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="relative hidden lg:block"
              >
                <div className="relative aspect-square">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent rounded-full blur-3xl"
                  />
                  <div className="relative grid grid-cols-2 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
                      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400',
                      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400',
                      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400'
                    ].map((img, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        whileHover={{ scale: 1.05, zIndex: 10 }}
                        className="aspect-square rounded-2xl overflow-hidden border border-amber-600/20 shadow-2xl"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="min-h-screen h-screen flex items-center py-32 px-6 bg-gradient-to-b from-transparent via-neutral-950/50 to-transparent relative">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <h2 className="text-5xl md:text-6xl font-light text-white mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Succeed</span>
                </h2>
                <p className="text-xl text-neutral-400 max-w-2xl mx-auto">Powerful tools designed for modern artists</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Palette, title: 'Easy Upload', desc: 'Upload and manage your artwork with our intuitive dashboard', color: 'from-amber-600 to-orange-500' },
                  { icon: BarChart3, title: 'Analytics', desc: 'Track views, engagement, and sales with real-time insights', color: 'from-blue-600 to-cyan-500' },
                  { icon: DollarSign, title: 'Fair Pricing', desc: 'Keep 85% of every sale with transparent, artist-friendly fees', color: 'from-green-600 to-emerald-500' },
                  { icon: Shield, title: 'Secure Platform', desc: 'Your artwork is protected with advanced security measures', color: 'from-purple-600 to-pink-500' },
                  { icon: Zap, title: 'Instant Payouts', desc: 'Receive your earnings quickly with multiple payment options', color: 'from-yellow-600 to-amber-500' },
                  { icon: Users, title: 'Global Reach', desc: 'Connect with collectors and artists from around the world', color: 'from-red-600 to-rose-500' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative p-8 bg-neutral-900/50 border border-neutral-800 hover:border-amber-600/30 rounded-2xl transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                      <div className="w-full h-full bg-neutral-900 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-7 h-7 text-amber-500" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-light text-white mb-3" style={{ fontFamily: 'ForestSmooth, serif' }}>{feature.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="min-h-screen h-screen flex items-center py-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-600/5 to-transparent" />
            <motion.div
              animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -30, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
            />

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 mb-8">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-6xl md:text-7xl font-light text-white mb-8 leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  Ready to Start Your Journey?
                </h2>
                <p className="text-2xl text-neutral-400 mb-12 leading-relaxed">
                  Join thousands of artists already building their careers on Artisan
                </p>
                <Link href="/artist">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(217, 119, 6, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-12 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-base tracking-wider rounded-xl font-medium inline-flex items-center gap-3 shadow-2xl shadow-amber-600/40"
                  >
                    GET STARTED NOW
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Footer */}
          <footer className="min-h-screen h-screen flex items-center py-16 px-6 border-t border-neutral-800/50 bg-neutral-950/50">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                  <span className="text-xl font-light tracking-[0.3em] text-white mb-4 block" style={{ fontFamily: 'ForestSmooth, serif' }}>ARTISAN</span>
                  <p className="text-sm text-neutral-400 leading-relaxed">Empowering artists to turn their passion into income.</p>
                </div>
                <div>
                  <h4 className="text-xs tracking-[0.2em] text-amber-600/70 font-light mb-4 uppercase">Platform</h4>
                  <ul className="space-y-2">
                    <li><Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Home</Link></li>
                    <li><Link href="/gallery" className="text-sm text-neutral-400 hover:text-white transition-colors">Gallery</Link></li>
                    <li><Link href="/artist" className="text-sm text-neutral-400 hover:text-white transition-colors">Artists</Link></li>
                    <li><Link href="/exhibitions" className="text-sm text-neutral-400 hover:text-white transition-colors">Exhibitions</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs tracking-[0.2em] text-amber-600/70 font-light mb-4 uppercase">For Artists</h4>
                  <ul className="space-y-2">
                    <li><Link href="/artist-landing" className="text-sm text-neutral-400 hover:text-white transition-colors">Why Join</Link></li>
                    <li><Link href="/signup" className="text-sm text-neutral-400 hover:text-white transition-colors">Sign Up</Link></li>
                    <li><Link href="/login" className="text-sm text-neutral-400 hover:text-white transition-colors">Login</Link></li>
                    <li><Link href="/dashboard/artist" className="text-sm text-neutral-400 hover:text-white transition-colors">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs tracking-[0.2em] text-amber-600/70 font-light mb-4 uppercase">Support</h4>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="text-sm text-neutral-400 hover:text-white transition-colors">About Us</Link></li>
                    <li><Link href="/contact" className="text-sm text-neutral-400 hover:text-white transition-colors">Contact</Link></li>
                    <li><Link href="/help" className="text-sm text-neutral-400 hover:text-white transition-colors">Help Center</Link></li>
                    <li><Link href="/terms" className="text-sm text-neutral-400 hover:text-white transition-colors">Terms</Link></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-neutral-800/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-neutral-500 text-sm">© 2026 Gaming Network Studio Media Group</p>
                <p className="text-neutral-600 text-xs">Made By Group 1</p>
              </div>
            </div>
          </footer>
          </div>
        </div>
      )}
    </>
  )
}
