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
    <footer className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 py-6 lg:px-12 bg-neutral-950/20 backdrop-blur-3xl border-t border-white/5 overflow-hidden">
      {/* Footer Top Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 relative z-10 px-6">
        <p className="text-[9px] text-neutral-500 tracking-[0.6em] font-black uppercase">
          Made By Group 1
        </p>
        
        <div className="flex items-center gap-12">
          <ThemeToggleButton variant="circle" start="center" />
        </div>
        
        <p className="text-[9px] text-neutral-500 tracking-[0.6em] font-black uppercase text-center">
          © Gaming Network Studio Media Group
        </p>
      </div>
    </footer>
  )
}
