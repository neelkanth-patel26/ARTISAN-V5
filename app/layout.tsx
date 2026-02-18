import React from "react"
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora } from 'next/font/google'
import { ServerStatus } from '@/components/server-status'
import { DevToolsBlocker } from '@/components/dev-tools-blocker'
import { Toaster } from 'sonner'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { PWAFullscreenManager } from '@/components/pwa-fullscreen-manager'

import './globals.css'

const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] })
const lora = Lora({ subsets: ['latin'], weight: ['400', '500'] })

export const metadata: Metadata = {
  title: 'Artisan - Curated Art Marketplace',
  description: 'Discover and acquire exceptional artworks directly from talented artists worldwide',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192' },
      { rel: 'icon', url: '/icon-512.png', sizes: '512x512' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
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
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#000000',
    // Android Chrome specific
    'color': '#000000',
    'mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
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
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <meta name="color" content="#000000" />
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
        <DevToolsBlocker />
        <ServiceWorkerRegistration />
        <PWAFullscreenManager />
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  )
}
