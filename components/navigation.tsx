'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutDashboard, LogOut } from 'lucide-react'
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

  useEffect(() => { setUser(getCurrentUser()) }, [pathname])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (pathname === '/' && !isMobile) {
      const t = setTimeout(() => setShowNav(true), 4500)
      return () => clearTimeout(t)
    }
    setShowNav(true)
  }, [pathname, isMobile])

  const navItems = [
    { name: 'Home',           path: '/' },
    { name: 'Gallery',        path: '/gallery' },
    { name: 'Artists',        path: '/artist' },
    { name: 'Exhibitions',    path: '/exhibitions' },
    { name: 'Visit',          path: '/visit' },
    { name: 'About',          path: '/about' },
    { name: 'Artist Landing', path: '/artist-landing' },
  ]

  return (
    <motion.nav
      initial={pathname === '/' && !isMobile ? { y: -100, opacity: 0 } : false}
      animate={showNav ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/50 backdrop-blur-3xl border-b border-white/[0.04] pt-[max(0px,env(safe-area-inset-top))]"
    >
      {/* top amber shimmer — matches hero */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />

      {/* ── single bar: logo | nav links | user | menu ── */}
      <div className="px-5 md:px-12 py-3.5 md:py-5 flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal gap-4 relative z-10">

        {/* Logo */}
        <Link href="/" className="group shrink-0">
          <span
            className="text-base md:text-xl font-light tracking-[0.45em] text-white/90 group-hover:text-white transition-colors duration-300"
            style={{ fontFamily: 'ForestSmooth, serif' }}
          >
            ARTISAN
          </span>
        </Link>

        {/* Desktop nav links — centred, same row */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-12 justify-center">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path} className="relative group">
              <span className={`text-[9px] tracking-[0.6em] font-black uppercase transition-all duration-500 selection:bg-transparent ${
                pathname === item.path
                  ? 'text-white'
                  : 'text-white/35 group-hover:text-white/80 group-hover:tracking-[0.7em]'
              }`}>
                {item.name}
              </span>
              {pathname === item.path && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/70 to-transparent"
                  transition={{ duration: 0.35 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right: user info + menu */}
        <div className="flex items-center gap-4 justify-end">
          {user && (
            <div className="hidden lg:flex items-center gap-3">
              <span className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500">
                {user.user_name || user.email}
              </span>
            </div>
          )}

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(v => !v)}
            className="group flex flex-col justify-center gap-[5px] w-10 h-10 rounded-full border border-white/[0.08] active:border-amber-600/40 active:bg-amber-600/5 hover:border-amber-600/30 hover:bg-amber-600/5 transition-all duration-300 items-center touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="block w-4 h-px bg-white/50 group-hover:bg-amber-500/70 transition-colors origin-center"
            />
            <motion.span
              animate={isMenuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block w-3 h-px bg-white/30 group-hover:bg-amber-500/50 transition-colors"
            />
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="block w-4 h-px bg-white/50 group-hover:bg-amber-500/70 transition-colors origin-center"
            />
          </button>
        </div>
      </div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59]"
            />

            {/* panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-[100dvh] w-full md:w-[460px] bg-neutral-950 border-l border-white/[0.05] z-[60] flex flex-col overflow-hidden pt-[max(0px,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              {/* ambient glow — matches hero orbs */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/[0.06] rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-600/[0.03] rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 to-black/60" />
              </div>

              {/* drawer header */}
              <div className="relative z-10 flex items-center justify-between px-8 md:px-12 py-5 md:py-6 border-b border-white/[0.05] shrink-0">
                <span
                  className="text-xl font-light tracking-[0.5em] text-white/80 uppercase"
                  style={{ fontFamily: 'ForestSmooth, serif' }}
                >
                  Artisan
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 rounded-full border border-white/[0.07] flex items-center justify-center hover:border-amber-600/30 hover:bg-amber-600/5 transition-all duration-400 group"
                >
                  <X size={16} strokeWidth={1.5} className="text-neutral-500 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* nav links */}
              <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-12 py-4 md:py-6 space-y-0.5 md:space-y-1 scrollbar-hide">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group flex items-center justify-between py-4 md:py-5 px-5 md:px-6 rounded-2xl transition-all duration-400 active:bg-white/[0.04] ${
                        pathname === item.path
                          ? 'bg-white/[0.03] border border-white/[0.07] text-white'
                          : 'border border-transparent text-neutral-500 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-[8px] font-black tabular-nums text-amber-600/30 w-4 shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`text-[11px] md:text-xs tracking-[0.35em] font-black uppercase transition-all duration-400 ${
                          pathname === item.path ? 'translate-x-1' : 'group-hover:translate-x-1'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      {pathname === item.path && (
                        <motion.div
                          layoutId="drawerActive"
                          className="w-1 h-4 bg-amber-600 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* auth footer */}
              <div className="relative z-10 px-6 md:px-12 py-6 md:py-8 border-t border-white/[0.05] shrink-0">
                {user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="space-y-4"
                  >
                    {/* identity card */}
                    <div className="relative px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden group/card">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/[0.05] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                      <p className="text-[8px] tracking-[0.5em] font-black uppercase text-amber-600/50 mb-1">Verified Identity</p>
                      <p className="text-base font-light text-white truncate">{user.user_name || user.email}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                        <span className="text-[8px] tracking-[0.3em] font-black uppercase text-neutral-500">Active Session</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-4 bg-white text-black rounded-2xl text-[9px] font-black tracking-[0.4em] uppercase hover:bg-amber-400 transition-colors duration-300"
                      >
                        <LayoutDashboard size={12} />
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut()
                          setUser(null)
                          setIsMenuOpen(false)
                          toast.success('Disconnected successfully')
                          router.push('/')
                        }}
                        className="flex items-center justify-center gap-2 py-4 border border-white/[0.07] text-neutral-500 hover:text-amber-600 hover:border-amber-600/30 rounded-2xl text-[9px] font-black tracking-[0.4em] uppercase transition-all duration-400"
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="grid grid-cols-1 gap-3"
                  >
                    <Link
                      href="/login"
                      onClick={() => { setIsMenuOpen(false); window.location.href = '/login' }}
                      className="py-5 bg-white text-black text-center rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:bg-amber-400 transition-colors duration-300"
                    >
                      Identity Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => { setIsMenuOpen(false); window.location.href = '/signup' }}
                      className="py-5 border border-white/[0.08] text-white/60 text-center rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/[0.04] hover:text-white transition-all duration-400"
                    >
                      Join Collective
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
