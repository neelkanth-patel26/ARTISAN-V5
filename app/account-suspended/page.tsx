'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AccountSuspended() {
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'suspended'

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/20 border border-red-600/30"
        >
          <ShieldAlert className="text-red-600" size={40} />
        </motion.div>

        <h1 className="text-3xl font-light text-white mb-3" style={{ fontFamily: 'ForestSmooth, serif' }}>
          Account {status === 'banned' ? 'Banned' : 'Suspended'}
        </h1>

        <p className="text-neutral-400 mb-2 font-light">
          {status === 'banned' 
            ? 'Your account has been permanently banned by the administrator. You can no longer access this platform.'
            : 'Your account has been temporarily suspended by the administrator. Access to your account has been restricted.'}
        </p>

        <p className="text-sm text-neutral-500 mb-8 font-light">
          {status === 'banned'
            ? 'This action is permanent. If you believe this is an error, please contact our support team immediately.'
            : 'This is a temporary restriction. Please contact the administrator to resolve this issue and restore your account access.'}
        </p>

        <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4 mb-8">
          <p className="text-amber-600 text-sm font-light">
            <strong className="font-semibold">Action Required:</strong> Please contact the administrator to resolve this issue.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href="mailto:support@artgallery.com"
            className="w-full py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-light transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={18} />
            Contact Support
          </a>

          <Link
            href="/"
            className="w-full py-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-light transition-colors block"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
