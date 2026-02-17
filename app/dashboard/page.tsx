'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    if (user.user_role === 'admin') router.push('/dashboard/admin')
    else if (user.user_role === 'artist') router.push('/dashboard/artist')
    else if (user.user_role === 'collector') router.push('/dashboard/collector')
    else router.push('/')
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-2 border-neutral-800" />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-neutral-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="font-light tracking-wider text-neutral-500" style={{ fontFamily: 'Oughter, serif' }}>
          Redirecting to dashboard...
        </p>
      </motion.div>
    </div>
  )
}
