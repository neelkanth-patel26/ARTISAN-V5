'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { X, Smartphone } from 'lucide-react'

export function MobileQRCode() {
  const [showQR, setShowQR] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [localUrl, setLocalUrl] = useState('')

  useEffect(() => {
    if (showQR) {
      fetch('/api/local-ip')
        .then(res => res.json())
        .then(data => {
          const url = `http://${data.ip}:${data.port}`
          setLocalUrl(url)
          QRCode.toDataURL(url, { width: 300, margin: 2 })
            .then(setQrCode)
        })
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
              Scan to Open on Mobile
            </h2>
            <p className="text-neutral-400 text-sm text-center mb-6">
              Scan this QR code with your mobile device
            </p>

            {qrCode && (
              <div className="bg-white p-4 rounded-lg mb-4">
                <img src={qrCode} alt="QR Code" className="w-full" />
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
