'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { X, Smartphone } from 'lucide-react'

export function MobileQRCode() {
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [localUrl, setLocalUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (showQR) {
      const generateQR = async () => {
        setIsLoading(true)
        try {
          let url = ''
          
          // Check if we're in production (Vercel) or development
          if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Production: Use the current origin (Vercel URL)
            url = window.location.origin
            console.log('Mobile QR: Using production URL:', url)
          } else {
            // Development: Use local IP
            const res = await fetch('/api/local-ip')
            const data = await res.json()
            url = `http://${data.ip}:${data.port}`
            console.log('Mobile QR: Local URL:', url)
          }
          
          setLocalUrl(url)
          const qr = await QRCode.toDataURL(url, { width: 300, margin: 2 })
          setQrCode(qr)
          console.log('Mobile QR: QR code generated successfully')
        } catch (err) {
          console.error('Mobile QR generation error:', err)
          // Fallback
          if (typeof window !== 'undefined') {
            try {
              const fallbackUrl = window.location.origin
              setLocalUrl(fallbackUrl)
              const qr = await QRCode.toDataURL(fallbackUrl, { width: 300, margin: 2 })
              setQrCode(qr)
              console.log('Mobile QR: Fallback generated for:', fallbackUrl)
            } catch (fallbackErr) {
              console.error('Mobile QR fallback error:', fallbackErr)
            }
          }
        } finally {
          setIsLoading(false)
        }
      }
      
      generateQR()
    }
  }, [showQR])

  return (
    <>
      <button
        onClick={() => setShowQR(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all"
        title="Scan QR for mobile"
      >
        <Smartphone size={24} />
      </button>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="relative bg-neutral-900 border border-amber-600/30 rounded-lg p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-all"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-light text-white/90 mb-2 text-center" style={{ fontFamily: 'serif' }}>
              Mobile Access QR Code
            </h2>
            <p className="text-neutral-400 text-sm text-center mb-6">
              <strong>Note:</strong> This opens in your browser. For <strong>true fullscreen PWA</strong>, install the app first!
            </p>

            {qrCode ? (
              <div className="bg-white p-4 rounded-lg mb-4">
                <img src={qrCode} alt="QR Code" className="w-full" />
              </div>
            ) : isLoading ? (
              <div className="bg-neutral-700 p-8 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-amber-600/70 text-sm">Generating QR Code...</div>
              </div>
            ) : (
              <div className="bg-neutral-700 p-8 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-red-400/70 text-sm">Failed to load QR Code</div>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-neutral-500 mb-2">Or visit:</p>
              <p className="text-amber-600/90 text-sm font-mono">{localUrl}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
