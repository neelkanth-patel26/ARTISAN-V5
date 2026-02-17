'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader, StatCard, LoadingSpinner } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { DollarSign, TrendingUp, ShoppingBag, Heart, Eye, Users, UserPlus, Package, ChevronDown, ChevronUp } from 'lucide-react'
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
      const buyerIds = [...new Set(data?.map(t => t.buyer_id).filter(Boolean))] || []
      const artistIds = [...new Set(data?.map(t => t.artist_id).filter(Boolean))] || []
      const artworkIds = [...new Set(data?.map(t => t.artwork_id).filter(Boolean))] || []

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
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Platform Analytics" description="Monitor platform transactions and earnings" />

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <DollarSign size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Total Revenue</p>
            <p className="text-2xl font-semibold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-600/10">
                <TrendingUp size={18} className="text-green-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Platform Fees</p>
            <p className="text-2xl font-semibold text-white">₹{stats.platformFees.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-blue-600/10">
                <ShoppingBag size={18} className="text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Purchases</p>
            <p className="text-2xl font-semibold text-white">{stats.purchases}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-pink-600/10">
                <Heart size={18} className="text-pink-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Supports</p>
            <p className="text-2xl font-semibold text-white">{stats.supports}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-purple-600/10">
                <TrendingUp size={18} className="text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">This Month</p>
            <p className="text-2xl font-semibold text-white">₹{stats.thisMonth.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-cyan-600/10">
                <Eye size={18} className="text-cyan-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Total Views</p>
            <p className="text-2xl font-semibold text-white">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-orange-600/10">
                <Users size={18} className="text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Artists</p>
            <p className="text-2xl font-semibold text-white">{stats.totalArtists}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-600/10">
                <UserPlus size={18} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Collectors</p>
            <p className="text-2xl font-semibold text-white">{stats.totalCollectors}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-teal-600/10">
                <Package size={18} className="text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Artworks</p>
            <p className="text-2xl font-semibold text-white">{stats.totalArtworks}</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-amber-600/10">
                <TrendingUp size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-1">Pending</p>
            <p className="text-2xl font-semibold text-white">{stats.pendingArtworks}</p>
          </div>
        </div>

        <button
          onClick={() => setShowCharts(!showCharts)}
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-900 p-4 hover:bg-neutral-800 transition-colors flex items-center justify-between"
        >
          <span className="text-white font-medium">Analytics Charts</span>
          {showCharts ? <ChevronUp className="text-neutral-400" /> : <ChevronDown className="text-neutral-400" />}
        </button>

        <AnimatePresence>
          {showCharts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-medium text-white mb-4">Daily Revenue (30 Days)</h3>
                  {revenueChart && <Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#737373', font: { size: 10 } }, grid: { color: '#262626' }, border: { display: false } }, x: { ticks: { color: '#737373', font: { size: 10 } }, grid: { display: false }, border: { display: false } } } }} />}
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-medium text-white mb-4">Monthly Revenue (6 Months)</h3>
                  {monthlyRevenueChart && <Bar data={monthlyRevenueChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 2, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#737373', font: { size: 10 } }, grid: { color: '#262626' }, border: { display: false } }, x: { ticks: { color: '#737373', font: { size: 10 } }, grid: { display: false }, border: { display: false } } } }} />}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-medium text-white mb-4">Revenue by Type</h3>
                  {transactionTypeChart && <Doughnut data={transactionTypeChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { position: 'bottom', labels: { color: '#a3a3a3', padding: 10, font: { size: 11 }, boxWidth: 12, boxHeight: 12 } } } }} />}
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-medium text-white mb-4">Artworks by Category</h3>
                  {categoryChart && <Doughnut data={categoryChart} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { position: 'bottom', labels: { color: '#a3a3a3', padding: 8, font: { size: 10 }, boxWidth: 10, boxHeight: 10 } } } }} />}
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                  <h3 className="text-sm font-medium text-white mb-4">User Growth (12 Months)</h3>
                  {userGrowth && <Bar data={userGrowth} options={{ responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, plugins: { legend: { labels: { color: '#a3a3a3', font: { size: 10 }, boxWidth: 12, boxHeight: 12 } } }, scales: { y: { ticks: { color: '#737373', font: { size: 10 } }, grid: { color: '#262626' }, border: { display: false } }, x: { ticks: { color: '#737373', font: { size: 9 } }, grid: { display: false }, border: { display: false } } } }} />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Recent Transactions</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactions.slice(0, 12).map((transaction, i) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-2xl border border-neutral-800 bg-neutral-800/30 p-5 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.transaction_type === 'purchase' 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'bg-pink-600/20 text-pink-400'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-medium text-white mb-4 line-clamp-1">
                    {transaction.artwork_title || 'Artist Support'}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Buyer</span>
                      <span className="text-white truncate ml-2 font-medium">{transaction.buyer_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Artist</span>
                      <span className="text-white truncate ml-2 font-medium">{transaction.artist_name}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Total</span>
                      <span className="text-xl font-semibold text-white">₹{Number(transaction.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Platform Fee</span>
                      <span className="text-sm text-green-400 font-medium">₹{Number(transaction.platform_fee).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">Artist Earnings</span>
                      <span className="text-sm text-neutral-300 font-medium">₹{Number(transaction.artist_earnings).toFixed(2)}</span>
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
