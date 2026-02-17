'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <Navigation />
      
      <div className="relative pt-32 pb-20 px-4 max-w-6xl mx-auto">
        <motion.div 
          className="flex items-center justify-center gap-2 text-amber-600/70 text-xs tracking-[0.3em] font-light mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Mail size={14} strokeWidth={1.5} />
          GET IN TOUCH
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-light text-white/90 mb-6 text-center" 
          style={{ fontFamily: 'ForestSmooth, serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400">Us</span>
        </motion.h1>
        
        <motion.p 
          className="text-neutral-400 text-center max-w-2xl mx-auto mb-16 text-sm md:text-base font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <form className="space-y-6">
              <div>
                <label className="block text-amber-600/70 text-xs tracking-[0.2em] font-light mb-3">NAME</label>
                <input
                  type="text"
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 text-white px-4 py-3.5 text-sm font-light rounded-lg focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/20 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-amber-600/70 text-xs tracking-[0.2em] font-light mb-3">EMAIL</label>
                <input
                  type="email"
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 text-white px-4 py-3.5 text-sm font-light rounded-lg focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-amber-600/70 text-xs tracking-[0.2em] font-light mb-3">MESSAGE</label>
                <textarea
                  rows={6}
                  className="w-full bg-neutral-900/50 border border-neutral-700/50 text-white px-4 py-3.5 text-sm font-light rounded-lg focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/20 transition-all resize-none"
                  placeholder="Your message..."
                />
              </div>

              <motion.button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border border-amber-600/50 text-amber-600 text-xs tracking-[0.25em] font-light rounded-lg hover:from-amber-600/30 hover:to-amber-500/30 hover:border-amber-600/70 transition-all duration-300 shadow-lg shadow-amber-600/10 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={16} strokeWidth={1.5} />
                SEND MESSAGE
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} strokeWidth={1.5} className="text-amber-600/70" />
                </div>
                <div>
                  <h3 className="text-white/90 font-light mb-2">Email</h3>
                  <p className="text-neutral-400 text-sm font-light">support@artisan.com</p>
                  <p className="text-neutral-400 text-sm font-light">artists@artisan.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} strokeWidth={1.5} className="text-amber-600/70" />
                </div>
                <div>
                  <h3 className="text-white/90 font-light mb-2">Phone</h3>
                  <p className="text-neutral-400 text-sm font-light">+1 (555) 123-4567</p>
                  <p className="text-neutral-400 text-sm font-light">Mon-Fri 9am-6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-amber-600/30 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} strokeWidth={1.5} className="text-amber-600/70" />
                </div>
                <div>
                  <h3 className="text-white/90 font-light mb-2">Address</h3>
                  <p className="text-neutral-400 text-sm font-light">123 Art Street</p>
                  <p className="text-neutral-400 text-sm font-light">New York, NY 10001</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/50 rounded-xl p-6">
              <h3 className="text-white/90 font-light mb-4">Business Hours</h3>
              <div className="space-y-2 text-sm font-light">
                <div className="flex justify-between text-neutral-400">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
