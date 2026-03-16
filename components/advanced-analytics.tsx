'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Eye, Heart, ShoppingCart, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

interface AnalyticsData {
  revenue: { current: number; previous: number; trend: number }
  views: { current: number; previous: number; trend: number }
  sales: { current: number; previous: number; trend: number }
  followers: { current: number; previous: number; trend: number }
  revenueChart: { labels: string[]; data: number[] }
  categoryChart: { labels: string[]; data: number[] }
  topArtworks: Array<{ id: string; title: string; views: number; sales: number; revenue: number }>
}

const PERIODS = [
  { key: '7d',  label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
  { key: '1y',  label: '1 Year' },
] as const

const DONUT_COLORS = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#f43f5e']

const CHART_TOOLTIP = {
  backgroundColor: '#0a0a0a',
  borderColor: '#1a1a1a',
  borderWidth: 1,
  titleColor: '#737373',
  bodyColor: '#ffffff',
  padding: 12,
  cornerRadius: 10,
}

export function AdvancedAnalytics({ userId, role }: { userId: string; role: string }) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?userId=${userId}&period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [period, userId])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-amber-600/60" />
        <span className="text-[9px] text-neutral-600 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>
          Compiling Data
        </span>
      </div>
    </div>
  )

  if (!data) return null

  const stats = [
    { icon: DollarSign, label: 'Revenue',      value: data.revenue.current,   trend: data.revenue.trend,   prefix: '₹' },
    { icon: Eye,        label: 'Total Views',   value: data.views.current,     trend: data.views.trend,     prefix: ''  },
    { icon: ShoppingCart, label: 'Sales',       value: data.sales.current,     trend: data.sales.trend,     prefix: ''  },
    { icon: Heart,      label: 'Followers',     value: data.followers.current, trend: data.followers.trend, prefix: ''  },
  ]

  const maxRevenue = Math.max(...data.topArtworks.map(a => a.revenue), 1)
  const maxViews  = Math.max(...data.topArtworks.map(a => a.views), 1)
  const hasCategories = data.categoryChart.labels.length > 0
  const hasTopArtworks = data.topArtworks.length > 0

  const revenueChartData = {
    labels: data.revenueChart.labels,
    datasets: [{
      label: 'Revenue',
      data: data.revenueChart.data,
      borderColor: 'rgba(245,158,11,0.7)',
      backgroundColor: 'rgba(245,158,11,0.04)',
      borderWidth: 1.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#f59e0b',
      pointRadius: 2.5,
      pointHoverRadius: 5,
    }],
  }

  const categoryChartData = {
    labels: data.categoryChart.labels,
    datasets: [{
      data: data.categoryChart.data,
      backgroundColor: DONUT_COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden">

      {/* Atmospheric glows — matches artworks page */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-900/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-10">

        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-8 bg-amber-600/40" />
            <span className="text-[10px] text-amber-600/60 uppercase tracking-[0.5em] font-black" style={{ fontFamily: 'Oughter, serif' }}>
              Performance Registry
            </span>
          </motion.div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
                Analytics
              </h1>
              <p className="text-neutral-500 text-sm mt-1 font-light">Track your creative impact and revenue</p>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl self-start sm:self-auto">
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    period === key
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      : 'text-neutral-600 hover:text-neutral-300'
                  }`}
                  style={{ fontFamily: 'Oughter, serif' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, label, value, trend, prefix }, i) => {
            const up = trend > 0
            const neutral = trend === 0
            const TrendIcon = neutral ? Minus : up ? ArrowUpRight : ArrowDownRight
            const trendColor = neutral ? 'text-neutral-600' : up ? 'text-emerald-400' : 'text-rose-400'
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl overflow-hidden hover:border-amber-600/20 transition-all duration-500"
              >
                {/* Hover sweep */}
                <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-600/20 group-hover:w-full transition-all duration-700 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-amber-600/10 border border-amber-600/20">
                      <Icon size={16} className="text-amber-600/70" />
                    </div>
                    <div className={`flex items-center gap-0.5 text-[10px] font-black ${trendColor}`} style={{ fontFamily: 'Oughter, serif' }}>
                      <TrendIcon size={12} />
                      <span>{Math.abs(trend)}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-light text-white tracking-tight">
                      {prefix}{value.toLocaleString()}
                    </div>
                    <div className="text-[8px] text-neutral-500 uppercase tracking-[0.3em] font-black mt-1" style={{ fontFamily: 'Oughter, serif' }}>
                      {label}
                    </div>
                  </div>
                  <div className="text-[9px] text-neutral-700 uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>
                    vs prior period
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Revenue Trend</h3>
                <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Earnings over time</p>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>
                <span className="w-4 h-px bg-amber-600/60 inline-block" />
                Revenue
              </div>
            </div>
            <div className="h-56">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
                  scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#404040', font: { size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#404040', font: { size: 10 } } },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Doughnut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl p-8"
          >
            <div className="space-y-1 mb-8">
              <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>By Category</h3>
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Sales distribution</p>
            </div>
            {hasCategories ? (
              <>
                <div className="h-40 flex items-center justify-center">
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '75%',
                      plugins: { legend: { display: false }, tooltip: CHART_TOOLTIP },
                    }}
                  />
                </div>
                <div className="mt-6 space-y-2.5">
                  {data.categoryChart.labels.slice(0, 5).map((lbl, i) => (
                    <div key={lbl} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i] }} />
                        <span className="text-neutral-500 text-[10px] uppercase tracking-widest font-black truncate max-w-[110px]" style={{ fontFamily: 'Oughter, serif' }}>{lbl}</span>
                      </div>
                      <span className="text-neutral-300 text-xs font-light">{data.categoryChart.data[i]}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center gap-2">
                <p className="text-neutral-700 text-[9px] uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>No artworks yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Top Artworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl overflow-hidden"
        >
          {/* Table header */}
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Top Performing Artworks</h3>
              <p className="text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Ranked by revenue</p>
            </div>
            <span className="text-[9px] text-neutral-600 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>
              {data.topArtworks.length} specimens
            </span>
          </div>

          {hasTopArtworks ? (
            <div className="divide-y divide-white/[0.03]">
              {data.topArtworks.map((artwork, i) => {
                // use revenue if any sales exist, otherwise fall back to views for bar width
                const anyRevenue = data.topArtworks.some(a => a.revenue > 0)
                const pct = anyRevenue
                  ? Math.round((artwork.revenue / maxRevenue) * 100)
                  : Math.round((artwork.views / maxViews) * 100)
                return (
                  <div
                    key={artwork.id}
                    className="group px-8 py-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-neutral-800 text-sm font-mono w-6 shrink-0 group-hover:text-neutral-600 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-white text-sm font-light truncate" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        {artwork.title}
                      </p>
                      <div className="h-px bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600/40 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                      <div className="hidden md:block text-right">
                        <p className="text-[8px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>Views</p>
                        <p className="text-neutral-400 text-sm font-light">{artwork.views.toLocaleString()}</p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-[8px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>Sales</p>
                        <p className="text-neutral-400 text-sm font-light">{artwork.sales}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-neutral-600 uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>Revenue</p>
                        <p className="text-amber-500/80 text-sm font-light">₹{artwork.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-8 py-16 flex flex-col items-center justify-center gap-2">
              <p className="text-neutral-700 text-[9px] uppercase tracking-widest font-black" style={{ fontFamily: 'Oughter, serif' }}>No approved artworks yet</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
