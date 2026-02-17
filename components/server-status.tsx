'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'

export function ServerStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkServer = async () => {
      if (!mounted) return
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        if (mounted) setIsOffline(!response.ok)
      } catch (error) {
        if (mounted && error.name !== 'AbortError') {
          setIsOffline(true)
        }
      }
    }

    // Delay initial check by 2 seconds
    const initialTimeout = setTimeout(checkServer, 2000)

    // Check every 30 seconds
    const interval = setInterval(checkServer, 30000)

    // Listen to online/offline events
    const handleOnline = () => mounted && setIsOffline(false)
    const handleOffline = () => mounted && setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      mounted = false
      clearTimeout(initialTimeout)
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 backdrop-blur-sm z-[10000] flex items-center justify-center"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-center px-6 max-w-md relative z-10 mx-4"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border-4 border-red-500/50 shadow-lg shadow-red-500/20"
            >
              <WifiOff className="text-red-500" size={40} />
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-red-500 bg-clip-text text-transparent mb-3 md:mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Server Offline
            </h2>
            
            <p className="text-neutral-300 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
              Unable to connect to the server. Please check your internet connection or try again later.
            </p>
            
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold hover:from-amber-500 hover:to-amber-400 transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 mx-auto text-sm md:text-base"
            >
              <RefreshCw size={18} />
              Retry Connection
            </motion.button>
            
            <p className="text-neutral-500 text-xs md:text-sm mt-4 md:mt-6">
              Checking connection automatically...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
