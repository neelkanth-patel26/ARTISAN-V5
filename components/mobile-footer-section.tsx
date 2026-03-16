'use client'

import { ThemeToggleButton } from '@/element/skiper26'

export function MobileFooterSection() {
  return (
    <div className="lg:hidden h-screen w-full flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 px-6 relative overflow-hidden">
      {/* Ambient orbs — matches hero */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-600/[0.06] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-600/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-10">

        {/* Logo wordmark */}
        <span
          className="text-3xl font-light tracking-[0.5em] text-white/80 uppercase"
          style={{ fontFamily: 'ForestSmooth, serif' }}
        >
          Artisan
        </span>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Made By Group 1 */}
        <p className="text-[9px] text-neutral-500 tracking-[0.6em] font-black uppercase">
          Made By Group 1
        </p>

        {/* Theme toggle */}
        <div suppressHydrationWarning>
          <ThemeToggleButton variant="circle" start="center" />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Copyright */}
        <p className="text-[9px] text-neutral-500 tracking-[0.5em] font-black uppercase text-center leading-relaxed">
          © Gaming Network Studio Media Group
        </p>
      </div>
    </div>
  )
}
