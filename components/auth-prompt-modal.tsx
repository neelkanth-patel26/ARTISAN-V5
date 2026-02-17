'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useEffect } from 'react'

interface AuthPromptModalProps {
  open: boolean
  onClose: () => void
  message?: string
  redirectUrl?: string
}

export function AuthPromptModal({ open, onClose, message, redirectUrl }: AuthPromptModalProps) {
  useEffect(() => {
    if (open && redirectUrl && typeof window !== 'undefined') {
      localStorage.setItem('auth_redirect', redirectUrl)
    }
  }, [open, redirectUrl])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <h3 className="text-xl font-semibold text-white mb-2 pr-8">Sign in required</h3>
        <p className="text-neutral-400 text-sm mb-6">
          {message ?? 'Sign in or create an account to like, share, comment, or continue.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white text-center rounded-lg font-medium transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="flex-1 px-6 py-3 border border-neutral-600 text-white text-center rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
