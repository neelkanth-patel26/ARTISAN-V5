'use client'

import { useEffect } from 'react'

export function DevToolsBlocker() {
  useEffect(() => {
    let blocked = false

    const blockPage = () => {
      if (blocked) return
      blocked = true
      
      // Immediately hide all content
      document.body.style.cssText = 'margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;'
      document.documentElement.style.cssText = 'margin:0;padding:0;overflow:hidden;touch-action:none;user-select:none;'
      
      // Replace entire page
      const root = document.getElementById('__next') || document.body
      root.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          z-index: 999999;
          touch-action: none;
          user-select: none;
        ">
          <div style="
            max-width: 90%;
            width: 600px;
            text-align: center;
            background: rgba(217, 119, 6, 0.05);
            border: 2px solid rgba(217, 119, 6, 0.3);
            border-radius: 20px;
            padding: 40px 24px;
            margin: 20px;
          ">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.5" style="margin: 0 auto 24px;">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h1 style="color:#d97706;font-size:clamp(24px,6vw,42px);font-weight:300;margin:0 0 20px;letter-spacing:0.05em;font-family:system-ui,-apple-system,sans-serif;">⚠️ ACCESS RESTRICTED ⚠️</h1>
            <div style="color:rgba(255,255,255,0.9);font-size:clamp(16px,4vw,20px);font-weight:500;margin:0 0 24px;line-height:1.6;font-family:system-ui,-apple-system,sans-serif;">Nothing is here. Go back and use the platform properly.</div>
            <div style="background:rgba(217,119,6,0.1);border-left:4px solid #d97706;padding:20px;margin:24px 0;text-align:left;border-radius:8px;">
              <p style="color:rgba(255,255,255,0.7);font-size:clamp(14px,3.5vw,16px);line-height:1.8;margin:0 0 12px;font-family:system-ui,-apple-system,sans-serif;">Source code viewing is not permitted for security and content protection purposes.</p>
              <p style="color:rgba(255,255,255,0.7);font-size:clamp(14px,3.5vw,16px);line-height:1.8;margin:0;font-family:system-ui,-apple-system,sans-serif;">All content is protected by copyright and intellectual property laws.</p>
            </div>
            <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(217,119,6,0.2);">
              <p style="color:rgba(255,255,255,0.5);font-size:clamp(12px,3vw,14px);margin:0 0 8px;font-family:system-ui,-apple-system,sans-serif;">Copyright © 2019-2026 Gaming Network Studio Media Group</p>
              <p style="color:rgba(255,255,255,0.4);font-size:clamp(11px,2.5vw,13px);margin:0;font-family:system-ui,-apple-system,sans-serif;">All Rights Reserved.</p>
            </div>
          </div>
        </div>
      `
    }

    // Disable right-click and long-press (mobile) - silently
    const handleContextMenu = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
          (e.ctrlKey && e.keyCode === 85) ||
          (e.ctrlKey && e.keyCode === 83) ||
          (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67))) {
        e.preventDefault()
        e.stopPropagation()
        blockPage()
        return false
      }
    }

    // Disable drag and selection
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    const handleSelectStart = (e: Event) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault()
        return false
      }
    }

    // Mobile long-press detection - silently block
    let longPressTimer: NodeJS.Timeout
    const handleTouchStart = (e: TouchEvent) => {
      longPressTimer = setTimeout(() => {
        // Just prevent the action, don't show warning
        e.preventDefault()
      }, 500)
    }

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer)
    }

    const handleTouchMove = () => {
      clearTimeout(longPressTimer)
    }

    // Aggressive dev tools detection
    const detectDevTools = () => {
      const threshold = 160
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        blockPage()
      }
    }

    // Debugger detection
    const detectDebugger = () => {
      const start = performance.now()
      debugger
      const end = performance.now()
      if (end - start > 100) {
        blockPage()
      }
    }

    // Console detection
    const detectConsole = () => {
      const element = new Image()
      Object.defineProperty(element, 'id', {
        get: function() {
          blockPage()
          throw new Error('DevTools')
        }
      })
      requestAnimationFrame(() => console.log(element))
    }

    // Mobile-specific: Detect Eruda or vConsole (mobile dev tools)
    const detectMobileDevTools = () => {
      if (typeof window !== 'undefined') {
        if ((window as any).eruda || (window as any).vConsole) {
          blockPage()
        }
      }
    }

    // Detect ad blockers
    const detectAdBlocker = () => {
      const testAd = document.createElement('div')
      testAd.innerHTML = '&nbsp;'
      testAd.className = 'adsbox ad-placement ad-placeholder adbadge BannerAd'
      testAd.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;'
      document.body.appendChild(testAd)
      
      setTimeout(() => {
        if (testAd.offsetHeight === 0 || window.getComputedStyle(testAd).display === 'none') {
          console.warn('Ad blocker detected')
        }
        testAd.remove()
      }, 100)
    }

    // Detect common download extensions
    const detectDownloadExtensions = () => {
      // Check for common download manager extensions
      const suspiciousGlobals = [
        'downloadHelper',
        'videoDownloadHelper', 
        'idmExtension',
        'eagleget'
      ]
      
      for (const global of suspiciousGlobals) {
        if ((window as any)[global]) {
          console.warn('Download extension detected')
        }
      }
    }

    document.addEventListener('contextmenu', handleContextMenu as any, true)
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('dragstart', handleDragStart, true)
    document.addEventListener('selectstart', handleSelectStart, true)
    document.addEventListener('touchstart', handleTouchStart as any, { passive: false, capture: true })
    document.addEventListener('touchend', handleTouchEnd, true)
    document.addEventListener('touchmove', handleTouchMove, true)
    
    const devToolsInterval = setInterval(detectDevTools, 500)
    const debuggerInterval = setInterval(detectDebugger, 1000)
    const consoleInterval = setInterval(detectConsole, 1000)
    const mobileDevToolsInterval = setInterval(detectMobileDevTools, 500)
    const adBlockerInterval = setInterval(detectAdBlocker, 5000)
    const downloadExtInterval = setInterval(detectDownloadExtensions, 5000)

    // Initial check
    detectDevTools()
    detectMobileDevTools()
    detectAdBlocker()
    detectDownloadExtensions()

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu as any, true)
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('dragstart', handleDragStart, true)
      document.removeEventListener('selectstart', handleSelectStart, true)
      document.removeEventListener('touchstart', handleTouchStart as any, true)
      document.removeEventListener('touchend', handleTouchEnd, true)
      document.removeEventListener('touchmove', handleTouchMove, true)
      clearInterval(devToolsInterval)
      clearInterval(debuggerInterval)
      clearInterval(consoleInterval)
      clearInterval(mobileDevToolsInterval)
      clearInterval(adBlockerInterval)
      clearInterval(downloadExtInterval)
      clearTimeout(longPressTimer)
    }
  }, [])

  return null
}
