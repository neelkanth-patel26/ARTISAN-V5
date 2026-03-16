'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, EmptyState, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, UserMinus, Eye, Heart, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CollectorFollowing() {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')

  useEffect(() => { loadFollowing() }, [])

  const loadFollowing = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', user.user_id)
      .order('created_at', { ascending: false })

    if (error) { setLoading(false); return }

    const artistIds = data?.map((f: any) => f.following_id) || []
    if (artistIds.length > 0) {
      const { data: artists } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, bio, followers_count, total_views, location')
        .in('id', artistIds)

      const enriched = data?.map((f: any) => ({
        ...f,
        artist: artists?.find((a: any) => a.id === f.following_id)
      })) || []
      setFollowing(enriched)
    } else {
      setFollowing([])
    }
    setLoading(false)
  }

  const handleUnfollow = async (artistId: string) => {
    const user = getCurrentUser()
    if (!user?.user_id) return
    try {
      const { error } = await supabase
        .from('follows').delete()
        .eq('follower_id', user.user_id)
        .eq('following_id', artistId)
      if (error) throw error
      setFollowing(prev => prev.filter(item => item.following_id !== artistId))
      toast.success('Unfollowed')
    } catch {
      toast.error('Failed to unfollow')
    }
  }

  const filtered = following.filter(item =>
    !search || item.artist?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-5 p-4 lg:p-8">
        <PageHeader title="Following" description="The creative minds you admire" />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Following',     value: following.length,                                                                    color: 'text-white'       },
            { label: 'Total Followers', value: following.reduce((s, f) => s + (f.artist?.followers_count ?? 0), 0).toLocaleString(), color: 'text-amber-400'   },
            { label: 'Total Views',   value: following.reduce((s, f) => s + (f.artist?.total_views ?? 0), 0).toLocaleString(),    color: 'text-neutral-300' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3.5"
            >
              <p className="text-[9px] text-neutral-600 tracking-[0.4em] font-black uppercase mb-1.5">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-light ${s.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        {following.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search artists..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-neutral-900/40 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
            />
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : following.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10">
            <EmptyState icon={Users} title="Not following anyone yet" description="Explore the gallery to find artists that resonate with your taste." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-10 text-center">
            <p className="text-neutral-500 text-sm">No artists match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  layout
                  key={item.following_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 transition-all duration-300"
                >
                  {/* Top amber shimmer on hover */}
                  <div className="h-px bg-gradient-to-r from-transparent via-amber-600/0 to-transparent group-hover:via-amber-600/30 transition-all duration-500" />

                  <div className="p-5 flex flex-col gap-4">
                    {/* Avatar + name row */}
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.04 }}
                        className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700/60 shrink-0"
                      >
                        {item.artist?.avatar_url ? (
                          <img src={item.artist.avatar_url} alt={item.artist.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-light text-amber-600/30" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {item.artist?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                        )}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/artist?id=${item.following_id}`}>
                          <h3 className="text-base font-light text-white hover:text-amber-500 transition-colors truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                            {item.artist?.full_name ?? 'Unknown Artist'}
                          </h3>
                        </Link>
                        {item.artist?.location && (
                          <p className="text-[10px] text-neutral-600 tracking-wider mt-0.5 truncate">{item.artist.location}</p>
                        )}
                      </div>

                      <Link
                        href={`/artist?id=${item.following_id}`}
                        className="w-8 h-8 rounded-xl border border-neutral-700 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-500 transition-all shrink-0"
                      >
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-800/20 px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Heart size={10} className="text-amber-600/50" />
                          <p className="text-[9px] text-neutral-600 tracking-[0.3em] font-black uppercase">Followers</p>
                        </div>
                        <p className="text-sm font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {(item.artist?.followers_count ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="rounded-xl border border-neutral-800 bg-neutral-800/20 px-3 py-2">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye size={10} className="text-amber-600/50" />
                          <p className="text-[9px] text-neutral-600 tracking-[0.3em] font-black uppercase">Views</p>
                        </div>
                        <p className="text-sm font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {(item.artist?.total_views ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {item.artist?.bio && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed italic line-clamp-2">
                        "{item.artist.bio}"
                      </p>
                    )}

                    {/* Since */}
                    <p className="text-[9px] text-neutral-700 tracking-[0.3em] font-black uppercase">
                      Following since {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>

                    {/* Unfollow */}
                    <button
                      onClick={() => handleUnfollow(item.following_id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all duration-300 text-[10px] font-black tracking-[0.3em] uppercase"
                    >
                      <UserMinus size={13} />
                      Unfollow
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
