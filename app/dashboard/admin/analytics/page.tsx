'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { DollarSign, TrendingUp, ShoppingBag, Heart, Eye, Users, UserPlus, Package, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    platformFees: 0,
    purchases: 0,
    supports: 0,
    thisMonth: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalArtists: 0,
    totalCollectors: 0,
    totalArtworks: 0,
    pendingArtworks: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [revenueChart, setRevenueChart] = useState<any>(null)
  const [categoryChart, setCategoryChart] = useState<any>(null)
  const [userGrowth, setUserGrowth] = useState<any>(null)
  const [transactionTypeChart, setTransactionTypeChart] = useState<any>(null)
  const [monthlyRevenueChart, setMonthlyRevenueChart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCharts, setShowCharts] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    const [transactionsRes, usersRes, artworksRes, categoriesRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('total_views, followers_count, role, created_at'),
      supabase
        .from('artworks')
        .select('id, status, category_id, created_at'),
      supabase
        .from('categories')
        .select('id, name')
    ])

    const data = transactionsRes.data
    const error = transactionsRes.error

    if (error) {
      console.error('Error loading analytics:', error)
    } else {
      const totalRevenue = data?.reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0
      const platformFees = data?.reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0
      const purchases = data?.filter(t => t.transaction_type === 'purchase').length || 0
      const supports = data?.filter(t => t.transaction_type === 'support').length || 0
      
      const thisMonth = data?.filter(t => 
        new Date(t.created_at).getMonth() === new Date().getMonth()
      ).reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0

      const totalViews = usersRes.data?.reduce((sum, u) => sum + (u.total_views || 0), 0) || 0
      const totalFollowers = usersRes.data?.reduce((sum, u) => sum + (u.followers_count || 0), 0) || 0
      const totalArtists = usersRes.data?.filter(u => u.role === 'artist').length || 0
      const totalCollectors = usersRes.data?.filter(u => u.role === 'collector').length || 0
      const totalArtworks = artworksRes.data?.length || 0
      const pendingArtworks = artworksRes.data?.filter(a => a.status === 'pending').length || 0

      setStats({ totalRevenue, platformFees, purchases, supports, thisMonth, totalViews, totalFollowers, totalArtists, totalCollectors, totalArtworks, pendingArtworks })

      // Revenue chart - last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (29 - i))
        return d.toISOString().split('T')[0]
      })
      const revenueByDay = last30Days.map(day => {
        const dayRevenue = data?.filter(t => t.created_at?.startsWith(day)).reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0
        return dayRevenue
      })
      setRevenueChart({
        labels: last30Days.map(d => new Date(d).getDate()),
        datasets: [{
          label: 'Platform Fees',
          data: revenueByDay,
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      })

      // Transaction type comparison
      const purchaseRevenue = data?.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0
      const supportRevenue = data?.filter(t => t.transaction_type === 'support').reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0
      setTransactionTypeChart({
        labels: ['Purchases', 'Support'],
        datasets: [{
          data: [purchaseRevenue, supportRevenue],
          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
          borderWidth: 0
        }]
      })

      // Monthly revenue - last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('en', { month: 'short' }) }
      })
      const monthlyRevenue = last6Months.map(m => {
        return data?.filter(t => {
          const created = new Date(t.created_at)
          return created.getMonth() === m.month && created.getFullYear() === m.year
        }).reduce((sum, t) => sum + Number(t.platform_fee || 0), 0) || 0
      })
      setMonthlyRevenueChart({
        labels: last6Months.map(m => m.label),
        datasets: [{
          label: 'Revenue',
          data: monthlyRevenue,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderRadius: 8,
          borderWidth: 0
        }]
      })

      // Category distribution
      const categoryMap = new Map(categoriesRes.data?.map(c => [c.id, c.name]))
      const categoryCounts = artworksRes.data?.reduce((acc: any, a) => {
        const catName = categoryMap.get(a.category_id) || 'Uncategorized'
        acc[catName] = (acc[catName] || 0) + 1
        return acc
      }, {})
      setCategoryChart({
        labels: Object.keys(categoryCounts || {}),
        datasets: [{
          data: Object.values(categoryCounts || {}),
          backgroundColor: [
            'rgba(251, 146, 60, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(217, 70, 239, 0.8)',
            'rgba(132, 204, 22, 0.8)'
          ],
          borderWidth: 0
        }]
      })

      // User growth - last 12 months
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (11 - i))
        return { month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('en', { month: 'short' }) }
      })
      const artistsByMonth = last12Months.map(m => {
        return usersRes.data?.filter(u => {
          const created = new Date(u.created_at)
          return u.role === 'artist' && created.getMonth() === m.month && created.getFullYear() === m.year
        }).length || 0
      })
      const collectorsByMonth = last12Months.map(m => {
        return usersRes.data?.filter(u => {
          const created = new Date(u.created_at)
          return u.role === 'collector' && created.getMonth() === m.month && created.getFullYear() === m.year
        }).length || 0
      })
      setUserGrowth({
        labels: last12Months.map(m => m.label),
        datasets: [
          {
            label: 'Artists',
            data: artistsByMonth,
            backgroundColor: 'rgba(251, 146, 60, 0.8)',
            borderRadius: 6,
            borderWidth: 0
          },
          {
            label: 'Collectors',
            data: collectorsByMonth,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
            borderWidth: 0
          }
        ]
      })

      // Enrich with user and artwork data
      const buyerIds = [...new Set(data?.map(t => t.buyer_id).filter(Boolean))]
      const artistIds = [...new Set(data?.map(t => t.artist_id).filter(Boolean))]
      const artworkIds = [...new Set(data?.map(t => t.artwork_id).filter(Boolean))]

      const [buyers, artists, artworks] = await Promise.all([
        buyerIds.length > 0 ? supabase.from('users').select('id, full_name').in('id', buyerIds) : { data: [] },
        artistIds.length > 0 ? supabase.from('users').select('id, full_name').in('id', artistIds) : { data: [] },
        artworkIds.length > 0 ? supabase.from('artworks').select('id, title').in('id', artworkIds) : { data: [] }
      ])

      const buyerMap: Record<string, string> = {}
      const artistMap: Record<string, string> = {}
      const artworkMap: Record<string, string> = {}

      buyers.data?.forEach((b: any) => { buyerMap[b.id] = b.full_name })
      artists.data?.forEach((a: any) => { artistMap[a.id] = a.full_name })
      artworks.data?.forEach((a: any) => { artworkMap[a.id] = a.title })

      const enriched = data?.map(t => ({
        ...t,
        buyer_name: buyerMap[t.buyer_id] || 'Unknown',
        artist_name: artistMap[t.artist_id] || 'Unknown',
        artwork_title: t.artwork_id ? artworkMap[t.artwork_id] : null
      })) || []

      setTransactions(enriched)
    }
    setLoading(false)
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.04] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.03] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1700px] mx-auto">
          {/* ── Intelligence Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400">Strategic Overview</span>
                </div>
                <TrendingUp size={14} className="text-neutral-700" />
              </div>
              <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Predictive <span className="text-neutral-500 italic">Intelligence</span>
              </h1>
              <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
                Orchestrating platform growth vectors and synthesizing transactional brilliance.
              </p>
            </div>

            {/* Metrics Nucleus: Master KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Revenue Vector', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-400' },
                { label: 'Platform Yield', value: `₹${stats.platformFees.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Ecosystem Pulse', value: stats.totalArtworks, icon: Package, color: 'text-blue-400' },
                { label: 'Curatorial Yield', value: stats.pendingArtworks, icon: Sparkles, color: 'text-amber-400' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="px-6 py-5 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl group hover:border-orange-500/20 transition-all duration-700"
                >
                  <p className="text-[9px] tracking-[0.4em] uppercase font-black text-neutral-600 group-hover:text-neutral-400 transition-colors mb-2" style={{ fontFamily: 'Oughter, serif' }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Metrics Nucleus: Secondary Vectors ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Purchases', value: stats.purchases, icon: ShoppingBag, color: 'text-blue-400' },
              { label: 'Supports', value: stats.supports, icon: Heart, color: 'text-pink-400' },
              { label: 'Platform Flow', value: `₹${stats.thisMonth.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400' },
              { label: 'Global Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-cyan-400' },
              { label: 'Artists', value: stats.totalArtists, icon: Users, color: 'text-orange-400' },
              { label: 'Collectors', value: stats.totalCollectors, icon: UserPlus, color: 'text-indigo-400' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="p-5 rounded-3xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-500"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] ${stat.color}`}>
                    <stat.icon size={14} />
                  </div>
                  <span className="text-[9px] text-neutral-600 uppercase font-black tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>{stat.label}</span>
                </div>
                <p className="text-xl text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Chart Expansion Protocol ── */}
          <div className="space-y-6">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="w-full group relative overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-8 transition-all duration-700 hover:bg-neutral-900/60 hover:border-orange-500/20"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-3xl transition-all duration-700 ${showCharts ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.02] text-neutral-600'}`}>
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-left space-y-1">
                    <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Visualization Matrix</h2>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Deep Data Synthesis & Trend Forecasting</p>
                  </div>
                </div>
                <div className={`p-3 rounded-full border border-white/5 transition-all duration-700 ${showCharts ? 'rotate-180 bg-orange-500/10 text-orange-400' : 'text-neutral-700'}`}>
                   {showCharts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showCharts && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-[2.5rem] bg-neutral-950/40 border border-white/[0.05] p-10 backdrop-blur-3xl group">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]" style={{ fontFamily: 'Oughter, serif' }}>Temporal Revenue Evolution (30D)</h3>
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                      </div>
                      {revenueChart && <Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#525252', font: { size: 9, weight: 'bold' } }, grid: { color: 'rgba(255,255,255,0.02)' }, border: { display: false } }, x: { ticks: { color: '#525252', font: { size: 9, weight: 'bold' } }, grid: { display: false }, border: { display: false } } } }} />}
                    </div>

                    <div className="rounded-[2.5rem] bg-neutral-950/40 border border-white/[0.05] p-10 backdrop-blur-3xl">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em]" style={{ fontFamily: 'Oughter, serif' }}>Phase Performance Index (6M)</h3>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                      </div>
                      {monthlyRevenueChart && <Bar data={monthlyRevenueChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#525252', font: { size: 9, weight: 'bold' } }, grid: { color: 'rgba(255,255,255,0.02)' }, border: { display: false } }, x: { ticks: { color: '#525252', font: { size: 10, weight: 'bold' } }, grid: { display: false }, border: { display: false } } } }} />}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="rounded-[2.5rem] bg-neutral-950/40 border border-white/[0.05] p-10 backdrop-blur-3xl">
                      <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-10 text-center" style={{ fontFamily: 'Oughter, serif' }}>Archetype Distribution</h3>
                      {transactionTypeChart && <Doughnut data={transactionTypeChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { position: 'bottom', labels: { color: '#737373', padding: 20, font: { size: 10, family: 'Oughter' }, boxWidth: 8, boxHeight: 8, usePointStyle: true } } } }} />}
                    </div>

                    <div className="rounded-[2.5rem] bg-neutral-950/40 border border-white/[0.05] p-10 backdrop-blur-3xl">
                      <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-10 text-center" style={{ fontFamily: 'Oughter, serif' }}>Registry Saturation</h3>
                      {categoryChart && <Doughnut data={categoryChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { position: 'bottom', labels: { color: '#737373', padding: 15, font: { size: 8, family: 'Oughter' }, boxWidth: 6, boxHeight: 6, usePointStyle: true } } } }} />}
                    </div>

                    <div className="rounded-[2.5rem] bg-neutral-950/40 border border-white/[0.05] p-10 backdrop-blur-3xl">
                      <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-10 text-center" style={{ fontFamily: 'Oughter, serif' }}>Community Vector Growth</h3>
                      {userGrowth && <Bar data={userGrowth} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { labels: { color: '#737373', font: { size: 9, family: 'Oughter' }, boxWidth: 8, boxHeight: 8, usePointStyle: true } } }, scales: { y: { ticks: { color: '#525252', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.02)' }, border: { display: false } }, x: { ticks: { color: '#525252', font: { size: 9 } }, grid: { display: false }, border: { display: false } } } }} />}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Intelligence Feed (Transactions) ── */}
          <div className="space-y-8">
            <div className="flex items-end justify-between px-4">
              <div className="space-y-1">
                <p className="text-[10px] text-orange-500/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Live Intelligence Feed</p>
                <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Recent <span className="text-neutral-500">Exchanges</span></h2>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {transactions.slice(0, 12).map((transaction, i) => (
                    <motion.div
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.19, 1, 0.22, 1] }}
                      className="group relative rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-8 backdrop-blur-3xl hover:bg-neutral-900/60 hover:border-white/[0.1] transition-all duration-700 hover:translate-y-[-4px]"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                          transaction.transaction_type === 'purchase' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                        }`} style={{ fontFamily: 'Oughter, serif' }}>
                          {transaction.transaction_type}
                        </div>
                        <span className="text-[10px] text-neutral-600 font-light tracking-widest uppercase">
                          {new Date(transaction.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-light text-white leading-tight line-clamp-2" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {transaction.artwork_title || 'Proprietary Support'}
                        </h3>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Principal Agent</p>
                            <p className="text-[13px] text-neutral-300 font-light truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{transaction.buyer_name}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[8px] uppercase tracking-[0.2em] text-neutral-600 font-black" style={{ fontFamily: 'Oughter, serif' }}>Creator Profile</p>
                            <p className="text-[13px] text-neutral-300 font-light truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>{transaction.artist_name}</p>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/[0.03] space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>Exchange Value</span>
                            <span className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>₹{Number(transaction.amount).toLocaleString()}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-[8px] text-neutral-700 uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Platform Yield</span>
                              <span className="text-[12px] text-emerald-500/80 font-medium">₹{Number(transaction.platform_fee).toFixed(2)}</span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-[8px] text-neutral-700 uppercase font-black" style={{ fontFamily: 'Oughter, serif' }}>Net Distribution</span>
                              <span className="text-[12px] text-neutral-400 font-medium">₹{Number(transaction.artist_earnings).toFixed(2)}</span>
                            </div>
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
      </div>
    </DashboardLayout>
  )
}
