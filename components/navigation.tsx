'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard, LogOut, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showNav, setShowNav] = useState(pathname !== '/')
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<{ user_name?: string; email?: string; user_role: string } | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [pathname])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (pathname === '/' && !isMobile) {
      const timer = setTimeout(() => setShowNav(true), 4500)
      return () => clearTimeout(timer)
    } else {
      setShowNav(true)
    }
  }, [pathname, isMobile])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Artists', path: '/artist' },
    { name: 'Exhibitions', path: '/exhibitions' },
    { name: 'Visit', path: '/visit' },
    { name: 'About', path: '/about' },
    { name: 'Artist Landing', path: '/artist-landing' },
  ]

  return (
    <motion.nav
      initial={pathname === '/' && !isMobile ? { y: -100, opacity: 0 } : false}
      animate={showNav ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 py-3 md:py-6 bg-neutral-950/40 backdrop-blur-3xl border-b border-white/5 pt-[max(10px,env(safe-area-inset-top))]"
    >
      {/* Header Top Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="px-6 md:px-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center gap-2 md:gap-4 group">
            <div className="w-6 h-6 md:w-8 md:h-10 border border-amber-600/30 flex items-center justify-center transition-all duration-300 group-hover:border-amber-600/60 lg:hidden">
              <span className="text-amber-600/70 text-[10px] md:text-xs font-serif group-hover:text-amber-600 uppercase">A</span>
            </div>
            <h2 className="text-sm md:text-2xl font-light tracking-[0.4em] text-white/90 transition-colors group-hover:text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
              ARTISAN
            </h2>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-sm text-neutral-400">
                Hi, <span className="font-medium text-white">{user.user_name || user.email || 'User'}</span>
              </span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
              >
                Dashboard
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg p-2 text-neutral-400 transition-all duration-300 hover:bg-neutral-800/30 hover:text-white touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Menu size={18} strokeWidth={1} className="md:h-5 md:w-5 pointer-events-none" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[59]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-screen w-full md:w-[480px] bg-neutral-950 border-l border-white/5 shadow-2xl z-[60] overflow-hidden flex flex-col pt-[max(10px,env(safe-area-inset-top))]"
            >
              {/* Background Textures */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-black opacity-50" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(217,119,6,0.05),transparent_50%)]" />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between p-8 md:p-12 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-10 border border-amber-600/20 flex items-center justify-center lg:hidden bg-white/[0.02]">
                      <span className="text-amber-600/70 text-xs font-serif uppercase">A</span>
                    </div>
                    <h3 className="text-2xl font-light text-white tracking-[0.5em] uppercase" style={{ fontFamily: 'ForestSmooth, serif' }}>Artisan</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="group"
                  >
                    <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/5 transition-all duration-500">
                      <X size={20} strokeWidth={1} className="text-neutral-500 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-8 md:p-12 space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Link
                          href={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`group flex items-center justify-between py-5 px-6 rounded-2xl transition-all duration-500 ${
                            pathname === item.path
                              ? 'bg-white/[0.03] border border-white/5 text-white'
                              : 'text-neutral-500 hover:text-white hover:bg-white/[0.01]'
                          }`}
                        >
                          <span className={`text-xs tracking-[0.3em] font-black uppercase transition-all duration-500 ${
                            pathname === item.path ? 'translate-x-2' : 'group-hover:translate-x-2'
                          }`}>
                            {item.name}
                          </span>
                          {pathname === item.path && (
                            <motion.div
                              layoutId="sidebarActive"
                              className="w-1 h-4 bg-amber-600 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-auto p-8 md:p-12 space-y-8">
                    {user ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-6"
                      >
                        {/* Elite Identity Card */}
                        <div className="relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden group/card shadow-2xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/[0.05] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
                          <div className="relative z-10 space-y-2">
                            <p className="text-[9px] tracking-[0.5em] font-black uppercase text-amber-600/60">Verified Identity</p>
                            <p className="text-xl font-light text-white truncate tracking-tight">{user.user_name || user.email}</p>
                            <div className="pt-4 flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[8px] tracking-[0.3em] font-black uppercase text-neutral-500">Active Session</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="group relative flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase overflow-hidden active:scale-[0.98] transition-all"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <LayoutDashboard size={14} />
                            <span>Dashboard</span>
                          </Link>
                          
                          <button
                            onClick={async () => {
                              await signOut()
                              setUser(null)
                              setIsMenuOpen(false)
                              toast.success('Disconnected successfully')
                              router.push('/')
                            }}
                            className="flex items-center justify-center gap-3 py-5 border border-white/5 text-neutral-500 hover:text-amber-600 hover:border-amber-600/30 rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500"
                          >
                            <LogOut size={14} />
                            <span>Terminate Session</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 gap-4"
                      >
                        <Link
                          href="/login"
                          onClick={() => { setIsMenuOpen(false); window.location.href = '/login' }}
                          className="py-5 bg-white text-black text-center rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:bg-neutral-200 transition-all font-sans"
                        >
                          Identity Login
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => { setIsMenuOpen(false); window.location.href = '/signup' }}
                          className="py-5 bg-transparent border border-white/10 text-white text-center rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all font-sans"
                        >
                          Join Collective
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex items-center justify-center gap-10 lg:gap-14 -mt-6 relative z-10">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="relative group"
          >
            <span className="text-[9px] tracking-[0.6em] text-white/40 group-hover:text-white transition-all duration-500 font-black uppercase group-hover:tracking-[0.7em] selection:bg-transparent">
              {item.name}
            </span>
            {pathname === item.path && (
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/70 to-transparent"
                layoutId="activeNav"
                transition={{ duration: 0.3 }}
              />
            )}
          </Link>
        ))}
      </div>
    </motion.nav>
  )
}
