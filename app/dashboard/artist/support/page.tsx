'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, DollarSign, TrendingUp, Grid3x3, List } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function ArtistSupport() {
  const [supports, setSupports] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, count: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadSupports()
  }, [])

  const loadSupports = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('artist_id', user.user_id)
      .eq('transaction_type', 'support')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading supports:', error)
    } else {
      const buyerIds = [...new Set(data?.map(t => t.buyer_id).filter(Boolean))] || []
      if (buyerIds.length > 0) {
        const { data: buyers } = await supabase
          .from('users')
          .select('id, full_name, avatar_url')
          .in('id', buyerIds)
        
        const buyerMap: Record<string, any> = {}
        buyers?.forEach(b => { buyerMap[b.id] = b })
        
        const enriched = data?.map(t => ({
          ...t,
          buyer: buyerMap[t.buyer_id]
        })) || []
        setSupports(enriched)
        
        const total = enriched.reduce((sum, t) => sum + Number(t.artist_earnings || 0), 0)
        const thisMonth = enriched.filter(t => 
          new Date(t.created_at).getMonth() === new Date().getMonth()
        ).reduce((sum, t) => sum + Number(t.artist_earnings || 0), 0)
        
        setStats({ total, count: enriched.length, thisMonth })
      }
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Support Received" description="Support from your followers" />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={DollarSign} label="Total Support" value={`₹${stats.total.toLocaleString()}`} />
          <StatCard icon={Heart} label="Support Count" value={stats.count.toString()} />
          <StatCard icon={TrendingUp} label="This Month" value={`₹${stats.thisMonth.toLocaleString()}`} />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : supports.length === 0 ? (
            <EmptyState icon={Heart} title="No support yet" description="Your supporters will appear here" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-400 text-sm">{supports.length} {supports.length === 1 ? 'supporter' : 'supporters'}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Grid3x3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {supports.map((transaction, i) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-5 transition-all hover:border-amber-600/50 hover:shadow-lg hover:shadow-amber-600/10"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-20 h-20 rounded-full bg-neutral-800 overflow-hidden border-2 border-neutral-700">
                          {transaction.buyer?.avatar_url ? (
                            <img src={transaction.buyer.avatar_url} alt={transaction.buyer.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-600 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {transaction.buyer?.full_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {transaction.buyer?.full_name || 'Anonymous'}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="w-full pt-3 border-t border-neutral-700">
                          <p className="text-2xl font-semibold text-amber-600 mb-1">₹{Number(transaction.artist_earnings || 0).toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">Fee: ₹{Number(transaction.platform_fee || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {supports.map((transaction, i) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-amber-600/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 border border-neutral-700">
                          {transaction.buyer?.avatar_url ? (
                            <img src={transaction.buyer.avatar_url} alt={transaction.buyer.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl text-neutral-600">
                              {transaction.buyer?.full_name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {transaction.buyer?.full_name || 'Anonymous'}
                          </h3>
                          <p className="text-sm text-neutral-400">
                            {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-amber-600">₹{Number(transaction.artist_earnings || 0).toLocaleString()}</p>
                          <p className="text-xs text-neutral-400">Fee: ₹{Number(transaction.platform_fee || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
