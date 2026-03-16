'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, UserMinus, Eye, Hash, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'

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

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.user_id)
        .eq('following_id', artistId)

      if (error) throw error
      
      setFollowing(prev => prev.filter(item => item.following_id !== artistId))
      toast.success('Successfully unfollowed artist')
    } catch (err) {
      toast.error('Failed to unfollow artist')
    }
  }

  // Generate a dynamic gradient based on string for a premium look
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
    const h1 = Math.abs(hash) % 360
    const h2 = (h1 + 40) % 360
    return `linear-gradient(135deg, hsv(${h1}, 70%, 20%), hsv(${h2}, 80%, 10%))`
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="relative min-h-[calc(100vh-100px)] space-y-8 p-6 lg:p-12 overflow-hidden bg-black/20">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neutral-900/20 blur-[100px] rounded-full pointer-events-none -ml-32 -mb-32" />

        <div className="relative z-10">
          <PageHeader 
            title="Following" 
            description="The collection of creative minds you admire" 
          />
        </div>

        <div className="relative z-10">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : following.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-neutral-800/50 bg-neutral-900/30 backdrop-blur-md p-20 text-center"
            >
              <EmptyState 
                icon={Users} 
                title="Your Circle is Empty" 
                description="Explore the gallery to find artists that resonate with your taste." 
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {following.map((item, i) => (
                  <motion.div
                    layout
                    key={item.following_id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                      delay: i * 0.08 
                    }}
                    className="group relative"
                  >
                    <div className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl transition-all duration-500 hover:border-amber-600/30 hover:bg-neutral-900/60 shadow-2xl hover:shadow-amber-900/10">
                      {/* Card Header / Cover */}
                      <div 
                        className="h-28 w-full opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                        style={{ 
                          background: `linear-gradient(45deg, #1a1a1a, #0a0a0a)`,
                          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.1), transparent 50%), radial-gradient(circle at 80% 50%, rgba(38, 38, 38, 0.4), transparent 50%)`
                        }}
                      />
                      
                      {/* Avatar Overlay */}
                      <div className="absolute top-14 left-6">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="w-22 h-22 p-1.5 rounded-2xl bg-black border border-neutral-800 group-hover:border-amber-600/30 shadow-2xl transition-all duration-500"
                        >
                          <div className="w-full h-full rounded-xl overflow-hidden bg-neutral-800">
                            {item.artist?.avatar_url ? (
                              <img 
                                src={item.artist.avatar_url} 
                                alt={item.artist.full_name} 
                                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl font-light text-amber-500/50">
                                {item.artist?.full_name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>

                      <div className="pt-14 p-6 space-y-4">
                        <div className="space-y-1">
                          <Link 
                            href={`/artist?id=${item.following_id}`}
                            className="flex items-center gap-2 group/name"
                          >
                            <h3 className="text-xl font-light text-white group-hover/name:text-amber-500 transition-colors duration-300" style={{ fontFamily: 'ForestSmooth, serif' }}>
                              {item.artist?.full_name}
                            </h3>
                            <ArrowUpRight size={14} className="text-neutral-500 opacity-0 group-hover/name:opacity-100 transition-all" />
                          </Link>
                          <div className="flex items-center gap-4 text-[10px] tracking-[0.15em] text-neutral-500 uppercase font-medium">
                            <span className="flex items-center gap-1.5">
                              <Users size={10} className="text-amber-600/60" />
                              {item.artist?.followers_count}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye size={10} className="text-amber-600/60" />
                              {item.artist?.total_views}
                            </span>
                          </div>
                        </div>

                        {item.artist?.bio && (
                          <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2 h-8 font-light italic">
                            "{item.artist.bio}"
                          </p>
                        )}

                        <div className="pt-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnfollow(item.following_id)
                            }}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-800 bg-black/40 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 text-xs font-medium flex items-center justify-center gap-2"
                          >
                            <UserMinus size={14} />
                            <span>Stop Following</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
