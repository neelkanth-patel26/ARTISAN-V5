'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/dashboard'
import { DASHBOARD_NAV } from '@/lib/dashboard-config'
import { User, Lock, Save, Mail, Phone, MapPin, Calendar, Shield, Activity, Bell, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser?.user_id) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.user_id)
          .single()
        
        if (profile) {
          setUser({ ...currentUser, profile })
          setAvatarUrl(profile.avatar_url)
          setProfileForm({
            full_name: profile.full_name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            bio: profile.bio || ''
          })
        }
      }
    } catch (error: any) {
      toast.error('Failed to load user data')
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
      await supabase.from('users').update({ avatar_url: url }).eq('id', user.user_id)
      toast.success('Avatar updated')
    } catch (error) {
      toast.error('Failed to upload avatar')
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          location: profileForm.location,
          bio: profileForm.bio
        })
        .eq('id', user.user_id)
      
      if (error) throw error
      
      toast.success('Profile updated successfully')
      loadUserData()
    } catch (error: any) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('password')
        .eq('email', profileForm.email)
        .single()

      if (!userData || userData.password !== passwordForm.current_password) {
        toast.error('Current password is incorrect')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('users')
        .update({ password: passwordForm.new_password })
        .eq('id', user.user_id)

      if (error) throw error

      toast.success('Password changed successfully')
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout navItems={DASHBOARD_NAV.admin} role="admin">
      <div className="space-y-6 p-4 lg:p-8">
        <PageHeader title="Settings" description="Manage your account settings and preferences" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-4"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-700 text-3xl font-bold text-white">
                      {(profileForm.full_name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors">
                      <Upload size={14} className="text-white" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  </label>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{profileForm.full_name || 'Admin User'}</h3>
                <p className="text-sm text-neutral-400 mb-2">{profileForm.email}</p>
                <span className="inline-block rounded-full px-3 py-1 text-xs bg-neutral-700 text-neutral-300">
                  Administrator
                </span>
              </div>

              {user && (
                <div className="space-y-3 pt-4 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Account Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  {user.profile?.created_at && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Member Since</span>
                      <span className="text-white">{new Date(user.profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-neutral-400" />
                <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <span className="text-xs text-neutral-400">Profile Completion</span>
                  <span className="text-sm font-semibold text-white">
                    {Math.round([
                      profileForm.full_name,
                      profileForm.email,
                      profileForm.phone,
                      profileForm.location,
                      profileForm.bio
                    ].filter(Boolean).length / 5 * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <span className="text-xs text-neutral-400">Last Login</span>
                  <span className="text-sm font-semibold text-white">Today</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} className="text-neutral-400" />
                <h3 className="text-sm font-semibold text-white">Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600/20">
                    <Shield size={14} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">Two-Factor Auth</p>
                    <p className="text-[10px] text-neutral-400">Not enabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600/20">
                    <Lock size={14} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">Password</p>
                    <p className="text-[10px] text-neutral-400">Strong</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-neutral-400" />
                <h3 className="text-sm font-semibold text-white">Preferences</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Email Notifications</span>
                  <div className="w-10 h-5 bg-green-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Marketing Emails</span>
                  <div className="w-10 h-5 bg-neutral-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neutral-800 rounded-lg">
                  <User className="text-neutral-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                  <h4 className="text-sm font-semibold text-white mb-4">Basic Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <input
                          type="email"
                          value={profileForm.email}
                          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-500 text-sm cursor-not-allowed"
                          disabled
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
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
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
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
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
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neutral-800 rounded-lg">
                  <Lock className="text-neutral-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Security</h2>
                  <p className="text-xs text-neutral-400">Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-800">
                  <p className="text-xs text-neutral-400">Password must be at least 6 characters long</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Lock size={18} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
