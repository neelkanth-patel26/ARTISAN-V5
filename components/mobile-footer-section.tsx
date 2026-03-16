'use client'

import { ThemeToggleButton } from '@/element/skiper26'

export function MobileFooterSection() {
  return (
    <div className="lg:hidden h-screen w-full flex items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 px-4">
      <div className="flex flex-col items-center gap-8">
        <p className="text-[9px] text-neutral-500 tracking-[0.5em] font-black uppercase">
          Artisan • Collective
        </p>
        
        <div suppressHydrationWarning>
          <ThemeToggleButton variant="circle" start="center" />
        </div>
        
        <p className="text-[9px] text-neutral-500 tracking-[0.5em] font-black uppercase text-center">
          © 2026 Artisan Media • Genesis
        </p>
      </div>
    </div>
  )
}
