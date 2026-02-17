'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'

export default function ArtistFollowers() {
  const [followers, setFollowers] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, thisMonth: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowers()
  }, [])

  const loadFollowers = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading followers:', error)
    } else {
      const followerIds = data?.map(f => f.follower_id) || []
      if (followerIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, email')
          .in('id', followerIds)
        
        const userMap: Record<string, any> = {}
        users?.forEach(u => { userMap[u.id] = u })
        
        const enriched = data?.map(f => ({
          ...f,
          user: userMap[f.follower_id]
        })) || []
        setFollowers(enriched)
        
        const thisMonth = enriched.filter(f => 
          new Date(f.created_at).getMonth() === new Date().getMonth()
        ).length
        setStats({ total: enriched.length, thisMonth })
      }
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Followers" description="People following your work" />

        <div className="grid gap-4 md:grid-cols-2">
          <StatCard icon={Users} label="Total Followers" value={stats.total.toString()} />
          <StatCard icon={TrendingUp} label="This Month" value={stats.thisMonth.toString()} />
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : followers.length === 0 ? (
            <EmptyState icon={Users} title="No followers yet" description="Share your work to gain followers" />
          ) : (
            <div className="space-y-3">
              {followers.map((item, i) => (
                <motion.div
                  key={item.follower_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                      {item.user?.avatar_url ? (
                        <img src={item.user.avatar_url} alt={item.user.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-amber-600">
                          {item.user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {item.user?.full_name}
                      </h3>
                      <p className="text-sm text-neutral-400">{item.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
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
