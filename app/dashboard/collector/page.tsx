'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { StatCard, PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { ShoppingBag, Heart, MessageSquare, DollarSign, FolderOpen, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { CollectionModal } from '@/components/collection-modal'
import { ExportTransactions } from '@/components/export-transactions'
import { ArtworkRecommendations } from '@/components/artwork-recommendations'

export default function CollectorDashboard() {
  const [stats, setStats] = useState({
    purchases: 0,
    likes: 0,
    comments: 0,
    spent: 0,
    collections: 0,
  })
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'recommendations' | 'export'>('overview')
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    loadDashboard()
    
    // Real-time subscriptions
    const user = getCurrentUser()
    if (user?.user_id) {
      const channel = supabase
        .channel('collector-dashboard-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `buyer_id=eq.${user.user_id}` },
          () => loadDashboard()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'likes', filter: `user_id=eq.${user.user_id}` },
          () => loadDashboard()
        )
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'reviews', filter: `reviewer_id=eq.${user.user_id}` },
          () => loadDashboard()
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }
  }, [])

  const loadDashboard = async () => {
    try {
      const user = await getCurrentUser()
      if (!user?.user_id) return

      const [transactionsRes, likesRes, reviewsRes, collectionsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, artworks(image_url, title)')
          .eq('buyer_id', user.user_id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false }),
        supabase.from('likes').select('id').eq('user_id', user.user_id),
        supabase.from('reviews').select('id').eq('reviewer_id', user.user_id),
        supabase.from('collections').select('id').eq('user_id', user.user_id),
      ])

      const transactions = transactionsRes.data ?? []
      const likesCount = likesRes.data?.length ?? 0
      const reviewsCount = reviewsRes.data?.length ?? 0
      const collectionsCount = collectionsRes.data?.length ?? 0
      const spent = transactions.reduce((sum, t) => sum + Number(t.amount ?? 0), 0)
      const purchaseCount = transactions.filter(t => t.transaction_type === 'purchase').length

      // Get artist names for support transactions
      const artistIds = [...new Set(transactions.filter(t => t.transaction_type === 'support').map(t => t.artist_id).filter(Boolean))]
      let artistMap: Record<string, string> = {}
      if (artistIds.length > 0) {
        const { data: artists } = await supabase.from('users').select('id, full_name').in('id', artistIds)
        artists?.forEach((a: any) => { artistMap[a.id] = a.full_name })
      }

      const enrichedTransactions = transactions.map(t => ({
        ...t,
        artist_name: t.transaction_type === 'support' ? artistMap[t.artist_id] : null
      }))

      setPurchases(enrichedTransactions)
      setStats({
        purchases: purchaseCount,
        likes: likesCount,
        comments: reviewsCount,
        spent,
        collections: collectionsCount,
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Collector Dashboard" description="Manage your collection and discover new art" />

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'collections'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <FolderOpen size={16} />
            Collections
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'recommendations'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <Sparkles size={16} />
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'export'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <FileText size={16} />
            Export
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                  {[
                    { label: 'Purchases', value: stats.purchases, icon: ShoppingBag, link: '/dashboard/collector/purchases' },
                    { label: 'Favorites', value: stats.likes, icon: Heart, link: '/dashboard/collector/favorites' },
                    { label: 'Comments', value: stats.comments, icon: MessageSquare, link: '/dashboard/collector/comments' },
                    { label: 'Collections', value: stats.collections, icon: FolderOpen, link: null },
                    { label: 'Total Spent', value: `₹${stats.spent.toLocaleString()}`, icon: DollarSign, link: null },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
                    >
                      <p className="text-xs text-neutral-400 mb-3">{stat.label}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                          <stat.icon className="w-5 h-5 text-neutral-400" />
                        </div>
                        <p className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      Recent Activity
                    </h2>
                    {purchases.length > 0 && (
                      <Link
                        href="/dashboard/collector/purchases"
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        View all →
                      </Link>
                    )}
                  </div>

                  {purchases.length === 0 ? (
                    <EmptyState
                      icon={ShoppingBag}
                      title="No activity yet"
                      description="Start collecting art or support artists to see your activity here"
                      action={
                        <Link
                          href="/gallery"
                          className="rounded-lg bg-amber-600 hover:bg-amber-500 px-6 py-2.5 text-sm text-white transition-colors"
                        >
                          Browse Gallery
                        </Link>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {purchases.slice(0, 6).map((transaction, i) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.05 * i }}
                          whileHover={{ scale: 1.02 }}
                          className="group overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800/30 transition-all hover:border-amber-600/50"
                        >
                          {transaction.transaction_type === 'purchase' && transaction.artworks ? (
                            <>
                              <div className="aspect-[4/3] overflow-hidden">
                                <img
                                  src={transaction.artworks?.image_url}
                                  alt={transaction.artworks?.title}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="mb-1 font-light text-white line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  {transaction.artworks?.title}
                                </h3>
                                <p className="mb-2 text-sm text-white">₹{Number(transaction.amount).toLocaleString()}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-neutral-400">
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                  </p>
                                  <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Purchase</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="aspect-[4/3] bg-gradient-to-br from-pink-600/20 to-purple-600/20 flex items-center justify-center">
                                <Heart className="text-pink-500" size={48} strokeWidth={1.5} />
                              </div>
                              <div className="p-4">
                                <h3 className="mb-1 font-light text-white line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  Artist Support
                                </h3>
                                <p className="mb-1 text-xs text-neutral-400">to {transaction.artist_name || 'Artist'}</p>
                                <p className="mb-2 text-sm text-white">₹{Number(transaction.amount).toLocaleString()}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-neutral-400">
                                    {new Date(transaction.created_at).toLocaleDateString()}
                                  </p>
                                  <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-400">Support</span>
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {user && <ArtworkRecommendations userId={user.user_id} />}
              </>
            )}

            {activeTab === 'collections' && user && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowCollectionModal(true)}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <FolderOpen size={18} />
                  Manage Collections
                </button>
                <p className="text-neutral-400 text-sm">Create and organize your artwork collections</p>
              </div>
            )}

            {activeTab === 'recommendations' && user && (
              <ArtworkRecommendations userId={user.user_id} />
            )}

            {activeTab === 'export' && user && (
              <ExportTransactions userId={user.user_id} role="collector" />
            )}
          </>
        )}
      </div>

      {showCollectionModal && (
        <CollectionModal onClose={() => setShowCollectionModal(false)} />
      )}
    </DashboardLayout>
  )
}
