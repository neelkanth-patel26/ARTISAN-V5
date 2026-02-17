'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ThemeToggleButton } from '@/element/skiper26'

export function Footer() {
  const members = [
    'Member 1',
    'Member 2',
    'Member 3',
    'Member 4',
    'Member 5',
    'Member 6'
  ]

  return (
    <footer className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 py-4 md:py-6 px-4 md:px-6 lg:px-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 border-t border-neutral-800/50 pt-4 md:pt-6">
        <p className="text-[10px] md:text-xs text-neutral-500 tracking-[0.2em] font-light uppercase" style={{ fontFamily: 'serif' }}>
          Made By Group 1
        </p>
        
        <ThemeToggleButton variant="circle" start="center" />
        
        <p className="text-[10px] md:text-xs text-neutral-500 tracking-[0.15em] md:tracking-[0.2em] font-light uppercase text-center" style={{ fontFamily: 'serif' }}>
          © 2026 Gaming Network Studio Media Group
        </p>
      </div>
    </footer>
  )
}
