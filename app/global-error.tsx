'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
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

          <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-amber-600/80 mx-auto" strokeWidth={1} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2 className="text-2xl md:text-4xl font-light text-white/90 mb-4">
                Critical Error
              </h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light mb-8">
                A critical error occurred. Please refresh the page or return home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 text-white font-light tracking-wider"
                >
                  TRY AGAIN
                </button>
                <a
                  href="/"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-amber-600/20 bg-neutral-900/60 text-amber-600 font-light tracking-wider"
                >
                  <Home size={18} />
                  GO HOME
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  )
}
