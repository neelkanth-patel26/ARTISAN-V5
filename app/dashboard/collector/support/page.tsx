'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Heart, DollarSign, Users, MapPin, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CollectorSupport() {
  const [supports, setSupports] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, count: 0, artists: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSupports()
  }, [])

  const loadSupports = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('buyer_id', user.user_id)
      .eq('transaction_type', 'support')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading supports:', error)
      setSupports([])
    } else {
      const artistIds = [...new Set(data?.map(t => t.artist_id).filter(Boolean))] || []
      if (artistIds.length > 0) {
        const { data: artists } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, bio, location, followers_count')
          .in('id', artistIds)
        
        const artistMap: Record<string, any> = {}
        artists?.forEach(a => { artistMap[a.id] = a })
        
        const enriched = data?.map(t => ({
          ...t,
          artist: artistMap[t.artist_id]
        })) || []
        setSupports(enriched)
        
        const total = enriched.reduce((sum, t) => sum + Number(t.amount || 0), 0)
        setStats({ total, count: enriched.length, artists: artistIds.length })
      } else {
        setSupports(data || [])
      }
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Artist Support" description="Your support history" />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={DollarSign} label="Total Support" value={`₹${stats.total.toLocaleString()}`} />
          <StatCard icon={Heart} label="Support Count" value={stats.count.toString()} />
          <StatCard icon={Users} label="Artists Supported" value={stats.artists.toString()} />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : supports.length === 0 ? (
            <EmptyState icon={Heart} title="No support sent yet" description="Support artists to help them create more art" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supports.map((transaction, i) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 backdrop-blur-sm transition-all hover:border-pink-600/50 hover:shadow-lg hover:shadow-pink-600/10 overflow-hidden"
                >
                  <div className="relative h-32 bg-gradient-to-br from-pink-600/10 via-purple-600/10 to-amber-600/10 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 to-transparent" />
                    <div className="relative w-20 h-20 rounded-full border-4 border-neutral-900 bg-gradient-to-br from-pink-600/20 to-purple-600/20 flex items-center justify-center">
                      <Heart className="text-pink-500" size={32} strokeWidth={1.5} />
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {transaction.artist?.full_name || 'Unknown Artist'}
                      </h3>
                      {transaction.artist?.location && (
                        <div className="flex items-center justify-center gap-1 text-xs text-neutral-400">
                          <MapPin size={12} />
                          <span>{transaction.artist.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {transaction.artist?.bio && (
                      <p className="text-xs text-neutral-400 text-center line-clamp-2 leading-relaxed">{transaction.artist.bio}</p>
                    )}
                    
                    <div className="flex items-center justify-center gap-4 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Heart size={12} className="text-pink-500" />
                        <span>{transaction.artist?.followers_count || 0}</span>
                      </div>
                      <div className="text-neutral-600">•</div>
                      <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-neutral-700/50">
                      <div className="text-center mb-3">
                        <p className="text-3xl font-light text-white mb-1" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs bg-pink-600/20 text-pink-400 border border-pink-600/30">
                          Support Payment
                        </span>
                      </div>
                      
                      <Link 
                        href={`/artist?id=${transaction.artist_id}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium transition-colors"
                      >
                        <ExternalLink size={14} />
                        View Artist Profile
                      </Link>
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
