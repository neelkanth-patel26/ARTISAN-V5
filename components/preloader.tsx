'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const words = [
  { text: 'Hello', font: 'font-sans' },
  { text: 'नमस्ते', font: 'font-sans' },
  { text: 'Bonjour', font: 'font-serif' },
  { text: 'こんにちは', font: 'font-sans' },
  { text: '你好', font: 'font-sans' },
  { text: '안녕하세요', font: 'font-sans' },
  { text: 'Ciao', font: 'font-serif' },
]

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [index, setIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (index < words.length - 1) {
      const timeout = setTimeout(() => setIndex(index + 1), 700)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setIsComplete(true)
        onComplete?.()
      }, 700)
      return () => clearTimeout(timeout)
    }
  }, [index, onComplete])

  useEffect(() => {
    if (!isComplete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isComplete])

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -100, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 items-center justify-center hidden lg:flex"
          >
            <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse"></div>
          </motion.div>
          <div className="absolute inset-0 items-center justify-center flex lg:hidden">
            <div className="absolute w-48 h-48 bg-amber-600/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative h-32 flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.h1
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease: [0.33, 1, 0.68, 1]
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30,
                  transition: {
                    duration: 0.25,
                    ease: [0.32, 0, 0.67, 0]
                  }
                }}
                className={`text-6xl md:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-white ${words[index].font}`}
                style={{ 
                  fontFamily: words[index].font === 'font-serif' ? 'serif' : 'sans-serif',
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased'
                }}
              >
                {words[index].text}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${((index + 1) / words.length) * 100}%` }}
            transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
            style={{ transform: 'translateZ(0)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
