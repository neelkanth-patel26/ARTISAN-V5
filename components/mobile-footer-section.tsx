'use client'

import { ThemeToggleButton } from '@/element/skiper26'

export function MobileFooterSection() {
  return (
    <div className="lg:hidden h-screen w-full flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 px-4">
      <div className="flex flex-col items-center gap-6">
        <p className="text-xs text-neutral-500 tracking-[0.2em] font-light uppercase" style={{ fontFamily: 'serif' }}>
          Made By Group 1
        </p>
        
        <ThemeToggleButton variant="circle" start="center" />
        
        <p className="text-xs text-neutral-500 tracking-[0.2em] font-light uppercase text-center" style={{ fontFamily: 'serif' }}>
          © 2026 Gaming Network Studio Media Group
        </p>
      </div>
    </div>
  )
}
