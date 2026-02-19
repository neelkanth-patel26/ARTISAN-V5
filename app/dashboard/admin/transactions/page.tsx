'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { DollarSign, ShoppingCart, Heart, TrendingUp, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({ totalRevenue: 0, purchases: 0, supports: 0, platformFees: 0, upiPlatformFees: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'purchase' | 'support'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading transactions:', error)
    } else {
      const userIds = [...new Set([
        ...data?.map(t => t.buyer_id).filter(Boolean) || [],
        ...data?.map(t => t.artist_id).filter(Boolean) || []
      ])]
      
      const artworkIds = [...new Set(data?.map(t => t.artwork_id).filter(Boolean))] || []

      const [usersRes, artworksRes] = await Promise.all([
        supabase.from('users').select('id, full_name, avatar_url').in('id', userIds),
        artworkIds.length > 0 ? supabase.from('artworks').select('id, title, image_url').in('id', artworkIds) : { data: [] }
      ])

      const userMap: Record<string, any> = {}
      usersRes.data?.forEach(u => { userMap[u.id] = u })

      const artworkMap: Record<string, any> = {}
      artworksRes.data?.forEach(a => { artworkMap[a.id] = a })

      const enriched = data?.map(t => ({
        ...t,
        buyer: userMap[t.buyer_id],
        artist: userMap[t.artist_id],
        artwork: artworkMap[t.artwork_id]
      })) || []

      setTransactions(enriched)

      const totalRevenue = enriched.reduce((sum, t) => sum + Number(t.amount || 0), 0)
      const purchases = enriched.filter(t => t.transaction_type === 'purchase').length
      const supports = enriched.filter(t => t.transaction_type === 'support').length
      const platformFees = enriched.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0)
      const upiPlatformFees = enriched.filter(t => t.payment_method === 'upi').reduce((sum, t) => sum + Number(t.platform_fee || 0), 0)

      setStats({ totalRevenue, purchases, supports, platformFees, upiPlatformFees })
    }
    setLoading(false)
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.transaction_type === filter
    const matchesSearch = searchQuery === '' || 
      t.buyer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artwork?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Transactions" description="Monitor all platform transactions" />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
          <StatCard icon={ShoppingCart} label="Purchases" value={stats.purchases.toString()} />
          <StatCard icon={Heart} label="Supports" value={stats.supports.toString()} />
          <StatCard icon={TrendingUp} label="Platform Fees" value={`₹${stats.platformFees.toLocaleString()}`} />
        </div>

        {stats.upiPlatformFees > 0 && (
          <div className="rounded-xl border border-amber-600/30 bg-amber-600/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">UPI Platform Fees (5%)</p>
                <p className="text-xs text-neutral-500 mt-1">gaming.network.studio.mg@okicici</p>
              </div>
              <p className="text-2xl font-bold text-amber-600">₹{stats.upiPlatformFees.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by buyer, artist, artwork, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-neutral-600 placeholder-neutral-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('purchase')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === 'purchase' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setFilter('support')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === 'support' ? 'bg-amber-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Supports
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : filteredTransactions.length === 0 ? (
            <EmptyState icon={DollarSign} title="No transactions" description="Transactions will appear here" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-neutral-700"
                >
                  <div className="flex flex-col gap-3">
                    {tx.transaction_type === 'purchase' && tx.artwork ? (
                      <img src={tx.artwork.image_url} alt={tx.artwork.title} className="w-full h-32 rounded-lg object-cover" />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-neutral-700 flex items-center justify-center">
                        <Heart className="text-amber-600" size={32} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-light text-white mb-1 line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {tx.transaction_type === 'purchase' ? tx.artwork?.title || 'Artwork Purchase' : 'Artist Support'}
                      </h3>
                      <p className="text-sm text-neutral-400 mb-1">
                        {tx.buyer?.full_name || 'Buyer'} → {tx.artist?.full_name || 'Artist'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                      <div>
                        <p className="text-lg font-semibold text-white">₹{Number(tx.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-neutral-400">Fee: ₹{Number(tx.platform_fee || 0).toFixed(2)}</p>
                        {tx.payment_method === 'upi' && (
                          <p className="text-xs text-amber-500">UPI</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.transaction_type === 'purchase' 
                          ? 'bg-blue-600/20 text-blue-400' 
                          : 'bg-pink-600/20 text-pink-400'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
