'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AuthPromptModal } from '@/components/auth-prompt-modal'
import { BookingModal } from '@/components/booking-modal'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Calendar, MapPin, Clock, Users, Ticket, ArrowRight, Star } from 'lucide-react'

type ExhibitionItem = {
  id: number | string
  title: string
  artist: string
  image: string
  date: string
  location: string
  time: string
  status: string
  visitors: string
  description: string
}

const DiscoveryPath = () => {
  const ref = useRef<SVGSVGElement>(null)
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  })

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-full pointer-events-none z-0 hidden lg:block overflow-visible pt-32">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 2000"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-20"
      >
        <motion.path
          d="M200 0 C200 400, 350 600, 200 1000 C50 1400, 200 1600, 200 2000"
          stroke="url(#pathGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          style={{ pathLength }}
        />
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0" />
            <stop offset="20%" stopColor="#d97706" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function ExhibitionCard({ exhibition, index, onBookVisit }: { exhibition: ExhibitionItem; index: number; onBookVisit?: () => void }) {
  const isEven = index % 2 === 0
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className={`relative flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center mb-32 lg:mb-64`}
    >
      {/* Connector Point */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full bg-amber-600 shadow-[0_0_20px_#d97706] hidden lg:block z-10" />

      {/* Image Side */}
      <div className="w-full lg:w-1/2 relative group">
        <div className="absolute -inset-4 bg-amber-600/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl">
          <img
            src={exhibition.image}
            alt={exhibition.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
          
          <div className="absolute top-6 right-6">
            <span className={`px-4 py-2 rounded-full text-[10px] tracking-widest font-black uppercase backdrop-blur-xl border ${
              exhibition.status === 'Current' 
                ? 'bg-amber-600/20 text-amber-500 border-amber-600/30' 
                : 'bg-white/5 text-neutral-400 border-white/10'
            }`}>
              {exhibition.status}
            </span>
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className={`w-full lg:w-1/2 space-y-8 ${isEven ? 'lg:text-left' : 'lg:text-right flex flex-col lg:items-end'}`}>
        <div className="space-y-4">
          <p className="text-amber-600/60 text-xs tracking-[0.4em] font-black uppercase">Season Exhibit</p>
          <h2 className="text-4xl md:text-6xl font-light text-white leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
            {exhibition.title}
          </h2>
          <p className="text-neutral-500 text-sm tracking-widest font-black uppercase">By {exhibition.artist}</p>
        </div>

        <p className="text-neutral-400 text-lg font-light leading-relaxed max-w-xl italic">
          "{exhibition.description}"
        </p>

        <div className={`grid grid-cols-2 gap-4 w-full max-w-md`}>
           <div className="space-y-1">
             <p className="text-[10px] text-neutral-600 tracking-[0.2em] font-black uppercase">Location</p>
             <p className="text-sm text-white font-medium">{exhibition.location}</p>
           </div>
           <div className="space-y-1">
             <p className="text-[10px] text-neutral-600 tracking-[0.2em] font-black uppercase">Schedule</p>
             <p className="text-sm text-white font-medium">{exhibition.date}</p>
           </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookVisit}
          className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:bg-neutral-200 transition-all flex items-center gap-4"
        >
          Request Entry <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function ExhibitionsPage() {
  const [realExhibitions, setRealExhibitions] = useState<ExhibitionItem[]>([])
  const [realLoading, setRealLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedExhibition, setSelectedExhibition] = useState<ExhibitionItem | null>(null)

  const handleBookVisit = (exhibition: ExhibitionItem) => {
    if (!getCurrentUser()) {
      setShowAuthPrompt(true)
    } else {
      setSelectedExhibition(exhibition)
    }
  }

  useEffect(() => {
    async function loadRealExhibitions() {
      try {
        const { data, error } = await supabase.rpc('get_all_exhibitions')
        if (error) throw error
        const list = (data || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          artist: e.artist ?? 'Selected Masters',
          image: e.image_url ?? 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
          date: e.start_date ? new Date(e.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'TBA',
          location: e.location ?? 'Main Vault',
          time: e.hours ?? '10:00 - 18:00',
          status: e.status === 'active' ? 'Current' : 'Upcoming',
          visitors: 'Limited Access',
          description: e.description ?? 'A curated exploration of artistic dialogue.',
        }))
        setRealExhibitions(list)
      } catch {
        setRealExhibitions([])
      } finally {
        setRealLoading(false)
      }
    }
    loadRealExhibitions()
  }, [])

  const exhibitions = [
    {
      id: 1,
      title: 'Digital Dreams',
      artist: 'Neelkanth Patel',
      image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
      date: 'Spring 2024',
      location: 'East Wing Vault',
      time: '10:00 - 20:00',
      status: 'Current',
      visitors: '1.8K',
      description: 'Immersive digital art installations pushing the boundaries of technology and human creativity.'
    },
    {
      id: 2,
      title: 'Sculptural Forms',
      artist: 'Urmi Thakkar',
      image: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?w=800',
      date: 'Summer 2024',
      location: 'Sculpture Garden',
      time: '09:00 - 19:00',
      status: 'Upcoming',
      visitors: 'TBA',
      description: 'Exploring three-dimensional art through innovative sculptural techniques and organic materials.'
    }
  ]

  return (
    <main className="min-h-screen bg-neutral-950 overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-neutral-950 z-10" />
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 2 }}
            src="https://images.unsplash.com/photo-1518998053574-53ee7536a909?w=1600&h=900&fit=crop" 
            className="w-full h-full object-cover"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-20 text-center space-y-6 px-4"
        >
          <p className="text-amber-600 text-xs tracking-[0.5em] font-black uppercase">The Program</p>
          <h1 className="text-6xl md:text-9xl font-light text-white tracking-tighter" style={{ fontFamily: 'ForestSmooth, serif' }}>
            Curated <br /> Seasons
          </h1>
          <p className="text-neutral-500 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed tracking-wide mt-8">
            A chronological journey through our most prestigious exhibitions and upcoming artistic encounters.
          </p>
        </motion.div>
      </section>

      {/* Discovery Path Section */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-12 py-32">
        <DiscoveryPath />
        
        <div className="relative z-10">
          {exhibitions.map((exhibition, index) => (
            <ExhibitionCard 
              key={exhibition.id} 
              exhibition={exhibition} 
              index={index} 
              onBookVisit={() => handleBookVisit(exhibition)} 
            />
          ))}

          {realLoading ? (
            <div className="flex justify-center py-32">
              <div className="w-12 h-12 border-2 border-amber-600/20 border-t-amber-600 rounded-full animate-spin" />
            </div>
          ) : (
            realExhibitions.map((exhibition, index) => (
              <ExhibitionCard 
                key={exhibition.id} 
                exhibition={exhibition} 
                index={index + 2} 
                onBookVisit={() => handleBookVisit(exhibition)} 
              />
            ))
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-12">
           <Star className="mx-auto text-amber-600/40" size={48} />
           <h2 className="text-4xl md:text-6xl text-white font-light leading-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
             Private Viewings <br /> & Masterclasses
           </h2>
           <p className="text-neutral-500 font-light max-w-xl mx-auto italic">
             "Art is not what you see, but what you make others see. Join our inner circle for exclusive encounters with art."
           </p>
           <button className="px-12 py-6 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white/5 transition-all">
             Inquire Membership
           </button>
        </div>
      </section>

      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} message="Sign in to book a visit to this exhibition." />
      {selectedExhibition && (
        <BookingModal
          exhibition={selectedExhibition}
          onClose={() => setSelectedExhibition(null)}
        />
      )}
      <Footer />
    </main>
  )
}
