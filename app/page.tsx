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
  const [isMobile, setIsMobile] = useState(false)
  const [scrollQueue, setScrollQueue] = useState<number[]>([])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [preloaderComplete, setPreloaderComplete] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

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

  const displaySections = isMobile ? sections : desktopSections

  const navigateSection = (direction: 'up' | 'down') => {
    if (isScrolling || !preloaderComplete) return
    setIsScrolling(true)

    if (direction === 'down' && currentSection < displaySections.length - 1) {
      setCurrentSection(prev => prev + 1)
    } else if (direction === 'up' && currentSection > 0) {
      setCurrentSection(prev => prev - 1)
    }

    setTimeout(() => setIsScrolling(false), 800)
  }

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 1024
    const checkOrientation = () => {
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const isLandscapeMode = window.innerHeight < window.innerWidth
      setIsLandscape(isTablet && isLandscapeMode)
    }
    
    setIsMobile(checkMobile())
    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    if (checkMobile()) return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }

    let scrollAccumulator = 0
    let scrollTimeout: NodeJS.Timeout

    const handleWheel = (e: WheelEvent) => {
      if (!preloaderComplete) return
      e.preventDefault()
      
      scrollAccumulator += e.deltaY
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        scrollAccumulator = 0
      }, 150)

      if (Math.abs(scrollAccumulator) > 100 && !isScrolling) {
        setIsScrolling(true)
        scrollAccumulator = 0

        if (e.deltaY > 0 && currentSection < displaySections.length - 1) {
          setCurrentSection(prev => prev + 1)
        } else if (e.deltaY < 0 && currentSection > 0) {
          setCurrentSection(prev => prev - 1)
        }

        setTimeout(() => setIsScrolling(false), 800)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (!preloaderComplete) return
      setTouchStart(e.touches[0].clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!preloaderComplete) return
      setTouchEnd(e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd || isScrolling || !preloaderComplete) return
      
      const distance = touchStart - touchEnd
      const minSwipeDistance = 50

      if (Math.abs(distance) > minSwipeDistance) {
        setIsScrolling(true)
        
        if (distance > 0 && currentSection < displaySections.length - 1) {
          setCurrentSection(prev => prev + 1)
        } else if (distance < 0 && currentSection > 0) {
          setCurrentSection(prev => prev - 1)
        }

        setTimeout(() => setIsScrolling(false), 800)
      }
      
      setTouchStart(0)
      setTouchEnd(0)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling || !preloaderComplete) return

      if (e.key === 'ArrowDown' && currentSection < displaySections.length - 1) {
        e.preventDefault()
        setIsScrolling(true)
        setCurrentSection(prev => prev + 1)
        setTimeout(() => setIsScrolling(false), 800)
      } else if (e.key === 'ArrowUp' && currentSection > 0) {
        e.preventDefault()
        setIsScrolling(true)
        setCurrentSection(prev => prev - 1)
        setTimeout(() => setIsScrolling(false), 800)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [currentSection, isScrolling, displaySections.length, touchStart, touchEnd, isMobile, preloaderComplete])

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
      
      <main className="bg-black h-screen lg:overflow-hidden overflow-y-auto overscroll-none relative">
      <Navigation />
      <div
        className="transition-transform duration-1000 ease-in-out"
        style={{ 
          transform: !isMobile ? `translateY(-${currentSection * 100}vh)` : 'none',
          willChange: !isMobile ? 'transform' : 'auto'
        }}
      >
        {displaySections.map((section, index) => (
          <div key={index} className="h-screen">
            {section}
          </div>
        ))}
      </div>
      <PaginationSidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      <Footer />
    </main>
    </>
  )
}
