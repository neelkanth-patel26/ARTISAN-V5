'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { 
  TrendingUp, Users, Heart, DollarSign, Image, 
  Search, ArrowUpRight, Zap, Award, BarChart3,
  Filter
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts'

export default function AdminArtistPerformance() {
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadArtistPerformance()
  }, [])

  const loadArtistPerformance = async () => {
    setLoading(true)
    const { data: artistsData, error: artistsError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, followers_count, total_views, created_at')
      .eq('role', 'artist')
      .eq('status', 'active')

    if (artistsError) {
      setLoading(false)
      return
    }

    const { data: artworksData } = await supabase
      .from('artworks')
      .select('artist_id, status')

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('artist_id, amount, artist_earnings, transaction_type, status')
      .eq('status', 'completed')

    const artworksByArtist: Record<string, number> = {}
    artworksData?.forEach(a => {
      artworksByArtist[a.artist_id] = (artworksByArtist[a.artist_id] || 0) + 1
    })

    const salesByArtist: Record<string, { count: number; revenue: number; support: number }> = {}
    transactionsData?.forEach(t => {
      if (!salesByArtist[t.artist_id]) {
        salesByArtist[t.artist_id] = { count: 0, revenue: 0, support: 0 }
      }
      salesByArtist[t.artist_id].count++
      salesByArtist[t.artist_id].revenue += Number(t.artist_earnings || 0)
      if (t.transaction_type === 'support') {
        salesByArtist[t.artist_id].support += Number(t.artist_earnings || 0)
      }
    })

    const enriched = artistsData?.map(artist => {
      const artworks = artworksByArtist[artist.id] || 0
      const sales = salesByArtist[artist.id]?.count || 0
      const revenue = salesByArtist[artist.id]?.revenue || 0
      const support = salesByArtist[artist.id]?.support || 0
      
      return {
        ...artist,
        artworks,
        sales,
        revenue,
        support,
        performance: (
          (artist.followers_count * 2) +
          (artist.total_views * 0.1) +
          (sales * 10) +
          (revenue * 0.01)
        )
      }
    }) || []

    enriched.sort((a, b) => b.performance - a.performance)
    setArtists(enriched)
    setLoading(false)
  }

  const filteredArtists = useMemo(() => 
    artists.filter(a => a.full_name.toLowerCase().includes(search.toLowerCase())),
    [artists, search]
  )

  const topStats = useMemo(() => {
    if (!artists.length) return { totalRevenue: 0, avgPerformance: 0, topArtist: 'None' }
    return {
      totalRevenue: artists.reduce((s, a) => s + a.revenue, 0),
      avgPerformance: Math.round(artists.reduce((s, a) => s + a.performance, 0) / artists.length),
      topArtist: artists[0].full_name.split(' ')[0]
    }
  }, [artists])

  const chartData = useMemo(() => 
    artists.slice(0, 6).map(a => ({
      name: a.full_name.split(' ')[0],
      Revenue: a.revenue,
      Followers: a.followers_count,
    })),
    [artists]
  )

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen p-6 lg:p-12 space-y-12 overflow-hidden">
        {/* Immersive Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-700/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 space-y-10">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
            <PageHeader 
              title="Artist Intelligence" 
              description="Orchestrating the performance vectors of our creator ecosystem" 
            />
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-orange-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Scan profiles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-2xl text-white text-[11px] uppercase tracking-[0.2em] placeholder-neutral-700 focus:outline-none focus:border-orange-500/30 focus:bg-white/[0.05] transition-all"
                  style={{ fontFamily: 'Oughter, serif' }}
                />
              </div>
              <button className="flex items-center gap-3 px-6 py-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.08] transition-all text-neutral-400 hover:text-white">
                <Filter size={16} />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Filter</span>
              </button>
            </div>
          </div>

          {/* Top Metrics Ensemble */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[
              { label: 'Ecosystem Revenue', value: `₹${topStats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', color: 'text-emerald-400' },
              { label: 'Avg Performance', value: topStats.avgPerformance, icon: Zap, trend: '+4.2%', color: 'text-orange-400' },
              { label: 'Leading Creator', value: topStats.topArtist, icon: Award, trend: 'Primary', color: 'text-amber-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] flex flex-col gap-6 group hover:bg-white/[0.05] transition-all duration-700 shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
                    <ArrowUpRight size={10} className={stat.color} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${stat.color}`}>{stat.trend}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-black" style={{ fontFamily: 'Oughter, serif' }}>{stat.label}</p>
                  <p className="text-[32px] font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Artist Comparison Analytics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/[0.05] space-y-8"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Comparative Performance Vectors</h3>
                <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-black" style={{ fontFamily: 'Oughter, serif' }}>Revenue vs Audience Engagement</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-500/20 rounded-xl">
                <BarChart3 size={14} className="text-orange-500" />
                <span className="text-[9px] text-orange-500 font-black uppercase tracking-widest">Live Intel</span>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#525252" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    style={{ fontFamily: 'Oughter, serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', fontSize: '10px', fontFamily: 'Oughter, serif' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }} />
                  <Bar dataKey="Revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} barSize={40} />
                  <Bar dataKey="Followers" fill="#ffffff15" radius={[8, 8, 0, 0]} barSize={20} />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Artist Performance Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredArtists.length > 0 ? (
                filteredArtists.map((artist, i) => (
                  <motion.div
                    key={artist.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="group relative flex flex-col p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-700 shadow-xl"
                  >
                    <div className="absolute top-8 right-8 text-[10px] font-black text-white/10 group-hover:text-orange-500/20 transition-colors uppercase tracking-[0.3em]" style={{ fontFamily: 'Oughter, serif' }}>
                      #{i + 1}
                    </div>

                    <div className="flex items-center gap-5 mb-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-orange-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-16 h-16 rounded-2xl bg-neutral-800 border border-white/5 overflow-hidden flex-shrink-0">
                          {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-orange-500">
                              {artist.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-light text-white tracking-tight leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>{artist.full_name}</h3>
                        <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-bold">Member Since {new Date(artist.created_at).getFullYear()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-10">
                      {[
                        { label: 'Artifacts', value: artist.artworks, color: 'text-neutral-400' },
                        { label: 'Audience', value: artist.followers_count, color: 'text-neutral-400' },
                        { label: 'Yield', value: `₹${artist.revenue.toLocaleString()}`, color: 'text-emerald-400' },
                        { label: 'Support', value: `₹${artist.support.toLocaleString()}`, color: 'text-orange-400' },
                      ].map(metric => (
                        <div key={metric.label} className="space-y-1.5 p-4 rounded-2xl bg-black/20 border border-white/[0.03]">
                          <p className="text-[8px] tracking-[0.2em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>{metric.label}</p>
                          <p className={`text-[15px] font-light ${metric.color}`} style={{ fontFamily: 'ForestSmooth, serif' }}>{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto space-y-4 pt-6 border-t border-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] tracking-[0.4em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Performance Identity</p>
                        <p className="text-[12px] font-black text-orange-500">{Math.round(artist.performance)}</p>
                      </div>
                      <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((artist.performance / 2000) * 100, 100)}%` }}
                          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                          className="h-full bg-gradient-to-r from-orange-600 to-amber-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-40 bg-white/[0.01] border border-white/[0.05] border-dashed rounded-[3rem] text-center">
                  <p className="text-[10px] tracking-[0.5em] uppercase text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>No Identity Sequences Detected</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
