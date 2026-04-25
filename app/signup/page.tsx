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
    <div className="relative min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden flex items-center justify-center p-6">
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(217,119,6,0.05),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(217,119,6,0.02),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <button onClick={() => window.history.length > 1 ? router.back() : router.push('/')} className="absolute top-8 left-8 md:top-12 md:left-12 z-50 group">
        <div className="flex items-center gap-4 text-neutral-500 hover:text-white transition-all duration-500">
          <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-white/20 group-hover:bg-white/5 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="hidden md:block text-[9px] tracking-[0.5em] font-black uppercase">Go to Home</span>
        </div>
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl py-8 md:py-12"
      >
        <div className="text-center mb-12 md:mb-16 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <p className="text-amber-600/60 text-[9px] tracking-[0.6em] font-black uppercase">Sign Up</p>
            <h1 className="text-5xl md:text-8xl font-light text-white tracking-tighter" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Sign Up
            </h1>
          </motion.div>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          <form onSubmit={handleSignup} className="space-y-10 relative z-10">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500 ml-1">Select Pathway</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'collector', icon: ShoppingBag, label: 'Collector' },
                  { id: 'artist', icon: Palette, label: 'Artist' },
                  { id: 'admin', icon: Shield, label: 'Admin' },
                ].map(({ id, icon: Icon, label }) => (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => setRole(id as any)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-500 ${
                      role === id
                        ? 'border-amber-600/40 bg-amber-600/10 shadow-[0_10px_30px_-10px_rgba(217,119,6,0.3)]'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <Icon className={`transition-colors duration-500 ${role === id ? 'text-amber-600' : 'text-neutral-600'}`} size={20} />
                    <span className={`text-[10px] tracking-widest uppercase font-black ${role === id ? 'text-white' : 'text-neutral-600'}`}>
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500 ml-1">Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-neutral-700 transition-all duration-500 focus:outline-none focus:border-amber-600/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-amber-600/5"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-neutral-700 transition-all duration-500 focus:outline-none focus:border-amber-600/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-amber-600/5"
                  placeholder="name@artisan.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500 ml-1">Secret Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-neutral-700 transition-all duration-500 focus:outline-none focus:border-amber-600/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-amber-600/5 pr-14"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-amber-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] tracking-[0.4em] font-black uppercase text-neutral-500 ml-1">Confirm Key</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-5 text-white placeholder-neutral-700 transition-all duration-500 focus:outline-none focus:border-amber-600/30 focus:bg-white/[0.05] focus:ring-4 focus:ring-amber-600/5"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-white text-black py-6 rounded-2xl text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] hover:bg-neutral-200 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Generating Profile...</span>
                </div>
              ) : (
                'Sign Up'
              )}
            </motion.button>
          </form>

          <div className="mt-12 pt-10 border-t border-white/5 text-center relative z-10">
            <p className="text-[10px] tracking-widest text-neutral-500 uppercase font-light">
              Already a member?{' '}
              <Link href="/login" className="text-amber-600/80 hover:text-amber-600 font-black ml-2 transition-colors">Login</Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-12 text-[8px] tracking-[0.6em] text-neutral-600 uppercase font-black pb-12">
          Sanctified &middot; Curated &middot; Artisan Protocol
        </p>
      </motion.div>
    </div>
  )
}
