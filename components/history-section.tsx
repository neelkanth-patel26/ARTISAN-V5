'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Package, RotateCcw, Award } from 'lucide-react'

export function HistorySection() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-2 text-amber-500/60 text-[9px] tracking-[0.5em] font-black uppercase mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Award size={12} className="text-amber-500" />
            The Artisan Standard
          </motion.div>
          <motion.h2 
            className="text-4xl md:text-7xl font-light text-white/90 mb-6 md:mb-8 leading-tight"
            style={{ fontFamily: 'ForestSmooth, serif' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Trusted Art
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Marketplace</span>
          </motion.h2>
          <motion.p 
            className="text-neutral-500 text-sm md:text-base leading-relaxed font-light max-w-2xl mx-auto mb-8 md:mb-12 italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            "Art is not what you see, but what you make others see." — Edgar Degas
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16">
            {[
              { Icon: ShieldCheck, title: 'Authenticated', desc: 'Every piece verified', color: 'from-green-600 to-emerald-500' },
              { Icon: Lock, title: 'Secure Payment', desc: 'Protected transactions', color: 'from-blue-600 to-cyan-500' },
              { Icon: Package, title: 'Insured Shipping', desc: 'Worldwide delivery', color: 'from-purple-600 to-pink-500' },
              { Icon: RotateCcw, title: '14-Day Returns', desc: 'Risk-free purchase', color: 'from-amber-600 to-orange-500' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group text-center relative pointer-events-none"
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 blur-2xl transition-opacity duration-700`} />
                  <feature.Icon className="relative w-10 h-10 md:w-12 md:h-12 mx-auto text-amber-600/30 group-hover:text-amber-600 transition-all duration-500 group-hover:scale-110" strokeWidth={0.5} />
                </div>
                <div className="text-[11px] tracking-[0.3em] font-black uppercase text-white/90 mb-3" style={{ fontFamily: 'ForestSmooth, serif' }}>{feature.title}</div>
                <div className="text-[10px] text-neutral-500 font-light tracking-widest">{feature.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
