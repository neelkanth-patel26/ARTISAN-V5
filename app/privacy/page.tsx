'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <Navigation />
      
      <div className="relative pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <motion.div 
          className="flex items-center justify-center gap-2 text-amber-600/70 text-xs tracking-[0.3em] font-light mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Shield size={14} strokeWidth={1.5} />
          LEGAL
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-light text-white/90 mb-6 text-center" 
          style={{ fontFamily: 'ForestSmooth, serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">Policy</span>
        </motion.h1>
        
        <motion.div 
          className="text-neutral-400 space-y-8 text-sm md:text-base font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-neutral-500 text-center mb-12">Last updated: January 2024</p>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, upload artwork, or communicate with us. This includes your name, email address, payment information, and artwork details.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Information Sharing</h2>
            <p>We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving promotional communications from us.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <span className="text-amber-600/80">privacy@artisan.com</span></p>
          </section>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  )
}
