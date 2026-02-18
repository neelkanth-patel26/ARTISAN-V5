'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/components/hero-section'
import { CollectionSection } from '@/components/collection-section'
import { FeaturedArtistsSection } from '@/components/featured-artists-section'
import { HistorySection } from '@/components/history-section'
import { VisitSection } from '@/components/visit-section'
import { PWASection } from '@/components/pwa-section'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { PaginationSidebar } from '@/components/pagination-sidebar'
import { Footer } from '@/components/footer'
import Preloader from '@/components/preloader'
import { MobileFooterSection } from '@/components/mobile-footer-section'
import { ChevronUp, ChevronDown, RotateCw } from 'lucide-react'
import { ServerStatus } from '@/components/server-status'

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [preloaderComplete, setPreloaderComplete] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'pwa-desktop' | 'pwa-mobile'>('desktop')

  const sections = [
    <HeroSection key="hero" />,
    <CollectionSection key="collection" />,
    <FeaturedArtistsSection key="artists" />,
    <HistorySection key="history" />,
    <VisitSection key="visit" />,
    <MobileFooterSection key="mobile-footer" />,
  ]

  const desktopSections = [
    <HeroSection key="hero" />,
    <CollectionSection key="collection" />,
    <FeaturedArtistsSection key="artists" />,
    <HistorySection key="history" />,
    <VisitSection key="visit" />,
    <PWASection key="pwa" />,
  ]

  const pwaSections = [
    <HeroSection key="hero" />,
    <CollectionSection key="collection" />,
    <FeaturedArtistsSection key="artists" />,
    <HistorySection key="history" />,
    <VisitSection key="visit" />,
  ]

  const displaySections = deviceType === 'mobile' || deviceType === 'pwa-mobile' ? sections : deviceType === 'pwa-desktop' ? pwaSections : desktopSections

  const navigateSection = (direction: 'up' | 'down') => {
    if (isScrolling || !preloaderComplete || (deviceType !== 'desktop' && deviceType !== 'pwa-desktop')) return
    setIsScrolling(true)

    if (direction === 'down' && currentSection < displaySections.length - 1) {
      setCurrentSection(prev => prev + 1)
    } else if (direction === 'up' && currentSection > 0) {
      setCurrentSection(prev => prev - 1)
    }

    setTimeout(() => setIsScrolling(false), 800)
  }

  useEffect(() => {
    setMounted(true)
    
    const checkDevice = () => {
      const isMobile = window.innerWidth < 1024
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      
      if (isPWA && isMobile) {
        setDeviceType('pwa-mobile')
      } else if (isPWA && !isMobile) {
        setDeviceType('pwa-desktop')
      } else if (isMobile) {
        setDeviceType('mobile')
      } else {
        setDeviceType('desktop')
      }
    }
    
    const checkOrientation = () => {
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const isLandscapeMode = window.innerHeight < window.innerWidth
      setIsLandscape(isTablet && isLandscapeMode)
    }

    checkDevice()
    checkOrientation()

    window.addEventListener('resize', () => {
      checkDevice()
      checkOrientation()
    })
    window.addEventListener('orientationchange', checkOrientation)

    const container = document.querySelector('main')
    if (!container) return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkOrientation)
    }

    const handleWheel = (e: WheelEvent) => {
      if (deviceType !== 'desktop' && deviceType !== 'pwa-desktop') return
      e.preventDefault()
      if (isScrolling || !preloaderComplete) return
      
      if (e.deltaY > 0) {
        navigateSection('down')
      } else if (e.deltaY < 0) {
        navigateSection('up')
      }
    }

    if (deviceType === 'desktop' || deviceType === 'pwa-desktop') {
      container.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      window.removeEventListener('resize', checkDevice)
      window.removeEventListener('orientationchange', checkOrientation)
      container.removeEventListener('wheel', handleWheel as any)
    }
  }, [isScrolling, preloaderComplete, deviceType])

  if (!mounted) {
    return (
      <>
        <Preloader onComplete={() => setPreloaderComplete(true)} />
        <main className="bg-black h-screen overflow-y-auto overscroll-none relative">
          <Navigation />
          <div className="transition-transform duration-1000 ease-in-out" style={{ transform: 'none' }}>
            {desktopSections.map((section, index) => (
              <div key={index} className="h-screen">
                {section}
              </div>
            ))}
          </div>
          <PaginationSidebar 
            currentSection={currentSection} 
            onSectionChange={setCurrentSection}
            totalSections={displaySections.length}
          />
          <Footer />
        </main>
      </>
    )
  }

  return (
    <>
      <Preloader onComplete={() => setPreloaderComplete(true)} />
      <PWAInstallPrompt />
      
      {isLandscape && (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-center px-6">
            <RotateCw className="text-amber-500 mx-auto mb-4 animate-spin" size={64} />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'ForestSmooth, serif' }}>Rotate Your Device</h2>
            <p className="text-neutral-400 text-lg">Please rotate your device to portrait mode for the best experience.</p>
          </div>
        </div>
      )}
      
      <main className={`bg-black h-screen ${deviceType === 'desktop' || deviceType === 'pwa-desktop' ? 'overflow-hidden' : 'overflow-y-auto'} overscroll-none relative`}>
        <Navigation />
        <div
          className="transition-transform duration-1000 ease-in-out"
          style={{ 
            transform: deviceType === 'desktop' || deviceType === 'pwa-desktop' ? `translateY(-${currentSection * 100}vh)` : 'none'
          }}
        >
          {displaySections.map((section, index) => (
            <div key={index} className="h-screen">
              {section}
            </div>
          ))}
        </div>
        <PaginationSidebar 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection}
          totalSections={displaySections.length}
        />
        <Footer />
      </main>
    </>
  )
}
