'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { MessageSquare, Eye, ChevronRight, Clock, CheckCircle2, AlertCircle, Hourglass, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { ArtworkModal } from '@/components/artwork-modal'

const STATUS = {
  approved: { label: 'Approved', icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending:  { label: 'Pending',  icon: Hourglass,    cls: 'text-amber-400  bg-amber-500/10  border-amber-500/20'  },
  rejected: { label: 'Rejected', icon: AlertCircle,  cls: 'text-red-400    bg-red-500/10    border-red-500/20'    },
} as const

export default function CollectorComments() {
  const [comments, setComments]               = useState<any[]>([])
  const [loading, setLoading]                 = useState(true)
  const [activeArtwork, setActiveArtwork]     = useState<string | null>(null)
  const [mobileView, setMobileView]           = useState<'list' | 'detail'>('list')
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)

  useEffect(() => {
    loadComments()
    const user = getCurrentUser()
    if (user?.user_id) {
      const ch = supabase.channel('my-reviews-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `reviewer_id=eq.${user.user_id}` }, loadComments)
        .subscribe()
      return () => { supabase.removeChannel(ch) }
    }
  }, [])

  const loadComments = async () => {
    const user = await getCurrentUser()
    if (!user?.user_id) return
    const { data } = await supabase
      .from('reviews')
      .select('*, artworks(id, title, image_url, price, description, medium, dimensions, year_created, artist_id)')
      .eq('reviewer_id', user.user_id)
      .order('created_at', { ascending: false })
    const list = data || []
    setComments(list)
    if (list.length > 0) setActiveArtwork(list[0].artwork_id)
    setLoading(false)
  }

  const grouped = comments.reduce((acc, r) => {
    if (!acc[r.artwork_id]) acc[r.artwork_id] = []
    acc[r.artwork_id].push(r)
    return acc
  }, {} as Record<string, any[]>)

  const artworkEntries = Object.entries(grouped) as [string, any[]][]
  const activeReviews  = activeArtwork ? (grouped[activeArtwork] ?? []) : []
  const activeFirst    = activeReviews[0]

  const openModal = async (artworkId: string, artworkData: any) => {
    const { data: artist } = await supabase.from('users').select('full_name').eq('id', artworkData.artist_id).single()
    setSelectedArtwork({
      id: artworkId, title: artworkData.title,
      artist: artist?.full_name || 'Artist', category: 'artwork',
      image: artworkData.image_url, price: Number(artworkData.price),
      description: artworkData.description, medium: artworkData.medium,
      dimensions: artworkData.dimensions, year_created: artworkData.year_created,
    })
  }

  const selectArtwork = (id: string) => {
    setActiveArtwork(id)
    setMobileView('detail')
  }

  const total    = comments.length
  const approved = comments.filter(r => r.status === 'approved').length
  const pending  = comments.filter(r => r.status === 'pending').length
  const artworks = artworkEntries.length

  const ArtworkList = () => (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-800/60 flex items-center justify-between">
        <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase">Artworks Reviewed</p>
        <span className="text-[9px] text-neutral-600 font-black tracking-wider">{artworkEntries.length}</span>
      </div>
      <div className="divide-y divide-neutral-800/40">
        {artworkEntries.map(([artworkId, reviews], i) => {
          const first    = reviews[0]
          const isActive = activeArtwork === artworkId
          const appCount = reviews.filter((r: any) => r.status === 'approved').length
          const penCount = reviews.filter((r: any) => r.status === 'pending').length

          return (
            <motion.button
              key={artworkId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => selectArtwork(artworkId)}
              className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 relative group ${
                isActive ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-bar"
                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-amber-600 rounded-r-full shadow-[0_0_8px_rgba(217,119,6,0.5)]"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0">
                {first.artworks?.image_url
                  ? <img src={first.artworks.image_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-neutral-800" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-base font-light truncate transition-colors duration-200 ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}
                  style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {first.artworks?.title || 'Artwork'}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {appCount > 0 && <span className="text-[11px] text-emerald-400 font-black tracking-wider">{appCount} approved</span>}
                  {penCount > 0 && <span className="text-[11px] text-amber-400  font-black tracking-wider">{penCount} pending</span>}
                  {appCount === 0 && penCount === 0 && <span className="text-[11px] text-red-400 font-black tracking-wider">{reviews.length} rejected</span>}
                </div>
              </div>

              <ChevronRight size={15} className={`shrink-0 transition-colors ${isActive ? 'text-amber-600' : 'text-neutral-700 group-hover:text-neutral-500'}`} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )

  const DetailPanel = () => (
    <AnimatePresence mode="wait">
      {activeFirst ? (
        <motion.div
          key={activeArtwork}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden"
        >
          {/* Hero banner */}
          <div className="relative h-44 sm:h-52 overflow-hidden">
            {activeFirst.artworks?.image_url && (
              <img src={activeFirst.artworks.image_url} alt="" className="w-full h-full object-cover scale-110 blur-sm opacity-25" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-neutral-900" />
            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />

            <div className="absolute inset-0 flex items-end p-5 gap-4">
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView('list')}
                className="lg:hidden absolute top-4 left-4 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
              </button>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                {activeFirst.artworks?.image_url && (
                  <img src={activeFirst.artworks.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  {activeFirst.artworks?.title}
                </h2>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-[9px] text-neutral-400 tracking-[0.4em] font-black uppercase">
                    {activeReviews.length} {activeReviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                  {activeFirst.artworks?.price && (
                    <span className="text-[9px] text-amber-600/70 tracking-[0.3em] font-black">
                      ₹{Number(activeFirst.artworks.price).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => openModal(activeArtwork!, activeFirst.artworks)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-black tracking-[0.3em] uppercase shrink-0"
              >
                <Eye size={12} /> View
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5 sm:p-6">
            <p className="text-[9px] text-neutral-500 tracking-[0.45em] font-black uppercase mb-5">Comment History</p>

            <div className="relative">
              <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-600/40 via-neutral-700/30 to-transparent pointer-events-none" />

              <div className="space-y-4">
                {activeReviews.map((review: any, i: number) => {
                  const s    = STATUS[review.status as keyof typeof STATUS] ?? STATUS.pending
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-3 sm:gap-4"
                    >
                      {/* Node */}
                      <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 z-10 ${s.cls}`}>
                        <Icon size={13} />
                      </div>

                      {/* Card */}
                      <div className="flex-1 rounded-xl border border-neutral-800 bg-neutral-800/25 p-4 space-y-2.5 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase tracking-[0.35em] px-2.5 py-1 rounded-lg border ${s.cls}`}>
                            {s.label}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                            <Clock size={10} />
                            {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        <p className="text-neutral-300 text-sm leading-relaxed break-words">{review.comment}</p>

                        <div className="pt-2 border-t border-neutral-800/60 flex items-center gap-2">
                          <span className="text-[9px] text-neutral-700 tracking-[0.3em] font-black uppercase">#{i + 1}</span>
                          <div className="flex-1 h-px bg-neutral-800/60" />
                          <span className="text-[9px] text-neutral-700 tracking-wider">
                            {new Date(review.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-5 p-4 lg:p-8">
        <PageHeader title="My Comments" description="Reviews and comments you've written" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',    value: total,    color: 'text-white' },
            { label: 'Artworks', value: artworks, color: 'text-white' },
            { label: 'Approved', value: approved, color: 'text-emerald-400' },
            { label: 'Pending',  value: pending,  color: 'text-amber-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3.5"
            >
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase mb-1.5">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10">
            <EmptyState icon={MessageSquare} title="No comments yet" description="Your reviews will appear here" />
          </div>
        ) : (
          <>
            {/* ── Desktop: two-column ── */}
            <div className="hidden lg:grid lg:grid-cols-[300px_1fr] gap-4 items-start">
              <ArtworkList />
              <DetailPanel />
            </div>

            {/* ── Mobile: list → detail navigation ── */}
            <div className="lg:hidden">
              <AnimatePresence mode="wait">
                {mobileView === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ArtworkList />
                  </motion.div>
                ) : (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <DetailPanel />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {selectedArtwork && (
        <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      )}
    </DashboardLayout>
  )
}
