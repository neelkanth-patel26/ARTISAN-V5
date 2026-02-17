'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden flex items-center justify-center">
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -80, 0], scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-amber-600/80 mx-auto" strokeWidth={1} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
            <p className="text-xs tracking-[0.3em] text-amber-600/80 font-light">SOMETHING WENT WRONG</p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
          </div>

          <h2 className="text-2xl md:text-4xl font-light text-white/90 mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Unexpected Error
          </h2>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light mb-8">
            We encountered an issue while processing your request. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={reset}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 text-white font-light tracking-wider transition-all hover:from-amber-500 hover:to-amber-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={18} />
              TRY AGAIN
            </motion.button>
            <Link href="/">
              <motion.button
                className="flex items-center gap-2 px-6 py-3 rounded-lg border border-amber-600/20 bg-neutral-900/60 text-amber-600 font-light tracking-wider transition-all hover:bg-neutral-900"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={18} />
                GO HOME
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
