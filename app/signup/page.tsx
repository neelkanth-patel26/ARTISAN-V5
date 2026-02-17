'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Palette, ShoppingBag, Shield, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'artist' | 'collector' | 'admin'>('collector')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white">Passwords don't match</p>
            <p className="text-xs text-neutral-400">Please make sure both passwords are identical</p>
          </div>
        </div>,
        { duration: 4000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
      return
    }
    if (password.length < 6) {
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <AlertCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white">Password too short</p>
            <p className="text-xs text-neutral-400">Password must be at least 6 characters</p>
          </div>
        </div>,
        { duration: 4000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, role, fullName)
      toast.success(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-white">Account created!</p>
            <p className="text-xs text-neutral-400">Please sign in to continue</p>
          </div>
        </div>,
        { duration: 3000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(217, 119, 6, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
      
      // Check if there's a redirect URL stored, otherwise go to login
      const redirectUrl = typeof window !== 'undefined' ? localStorage.getItem('auth_redirect') : null
      if (redirectUrl) {
        // Don't remove it yet - let login page handle it after they sign in
        router.push('/login')
      } else {
        router.push('/login')
      }
    } catch (error: any) {
      toast.error(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
            <XCircle size={20} className="text-red-500" />
          </div>
          <div>
            <p className="font-medium text-white">Signup failed</p>
            <p className="text-xs text-neutral-400">{error.message || 'Please try again'}</p>
          </div>
        </div>,
        { duration: 4000, style: { background: 'linear-gradient(135deg, #1c1917 0%, #0a0a0a 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px' } }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl lg:block hidden"
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl lg:block hidden"
        animate={{ x: [0, -50, 0], y: [0, -80, 0], scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <button onClick={() => router.back()} className="absolute top-8 left-8 z-50 group">
        <motion.div 
          className="flex items-center gap-2 text-neutral-400 hover:text-amber-600 transition-colors"
          whileHover={!isMobile ? { x: -5 } : undefined}
        >
          <ArrowLeft size={20} />
          <span className="text-sm tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>BACK</span>
        </motion.div>
      </button>

      <div className="flex min-h-screen items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          animate={isMobile ? false : { opacity: 1, y: 0 }}
          transition={isMobile ? undefined : { duration: 0.8 }}
          className="w-full max-w-md"
        >
          <motion.div 
            className="mb-12 text-center"
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            transition={isMobile ? undefined : { duration: 0.6, delay: 0.2 }}
          >
            <motion.h1 
              className="text-6xl font-light tracking-[0.2em] text-white/90 mb-6"
              style={{ fontFamily: 'ForestSmooth, serif' }}
            >
              ARTISAN
            </motion.h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
              <p className="text-xs tracking-[0.3em] text-amber-600/80 font-light">JOIN THE COMMUNITY</p>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            animate={isMobile ? false : { opacity: 1, y: 0 }}
            transition={isMobile ? undefined : { duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border border-amber-600/20 bg-neutral-900/60 p-8 backdrop-blur-xl shadow-2xl"
          >
            <form onSubmit={handleSignup} className="space-y-6">
              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={isMobile ? false : { opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.4 }}
              >
                <label className="mb-3 block text-sm font-light tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>SELECT ROLE</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'collector', icon: ShoppingBag, label: 'Collector' },
                    { id: 'artist', icon: Palette, label: 'Artist' },
                    { id: 'admin', icon: Shield, label: 'Admin' },
                  ].map(({ id, icon: Icon, label }) => (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => setRole(id as any)}
                      className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                        role === id
                          ? 'border-amber-600/60 bg-amber-600/10'
                          : 'border-amber-600/20 bg-black/30 hover:border-amber-600/40'
                      }`}
                      whileHover={!isMobile ? { scale: 1.05 } : undefined}
                      whileTap={!isMobile ? { scale: 0.95 } : undefined}
                    >
                      <Icon className={`mb-2 ${role === id ? 'text-amber-600' : 'text-neutral-400'}`} size={24} />
                      <span className={`text-xs font-light tracking-wider ${role === id ? 'text-white' : 'text-neutral-400'}`}>
                        {label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={isMobile ? false : { opacity: 0, x: -20 }}
                animate={isMobile ? false : { opacity: 1, x: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.5 }}
              >
                <label className="mb-2 block text-sm font-light tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>FULL NAME</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-amber-600/20 bg-black/40 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  placeholder="John Doe"
                  required
                />
              </motion.div>

              <motion.div
                initial={isMobile ? false : { opacity: 0, x: -20 }}
                animate={isMobile ? false : { opacity: 1, x: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.6 }}
              >
                <label className="mb-2 block text-sm font-light tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-amber-600/20 bg-black/40 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  placeholder="your@email.com"
                  required
                />
              </motion.div>

              <motion.div
                initial={isMobile ? false : { opacity: 0, x: -20 }}
                animate={isMobile ? false : { opacity: 1, x: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.7 }}
              >
                <label className="mb-2 block text-sm font-light tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>PASSWORD</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-amber-600/20 bg-black/40 px-4 py-3 pr-12 text-white placeholder-neutral-600 transition-all focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={isMobile ? false : { opacity: 0, x: -20 }}
                animate={isMobile ? false : { opacity: 1, x: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.8 }}
              >
                <label className="mb-2 block text-sm font-light tracking-wider text-amber-600/70" style={{ fontFamily: 'Oughter, serif' }}>CONFIRM PASSWORD</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-amber-600/20 bg-black/40 px-4 py-3 text-white placeholder-neutral-600 transition-all focus:border-amber-600/50 focus:outline-none focus:ring-2 focus:ring-amber-600/20"
                  placeholder="••••••••"
                  required
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 py-3.5 font-light tracking-wider text-white transition-all hover:from-amber-500 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                whileHover={!isMobile ? { scale: 1.02 } : undefined}
                whileTap={!isMobile ? { scale: 0.98 } : undefined}
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={isMobile ? false : { opacity: 1, y: 0 }}
                transition={isMobile ? undefined : { duration: 0.5, delay: 0.9 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    CREATING ACCOUNT...
                  </span>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </motion.button>
            </form>

            <motion.div 
              className="mt-8 text-center"
              initial={isMobile ? false : { opacity: 0 }}
              animate={isMobile ? false : { opacity: 1 }}
              transition={isMobile ? undefined : { duration: 0.5, delay: 1 }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-600/20 to-transparent mb-6" />
              <p className="text-sm font-light tracking-wide text-neutral-400" style={{ fontFamily: 'Oughter, serif' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-amber-600 transition-colors hover:text-amber-500">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
