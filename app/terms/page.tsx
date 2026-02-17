'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
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
          <FileText size={14} strokeWidth={1.5} />
          LEGAL
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-light text-white/90 mb-6 text-center" 
          style={{ fontFamily: 'ForestSmooth, serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">Service</span>
        </motion.h1>
        
        <motion.div 
          className="text-neutral-400 space-y-8 text-sm md:text-base font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-neutral-500 text-center mb-12">Last updated: January 2024</p>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Acceptance of Terms</h2>
            <p>By accessing and using Artisan, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Artist Responsibilities</h2>
            <p>Artists are responsible for the content they upload and must ensure they have the rights to sell their artwork. All artwork must be original and not infringe on any third-party rights.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Commission Structure</h2>
            <p>Artisan charges a commission on each sale made through the platform. The current commission rate is 15% of the sale price. Artists will receive payment within 14 days of a completed transaction.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Intellectual Property</h2>
            <p>Artists retain all rights to their artwork. By uploading content, you grant Artisan a license to display and promote your work on our platform and marketing materials.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Prohibited Conduct</h2>
            <p>Users may not engage in any activity that interferes with or disrupts the service, violates any laws, or infringes on the rights of others.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Termination</h2>
            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms of Service.</p>
          </section>

          <section>
            <h2 className="text-xl text-white/90 font-light mb-4">Contact</h2>
            <p>For questions about these Terms, contact us at <span className="text-amber-600/80">legal@artisan.com</span></p>
          </section>
        </motion.div>
      </div>
      
      <Footer />
    </main>
  )
}
