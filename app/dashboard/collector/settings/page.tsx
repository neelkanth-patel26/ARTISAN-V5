'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { User, Lock, Save, Mail, Phone, MapPin, Activity, ShoppingBag, Heart, MessageSquare, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getCurrentUser, getProfile, updateProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function CollectorSettings() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ purchases: 0, favorites: 0, comments: 0 })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  })

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [])

  const loadStats = async () => {
    const user = await getCurrentUser()
    if (user?.user_id) {
      const [purchases, favorites, comments] = await Promise.all([
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('buyer_id', user.user_id).eq('status', 'completed'),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('user_id', user.user_id),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', user.user_id)
      ])
      setStats({
        purchases: purchases.count || 0,
        favorites: favorites.count || 0,
        comments: comments.count || 0
      })
    }
  }

  const loadProfile = async () => {
    const user = await getCurrentUser()
    if (user && user.user_id) {
      const profile = await getProfile(user.user_id)
      if (profile) {
        setAvatarUrl(profile.avatar_url)
        setFormData({
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          bio: profile.bio || '',
        })
      }
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'profiles')
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const { url } = await response.json()
      setAvatarUrl(url)
      const user = await getCurrentUser()
      if (user?.user_id) {
        await supabase.from('users').update({ avatar_url: url }).eq('id', user.user_id)
      }
      toast.success('Avatar updated')
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await getCurrentUser()
      if (!user || !user.user_id) throw new Error('Not authenticated')

      await updateProfile(user.user_id, formData)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.collector} role="collector">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Settings" description="Manage your profile" />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-700 text-3xl font-bold text-white">
                        {(formData.full_name || 'C').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors">
                        <Upload size={14} className="text-white" />
                      </div>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">{formData.full_name || 'Collector'}</h3>
                  <p className="text-sm text-neutral-400 mb-2">{formData.email}</p>
                  <span className="inline-block rounded-full px-3 py-1 text-xs bg-neutral-700 text-neutral-300">
                    Collector
                  </span>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={16} className="text-neutral-400" />
                  <h3 className="text-sm font-semibold text-white">Profile Status</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-400">Profile Completion</span>
                      <span className="text-xs font-semibold text-white">
                        {Math.round([
                          formData.full_name,
                          formData.email,
                          formData.phone,
                          formData.location,
                          formData.bio
                        ].filter(Boolean).length / 5 * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round([
                          formData.full_name,
                          formData.email,
                          formData.phone,
                          formData.location,
                          formData.bio
                        ].filter(Boolean).length / 5 * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Account Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={14} className="text-neutral-400" />
                      <span className="text-xs text-white">Purchases</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{stats.purchases}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-neutral-400" />
                      <span className="text-xs text-white">Favorites</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{stats.favorites}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-neutral-400" />
                      <span className="text-xs text-white">Comments</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{stats.comments}</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Quick Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Account Type</span>
                    <span className="text-white">Collector</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <User className="text-neutral-400" size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-semibold text-white mb-4">Basic Details</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 text-sm cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-semibold text-white mb-4">Contact Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Phone Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-300 mb-2">Location</label>
                        <div className="relative">
                          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, Country"
                            className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                    <h4 className="text-sm font-semibold text-white mb-4">About</h4>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
