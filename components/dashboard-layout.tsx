'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { signOut, getCurrentUser, getProfile } from '@/lib/auth'
import { Profile } from '@/lib/types'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface DashboardLayoutProps {
  children: ReactNode
  navItems: { icon: any; label: string; href: string }[]
  role: 'artist' | 'collector' | 'admin'
}

const navAccent = {
  active: 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 text-white border-l-2 border-amber-600',
  hover: 'hover:bg-amber-600/10 hover:border-l-2 hover:border-amber-600/50',
  logo: 'border-amber-600/30 text-amber-600',
  mobile: 'text-amber-600',
}

export function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      const user = getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (user.user_role !== role) {
        router.push('/login')
        return
      }
      try {
        const fullProfile = await getProfile(user.user_id)
        if (!fullProfile) {
          await signOut()
          router.push('/login')
          return
        }
        setProfile(fullProfile)
      } catch (error) {
        await signOut()
        router.push('/login')
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
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
    const Icon = item.icon
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-light tracking-wider transition-all duration-200 ${
          isActive
            ? navAccent.active
            : `text-neutral-400 ${navAccent.hover}`
        }`}
        style={{ fontFamily: 'Oughter, serif' }}
      >
        <Icon size={20} strokeWidth={1.5} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-neutral-800 bg-neutral-950 backdrop-blur-xl lg:flex">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-20 items-center border-b border-neutral-800 px-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 border border-neutral-700 transition-all group-hover:bg-neutral-700 group-hover:border-neutral-600">
                <span className="text-sm font-serif text-white" style={{ fontFamily: 'Oughter, serif' }}>A</span>
              </div>
              <span className="text-lg font-light tracking-[0.2em] text-white" style={{ fontFamily: 'Oughter, serif' }}>ARTISAN</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-3 py-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-neutral-800 text-white border-l-2 border-neutral-600' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${isActive ? 'bg-neutral-700' : 'bg-neutral-900 group-hover:bg-neutral-800'}`}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="font-light tracking-wide">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-neutral-800 px-3 py-4">
            <Link href="/" className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-all hover:bg-neutral-900 hover:text-white group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 transition-all group-hover:bg-neutral-800">
                <Home size={18} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-light tracking-wide">Go to home</span>
            </Link>

            {loading ? (
              <div className="mb-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 animate-pulse">
                <div className="h-3 bg-neutral-800 rounded mb-2" />
                <div className="h-4 bg-neutral-800 rounded mb-1" />
                <div className="h-3 bg-neutral-800 rounded w-2/3" />
              </div>
            ) : profile ? (
              <div className="mb-3 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 text-white font-semibold">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-white">{profile.full_name}</p>
                    <p className="truncate text-xs text-neutral-400">{profile.email}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-400 transition-all hover:bg-neutral-900 hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 transition-all group-hover:bg-neutral-800">
                <LogOut size={18} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-light tracking-wide">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-amber-600/20 bg-gradient-to-r from-neutral-950 to-neutral-900 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${navAccent.logo}`}>
            <span className="text-xs font-serif" style={{ fontFamily: 'Oughter, serif' }}>A</span>
          </div>
          <span className="text-base font-light tracking-[0.15em] text-white/90" style={{ fontFamily: 'Oughter, serif' }}>
            ARTISAN
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-600/10 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {sidebarOpen ? <X size={24} className="pointer-events-none" /> : <Menu size={24} className="pointer-events-none" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 mt-16 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute right-0 top-0 flex h-full w-64 flex-col border-l border-amber-600/20 bg-gradient-to-b from-neutral-950 to-neutral-900 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide px-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
                      pathname === item.href ? navAccent.active : 'text-neutral-400 hover:bg-amber-600/10 hover:text-amber-600'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={1.5} />
                    <span className="text-sm font-light tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="border-t border-amber-600/20 px-3 pt-4">
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-neutral-400 transition-all hover:bg-amber-600/10 hover:text-amber-600"
                >
                  <Home size={20} strokeWidth={1.5} />
                  <span className="text-sm font-light tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>Go to home</span>
                </Link>
                <div className="mb-2 rounded-lg border border-amber-600/20 bg-black/30 px-3 py-2">
                  <p className="mb-0.5 text-xs font-light uppercase tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>Account</p>
                  <p className="truncate text-sm font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{profile?.full_name || '...'}</p>
                  <p className="truncate text-xs text-neutral-400">{profile?.email || '...'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-neutral-400 transition-all hover:bg-amber-600/10 hover:text-amber-600"
                >
                  <LogOut size={20} strokeWidth={1.5} />
                  <span className="text-sm font-light tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-amber-600/20 bg-gradient-to-r from-neutral-950 to-neutral-900 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                  isActive ? navAccent.mobile : 'text-neutral-500'
                }`}
              >
                <Icon size={22} strokeWidth={1.5} />
                <span className="text-[10px] font-light tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative min-h-screen pb-20 pt-16 lg:pb-0 lg:pt-0 lg:pl-64 overflow-x-hidden">
        <div className="min-h-screen overflow-x-hidden">
          {loading ? (
            <div className="p-6 lg:p-10 space-y-6">
              <div className="h-8 bg-neutral-800 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-neutral-800 rounded w-1/2 animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {[1,2,3,4].map(i => <div key={i} className="h-24 bg-neutral-800 rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : children}
        </div>
      </main>
    </div>
  )
}
