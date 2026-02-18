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
      className="fixed top-0 left-0 right-0 z-50 py-6 md:py-8 bg-gradient-to-b from-black/50 via-black/30 to-transparent backdrop-blur-sm border-b border-amber-600/10"
    >
      <div className="px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-6 h-6 md:w-8 md:h-8 border border-amber-600/40 flex items-center justify-center transition-all duration-300 group-hover:border-amber-600/70 group-hover:shadow-lg group-hover:shadow-amber-600/20 lg:hidden">
              <span className="text-amber-600/70 text-[10px] md:text-xs font-serif group-hover:text-amber-600">A</span>
            </div>
            <h2 className="text-sm md:text-lg font-light tracking-[0.2em] md:tracking-[0.3em] text-white/90 transition-colors group-hover:text-white" style={{ fontFamily: 'Oughter, serif' }}>
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
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border-l border-amber-600/20 shadow-2xl z-[60] overflow-hidden"
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-amber-600/40 flex items-center justify-center lg:hidden">
                      <span className="text-amber-600/70 text-xs font-serif">A</span>
                    </div>
                    <h3 className="text-xl font-light text-white/90 tracking-[0.2em]" style={{ fontFamily: 'Oughter, serif' }}>ARTISAN</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-neutral-800/50 rounded-lg touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X size={22} strokeWidth={1.5} className="pointer-events-none" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 md:p-8 space-y-1">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block py-4 px-4 text-base transition-all font-light tracking-wider rounded-lg group ${
                            pathname === item.path
                              ? 'text-amber-600 bg-amber-600/10 border border-amber-600/30'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/30'
                          }`}
                        >
                          <span className="flex items-center justify-between">
                            {item.name}
                            {pathname === item.path && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 bg-amber-600 rounded-full"
                              />
                            )}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="space-y-4 px-6 pb-8 md:px-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      {user ? (
                        <>
                          <div className="rounded-lg border border-neutral-700/50 bg-neutral-800/30 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                              Logged in as
                            </p>
                            <p className="truncate font-medium text-white">{user.user_name || user.email || 'User'}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex w-full items-center justify-center gap-2 py-3 px-4 bg-amber-600 text-white font-medium rounded-lg transition-colors hover:bg-amber-500"
                          >
                            <LayoutDashboard size={18} />
                            Dashboard
                          </Link>
                          <button
                            onClick={async () => {
                              await signOut()
                              setUser(null)
                              setIsMenuOpen(false)
                              toast.success(
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
                                    <CheckCircle2 size={20} className="text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">Logged out successfully</p>
                                    <p className="text-xs text-neutral-400">See you again soon!</p>
                                  </div>
                                </div>,
                                {
                                  duration: 3000,
                                  style: {
                                    background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)',
                                    border: '1px solid rgba(217, 119, 6, 0.3)',
                                    padding: '16px',
                                    borderRadius: '12px',
                                  }
                                }
                              )
                              router.push('/')
                            }}
                            className="flex w-full items-center justify-center gap-2 py-3 px-4 border border-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors hover:bg-neutral-800 hover:text-white"
                          >
                            <LogOut size={18} />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={(e) => {
                              e.preventDefault()
                              setIsMenuOpen(false)
                              window.location.href = '/login'
                            }}
                            className="block w-full py-3 px-4 bg-amber-600 text-white text-center font-medium rounded-lg transition-colors hover:bg-amber-500"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/signup"
                            onClick={(e) => {
                              e.preventDefault()
                              setIsMenuOpen(false)
                              window.location.href = '/signup'
                            }}
                            className="block w-full py-3 px-4 bg-neutral-800 text-white text-center font-medium rounded-lg transition-colors border border-neutral-700 hover:bg-neutral-700"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:flex items-center justify-center gap-8 lg:gap-10 -mt-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="relative group"
          >
            <span className="text-xs tracking-[0.2em] text-neutral-400 hover:text-white transition-all duration-300 font-light group-hover:tracking-[0.25em]">
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
