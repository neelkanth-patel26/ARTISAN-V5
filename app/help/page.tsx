'use client'

import { motion } from 'framer-motion'
import { HelpCircle, Mail, MessageCircle, Book, ArrowLeft, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I create an account?', a: 'Click on "Sign Up" in the navigation menu, choose your role (Artist or Collector), and fill in your details. You\'ll receive a confirmation email to verify your account.' },
        { q: 'What are the different user roles?', a: 'We have three roles: Artists (upload and sell artwork), Collectors (browse and purchase art), and Admins (manage the platform).' },
        { q: 'Is registration free?', a: 'Yes! Registration is completely free for both artists and collectors.' },
      ]
    },
    {
      category: 'For Artists',
      questions: [
        { q: 'How do I upload my artwork?', a: 'After logging in, go to your Artist Dashboard and click "Upload Artwork". Fill in the details, upload your image, set your price, and submit for approval.' },
        { q: 'What are the platform fees?', a: 'We charge a 10% platform fee on artwork sales and 5% on direct artist support payments. You keep 90% of your artwork sales.' },
        { q: 'How do I receive payments?', a: 'Set up your UPI details in your profile settings. Payments are processed after successful sales and transferred to your account.' },
        { q: 'How long does artwork approval take?', a: 'Our admin team typically reviews and approves artwork within 24-48 hours.' },
      ]
    },
    {
      category: 'For Collectors',
      questions: [
        { q: 'How do I purchase artwork?', a: 'Browse the gallery, click on artwork you like, and click "Purchase". You\'ll be redirected to our secure checkout powered by Stripe.' },
        { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards through Stripe, as well as UPI payments for direct artist support.' },
        { q: 'Can I return artwork?', a: 'Yes, we offer a 14-day return policy. Contact support if you\'re not satisfied with your purchase.' },
        { q: 'Is shipping included?', a: 'Shipping costs vary by location and artwork size. All artworks are insured during shipping.' },
      ]
    },
    {
      category: 'Account & Security',
      questions: [
        { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page and follow the instructions sent to your email.' },
        { q: 'Can I change my account type?', a: 'Contact our support team to request an account type change from Collector to Artist or vice versa.' },
        { q: 'Is my payment information secure?', a: 'Yes, all payments are processed through Stripe, a PCI-compliant payment processor. We never store your card details.' },
      ]
    },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -80, 0], scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <Link href="/" className="absolute top-8 left-8 z-50 group">
        <motion.div 
          className="flex items-center gap-2 text-neutral-400 hover:text-amber-600 transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft size={20} />
          <span className="text-sm tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>BACK</span>
        </motion.div>
      </Link>

      <div className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <HelpCircle className="w-16 h-16 text-amber-600/80" strokeWidth={1} />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-light text-white/90 mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Help Center
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our support team
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Mail, title: 'Email Support', desc: 'support@artisan.com', color: 'from-blue-600 to-cyan-500' },
            { icon: MessageCircle, title: 'Live Chat', desc: 'Available 9 AM - 6 PM', color: 'from-green-600 to-emerald-500' },
            { icon: Book, title: 'Documentation', desc: 'Browse our guides', color: 'from-purple-600 to-pink-500' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-neutral-900/60 border border-amber-600/20 rounded-xl backdrop-blur-xl text-center"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} p-0.5 mx-auto mb-4`}>
                <div className="w-full h-full bg-neutral-900 rounded-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <h3 className="text-lg font-light text-white mb-2" style={{ fontFamily: 'Oughter, serif' }}>{item.title}</h3>
              <p className="text-sm text-neutral-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-light text-white/90 mb-8 text-center" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {faqs.map((category, catIdx) => (
              <div key={catIdx}>
                <h3 className="text-xl font-light text-amber-600/80 mb-4 tracking-wider" style={{ fontFamily: 'Oughter, serif' }}>
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.questions.map((faq, faqIdx) => {
                    const globalIdx = catIdx * 10 + faqIdx
                    return (
                      <motion.div
                        key={faqIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + faqIdx * 0.05 }}
                        className="bg-neutral-900/60 border border-neutral-800 rounded-lg overflow-hidden backdrop-blur-xl"
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === globalIdx ? null : globalIdx)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-800/30 transition-colors"
                        >
                          <span className="text-white font-light">{faq.q}</span>
                          <motion.div
                            animate={{ rotate: openFaq === globalIdx ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5 text-amber-600" />
                          </motion.div>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: openFaq === globalIdx ? 'auto' : 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-neutral-400 text-sm leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center p-8 bg-neutral-900/60 border border-amber-600/20 rounded-xl backdrop-blur-xl"
        >
          <h3 className="text-2xl font-light text-white mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Still need help?
          </h3>
          <p className="text-neutral-400 mb-6">
            Our support team is here to assist you
          </p>
          <Link href="mailto:support@artisan.com">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-light tracking-wider transition-all hover:from-amber-500 hover:to-amber-600"
            >
              CONTACT SUPPORT
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
