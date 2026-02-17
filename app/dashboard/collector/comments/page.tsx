'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { MessageSquare, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { ArtworkModal } from '@/components/artwork-modal'

export default function CollectorComments() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedArtwork, setExpandedArtwork] = useState<string | null>(null)
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)

  useEffect(() => {
    loadComments()
    
    // Real-time subscription
    const user = getCurrentUser()
    if (user?.user_id) {
      const channel = supabase
        .channel('my-reviews-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'reviews', filter: `reviewer_id=eq.${user.user_id}` },
          () => loadComments()
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
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

    setComments(data || [])
    setLoading(false)
  }

  // Group comments by artwork
  const groupedComments = comments.reduce((acc, review) => {
    const artworkId = review.artwork_id
    if (!acc[artworkId]) acc[artworkId] = []
    acc[artworkId].push(review)
    return acc
  }, {} as Record<string, any[]>)

  const handleViewArtwork = async (artworkId: string, artworkData: any) => {
    // Get artist name
    const { data: artist } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', artworkData.artist_id)
      .single()
    
    setSelectedArtwork({
      id: artworkId,
      title: artworkData.title,
      artist: artist?.full_name || 'Artist',
      category: 'artwork',
      image: artworkData.image_url,
      price: Number(artworkData.price),
      description: artworkData.description,
      medium: artworkData.medium,
      dimensions: artworkData.dimensions,
      year_created: artworkData.year_created
    })
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="My Comments" description="Reviews and comments you've written" />

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : comments.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No comments yet"
              description="Your reviews will appear here"
            />
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedComments).map(([artworkId, reviews], i) => {
                const firstReview = reviews[0]
                const isExpanded = expandedArtwork === artworkId
                
                return (
                  <motion.div
                    key={artworkId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-neutral-800 bg-neutral-800/30 overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      {firstReview.artworks?.image_url && (
                        <img
                          src={firstReview.artworks.image_url}
                          alt={firstReview.artworks.title}
                          className="w-24 h-24 rounded-lg object-cover border border-neutral-700"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-light text-white text-lg" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {firstReview.artworks?.title || 'Artwork'}
                          </h3>
                          <button
                            onClick={() => handleViewArtwork(artworkId, firstReview.artworks)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-all text-xs"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                        <p className="text-neutral-400 text-sm mb-3">{reviews.length} {reviews.length === 1 ? 'comment' : 'comments'}</p>
                        
                        {reviews.length > 1 && (
                          <button
                            onClick={() => setExpandedArtwork(isExpanded ? null : artworkId)}
                            className="flex items-center gap-1 text-neutral-400 text-sm hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {isExpanded ? 'Show less' : 'Show all comments'}
                          </button>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {(isExpanded || reviews.length === 1) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-neutral-800"
                        >
                          <div className="p-4 space-y-3">
                            {reviews.map((review) => (
                              <div key={review.id} className="bg-neutral-900/50 rounded-lg p-3 border border-neutral-800">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                  <span className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-neutral-300 text-sm mb-2">{review.comment}</p>
                                <span
                                  className={`inline-block text-xs px-2 py-1 rounded ${
                                    review.status === 'approved'
                                      ? 'bg-green-600/20 text-green-400'
                                      : review.status === 'pending'
                                        ? 'bg-yellow-600/20 text-yellow-400'
                                        : 'bg-neutral-700 text-neutral-400'
                                  }`}
                                >
                                  {review.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </DashboardLayout>
  )
}
