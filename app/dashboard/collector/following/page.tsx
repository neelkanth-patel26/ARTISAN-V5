'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, UserMinus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function CollectorFollowing() {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFollowing()
  }, [])

  const loadFollowing = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading following:', error)
      setFollowing([])
    } else {
      const artistIds = data?.map(f => f.following_id) || []
      if (artistIds.length > 0) {
        const { data: artists } = await supabase
          .from('users')
          .select('id, full_name, avatar_url, bio, followers_count, total_views')
          .in('id', artistIds)
        
        const enriched = data?.map(f => ({
          ...f,
          artist: artists?.find(a => a.id === f.following_id)
        })) || []
        setFollowing(enriched)
      }
    }
    setLoading(false)
  }

  const handleUnfollow = async (artistId: string) => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.user_id)
      .eq('following_id', artistId)

    toast.success('Unfollowed')
    loadFollowing()
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Following" description="Artists you follow" />

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          {loading ? (
            <LoadingSpinner />
          ) : following.length === 0 ? (
            <EmptyState icon={Users} title="Not following anyone" description="Follow artists to see their updates" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {following.map((item, i) => (
                <motion.div
                  key={item.following_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                      {item.artist?.avatar_url ? (
                        <img src={item.artist.avatar_url} alt={item.artist.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-amber-600">
                          {item.artist?.full_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {item.artist?.full_name}
                      </h3>
                      <div className="flex gap-3 text-xs text-neutral-400 mt-1">
                        <span>{item.artist?.followers_count} followers</span>
                        <span>{item.artist?.total_views} views</span>
                      </div>
                    </div>
                  </div>
                  {item.artist?.bio && (
                    <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{item.artist.bio}</p>
                  )}
                  <button
                    onClick={() => handleUnfollow(item.following_id)}
                    className="w-full px-3 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <UserMinus size={14} />
                    Unfollow
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
