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
      <div className="relative min-h-screen">
        {/* ── Atmospheric Sentinel ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-[45%] h-[45%] bg-orange-600/[0.03] rounded-full blur-[130px]" />
          <div className="absolute bottom-[5%] left-[-10%] w-[35%] h-[35%] bg-blue-600/[0.02] rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 p-6 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
          {/* ── Console Header ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-[10px] tracking-[0.5em] uppercase font-black text-orange-400">System Parameters</span>
              </div>
              <Activity size={14} className="text-neutral-700" />
            </div>
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'ForestSmooth, serif' }}>
              Core <span className="text-neutral-500 italic">Configuration</span>
            </h1>
            <p className="text-[15px] text-neutral-500 font-light tracking-wide max-w-lg">
              Fine-tuning the platform architecture and curating your administrator identity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ── Left Column: Identity & Intelligence ── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-4 space-y-6"
            >
              {/* Identity Hub */}
              <div className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-8 backdrop-blur-3xl transition-all duration-700 hover:bg-neutral-900/60 hover:border-orange-500/20">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-700" />
                    <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border border-white/[0.1] p-2 bg-neutral-950/40 group-hover:border-orange-500/40 transition-all duration-700">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" className="h-full w-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-900 text-5xl font-light text-neutral-400" style={{ fontFamily: 'ForestSmooth, serif' }}>
                          {(profileForm.full_name || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <label className="absolute bottom-2 right-2 cursor-pointer">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-3 bg-orange-500 text-white rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-colors hover:bg-orange-600"
                        >
                          <Upload size={16} />
                        </motion.div>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <h3 className="text-3xl font-light text-white mb-2" style={{ fontFamily: 'ForestSmooth, serif' }}>
                    {profileForm.full_name || 'Admin Principal'}
                  </h3>
                  <p className="text-[12px] text-neutral-500 font-light tracking-[0.2em] uppercase mb-6" style={{ fontFamily: 'Oughter, serif' }}>
                    {profileForm.email}
                  </p>
                  
                  <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>
                    Administrator Level Protocol
                  </div>
                </div>

                {user && (
                  <div className="mt-10 pt-8 border-t border-white/[0.03] space-y-4">
                    <div className="flex items-center justify-between text-[10px] tracking-widest font-black uppercase text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>
                      <span>Status Protocol</span>
                      <span className="text-emerald-500/80">Active.Seal</span>
                    </div>
                    {user.profile?.created_at && (
                      <div className="flex items-center justify-between text-[10px] tracking-widest font-black uppercase text-neutral-600" style={{ fontFamily: 'Oughter, serif' }}>
                        <span>Initiated</span>
                        <span className="text-neutral-400">{new Date(user.profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Intelligence Stats */}
              <div className="rounded-[2.5rem] bg-neutral-900/20 border border-white/[0.03] p-8 space-y-6">
                 <div className="flex items-center gap-3">
                   <Activity size={14} className="text-neutral-700" />
                   <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]" style={{ fontFamily: 'Oughter, serif' }}>Identity Completion</h3>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="relative h-[2px] w-full bg-white/[0.02] rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.round([profileForm.full_name, profileForm.email, profileForm.phone, profileForm.location, profileForm.bio].filter(Boolean).length / 5 * 100)}%` }}
                       className="absolute inset-y-0 left-0 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                     />
                   </div>
                   <div className="flex justify-between items-end">
                     <p className="text-xs text-neutral-500 font-light italic">Profile integrity level</p>
                     <p className="text-2xl font-light text-white leading-none" style={{ fontFamily: 'ForestSmooth, serif' }}>
                       {Math.round([profileForm.full_name, profileForm.email, profileForm.phone, profileForm.location, profileForm.bio].filter(Boolean).length / 5 * 100)}%
                     </p>
                   </div>
                 </div>
              </div>

              {/* Security Visualization */}
              <div className="rounded-[2.5rem] bg-neutral-900/20 border border-white/[0.03] p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Shield size={16} className="text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]" style={{ fontFamily: 'Oughter, serif' }}>Protocol Shield</p>
                    <p className="text-sm text-white font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>Active Encryption</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] space-y-1">
                    <p className="text-[8px] text-neutral-600 uppercase font-black tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>2FA Security</p>
                    <p className="text-[11px] text-neutral-500">Offline</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] space-y-1">
                    <p className="text-[8px] text-neutral-600 uppercase font-black tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>Access Logs</p>
                    <p className="text-[11px] text-emerald-500/60">Verified</p>
                  </div>
                </div>
              </div>

              {/* Preferences Toggles */}
              <div className="rounded-[2.5rem] bg-neutral-900/20 border border-white/[0.03] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Bell size={14} className="text-neutral-700" />
                  <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]" style={{ fontFamily: 'Oughter, serif' }}>Configuration Flow</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="space-y-0.5">
                      <p className="text-[12px] text-neutral-300 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>Direct Intelligence Feed</p>
                      <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>Core Alerts</p>
                    </div>
                    <div className="w-10 h-5 bg-orange-500 rounded-full relative transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between group cursor-pointer opacity-50">
                    <div className="space-y-0.5">
                      <p className="text-[12px] text-neutral-300 font-light" style={{ fontFamily: 'ForestSmooth, serif' }}>Marketing Propagation</p>
                      <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest" style={{ fontFamily: 'Oughter, serif' }}>External Ops</p>
                    </div>
                    <div className="w-10 h-5 bg-neutral-800 rounded-full relative transition-all duration-300">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-neutral-600 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Right Column: Configuration Protocols ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 space-y-12"
            >
              {/* Profile Protocol Form */}
              <div className="rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-10 backdrop-blur-3xl space-y-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                    <User size={24} className="text-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Principal <span className="text-neutral-500">Identity</span></h2>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Public Identity Reconciliation</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Full Legal Name</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                        placeholder="Lexington Artisan"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Registered Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                        <input
                          type="email"
                          value={profileForm.email}
                          className="w-full pl-14 pr-6 py-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl text-neutral-600 text-[15px] font-light cursor-not-allowed"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Secure Communication</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                          placeholder="+X (XXX) XXX-XXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Principal Domain</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full pl-14 pr-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                          placeholder="Paris, France"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Biometric Narrative</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      className="w-full px-6 py-5 bg-white/[0.02] border border-white/[0.05] rounded-[2rem] text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700 resize-none"
                      placeholder="Crafting the artistic direction of the platform..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full py-5 rounded-[2rem] bg-orange-500 text-white font-medium text-[13px] tracking-[0.3em] uppercase transition-all duration-500 hover:bg-orange-600 disabled:opacity-50 shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:shadow-[0_10px_40px_rgba(249,115,22,0.3)] flex items-center justify-center gap-4"
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <Save size={18} />
                    {loading ? 'Synthesizing...' : 'Seal Changes'}
                  </motion.button>
                </form>
              </div>

              {/* Security Protocol Form */}
              <div className="rounded-[2.5rem] bg-neutral-900/40 border border-white/[0.05] p-10 backdrop-blur-3xl space-y-10">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
                    <Lock size={24} className="text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-3xl font-light text-white" style={{ fontFamily: 'ForestSmooth, serif' }}>Cryptographic <span className="text-neutral-500">Security</span></h2>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-black" style={{ fontFamily: 'Oughter, serif' }}>Vault Access Transformation</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Existing Key</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                      placeholder="Enter current key"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Novus Key</label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                        placeholder="Min. 6 indices"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-black px-1" style={{ fontFamily: 'Oughter, serif' }}>Validation Link</label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl text-white text-[15px] font-light focus:outline-none focus:border-orange-500/40 transition-all duration-500 placeholder-neutral-700"
                        placeholder="Repeat novus key"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.03] border-l-2 border-l-emerald-500/40">
                    <p className="text-[11px] text-neutral-500 italic font-light">Precision indexing: Security protocols require a minimum of 6 unique cryptographic characters.</p>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading}
                    className="w-full py-5 rounded-[2rem] bg-neutral-950 border border-white/[0.05] text-white font-medium text-[13px] tracking-[0.3em] uppercase transition-all duration-500 hover:bg-neutral-900 group flex items-center justify-center gap-4"
                    style={{ fontFamily: 'Oughter, serif' }}
                  >
                    <Lock size={18} className="text-neutral-600 group-hover:text-emerald-500 transition-colors" />
                    {loading ? 'Re-keying...' : 'Initiate Re-key'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
