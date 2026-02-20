'use client'

import { AlertTriangle, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="/_next/static/css/app/layout.css" />
      </head>
      <body>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0a0a0a, #171717, #0a0a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '24px', maxWidth: '600px' }}>
            <div style={{ marginBottom: '32px' }}>
              <AlertTriangle style={{ width: '96px', height: '96px', color: '#d97706', margin: '0 auto', opacity: 0.8 }} strokeWidth={1} />
            </div>

            <h2 style={{ fontSize: '32px', fontWeight: '300', color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
              Critical Error
            </h2>
            <p style={{ color: '#a3a3a3', fontSize: '16px', lineHeight: '1.6', fontWeight: '300', marginBottom: '32px' }}>
              A critical error occurred. Please refresh the page or return home.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '12px 24px', borderRadius: '8px', background: 'linear-gradient(to right, #d97706, #b45309)', color: 'white', fontWeight: '300', letterSpacing: '0.05em', border: 'none', cursor: 'pointer', fontSize: '14px' }}
              >
                TRY AGAIN
              </button>
              <a
                href="/"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(217,119,6,0.2)', background: 'rgba(23,23,23,0.6)', color: '#d97706', fontWeight: '300', letterSpacing: '0.05em', textDecoration: 'none', fontSize: '14px' }}
              >
                <Home size={18} />
                GO HOME
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
