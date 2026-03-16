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
      <div className="min-h-screen space-y-8 p-6 lg:p-12 bg-transparent">
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex"
                  >
                    <div className="relative flex-1 flex flex-col overflow-hidden rounded-[2.5rem] border border-neutral-800 bg-neutral-800/40 backdrop-blur-xl transition-all duration-700 hover:border-amber-600/30 hover:bg-neutral-800/60 shadow-2xl">
                      {/* Subthe Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      
                      <div className="flex-1 flex flex-col p-8">
                        {/* Top Section: Avatar and Main Info */}
                        <div className="flex flex-col items-center text-center space-y-4 mb-6">
                          {/* Avatar Container */}
                          <div className="relative">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="w-24 h-24 rounded-3xl bg-neutral-800 border-2 border-neutral-800 group-hover:border-amber-600/30 transition-all duration-700 overflow-hidden shadow-2xl"
                            >
                              {item.artist?.avatar_url ? (
                                <img 
                                  src={item.artist.avatar_url} 
                                  alt={item.artist.full_name} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-3xl font-light text-amber-500/30">
                                  {item.artist?.full_name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </motion.div>
                          </div>

                          <div className="space-y-1.5 w-full">
                            <Link 
                              href={`/artist?id=${item.following_id}`}
                              className="inline-block max-w-full"
                            >
                              <h3 className="text-2xl font-light text-white truncate hover:text-amber-500 transition-colors duration-300" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                {item.artist?.full_name}
                              </h3>
                            </Link>
                            <div className="flex justify-center items-center gap-4">
                              <span className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-semibold">
                                <Users size={10} className="text-amber-600/50" />
                                {item.artist?.followers_count}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-neutral-800" />
                              <span className="flex items-center gap-1.5 text-[8px] tracking-[0.2em] text-neutral-500 uppercase font-semibold">
                                <Eye size={10} className="text-amber-600/50" />
                                {item.artist?.total_views}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio Section with Fixed Height for Consistency */}
                        <div className="flex-1 flex flex-col justify-center min-h-[60px] relative">
                          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent top-0" />
                          <p className="text-[11px] text-neutral-400 leading-relaxed text-center font-light italic opacity-70 group-hover:opacity-100 transition-opacity px-2">
                             {item.artist?.bio ? `"${item.artist.bio.slice(0, 100)}${item.artist.bio.length > 100 ? '...' : ''}"` : "Exploring contemporary art boundaries..."}
                          </p>
                          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent bottom-0" />
                        </div>

                        {/* Action Area */}
                        <div className="mt-8">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnfollow(item.following_id)
                            }}
                            className="w-full flex items-center justify-center gap-2 group/btn relative py-3.5 rounded-2xl bg-amber-600 text-white text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-amber-500 transition-all duration-300 shadow-lg shadow-amber-900/20 active:scale-[0.98]"
                          >
                            <UserMinus size={14} className="transition-transform duration-500 group-hover/btn:-translate-x-1" />
                            <span className="relative z-10">Stop Following</span>
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
