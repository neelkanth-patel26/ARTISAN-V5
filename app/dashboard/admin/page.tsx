'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import {
  StatCard,
  PageHeader,
  EmptyState,
  QuickActionCard,
  LoadingSpinner,
} from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import {
  Users,
  Image,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  BarChart3,
  BadgeCheck,
  MessageCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AdvancedAnalytics } from '@/components/advanced-analytics'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalCollectors: 0,
    totalArtworks: 0,
    pendingArtworks: 0,
    totalExhibitions: 0,
    totalRevenue: 0,
  })
  const [pendingArtworks, setPendingArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'chat'>('overview')
  const user = getCurrentUser()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase.rpc('get_pending_artworks'),
      ])

      if (statsRes.error) throw statsRes.error

      if (statsRes.data) {
        const s = statsRes.data
        setStats({
          totalUsers: s.totalusers ?? s.totalUsers ?? 0,
          totalArtists: s.totalartists ?? s.totalArtists ?? 0,
          totalCollectors: s.totalcollectors ?? s.totalCollectors ?? 0,
          totalArtworks: s.totalartworks ?? s.totalArtworks ?? 0,
          pendingArtworks: s.pendingartworks ?? s.pendingArtworks ?? 0,
          totalExhibitions: s.totalexhibitions ?? s.totalExhibitions ?? 0,
          totalRevenue: Number(s.totalrevenue ?? s.totalRevenue ?? 0),
        })
      }
      setPendingArtworks((pendingRes.data ?? []).filter(Boolean))
    } catch (error: any) {
      console.error('Dashboard load error:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (artworkId: string) => {
    try {
      const user = await getCurrentUser()
      const { error } = await supabase.rpc('approve_artwork', {
        artwork_id: artworkId,
        admin_id: user?.user_id,
      })
      if (error) throw error
      toast.success('Artwork approved')
      loadDashboard()
    } catch (error: any) {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (artworkId: string) => {
    try {
      const { error } = await supabase.rpc('reject_artwork', { artwork_id: artworkId })
      if (error) throw error
      toast.success('Artwork rejected')
      loadDashboard()
    } catch (error: any) {
      toast.error('Failed to reject')
    }
  }

  const handleVerifyArtist = async (artistId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          verification_date: new Date().toISOString()
        })
        .eq('id', artistId)
      
      if (error) throw error
      toast.success('Artist verified')
    } catch (error) {
      toast.error('Failed to verify artist')
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Artists', value: stats.totalArtists, icon: Image },
    { label: 'Collectors', value: stats.totalCollectors, icon: TrendingUp },
    { label: 'Total Artworks', value: stats.totalArtworks, icon: Image },
    { label: 'Pending Approval', value: stats.pendingArtworks, icon: Clock },
    { label: 'Exhibitions', value: stats.totalExhibitions, icon: Calendar },
    { label: 'Platform Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign },
  ]

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Admin Dashboard" description="Platform management and analytics" />

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <BarChart3 size={16} />
            Platform Analytics
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <MessageCircle size={16} />
            Support Chats
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                  {statCards.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 lg:p-6"
                    >
                      <p className="text-xs lg:text-sm text-neutral-400 mb-3">{stat.label}</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                          <stat.icon className="w-5 h-5 text-neutral-400" />
                        </div>
                        <p className="text-2xl lg:text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 lg:p-6 lg:col-span-2"
                  >
                    <div className="mb-4 lg:mb-6 flex items-center justify-between">
                      <h2 className="text-xl lg:text-2xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>
                        Pending Artworks
                      </h2>
                      <span className="rounded-full bg-amber-600/10 border border-amber-600/30 px-3 lg:px-4 py-1 lg:py-1.5 text-xs lg:text-sm text-amber-500">
                        {pendingArtworks.length}
                      </span>
                    </div>

                    {pendingArtworks.length === 0 ? (
                      <EmptyState
                        icon={CheckCircle}
                        title="All caught up!"
                        description="No pending artworks to review"
                      />
                    ) : (
                      <div className="space-y-2 lg:space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto">
                        {pendingArtworks.map((artwork, i) => (
                          <motion.div
                            key={artwork.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex flex-col lg:flex-row gap-3 lg:gap-4 rounded-xl border border-neutral-800 bg-neutral-800/30 p-3 lg:p-4"
                          >
                            <div className="flex gap-3 lg:gap-4 flex-1">
                              <img
                                src={artwork.image_url}
                                alt={artwork.title}
                                className="h-16 w-16 lg:h-20 lg:w-20 shrink-0 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm lg:text-base font-light text-white mb-1 line-clamp-1" style={{ fontFamily: 'ForestSmooth, serif' }}>{artwork.title}</h3>
                                <p className="text-xs lg:text-sm text-neutral-400 mb-1">by {artwork.artist_name}</p>
                                <p className="text-base lg:text-lg font-light text-amber-500">₹{Number(artwork.price).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                              <button
                                onClick={() => handleApprove(artwork.id)}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2 text-sm text-white transition-all"
                              >
                                <CheckCircle size={16} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(artwork.id)}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition-all hover:bg-neutral-700"
                              >
                                <AlertCircle size={16} />
                                Reject
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-3 lg:space-y-4"
                  >
                    <h2 className="text-xl lg:text-2xl font-light text-white mb-4 lg:mb-6" style={{ fontFamily: 'ForestSmooth, serif' }}>
                      Quick Actions
                    </h2>
                    <QuickActionCard
                      href="/dashboard/admin/users"
                      icon={BadgeCheck}
                      label="Verify Artists"
                      description="Manage artist verification"
                    />
                    <QuickActionCard
                      href="/dashboard/admin/transactions"
                      icon={DollarSign}
                      label="View Transactions"
                      description="Monitor all platform transactions"
                    />
                    <QuickActionCard
                      href="/dashboard/admin/artworks"
                      icon={Image}
                      label="Manage Artworks"
                      description="Review, approve, or reject artworks"
                    />
                    <QuickActionCard
                      href="/gallery"
                      icon={Image}
                      label="Browse Gallery"
                      description="View all artworks"
                    />
                  </motion.div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && user && (
              <AdvancedAnalytics userId={user.user_id} role="admin" />
            )}

            {activeTab === 'chat' && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
                <h3 className="text-xl font-light text-white mb-4" style={{ fontFamily: 'ForestSmooth, serif' }}>
                  Active Support Chats
                </h3>
                <p className="text-neutral-400 text-sm">Support chat management interface coming soon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
