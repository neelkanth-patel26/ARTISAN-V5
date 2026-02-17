import React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { ServerStatus } from '@/components/server-status'
import { DevToolsBlocker } from '@/components/dev-tools-blocker'
import { Toaster } from 'sonner'

import './globals.css'

const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] })
const lora = Lora({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'Artisan - Curated Art Marketplace',
  description: 'Discover and acquire exceptional artworks directly from talented artists worldwide',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Artisan',
    startupImage: [
      {
        url: '/icon-512.png',
        media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Artisan',
    'application-name': 'Artisan',
    'msapplication-TileColor': '#d97706',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  themeColor: '#d97706',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" style={{
      '--font-serif': playfairDisplay.style.fontFamily,
      '--font-body': lora.style.fontFamily,
    } as any}>
      {/* 





        ═══════════════════════════════════════════════════════════════════════════════
        
                              ⚠️  ACCESS RESTRICTED  ⚠️
        
        ═══════════════════════════════════════════════════════════════════════════════
        
        
                    NOTHING IS HERE. GO BACK AND USE THE PLATFORM PROPERLY.
        
        
        Source code viewing is NOT PERMITTED for security and content protection.
        
        This code is protected by copyright and intellectual property laws.
        Unauthorized copying, modification, or distribution is strictly prohibited.
        
        Any attempt to reverse engineer, decompile, or extract source code from this
        application may result in legal action.
        
        
        ═══════════════════════════════════════════════════════════════════════════════
        
                    Copyright © 2019-2026 Gaming Network Studio Media Group
                                    All Rights Reserved.
        
        ═══════════════════════════════════════════════════════════════════════════════
        
        
        If you have legitimate business inquiries, please contact us through proper
        channels at support@artisan.com
        
        





      */}
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="robots" content="noarchive, noimageindex" />
        <style dangerouslySetInnerHTML={{
          __html: `/* Copyright © 2019-2026 Gaming Network Studio Media Group - All Rights Reserved */`
        }} />
      </head>
      <body className="bg-black text-white antialiased" style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
        {/* ⚠️ STOP - You are viewing protected source code ⚠️ */}
        <DevToolsBlocker />
        <ServerStatus />
        <Toaster position="top-right" richColors />
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
              })
            }
          `
        }} />
      </body>
    </html>
  )
}
