'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LogOut, Menu, X } from 'lucide-react'
import { signOut, getCurrentUser, getProfile } from '@/lib/auth'
import { Profile } from '@/lib/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface DashboardLayoutProps {
  children: ReactNode
  navItems: { icon: any; label: string; href: string }[]
  role: 'artist' | 'collector' | 'admin'
}

const roleLabel: Record<string, string> = {
  artist: 'Artist',
  collector: 'Collector',
  admin: 'Admin',
}

export function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // Grant a small window for hydration and state sync before enabling transitions
    const timer = setTimeout(() => setIsInitialLoad(false), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      const user = getCurrentUser()
      if (!user) { router.push('/login'); return }
      if (user.user_role !== role) { router.push('/login'); return }
      try {
        const fullProfile = await getProfile(user.user_id)
        if (!fullProfile) { await signOut(); router.push('/login'); return }
        setProfile(fullProfile)
      } catch {
        await signOut(); router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [role, router])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push('/')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden lg:flex flex-col ${!isInitialLoad ? 'transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]' : ''} w-64 border-r border-white/[0.04] bg-neutral-950/80 backdrop-blur-[40px]`}
      >
        {/* Atmospheric Sentinel - Sidebar Internal */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-10 w-64 h-64 bg-orange-600/[0.03] rounded-full blur-[80px]" />
          <div className="absolute bottom-40 -left-10 w-48 h-48 bg-orange-700/[0.02] rounded-full blur-[60px]" />
        </div>

        {/* Logo Section */}
        <div className="relative flex h-[80px] items-center shrink-0 border-b border-white/[0.04] px-6 gap-4">
          <span className="text-[15px] font-black tracking-[0.4em] text-white/90 whitespace-nowrap" style={{ fontFamily: 'Oughter, serif' }}>
            ARTISAN
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-3 py-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-4 rounded-2xl px-3.5 py-3 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${
                  isActive
                    ? 'bg-orange-600/[0.08] text-orange-400 border border-orange-500/20 shadow-[0_4px_20px_rgba(234,88,12,0.05)]'
                    : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={`shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-[13px] font-light tracking-widest whitespace-nowrap" style={{ fontFamily: 'Oughter, serif' }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Global Control & Identity */}
        <div className="px-3 pb-8 space-y-4">
          <div className="px-3 flex flex-col gap-1.5">
            <Link
              href="/"
              className="group flex items-center gap-4 rounded-2xl px-3.5 py-3 text-neutral-600 hover:text-neutral-200 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-all duration-500"
            >
              <Home size={18} strokeWidth={1.5} className="shrink-0 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-[13px] font-light tracking-[0.2em] uppercase" style={{ fontFamily: 'Oughter, serif' }}>Home Portal</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-4 rounded-2xl px-3.5 py-3 text-neutral-600 hover:text-rose-400 hover:bg-rose-500/[0.03] border border-transparent hover:border-rose-500/10 transition-all duration-500"
            >
              <LogOut size={18} strokeWidth={1.5} className="shrink-0 transition-transform duration-500 group-hover:scale-110" />
              <span className="text-[13px] font-light tracking-[0.2em] uppercase" style={{ fontFamily: 'Oughter, serif' }}>Terminate</span>
            </button>
          </div>

          {/* User Identity Panel - VIP Redesign */}
          <div className="relative pt-6 border-t border-white/[0.04]">
            {!loading && profile && (
              <div className="mx-1 p-4 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] flex items-center gap-4 shadow-xl relative overflow-hidden group">
                {/* Subtle depth glow */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/[0.02] blur-xl rounded-full" />
                
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 border border-white/[0.05] text-orange-500 text-[15px] font-black group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(234,88,12,0.15)] transition-all duration-500" style={{ fontFamily: 'Oughter, serif' }}>
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="truncate text-[13px] font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {profile.full_name}
                  </p>
                  <div className="flex items-center">
                    <span className="text-[8px] tracking-[0.3em] uppercase font-black text-orange-500/70 bg-orange-500/5 px-2 py-0.5 rounded-lg border border-orange-500/10">
                      {roleLabel[role]}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-24 items-center justify-between border-b border-white/[0.04] bg-neutral-950/80 backdrop-blur-2xl px-6 lg:hidden"
        style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}
      >
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/10 border border-orange-500/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.53-.19-1.01-.5-1.38-.31-.37-.5-.85-.5-1.37 0-1.1.9-2 2-2h2.34c3.12 0 5.66-2.54 5.66-5.66C23 6.01 18.03 2 12 2z" fill="url(#pSidGradMob)" opacity="0.9"/>
              <defs>
                <linearGradient id="pSidGradMob" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#f97316" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#92400e" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-[13px] font-black tracking-[0.3em] text-white/90" style={{ fontFamily: 'Oughter, serif' }}>ARTISAN</span>
        </Link>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600/10 border border-orange-600/20 text-orange-400 text-[12px] font-black" style={{ fontFamily: 'Oughter, serif' }}>
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white transition-all"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col border-l border-white/[0.04] bg-neutral-950/90 backdrop-blur-3xl lg:hidden overflow-y-auto scrollbar-hide"
              style={{ paddingTop: 'calc(6rem + max(0px, env(safe-area-inset-top)))' }}
            >
              {/* Internal Atmospherics */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative px-6 py-4 flex items-center justify-between border-b border-white/[0.04]">
                <span className="text-[10px] tracking-[0.4em] uppercase font-black text-orange-600/60 bg-orange-600/5 px-3 py-1 rounded-full border border-orange-500/10">
                  {roleLabel[role]} Protocol
                </span>
              </div>

              <nav className="relative flex-1 px-4 py-8 space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`relative flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                        isActive
                          ? 'bg-orange-600/10 text-orange-400 border border-orange-500/20'
                          : 'text-neutral-500 hover:text-neutral-200'
                      }`}
                    >
                      <item.icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="text-[14px] font-light tracking-widest uppercase" style={{ fontFamily: 'Oughter, serif' }}>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="relative border-t border-white/[0.04] p-6 space-y-6">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-4 text-neutral-500 hover:text-white transition-all"
                >
                  <Home size={18} />
                  <span className="text-[12px] font-light tracking-[0.2em] uppercase" style={{ fontFamily: 'Oughter, serif' }}>Return Home</span>
                </Link>

                {profile && (
                  <div className="p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-900 border border-white/5 text-orange-500 text-[15px] font-black" style={{ fontFamily: 'Oughter, serif' }}>
                      {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[14px] font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{profile.full_name}</p>
                      <p className="truncate text-[10px] text-neutral-600 mt-0.5 tracking-tight">{profile.email}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 text-neutral-600 hover:text-rose-400 transition-all font-black"
                >
                  <LogOut size={18} />
                  <span className="text-[12px] font-light tracking-[0.2em] uppercase" style={{ fontFamily: 'Oughter, serif' }}>Terminate Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/[0.04] bg-neutral-950/80 backdrop-blur-2xl lg:hidden"
        style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1.5 py-1 transition-all duration-300 ${
                  isActive ? 'text-orange-400 scale-110' : 'text-neutral-600'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[8px] font-black tracking-[0.2em] uppercase" style={{ fontFamily: 'Oughter, serif' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Main Context Viewport ── */}
      <main className="relative min-h-screen">
        <div className={`min-h-screen ${!isInitialLoad ? 'transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]' : ''} pb-20 pt-16 lg:pt-0 lg:pb-0 lg:pl-64`}>
          {loading ? (
            <div className="p-12 space-y-8 max-w-7xl mx-auto">
              <div className="h-10 bg-white/[0.02] rounded-[2rem] w-1/4 animate-pulse border border-white/[0.05]" />
              <div className="h-4 bg-white/[0.01] rounded-full w-1/2 animate-pulse border border-white/[0.03]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/[0.02] rounded-[2.5rem] animate-pulse border border-white/[0.05]" />)}
              </div>
            </div>
          ) : (
            <div className="max-w-[1600px] mx-auto min-h-screen">
              {children}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
