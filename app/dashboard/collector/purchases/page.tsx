'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { ShoppingBag, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function CollectorPurchases() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'purchase' | 'support'>('all')

  useEffect(() => {
    loadTransactions()
    
    // Real-time subscription
    const user = getCurrentUser()
    if (user?.user_id) {
      const channel = supabase
        .channel('transactions-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'transactions', filter: `buyer_id=eq.${user.user_id}` },
          () => loadTransactions()
        )
        .subscribe()
      
      return () => { supabase.removeChannel(channel) }
    }
  }, [])

  const loadTransactions = async () => {
    const user = await getCurrentUser()
    if (!user || !user.user_id) return

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        artworks (
          id,
          title,
          image_url,
          artist_id
        )
      `)
      .eq('buyer_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading transactions:', error)
      setTransactions([])
    } else {
      const txs = data || []
      const artistIds = [...new Set(txs.map((t: any) => t.artist_id || t.artworks?.artist_id).filter(Boolean))]
      
      if (artistIds.length > 0) {
        const { data: artists } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .in('id', artistIds)
        
        const artistMap: Record<string, any> = {}
        artists?.forEach((a: any) => { artistMap[a.id] = a })
        
        const enriched = txs.map((t: any) => ({
          ...t,
          artist: artistMap[t.artist_id],
          artworks: t.artworks ? {
            ...t.artworks,
            users: { full_name: artistMap[t.artworks.artist_id]?.full_name || 'Unknown Artist' }
          } : null
        }))
        setTransactions(enriched)
      } else {
        setTransactions(txs)
      }
    }
    setLoading(false)
  }

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.transaction_type === filter
  )

  const purchases = transactions.filter(t => t.transaction_type === 'purchase')
  const supports = transactions.filter(t => t.transaction_type === 'support')

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="My Purchases" description="Your purchase and support history" />

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('purchase')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'purchase' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Purchases ({purchases.length})
          </button>
          <button
            onClick={() => setFilter('support')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'support' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            Supports ({supports.length})
          </button>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState 
              icon={filter === 'support' ? Heart : ShoppingBag} 
              title={`No ${filter === 'all' ? 'transactions' : filter === 'purchase' ? 'purchases' : 'supports'} yet`} 
              description={`Your ${filter === 'all' ? 'transactions' : filter === 'purchase' ? 'purchases' : 'supports'} will appear here`} 
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTransactions.map((transaction, i) => (
                <motion.div 
                  key={transaction.id} 
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  whileHover={{ scale: 1.02 }} 
                  className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800/30 transition-all hover:border-neutral-700"
                >
                  {transaction.transaction_type === 'purchase' && transaction.artworks ? (
                    <>
                      <img 
                        src={transaction.artworks.image_url} 
                        alt={transaction.artworks.title} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="p-4">
                        <h3 className="font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{transaction.artworks.title}</h3>
                        <p className="text-sm text-neutral-400 mb-2">by {transaction.artworks.users?.full_name}</p>
                        <p className="mb-2 text-sm text-white">₹{transaction.amount}</p>
                        <div className="flex justify-between items-center text-xs text-neutral-400">
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span className="px-2 py-1 rounded text-[10px] bg-blue-600/20 text-blue-400">
                            Purchase
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-full h-48 bg-gradient-to-br from-pink-600/20 to-purple-600/20 flex items-center justify-center">
                        <Heart className="text-pink-500" size={64} strokeWidth={1.5} />
                      </div>
                      <div className="p-4">
                        <h3 className="font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>Artist Support</h3>
                        <p className="text-sm text-neutral-400 mb-2">to {transaction.artist?.full_name || 'Artist'}</p>
                        <p className="mb-2 text-sm text-white">₹{transaction.amount}</p>
                        <div className="flex justify-between items-center text-xs text-neutral-400">
                          <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                          <span className="px-2 py-1 rounded text-[10px] bg-pink-600/20 text-pink-400">
                            Support
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
