'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { Users, TrendingUp, Heart, Calendar, ArrowRight, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArtistFollowers() {
  const [followers, setFollowers] = useState<any[]>([])
  const [stats, setStats]         = useState({ total: 0, thisMonth: 0 })
  const [loading, setLoading]     = useState(true)

  useEffect(() => { loadFollowers() }, [])

  const loadFollowers = async () => {
    const user = getCurrentUser()
    if (!user?.user_id) return

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', user.user_id)
      .order('created_at', { ascending: false })

    if (!error && data?.length) {
      const ids = data.map(f => f.follower_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, email, location, role')
        .in('id', ids)

      const map: Record<string, any> = {}
      users?.forEach(u => { map[u.id] = u })

      const enriched = data.map(f => ({ ...f, user: map[f.follower_id] }))
      setFollowers(enriched)

      const thisMonth = enriched.filter(f =>
        new Date(f.created_at).getMonth() === new Date().getMonth() &&
        new Date(f.created_at).getFullYear() === new Date().getFullYear()
      ).length
      setStats({ total: enriched.length, thisMonth })
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.artist} role="artist">
      <div className="relative min-h-screen">

        {/* Atmospheric Sentinel — identical to artist dashboard */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400" style={{ fontFamily: 'Oughter, serif' }}>Patron Registry</span>
              </div>
              <Heart size={14} className="text-neutral-700" />
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Followers <span className="text-neutral-500 italic">Network</span>
            </h1>
            <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
              Everyone who has subscribed to your creative manifestation.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stat cards — same style as dashboard primary vectors */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Total Patrons',      value: stats.total,      icon: Users,     color: 'text-orange-400', glow: 'bg-orange-500/5' },
                  { label: 'Joined This Month',  value: stats.thisMonth,  icon: TrendingUp, color: 'text-rose-400',   glow: 'bg-rose-500/5'   },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group hover:border-orange-500/20 transition-all duration-700 relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${stat.glow}`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] ${stat.color} group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-700`}>
                          <stat.icon size={18} strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-[9px] tracking-[0.4em] uppercase font-black text-neutral-600 group-hover:text-neutral-400 transition-colors mb-2" style={{ fontFamily: 'Oughter, serif' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Followers list */}
              <section className="space-y-8">
                <div className="flex items-end justify-between px-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Registry</p>
                    <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      All <span className="text-neutral-500">Followers</span>
                    </h2>
                  </div>
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>
                    {stats.total} total
                  </span>
                </div>

                {followers.length === 0 ? (
                  <div className="py-32 rounded-[3.5rem] bg-neutral-900/40 border border-white/[0.05] backdrop-blur-3xl flex flex-col items-center gap-8 text-center">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <UserCheck size={32} className="text-neutral-700" strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>No Followers Yet</h3>
                      <p className="text-[13px] text-neutral-500 font-light max-w-xs">Share your work to start building your patron network.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                      {followers.map((item, i) => (
                        <motion.div
                          key={item.follower_id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                          className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] overflow-hidden backdrop-blur-3xl hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                        >
                          {/* Top accent — same as artwork card status badge area */}
                          <div className="px-10 pt-10 pb-6 flex items-center gap-5">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div className="w-16 h-16 rounded-[1.4rem] bg-neutral-800 border border-white/[0.05] overflow-hidden group-hover:border-orange-500/20 transition-all duration-700">
                                {item.user?.avatar_url ? (
                                  <img
                                    src={item.user.avatar_url}
                                    alt={item.user?.full_name}
                                    className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-light text-neutral-600 group-hover:text-orange-400/60 transition-colors" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                    {item.user?.full_name?.charAt(0).toUpperCase() || '?'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Name + role */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="text-xl font-light text-white group-hover:text-orange-400 transition-colors duration-700 truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                {item.user?.full_name || 'Anonymous'}
                              </h3>
                              <span className="inline-block px-3 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500" style={{ fontFamily: 'Oughter, serif' }}>
                                {item.user?.role || 'collector'}
                              </span>
                            </div>
                          </div>

                          {/* Divider + meta — same pattern as artwork card bottom */}
                          <div className="px-10 pb-10 pt-4 border-t border-white/[0.03] space-y-4">
                            {item.user?.location && (
                              <div className="flex items-center gap-2">
                                <div className="h-px w-4 bg-orange-500/20" />
                                <p className="text-[10px] text-neutral-500 tracking-widest uppercase font-light" style={{ fontFamily: 'Oughter, serif' }}>{item.user.location}</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Following Since</p>
                                <p className="text-[13px] text-neutral-400 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>
                                  {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-neutral-600 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all duration-500">
                                <Calendar size={14} strokeWidth={1.5} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
