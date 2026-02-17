'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Eye, Heart, ShoppingCart, Users, Calendar } from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface AnalyticsData {
  revenue: { current: number; previous: number; trend: number }
  views: { current: number; previous: number; trend: number }
  sales: { current: number; previous: number; trend: number }
  followers: { current: number; previous: number; trend: number }
  revenueChart: { labels: string[]; data: number[] }
  categoryChart: { labels: string[]; data: number[] }
  topArtworks: Array<{ id: string; title: string; views: number; sales: number; revenue: number }>
}

export function AdvancedAnalytics({ userId, role }: { userId: string; role: string }) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [period, userId])

  const loadAnalytics = async () => {
    setLoading(true)
    // Fetch analytics data from API
    const response = await fetch(`/api/analytics?userId=${userId}&period=${period}`)
    const result = await response.json()
    setData(result)
    setLoading(false)
  }

  const StatCard = ({ icon: Icon, label, value, trend, prefix = '' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 rounded-xl p-6 border border-neutral-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-amber-600/10 rounded-lg">
          <Icon size={24} className="text-amber-600" />
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-neutral-400 text-sm mb-1">{label}</p>
      <p className="text-white text-3xl font-semibold">{prefix}{value.toLocaleString()}</p>
    </motion.div>
  )

  if (loading) return <div className="text-center py-12 text-neutral-500">Loading analytics...</div>

  if (!data) return null

  const revenueChartData = {
    labels: data.revenueChart.labels,
    datasets: [{
      label: 'Revenue',
      data: data.revenueChart.data,
      borderColor: 'rgb(251, 191, 36)',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      tension: 0.4
    }]
  }

  const categoryChartData = {
    labels: data.categoryChart.labels,
    datasets: [{
      data: data.categoryChart.data,
      backgroundColor: ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444']
    }]
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Analytics Dashboard</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                period === p
                  ? 'bg-amber-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Revenue" value={data.revenue.current} trend={data.revenue.trend} prefix="₹" />
        <StatCard icon={Eye} label="Total Views" value={data.views.current} trend={data.views.trend} />
        <StatCard icon={ShoppingCart} label="Sales" value={data.sales.current} trend={data.sales.trend} />
        <StatCard icon={Heart} label="Followers" value={data.followers.current} trend={data.followers.trend} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h3 className="text-white font-medium mb-4">Revenue Trend</h3>
          <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        {/* Category Distribution */}
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h3 className="text-white font-medium mb-4">Sales by Category</h3>
          <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>
      </div>

      {/* Top Artworks */}
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h3 className="text-white font-medium mb-4">Top Performing Artworks</h3>
        <div className="space-y-3">
          {data.topArtworks.map((artwork, i) => (
            <div key={artwork.id} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-neutral-700">#{i + 1}</span>
                <div>
                  <p className="text-white font-medium">{artwork.title}</p>
                  <p className="text-sm text-neutral-400">{artwork.views} views • {artwork.sales} sales</p>
                </div>
              </div>
              <p className="text-amber-600 font-semibold">₹{artwork.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
