'use client'

import { motion } from 'framer-motion'
import { Compass, ArrowRight, Mail, Phone, Users } from 'lucide-react'
import Link from 'next/link'

export function VisitSection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center relative z-40">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Compass size={12} className="text-amber-500" />
            The Genesis
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-6xl font-light text-white/90 mb-6 md:mb-8 leading-tight"
            style={{ fontFamily: 'ForestSmooth, serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Begin Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Art Journey</span>
          </motion.h2>
          <motion.div 
            className="space-y-6 text-neutral-400 text-sm font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <div className="text-neutral-500 mb-4 text-[10px] tracking-[0.4em] font-black uppercase">Consignment Strategy</div>
              <div className="space-y-4 pl-4 border-l border-white/5">
                {[
                  { id: '01', text: 'Browse our curated collection' },
                  { id: '02', text: 'Select your favorite artwork' },
                  { id: '03', text: 'Secure checkout & authentication' },
                  { id: '04', text: 'Insured delivery to your door' }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4 hover:translate-x-1 transition-transform cursor-default">
                    <span className="text-amber-600/40 text-[10px] font-black tracking-widest">{step.id}</span>
                    <span className="text-neutral-400 group-hover:text-white transition-colors">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-neutral-500 mb-4 text-[10px] tracking-[0.4em] font-black uppercase">Direct Liaison</div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 group cursor-pointer w-fit">
                  <Mail size={12} className="text-amber-600/40 group-hover:text-amber-600 transition-colors" />
                  <span className="text-neutral-400 group-hover:text-white transition-colors">concierge@artisan.com</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer w-fit">
                  <Phone size={12} className="text-amber-600/40 group-hover:text-amber-600 transition-colors" />
                  <span className="text-neutral-400 group-hover:text-white transition-colors">+91 123 456 7890</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-white/80 mb-2 text-base" style={{ fontFamily: 'Oughter, serif' }}>Join Our Community</div>
              <div>Get exclusive access to new releases and artist collaborations</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-6 pointer-events-auto"
        >
          <Link href="/signup">
            <motion.button 
              className="group w-full py-5 bg-white/5 border border-white/5 text-white/90 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/10 hover:border-white/10 transition-all duration-500 flex items-center justify-center gap-3 rounded-xl shadow-2xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Initiate Membership
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </Link>
          <Link href="/gallery">
            <motion.button 
              className="w-full py-5 border border-white/5 text-neutral-500 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/5 hover:text-white transition-all duration-500 rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Sanctuary
            </motion.button>
          </Link>
          <Link href="/artist-landing">
            <motion.button 
              className="w-full py-5 border border-white/5 text-neutral-500 text-[10px] tracking-[0.4em] font-black uppercase hover:bg-white/5 hover:text-white transition-all duration-500 rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Manifest as Creator
            </motion.button>
          </Link>
          
          <motion.div 
            className="pt-8 hidden md:block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=600&h=400&fit=crop&q=90"
                alt="Art gallery"
                className="relative w-full h-[200px] object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 border border-neutral-800/50"
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                }}
              />
            </div>
          </motion.div>

          
        </motion.div>
      </div>
    </section>
  )
}
